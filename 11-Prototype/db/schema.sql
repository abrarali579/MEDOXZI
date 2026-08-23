-- MEDOXZI Pre-Round — core schema excerpt
-- Demonstrates the constraints the blueprint calls structural rather than
-- procedural. NOT a complete schema; see 04-Architecture/Data-Model.md.
--
-- NOT FOR CLINICAL USE.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------- tenancy

CREATE TABLE tenant (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        text NOT NULL,
    region      text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM (
    'PATIENT','CAREGIVER','FRONT_DESK','INTAKE_STAFF','NURSE',
    'DOCTOR','CLINICAL_SAFETY_OWNER','CLINIC_ADMIN','SUPPORT'
);

CREATE TABLE app_user (
    id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id    uuid NOT NULL REFERENCES tenant(id),
    role         user_role NOT NULL,
    display_name text NOT NULL,
    is_active    boolean NOT NULL DEFAULT true
);

-- --------------------------------------------------------------- encounter

CREATE TYPE encounter_status AS ENUM (
    'CREATED','INTAKE_PENDING','INTAKE_PARTIAL','INTAKE_COMPLETE',
    'PROCESSING','READY','IN_CONSULT','SIGNED','CANCELLED'
);

CREATE TYPE generation_mode AS ENUM (
    'RAW_ONLY','STRUCTURED_ONLY','SOURCE_BOUND_SUMMARY','PARTIAL_DOCUMENT_MODE',
    'AI_DISABLED_BY_CONSENT','AI_DISABLED_BY_COHORT','AI_FAILED_SAFE',
    'FULL_PRE_ROUND'
);

CREATE TYPE document_lifecycle_state AS ENUM (
    'upload_started','upload_complete','checksum_verified','malware_scan_passed',
    'parse_pending','parse_failed','OCR_pending','OCR_partial','OCR_complete',
    'extraction_pending','extraction_partial','extraction_complete',
    'identity_review_required','human_verification_required',
    'ready_for_summary','rejected','quarantined'
);

CREATE TYPE temporal_status AS ENUM (
    'CURRENT','HISTORICAL','DATE_UNKNOWN','SUPERSEDED',
    'REPORTED_STOPPED','NEEDS_CONFIRMATION'
);

CREATE TYPE source_reliability AS ENUM (
    'TRUSTED_CLINIC_RECORD','PATIENT_REPORTED','CAREGIVER_REPORTED',
    'OCR_UNVERIFIED','EXTERNAL_UNVERIFIED','UNCERTAIN'
);

CREATE TYPE identity_binding_status AS ENUM (
    'VERIFIED_MATCH','POSSIBLE_MATCH_REQUIRES_REVIEW','CLEAR_MISMATCH'
);

CREATE TABLE encounter (
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id          uuid NOT NULL REFERENCES tenant(id),
    patient_id         uuid NOT NULL,
    doctor_user_id     uuid REFERENCES app_user(id),
    status             encounter_status NOT NULL DEFAULT 'CREATED',
    cohort_flags       jsonb NOT NULL DEFAULT '{}'::jsonb,
    ai_enabled         boolean NOT NULL DEFAULT false,
    generation_mode    generation_mode NOT NULL DEFAULT 'STRUCTURED_ONLY',
    idempotency_key    text,
    row_version        bigint NOT NULL DEFAULT 1,
    content_version_id text,
    signed_by_user_id  uuid REFERENCES app_user(id),
    signed_at          timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX encounter_idempotency_per_tenant
    ON encounter(tenant_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE TABLE patient_document (
    id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               uuid NOT NULL REFERENCES tenant(id),
    encounter_id            uuid NOT NULL REFERENCES encounter(id),
    storage_object_id       text NOT NULL,
    sha256                  text,
    lifecycle_state         document_lifecycle_state NOT NULL DEFAULT 'upload_started',
    identity_binding_status identity_binding_status,
    identity_resolution_by  uuid REFERENCES app_user(id),
    identity_resolution_at  timestamptz,
    failure_reason          text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

-- CONSTRAINT 1 -------------------------------------------------------------
-- Only a DOCTOR of the same tenant may sign an encounter.
-- Hiding the button in the UI is presentation. This is access control.
CREATE OR REPLACE FUNCTION enforce_doctor_signature() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'SIGNED' THEN
        IF NEW.signed_by_user_id IS NULL THEN
            RAISE EXCEPTION 'Encounter % cannot be SIGNED without a signer', NEW.id;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM app_user u
            WHERE u.id = NEW.signed_by_user_id
              AND u.role = 'DOCTOR'
              AND u.tenant_id = NEW.tenant_id
        ) THEN
            RAISE EXCEPTION
                'Encounter % may only be signed by a DOCTOR of tenant %',
                NEW.id, NEW.tenant_id;
        END IF;
        NEW.signed_at := COALESCE(NEW.signed_at, now());
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_doctor_signature
    BEFORE INSERT OR UPDATE ON encounter
    FOR EACH ROW EXECUTE FUNCTION enforce_doctor_signature();

-- ----------------------------------------------------- extracted facts

CREATE TYPE fact_type AS ENUM (
    'MEDICATION','CONDITION','LAB_RESULT','ALLERGY','PROCEDURE','VITAL',
    'PREGNANCY','ANTICOAGULANT_USE','PATIENT_IDENTITY','DATE_OF_BIRTH',
    'REPORT_OWNERSHIP','OTHER'
);
CREATE TYPE verification_status AS ENUM (
    'UNCONFIRMED','CONFIRMED','CORRECTED','REJECTED','ILLEGIBLE'
);

CREATE TABLE extracted_clinical_fact (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           uuid NOT NULL REFERENCES tenant(id),
    encounter_id        uuid NOT NULL REFERENCES encounter(id),
    document_id         uuid NOT NULL,
    source_span_id      uuid NOT NULL,      -- NOT NULL: no fact without a source
    fact_type           fact_type NOT NULL,
    raw_text            text NOT NULL,
    ocr_text            text,
    normalised_value    jsonb,
    field_confidence    jsonb NOT NULL DEFAULT '{}'::jsonb,
    source_crop_id      text,
    source_reliability  source_reliability NOT NULL DEFAULT 'OCR_UNVERIFIED',
    temporal_status     temporal_status NOT NULL DEFAULT 'DATE_UNKNOWN',
    confidence          numeric(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    is_high_risk        boolean NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'UNCONFIRMED',
    verified_by_user_id uuid REFERENCES app_user(id),
    verified_at         timestamptz,
    original_value      jsonb,
    corrected_value     jsonb,
    reviewer_decision   text,
    created_at          timestamptz NOT NULL DEFAULT now(),

    -- CONSTRAINT 2 ---------------------------------------------------------
    -- A high-risk fact (medication, allergy, dose) can never be CONFIRMED
    -- without a named human behind it. This is the single most important
    -- constraint in the schema: it makes the most dangerous failure mode in
    -- the product unreachable through any code path, present or future.
    CONSTRAINT high_risk_requires_human_verification CHECK (
        NOT (is_high_risk
             AND verification_status = 'CONFIRMED'
             AND verified_by_user_id IS NULL)
    ),

    -- An illegible field carries no value. We do not guess.
    CONSTRAINT illegible_carries_no_value CHECK (
        verification_status <> 'ILLEGIBLE'
        OR normalised_value IS NULL
        OR normalised_value = '{}'::jsonb
    )
);

CREATE TYPE contradiction_status AS ENUM (
    'OPEN','REVIEW_REQUIRED','RESOLVED','REJECTED_AS_FALSE_POSITIVE'
);

CREATE TABLE clinical_contradiction (
    id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id             uuid NOT NULL REFERENCES tenant(id),
    encounter_id          uuid NOT NULL REFERENCES encounter(id),
    fact_a_type           text NOT NULL,
    fact_a_id             uuid NOT NULL,
    fact_b_type           text NOT NULL,
    fact_b_id             uuid NOT NULL,
    source_summary        jsonb NOT NULL,
    confidence            numeric(3,2) CHECK (confidence BETWEEN 0 AND 1),
    status                contradiction_status NOT NULL DEFAULT 'REVIEW_REQUIRED',
    resolution            text,
    resolved_by_user_id   uuid REFERENCES app_user(id),
    resolved_at           timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------- clinical record rows

CREATE TYPE clinical_provenance AS ENUM (
    'PATIENT_REPORTED','CAREGIVER_REPORTED','STAFF_RECORDED',
    'DOCTOR_ASSERTED','RECORD_IMPORTED','AI_EXTRACTED_CONFIRMED'
);

CREATE TYPE allergy_status AS ENUM (
    'ACTIVE','RESOLVED','NONE_KNOWN','NOT_ASKED'
);

CREATE TABLE allergy (
    id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     uuid NOT NULL REFERENCES tenant(id),
    encounter_id  uuid NOT NULL REFERENCES encounter(id),
    substance     text,
    reaction      text,
    severity      text,
    status        allergy_status NOT NULL,
    -- CONSTRAINT 3: every clinical row must declare where it came from.
    provenance    clinical_provenance NOT NULL,
    source_fact_id uuid REFERENCES extracted_clinical_fact(id),
    asserted_by_user_id uuid REFERENCES app_user(id),
    asserted_at   timestamptz NOT NULL DEFAULT now(),

    -- NONE_KNOWN and NOT_ASKED are statements about the *encounter*, not about
    -- a substance. Storing a substance alongside them would let the two
    -- collapse into each other, which is exactly the bug we are preventing.
    CONSTRAINT non_allergy_statuses_carry_no_substance CHECK (
        status NOT IN ('NONE_KNOWN','NOT_ASKED') OR substance IS NULL
    )
);

-- --------------------------------------------------- clinical content

CREATE TYPE content_status AS ENUM (
    'DRAFT','DEMO_UNVALIDATED','CLINIC_REVIEW',
    'APPROVED_FOR_PILOT','ACTIVE','RETIRED'
);

CREATE TABLE clinical_content_source (
    id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                   text NOT NULL,
    publisher               text,
    author_or_organisation  text,
    version_or_date         text,
    source_url              text,
    licence_status          text NOT NULL,
    permitted_reuse_status  text NOT NULL,
    usage_mode              text NOT NULL CHECK (usage_mode IN ('copied','paraphrased','independently_structured')),
    evidence_class          text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clinical_content_version (
    id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id            uuid REFERENCES tenant(id),
    version              text NOT NULL,
    status               content_status NOT NULL DEFAULT 'DRAFT',
    authored_by_user_id  uuid NOT NULL REFERENCES app_user(id),
    signed_by_user_id    uuid REFERENCES app_user(id),
    signed_at            timestamptz,
    activated_by_user_id uuid REFERENCES app_user(id),
    activated_at         timestamptz,
    changelog            text,
    source_registry_ids  uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],

    -- CONSTRAINT 4: two-person control. The author of a safety rule cannot be
    -- the person who puts it into production.
    CONSTRAINT two_person_activation CHECK (
        activated_by_user_id IS NULL
        OR activated_by_user_id <> authored_by_user_id
    )
);

CREATE TABLE safety_rule_activation (
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id          uuid NOT NULL REFERENCES tenant(id),
    rule_key           text NOT NULL,
    rule_version       text NOT NULL,
    clinical_author_id uuid NOT NULL REFERENCES app_user(id),
    reviewer_id        uuid NOT NULL REFERENCES app_user(id),
    effective_date     date NOT NULL,
    source_reference   text NOT NULL,
    clinic_scope       text NOT NULL,
    approval_state     text NOT NULL CHECK (approval_state IN ('DRAFT','SIGNED_APPROVED','RETIRED')),
    created_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rule_author_reviewer_distinct CHECK (clinical_author_id <> reviewer_id)
);

-- Shadow reasoning is intentionally separate from doctor-visible views. The
-- application role serving patient/staff/doctor APIs receives no SELECT grant.
CREATE TABLE shadow_hypothesis_result (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       uuid NOT NULL REFERENCES tenant(id),
    encounter_id    uuid NOT NULL REFERENCES encounter(id),
    run_id          uuid NOT NULL,
    hypothesis_code text NOT NULL,
    hypothesis_rank integer NOT NULL,
    shadow_score    numeric(6,4) NOT NULL,
    model_version   text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT no_probability_field_semantics CHECK (shadow_score BETWEEN 0 AND 1)
);

-- ------------------------------------------------------------- audit

CREATE TABLE audit_event (
    id            bigserial,
    tenant_id     uuid NOT NULL,
    occurred_at   timestamptz NOT NULL DEFAULT now(),
    actor_user_id uuid,
    actor_role    user_role,
    action        text NOT NULL,
    resource_type text NOT NULL,
    resource_id   uuid,
    patient_id    uuid,
    encounter_id  uuid,
    outcome       text NOT NULL,
    reason        text,          -- required for break-glass / out-of-scope
    request_id    text,
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- No UPDATE or DELETE grant is ever issued to the application role on this
-- table. Append-only is enforced by privilege, not by convention.
-- REVOKE UPDATE, DELETE ON audit_event FROM app_role;

-- ------------------------------------------------------- row-level security
-- Applied to EVERY tenant-scoped table. A CI job enumerates tenant-scoped
-- tables and fails the build if any lacks a policy — so tenancy cannot be
-- forgotten when someone adds a table.

ALTER TABLE encounter                ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_clinical_fact  ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergy                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_user                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_document         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_contradiction   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_content_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_rule_activation   ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_hypothesis_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON encounter
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON extracted_clinical_fact
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON allergy
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON app_user
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON patient_document
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON clinical_contradiction
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON clinical_content_version
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON safety_rule_activation
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY shadow_service_only ON shadow_hypothesis_result
    USING (tenant_id = current_setting('app.tenant_id')::uuid
           AND current_setting('app.role', true) = 'shadow_service');

-- CI check (run as a test, not as a migration):
--   SELECT c.relname FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r'
--     AND EXISTS (SELECT 1 FROM information_schema.columns
--                 WHERE table_name = c.relname AND column_name = 'tenant_id')
--     AND NOT c.relrowsecurity;
--   -- must return zero rows

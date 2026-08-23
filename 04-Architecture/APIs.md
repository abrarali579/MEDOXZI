# Deliverable 10 — API Design

**Style:** REST/JSON over HTTPS. Versioned at `/v1`. Tenant resolved from the authenticated principal, **never from a request parameter**. All responses carry `request_id`. All list endpoints are cursor-paginated.

**Cross-cutting rules enforced by middleware:**
- Every request is authenticated; every response is tenant-filtered at the query layer (RLS), not in application code.
- Every clinical data access writes an `audit_event` **before** the response is returned.
- **Any response containing a clinical value includes its `provenance` object.** A serializer that omits provenance fails a CI test.
- **Patient and caregiver principals receive `404` (not `403`) for AI-interpretation resources** — their existence is not disclosed.
- Idempotency keys required on all POSTs that create clinical state.

---

## 1. API groups

| Group | Base path | Consumers |
|---|---|---|
| Authentication | `/v1/auth` | all |
| Patients & registration | `/v1/patients` | staff |
| Encounters & queue | `/v1/encounters`, `/v1/queue` | staff, doctor |
| Intake | `/v1/intake` | patient, caregiver, staff |
| Documents | `/v1/documents` | patient, staff |
| Pre-round | `/v1/encounters/{id}/pre-round` | **doctor only** |
| Questions & responses | `/v1/encounters/{id}/questions` | doctor |
| Clinical record | `/v1/encounters/{id}/clinical` | doctor, nurse |
| Summary & signing | `/v1/encounters/{id}/summary` | doctor |
| Feedback | `/v1/feedback` | doctor, nurse, safety owner |
| Clinical content | `/v1/content` | safety owner, admin |
| Knowledge | `/v1/knowledge` | safety owner, admin |
| Audit & admin | `/v1/admin` | admin |
| Internal AI orchestration | *(not public)* | workers only |

---

## 2. Representative contracts

### 2.1 Register a patient and create an encounter

```http
POST /v1/patients
Authorization: Bearer <staff token>
Idempotency-Key: 7f1c…
```
```json
{
  "name": "…", "dob": "1978-04-12", "dob_precision": "DAY",
  "sex": "female", "contact": "+91…", "preferred_language": "hi",
  "external_id": { "system": "ABHA", "value": "…" }
}
```
```json
201 { "patient_id": "pat_01H…", "created": true, "possible_duplicates": [
      { "patient_id": "pat_01G…", "match_score": 0.82, "match_fields": ["name","dob"] } ] }
```
*Duplicates are **surfaced for staff resolution**, never auto-merged.*

```http
POST /v1/encounters
```
```json
{ "patient_id": "pat_01H…", "doctor_user_id": "usr_…", "department": "general_medicine" }
```
```json
201 {
  "encounter_id": "enc_01H…",
  "status": "INTAKE_PENDING",
  "token": { "number": 47, "queue_position": 12, "issued_at": "2026-08-23T09:14:02+05:30" },
  "intake_link": { "url": "https://…/i/9f2a…", "expires_at": "…", "qr_png_url": "…" },
  "cohort_flags": { "paediatric": false, "pregnancy": null, "elderly": false }
}
```

### 2.2 Consent

```http
POST /v1/patients/{patient_id}/consents
```
```json
{ "type": "AI_PROCESSING", "granted": true,
  "consent_text_version": "ai-processing@2026-06-01.2",
  "language_shown": "hi", "capture_method": "APP" }
```
```json
201 { "consent_id": "con_…", "granted_at": "…", "revocable": true }
```
*Revocation is `POST /v1/consents/{id}/revoke` — never a `PATCH`.*

### 2.3 Intake

```http
GET /v1/intake/{intake_token}/questions?chief_complaint=chest_pain&language=hi
```
```json
200 {
  "content_version": "content@1.4.0",
  "sections": [{
    "key": "symptom_detail",
    "questions": [{
      "id": "q_cp_exertion",
      "text": "क्या यह परिश्रम करने पर बढ़ता है?",
      "answer_type": "ENUM",
      "options": [{"value":"YES","label":"हाँ"},{"value":"NO","label":"नहीं"},
                  {"value":"UNKNOWN","label":"पता नहीं"}],
      "skippable": true,
      "is_required_for_completeness": true,
      "branching": { "if": {"value":"YES"}, "then_show": ["q_cp_duration_exertion"] }
    }]
  }]
}
```

```http
PUT /v1/intake/{intake_token}/responses
```
```json
{ "responses": [
  { "question_id": "q_cp_exertion", "status": "ANSWERED", "value_enum": "YES" },
  { "question_id": "q_cp_radiation", "status": "NOT_ASKED" },
  { "question_id": "q_cp_duration",  "status": "ANSWERED", "value_numeric": 3, "value_unit": "days" }
]}
```
```json
200 { "saved": 3, "sections_completed": 2, "sections_total": 6,
      "next_questions": ["q_cp_duration_exertion"] }
```
*`status` is mandatory on every response. There is no way to submit a value without stating whether it was answered, unknown, or not asked.*

### 2.4 Documents

```http
POST /v1/documents/upload-url
{ "encounter_id": "enc_…", "filename": "lab.jpg", "mime_type": "image/jpeg",
  "page_count": 1, "sha256": "…" }

201 { "document_id": "doc_…", "upload_url": "https://…", "expires_in": 300 }
```

```http
GET /v1/documents/{document_id}
200 {
  "document_id": "doc_…",
  "doc_type": "LAB_REPORT", "doc_type_confidence": 0.94,
  "is_handwritten": false,
  "identity_check": "MATCH",
  "processing_status": "COMPLETE",
  "page_count": 2,
  "view_url": "https://…signed…",
  "extracted_facts": [
    {
      "fact_id": "fact_…",
      "fact_type": "LAB_RESULT",
      "raw_text": "HbA1c 8.4 %",
      "normalised": { "analyte": "HbA1c", "value": 8.4, "unit": "%",
                      "reference_range": "4.0-5.6", "abnormal_flag": "HIGH" },
      "observed_date": "2026-06-02",
      "confidence": 0.96,
      "is_high_risk": false,
      "verification_status": "UNCONFIRMED",
      "source": { "document_id": "doc_…", "page": 1,
                  "bbox": [0.12,0.44,0.61,0.48], "excerpt": "HbA1c 8.4 %" }
    }
  ]
}
```

```http
POST /v1/facts/{fact_id}/verify
{ "action": "CONFIRM" }                       # or CORRECT / REJECT / ILLEGIBLE
{ "action": "CORRECT", "corrected_value": { "dose": 1000, "dose_unit": "mg" } }

200 { "verification_status": "CORRECTED",
      "verified_by": "usr_…", "verified_at": "…",
      "original_preserved": true }
```
*A `CONFIRM` on a high-risk fact by a non-clinical role returns `403`. Enforced at the database layer as well.*

### 2.5 Doctor queue and pre-round view

```http
GET /v1/queue?session_date=2026-08-23&doctor_user_id=usr_…
200 { "items": [
  { "token": 47, "encounter_id": "enc_…", "patient_display": "R. S., F 48",
    "intake_status": "INTAKE_COMPLETE", "documents": {"total":3,"processed":3},
    "red_flags": {"count":1,"max_severity":"HIGH"},
    "pre_round_ready": true, "waiting_minutes": 34 }
]}
```

```http
GET /v1/encounters/{id}/pre-round
Authorization: Bearer <doctor token>
```
```json
200 {
  "encounter_id": "enc_…",
  "generation_mode": "SOURCE_BOUND_SUMMARY",
  "generated_at": "2026-08-23T09:41:11+05:30",
  "content_version": "content@1.4.0",
  "ai_output_id": "aio_…",

  "identity": { "display": "R. S.", "age": 48, "sex": "female", "token": 47 },

  "red_flags": [{
    "flag_id": "flg_…",
    "rule_key": "RF-CHEST-02",
    "rule_version": "content@1.4.0",
    "severity": "HIGH",
    "message": "Chest pain with exertional relationship and age >45 — assess promptly",
    "triggered_by": [
      { "question_id": "q_cp_exertion", "value": "YES" },
      { "field": "age", "value": 48 }
    ],
    "suggested_action": "Prioritise assessment; consider ECG per clinic protocol",
    "acknowledged": false
  }],
  "no_rule_triggered": false,

  "chief_complaint": {
    "value": "Chest pain",
    "duration": { "value": 3, "unit": "days" },
    "provenance": { "source": "PATIENT", "entered_by": "PATIENT", "recorded_at": "…" }
  },

  "allergies": {
    "status": "ACTIVE",
    "items": [ { "substance": "Penicillin", "reaction": "rash", "severity": "moderate",
                 "provenance": { "source": "PATIENT" } } ]
  },

  "medications": [
    { "display": "Metformin 500 mg BD", "generic": "metformin",
      "verification_status": "CONFIRMED",
      "provenance": { "source": "AI_EXTRACTED_CONFIRMED",
                      "document_id": "doc_…", "page": 1, "bbox": [...],
                      "confidence": 0.93, "verified_by": "usr_…" } },
    { "display": "Atorvastatin 10 mg OD", "generic": "atorvastatin",
      "verification_status": "UNCONFIRMED",
      "provenance": { "source": "AI_EXTRACTED", "document_id": "doc_…",
                      "page": 1, "bbox": [...], "confidence": 0.61 } }
  ],

  "significant_positives": [
    { "text": "Chest discomfort worse on exertion",
      "provenance": { "source": "PATIENT", "question_id": "q_cp_exertion" } }
  ],
  "significant_negatives": [
    { "text": "No radiation to arm or jaw",
      "provenance": { "source": "PATIENT", "question_id": "q_cp_radiation" } }
  ],

  "abnormal_prior_labs": [
    { "analyte": "HbA1c", "value": 8.4, "unit": "%", "reference_range": "4.0-5.6",
      "observed_date": "2026-06-02", "trend": "up",
      "provenance": { "source": "AI_EXTRACTED", "document_id": "doc_…",
                      "page": 1, "confidence": 0.96 } }
  ],

  "missing_information": [
    { "field": "smoking_status", "reason": "NOT_ASKED", "importance": "high" },
    { "field": "family_history_cad", "reason": "NOT_ASKED", "importance": "high" }
  ],

  "contradictions": [
    { "topic": "diabetes",
      "a": { "text": "Patient reports no diabetes", "provenance": {"source":"PATIENT"} },
      "b": { "text": "Discharge summary lists Type 2 diabetes",
             "provenance": {"source":"AI_EXTRACTED","document_id":"doc_…","page":2} },
      "resolved": false }
  ],

  "disclaimer": "AI-organised summary of patient-reported and record-derived information. Not a clinical assessment. Verify before use."
}
```

**Note what is absent from this payload:** any diagnostic consideration, any probability, any recommendation. In v1 those exist only in the shadow store, and no route returns them to a doctor.

### 2.6 Questions during consultation

```http
GET /v1/encounters/{id}/questions/next?limit=6
200 { "selection_mode": "DETERMINISTIC",
      "content_version": "content@1.4.0",
      "questions": [
        { "id": "q_cp_radiation_detail", "text": "Radiation?",
          "answer_type": "MULTI",
          "options": ["Left arm","Right arm","Jaw","Back","None","Other"],
          "rationale": "Discriminates between cardiac and musculoskeletal causes",
          "keyboard_hints": ["1","2","3","4","5","6"] } ] }
```

```http
POST /v1/encounters/{id}/questions/{question_id}/response
{ "status": "ANSWERED", "value_multi": ["Left arm"] }

200 { "saved": true,
      "state_updated": true,
      "new_red_flags": [],
      "new_contradictions": [],
      "next_questions": ["q_cp_sweating"] }
```
*Response time budget: <200ms. No model call on this path.*

### 2.7 Summary and signing

```http
GET /v1/encounters/{id}/summary
200 {
  "status": "DRAFT",
  "sections": {
    "patient_reported":      { "text": "…", "provenance_summary": {"PATIENT": 14, "STAFF": 2} },
    "historical_record":     { "text": "…", "sources": [ {"document_id":"doc_…"} ] },
    "observed_in_consult":   { "text": "…" },
    "ai_interpretation":     { "text": "…", "label": "AI-generated — verify",
                               "collapsible": true, "ai_output_id": "aio_…" },
    "doctor_assessment":     { "text": null }
  },
  "verifier_result": "PASS"
}
```

```http
POST /v1/encounters/{id}/sign
{ "approved_note": "…",
  "final_diagnosis": { "text": "Stable angina — for evaluation", "code": "I20.9", "system": "ICD-10" },
  "alternative_diagnosis": { "text": "Musculoskeletal chest pain" },
  "edits": [ { "section": "ai_interpretation", "action": "removed_sentence", "text": "…" } ] }

200 { "status": "SIGNED", "signed_at": "…", "signed_by": "usr_…",
      "edit_diff_stored": true, "export_available": true }

403 { "error": "role_not_permitted", "detail": "Only a DOCTOR may sign an encounter" }
```

### 2.8 Feedback

```http
POST /v1/feedback
{ "encounter_id": "enc_…", "target_type": "SUMMARY", "target_id": "aio_…",
  "rating": "CLINICALLY_UNSAFE", "comment": "Stated allergy status as none; patient reported penicillin allergy" }

201 { "feedback_id": "fb_…",
      "safety_event_created": true,
      "safety_event_id": "sev_…",
      "assigned_to": "clinical_safety_owner",
      "sla_hours": 24 }
```

### 2.9 Clinical content (safety-owner surface)

```http
POST /v1/content/versions
{ "parent_version_id": "cv_…", "changelog": "Tighten RF-CHEST-02 age threshold to 40" }
201 { "version_id": "cv_…", "status": "DRAFT" }

POST /v1/content/versions/{id}/sign        # requires CLINICAL_SAFETY_OWNER
POST /v1/content/versions/{id}/activate    # requires a DIFFERENT user
409 { "error": "two_person_control_required",
      "detail": "Author and activator must be different users for safety content" }

POST /v1/content/versions/{id}/rollback
200 { "active_version": "cv_previous", "rolled_back_at": "…" }
```

### 2.10 Admin and audit

```http
GET /v1/admin/audit?patient_id=pat_…&from=…&to=…&cursor=…
200 { "items": [ { "occurred_at":"…", "actor_user_id":"usr_…", "actor_role":"DOCTOR",
                   "action":"READ_PRE_ROUND", "resource_type":"pre_round_view",
                   "resource_id":"prv_…", "outcome":"SUCCESS", "reason": null } ],
      "next_cursor": "…" }

POST /v1/admin/patients/{id}/erasure
{ "reason": "patient_request", "requested_by": "usr_…" }
202 { "job_id": "job_…", "scope": ["documents","extracted_facts","ai_outputs",
      "shadow_outputs","cache","analytics"], "completion_record_will_be_issued": true }
```

---

## 3. Error model

```json
{ "error": "validation_failed",
  "detail": "…",
  "request_id": "req_…",
  "fields": { "value_numeric": "must be positive" } }
```

| Code | Meaning |
|---|---|
| `400 validation_failed` | Schema or business-rule violation |
| `401 unauthenticated` | Missing/expired credentials |
| `403 role_not_permitted` | Role lacks the capability |
| `404 not_found` | Includes deliberate concealment of AI resources from patient principals |
| `409 conflict` | State machine violation, two-person control, idempotency replay mismatch |
| `410 gone` | Deleted per retention or erasure |
| `422 clinical_constraint` | e.g. confirming a high-risk fact without a clinical role |
| `429 rate_limited` | |
| `503 degraded` | AI layer unavailable; **response indicates which capabilities are degraded, and the client renders the raw view rather than failing** |

## 4. Webhooks / events (internal)

`encounter.intake_submitted` · `document.processed` · `document.extraction_failed` · `preround.ready` · `preround.degraded` · `safety_flag.raised` · `encounter.signed` · `feedback.clinically_unsafe` · `content.version_activated`

All events are PHI-free: identifiers only, no clinical values.

## 5. API conventions that are safety controls

1. **Provenance is a required field of every clinical value serializer** — tested in CI by a schema assertion over all responses.
2. **`status` is required on every question response** — there is no way to record a value without recording how it was obtained.
3. **`generation_mode` is always present on the pre-round view**, so the client always knows whether it is showing AI output, a degraded view, or a consent-gated raw view.
4. **`no_rule_triggered` is an explicit boolean**, so the UI can render the correct wording rather than inferring reassurance from an empty array.
5. **Draft content is never returned by export endpoints** — enforced by the query, not by the caller.
6. **The pre-round route requires a `DOCTOR` principal**; there is no query parameter, header, or role escalation that returns shadow considerations in v1.

## v2.2 Reconciliation

APIs must not expose shadow hypotheses to patient, staff, or doctor roles. Replace unsupported probability fields with `shadow_score`, `hypothesis_rank`, or `relative_score` in internal-only endpoints. Public clinical responses include explicit fallback/error states and idempotency keys for submit, upload, webhook, retry, and summary regeneration flows.


> ### ⚠️ v2 — INDONESIA IS NOW THE PRIMARY JURISDICTION
>
> The country-neutral architecture (§1–§5) stands unchanged and is still the design.
>
> **The India-specific analysis (§6) is superseded as the governing analysis by [13-Indonesia/Regulatory-Indonesia.md](../13-Indonesia/Regulatory-Indonesia.md).** Key deltas under Indonesia's UU 27/2022 and GR 28/2024:
> - **Breach notification: 72 hours** (3×24) to data subjects and the authority
> - **Health data must be stored in Indonesian data centres**, and transfers between health information system organisers must route through the national health information system ⚖️
> - **No adequacy list exists**, so cross-border transfer rests on contractual safeguards or consent
> - **Administrative sanctions up to 2% of annual revenue**; criminal provisions with corporate multipliers
> - **A dedicated supervisory authority has not yet been appointed** — MOCD currently supervises
>
> The de-identification boundary in §2 becomes more load-bearing, not less — **and it is not sufficient on its own**, because GR 28/2024 attaches to the organiser's data centres rather than only to identifiers.

# Deliverable 12 — Privacy, Security and Governance

> **⚖️ This document is not legal advice.** It is an engineering and design analysis by a product team. Every item marked ⚖️ requires review by qualified Indian data-protection counsel and, where indicated, by regulatory counsel, before the pilot processes real patient data.

---

## 1. Country-neutral architecture (the baseline everything else layers onto)

These controls are designed to satisfy the common core of DPDP, HIPAA and GDPR-style regimes, so that the launch geography changes configuration rather than architecture.

| Principle | Implementation |
|---|---|
| **Data minimisation** | Collect only what changes clinical management. Social history is scoped tightly. No collection of protected attributes not clinically required. Free text is preferred over structured collection of sensitive categories. |
| **Purpose limitation** | Each data category has a declared purpose recorded in the schema; analytics uses a separate, de-identified store. |
| **Lawful basis** | Layered, granular, revocable consent (§3) plus the clinic's treatment basis. |
| **Storage limitation** | Retention policy per data class, enforced by an executable deletion workflow, not by intention. |
| **Integrity and confidentiality** | Encryption at rest and in transit, RBAC + RLS, network segmentation, secrets management, audit. |
| **Accountability** | Append-only audit, versioned AI outputs, documented governance roles, DPIA before pilot. |
| **Data subject rights** | Access, correction, erasure and portability implemented as workflows with completion records. |
| **Data residency** | Per-tenant region configuration; **no PHI leaves the configured region**, including to model endpoints. |

## 2. The de-identification boundary (the single most important privacy control)

**Rule: no direct identifier ever crosses the model gateway.**

```
┌──────────────────── Trust boundary ─────────────────────┐
│                                                          │
│  patient.name, phone, address, MRN, ABHA                 │
│  ── stored in application-level-encrypted columns ──     │
│                                                          │
│  Model payload construction:                             │
│    • direct identifiers  → REMOVED                       │
│    • name references     → "the patient"                 │
│    • dates of birth      → age in years only             │
│    • precise dates       → relative offsets where the    │
│                            clinical meaning is preserved │
│    • free text           → Presidio scan + redaction     │
│    • encounter identity  → stable per-encounter pseudonym│
│                                                          │
│  ── mapping table never leaves the database ──           │
└──────────────────────────┬───────────────────────────────┘
                           │ pseudonymised clinical payload only
                           ▼
                   Model gateway → LLM endpoint (in-region)
```

**Honest limitations, stated rather than glossed over:**
- **This is pseudonymisation, not anonymisation.** A detailed clinical narrative can be re-identifying in principle. The control reduces exposure; it does not eliminate it. ⚠️
- **Free-text redaction is imperfect.** Presidio's own documentation warns that it will not find everything. It is defence in depth, not a guarantee. 🔐
- **Therefore the contractual controls matter as much as the technical ones**: in-region endpoint, no training on our data, zero or minimal retention, deletion on request, subprocessor disclosure, breach notification. These must be in writing before any real data flows. ⚖️
- Uploaded **document images are never sent to a general LLM endpoint** — OCR runs in our own workers, or through a contracted OCR service under the same terms.

## 3. Consent architecture

| Consent | Legal character | Default | Granularity | Revocable | Effect of refusal |
|---|---|---|---|---|---|
| Treatment / record | Clinic's basis for care | Per clinic | Patient | Per clinic policy | Clinic's existing process |
| **AI-assisted processing** | Explicit, specific, informed | **Off** | Patient, per encounter type | **Yes** | Intake captured, shown raw; **zero model calls**; encounter proceeds |
| Product improvement (de-identified) | Explicit, separate, optional | **Off** | Patient | **Yes** | Excluded from all datasets; removed at the next dataset build |
| Caregiver representation | Explicit | Off | Per link | Yes | Caregiver cannot act |
| Guardian consent (minors / persons requiring a guardian) | Statutory | Required where applicable | Patient | Yes | Intake requires an authorised guardian ⚖️ |

**Design commitments:**
- Consent notices are **standalone, plain-language, in the patient's chosen language**, and versioned — the exact text shown is reproducible for any historical consent.
- **Refusal is functional.** A consent that cannot be refused without losing care is not consent. Enforcement is technical: `encounter.ai_enabled = false` short-circuits the orchestrator before any model client is constructed, and this is asserted in an integration test.
- **Withdrawal propagates to derived data.** AI outputs, shadow outputs, cached views and analytics rows derived from a withdrawn patient are deleted; the deletion job enumerates every derived artefact and issues a completion record.
- **No pre-ticked boxes, no bundled consent, no dark patterns.**

## 4. Security controls

| Domain | Control |
|---|---|
| **Identity** | MFA for all clinical and admin roles; SSO where the clinic has it; short sessions; device binding for shared tablets; forced re-auth for admin actions |
| **Authorisation** | RBAC (see [Access-Control.md](Access-Control.md)); least privilege by encounter, not only by role; break-glass with ticket, approver, time-box, notification and audit |
| **Tenancy** | `tenant_id` on every table + Postgres RLS; a cross-tenant test suite runs in CI and blocks merge on failure |
| **Encryption at rest** | Database, object storage and backups encrypted with managed keys; **direct identifiers additionally encrypted at the application layer** so a database dump alone does not reveal them |
| **Encryption in transit** | TLS 1.3 externally; mTLS between internal tiers |
| **Secrets** | Managed secret store, automated rotation, no secrets in images, environment files, or repositories; secret scanning in CI |
| **Network** | Private subnets; data tier has no internet route; **egress allowlist** limited to the model endpoint, SMS gateway and OCR fallback; AI/OCR workers have no other egress |
| **Document access** | Short-lived signed URLs (≤5 min), scoped to one document, logged on issuance and on use |
| **Input handling** | MIME validation, virus scan, size limits, image re-encoding to strip metadata (including EXIF GPS) |
| **Prompt injection** | Untrusted text is delimited and never concatenated into instructions; output schemas constrain what any injection could achieve; the traceability verifier is the backstop |
| **Backups** | Encrypted, in-region, RPO ≤15 min, **restore tested quarterly** — an untested backup is a hope |
| **Disaster recovery** | RTO ≤4h; documented and rehearsed runbook |
| **Logging** | **No PHI in logs.** Pseudonymous identifiers only. Enforced by a log filter, a CI lint rule, and periodic sampling |
| **Observability** | Metrics and traces carry ids, never clinical values |
| **Vulnerability management** | Dependency scanning, container scanning, documented patch SLA, annual third-party penetration test before scale-up |
| **Third-party risk** | DPA with every subprocessor; recorded subprocessor list; no-training and retention terms in writing; annual review ⚖️ |

## 5. Data classification and handling

| Class | Examples | Handling |
|---|---|---|
| **Direct identifiers** | Name, phone, address, MRN, ABHA | Application-layer encrypted; never in logs; **never sent to a model**; access audited |
| **Clinical PHI** | Symptoms, diagnoses, medications, labs, documents | Encrypted at rest; RLS; audited; pseudonymised before model calls |
| **AI artefacts** | Prompts, outputs, shadow outputs | Treated as PHI; separate retention; deleted with their source |
| **Operational** | Tokens, queue positions, timings | Lower sensitivity; still tenant-scoped |
| **De-identified analytics** | Aggregated metrics | Separate store, separate account; **re-identification attempts are a policy violation and a monitored event** |
| **Secrets** | Keys, credentials | Managed store only |

## 6. India-specific analysis ⚖️

**Framework:** Digital Personal Data Protection Act, 2023, with the DPDP Rules, 2025 **notified 14 November 2025** with an **18-month phased compliance timeline** **[Confirmed — PIB, R-02]**.

| Requirement | What it means for us | Status |
|---|---|---|
| **Data Fiduciary vs Processor** | Likely **Processor** for clinic-directed processing and **Fiduciary** for our own product analytics — a dual posture requiring distinct contractual and consent treatment | **⚖️ Must be determined by counsel** — Open Question D1 |
| **Consent notice** | Must be standalone, clear, simple, and explain the specific purpose **[Confirmed]** | Designed in §3; text requires legal review ⚖️ |
| **Consent Managers** | Must be Indian companies **[Confirmed]**; relevant if we integrate ABDM consent flows | Deferred to Phase 2 |
| **Children** | Verifiable parental consent required **[Confirmed]** | Guardian consent path designed; **paediatric AI processing is out of scope in v1 anyway**, which conveniently reduces exposure |
| **Persons with disabilities** | Lawful guardian consent where applicable **[Confirmed]** | Guardian path designed ⚖️ |
| **Breach notification** | Affected individuals must be informed in plain language covering nature, consequences, remediation and a contact point **[Confirmed]** | Runbook required before pilot (§8) |
| **Significant Data Fiduciary** | Triggers independent audits, DPIAs and possible localisation restrictions **[Confirmed that the category exists]** | Assumed not applicable at pilot scale; **re-assess at multi-clinic** ⚖️ |
| **Retention** | The Rules as summarised do not set health-sector periods **[Confirmed absence in the reviewed source]** | **Must be set against Indian medical-records retention requirements** — Open Question D5 ⚖️ |
| **Sector-specific health obligations** | Not addressed in the reviewed source | **[Unverified]** — counsel must check for separate health-sector guidance ⚖️ |
| **Localisation** | Government may specify restrictions for Significant Data Fiduciaries **[Confirmed]** | We design for in-India residency regardless — it is the safe default |
| **ABDM** | Voluntary today; relevant for identity and distribution | Capture ABHA as an identifier; integration is Phase 2/3 |

**Our default posture:** behave as though the stricter interpretation applies — all PHI in India, explicit granular consent, full audit, documented DPIA — because the cost of doing so now is small and the cost of retrofitting is not.

## 7. US HIPAA comparison ⚖️

Included because it is the most likely second market and because designing to the intersection costs little now.

| Dimension | India (DPDP) | US (HIPAA) | Our design |
|---|---|---|---|
| Scope | Digital personal data broadly | PHI held by covered entities and business associates | Treat all clinical data as maximally protected |
| Our role | Fiduciary or Processor **[to be determined ⚖️]** | Almost certainly a **Business Associate** | Design for Processor/BA obligations either way |
| Contract | DPA | **BAA required** | Template both |
| Consent | Explicit consent central | Treatment/payment/operations often permit use without individual authorisation; **research and marketing require authorisation** | We require explicit consent regardless — stricter, simpler, more defensible |
| Security rule | Principles-based | Administrative, physical, technical safeguards specified | Our controls map to the HIPAA Security Rule categories |
| Breach notification | Individuals + Board, plain language | Individuals within 60 days; HHS; media if ≥500 | Runbook designed to the stricter timeline |
| De-identification | Not prescriptively defined | Safe Harbor (18 identifiers) or Expert Determination | **Use HIPAA Safe Harbor as the working technical standard** — it is concrete, testable, and satisfies both |
| Minimum necessary | Data minimisation | "Minimum necessary" standard | Least privilege by encounter |
| Audit | Accountability principle | Required | Append-only audit from commit #1 |

**Practical conclusion:** building to *HIPAA Safe Harbor de-identification + DPDP explicit consent + in-region residency* satisfies both regimes' hard requirements and gives a clean story to either regulator. **[Inference ⚖️]**

## 8. Governance artefacts required before the pilot

| Artefact | Owner | Blocking? |
|---|---|---|
| Data Protection Impact Assessment | Privacy advisor + CTO | **Yes** ⚖️ |
| Records of Processing Activities | CTO | Yes |
| Data Processing Agreement with the pilot clinic | Founder + counsel | **Yes** ⚖️ |
| DPAs with every subprocessor (LLM, OCR, SMS, hosting) | CTO + counsel | **Yes** ⚖️ |
| Consent texts, reviewed and translated | Counsel + clinical lead | **Yes** ⚖️🩺 |
| Breach response runbook, with named roles and rehearsal | CTO | **Yes** |
| Data retention and deletion policy | CTO + counsel | Yes ⚖️ |
| Access control policy and role definitions | CTO | Yes |
| Security review / penetration test | External | Before scale-up |
| Ethics / institutional review pathway for the pilot | Founder + clinical lead | **Yes** 🩺⚖️ |
| Model vendor terms: in-region, no-training, retention, deletion | CTO + counsel | **Yes** ⚖️ |

## 9. Breach response outline

1. **Detect** — alerting on anomalous access, failed RLS assertions, egress violations, mass export.
2. **Contain** — revoke credentials, isolate, freeze the affected tenant if required.
3. **Assess** — scope, data classes, individuals affected, from the audit log.
4. **Notify** — clinic within 24h; individuals and the Data Protection Board per DPDP Rules requirements, in plain language covering nature, consequences, remediation and contact ⚖️.
5. **Remediate and record** — root cause, fix, verification, and a written post-incident report.
6. **Review** — the runbook is rehearsed at least annually; an unrehearsed runbook is a document, not a capability.

## 10. Model-training consent — the explicit position

- **No customer or patient data is used to train or fine-tune any model without separate, granular, revocable opt-in consent**, and not at all in v1.
- **Contractual no-training terms with the model vendor are mandatory** and verified in writing before any real data flows ⚖️.
- Product-improvement datasets are **de-identified, consented, versioned, governed and expiring** — see [AI-Architecture.md](../04-Architecture/AI-Architecture.md) §7.
- **Withdrawal removes the individual from future dataset builds**, and this is a tested workflow.

## v2.2 Reconciliation

Do not hard-code MEDOXZI as controller or processor in all cases. Maintain a purpose matrix for intake, documents, summaries, support, telemetry, model processing, retention, deletion, and candidate learning data. Apply data minimisation and retention nuance: medical-record retention may constrain deletion of clinical records while derived/non-required data may need separate handling.


> ### ⚠️ v2 AMENDMENT — read first
>
> **The deterministic red-flag engine is no longer an MVP feature.** It is built, tested and wired in, but **ships with an empty rule set**. The lead doctor at clinic 1 authors the rules during CUSTOMISE, and until they do, the product emits **no urgency signal of any kind**.
>
> This is what makes shipping without a contracted clinical safety owner defensible: with an empty rule set, the MVP makes no clinical assertion at all. Everywhere below that lists red-flag rules as an MVP must-have, read it as *"engine present, rule set empty, filled at CUSTOMISE."*
>
> **Also added to the MVP:** the agent harness ([12-Harness/](../12-Harness/)) and FHIR-R4-shaped export (Indonesia's SATUSEHAT platform is FHIR R4 and mandated).
>
> See [00-Executive/Revised-Direction-v2.md](../00-Executive/Revised-Direction-v2.md).

> ### v2.4 AMENDMENT - healthcare-first narrow MVP
>
> Founder direction in session H supersedes the v2.3 Evidence Sprint sequence for immediate work. Build healthcare first, narrowly:
>
> 1. basic personal information and encounter token;
> 2. patient/caregiver/staff enters a 2-3 line issue description in the patient's words;
> 3. system asks Lead-Doctor-approved basic history/symptom questions relevant to that description;
> 4. previous reports may be attached, but first MVP treats them primarily as doctor-reviewable sources, not trusted extracted conclusions;
> 5. a source-bound brief is pushed to the doctor's tablet/phone.
>
> Best initial patient segment: first clinic visits with no previous reports. No AI diagnosis, conclusion, treatment advice, reassurance or visible differential is in scope. See ADR-035.

# Deliverable 6 — MVP Specification

**The rule applied throughout:** *a feature earns MVP inclusion only if removing it would prevent us from learning whether pre-rounding saves physician time safely.* Everything else, however technically attractive, is deferred. Several features in this document were cut specifically because they were possible rather than necessary.

---

## 1. MVP — Must Have

### 1.1 Registration and queue
- Staff registration + patient lookup with identity verification; first-visit patients are the preferred initial segment
- Deterministic token issuance bound to `(tenant, patient, encounter, doctor, session)`
- Layered consent capture (treatment / AI processing / product-improvement opt-in, default off)
- Intake handoff: SMS link, QR, or clinic tablet
- Queue view with intake status, document attachment status and brief readiness
- Staff-controlled queue re-ordering (suggested, never automatic)
- **Degraded mode**: clinic can register and queue with the AI layer down

### 1.2 Intake (all three modes)
- Patient self-service PWA, caregiver-assisted, and staff-assisted — **one data model, differing only in provenance**
- Chief complaint selection from the clinician-authored list, plus a **2-3 line free-text issue description**
- Basic branching question sets from the **Lead-Doctor-approved healthcare pack** *(scope-limited on purpose)*
- Medications (search + photo + free text + "don't know"), allergies (with `NONE_KNOWN` ≠ `NOT_ASKED`), comorbidities, surgeries, family/social history
- English + 2 languages
- Continuous autosave, resumable sessions, staff handoff
- Patient review screen in their own language
- **Zero clinical interpretation shown to the patient**

### 1.3 Document ingestion
- Upload/capture, quality check, virus scan, encrypted tenant-scoped storage
- Preprocess → digital-text-or-OCR → classify → type-specific extraction where available; attachment viewing is sufficient for the first narrow MVP
- Medications, problems, lab analytes (value + unit + reference range), dates, all treated as unconfirmed until human review
- **Per-fact confidence + source span (page + bounding box)**
- **High-risk facts enter `UNCONFIRMED`; human confirmation required**
- Duplicate merge with multi-source facts; contradiction surfacing
- Patient-identity cross-check that blocks on mismatch
- Explicit `EXTRACTION_FAILED` state — no guessing
- Fully asynchronous

### 1.4 Pre-round processing
- Async pipeline triggered on submission
- **Deterministic red-flag rule engine present but production rule pack empty** until named Lead Doctor sign-off
- LLM synthesis under a strict schema, followed by a **traceability verifier** with degrade-to-raw on failure
- Cohort gating (paediatric / pregnancy / elderly → suppress AI, show raw)
- Consent gating (refusal → zero LLM calls)
- Full AI output provenance: model, version, prompt version, content version, input hash, latency
- **Differential engine + question ranker in shadow mode** (persisted, never rendered to the consulting doctor)

### 1.5 Doctor Pre-Round View
- The one-screen snapshot per FR-5.1, ≤30-second read, <1.5s interactive
- Provenance chips on every element; 1-click to highlighted source
- Unconfirmed facts visually distinct
- If no approved safety rules exist, "No clinic-approved safety rules are active"
- Explicit empty and partial states
- Question panel with one-tap controls, contradiction surfacing, missing-critical-information block
- Doctor-added questions captured as signal

### 1.6 Summary and record
- Five structurally separated sections
- Editable draft; **`DOCTOR`-only approve**; draft excluded from export
- Draft↔approved diff stored
- Final clinician diagnosis + optional alternative
- PDF and structured JSON export of approved encounters
- Versioned amendments; nothing overwritten

### 1.7 Feedback
- One-tap ratings on questions, considerations (shadow reviewers) and summaries
- **"Clinically unsafe" → immediate safety event to the clinical safety owner, tracked to closure**
- Extraction and history corrections stored as labels with originals preserved
- Never mandatory, never blocking
- **No automatic model change from any feedback**

### 1.8 Platform and safety foundations
- RBAC per [User-Roles.md](User-Roles.md); `tenant_id` + Postgres RLS everywhere
- Encryption at rest and in transit; managed secrets; PHI-free logs
- Append-only audit of access, AI outputs, overrides, content changes
- Configurable retention + executable deletion (including derived AI outputs)
- Clinical content authoring + versioning + two-person sign-off, **no deploy required**
- In-region data residency; **no direct identifiers to any external model endpoint**
- Evaluation harness + synthetic case suite (Synthea-derived + clinician-authored)

---

## 2. Phase 2 — after the workflow is validated

Gated on: pilot demonstrating time saving, zero unresolved critical safety events, and — for anything marked ⚖️ — a written regulatory opinion.

| Feature | Gate |
|---|---|
| **Differential considerations visible to the doctor** | Adjudicated validation gates passed **and** regulatory opinion obtained ⚖️🩺 |
| **LLM question re-ranking visible** | Gate 6 only: shadow-mode evidence from an adjudicated corpus, domain-expert review, rollback plan and any required regulatory opinion |
| Learned question ranking from feedback (governed, offline, versioned) | Dataset governance in place |
| Institutional knowledge RAG with citations | Licence verification complete ⚖️ |
| Expansion beyond the top 10 complaints | Clinician authorship capacity |
| Paediatric / pregnancy / elderly cohort support | Cohort-specific rules authored and validated 🩺 |
| HIS integration (read patient + token) | Pilot clinic's vendor cooperation |
| FHIR export (Patient, Encounter, Condition, Observation, MedicationStatement, AllergyIntolerance, DocumentReference) | Real integration demand |
| Vitals capture and integration | Clinic workflow fit |
| Terminology mapping to ICD-10 / SNOMED CT | Licensing resolved ⚖️ |
| Multi-doctor, multi-department scheduling | Second clinic |
| Analytics dashboard for clinic admins | Demand from a paying customer |
| Additional languages | Translation review budget |
| Longitudinal cross-visit patient view | Retention and identity-resolution policy settled |

## 3. Phase 3 — advanced intelligence and scale

Ambient voice capture and scribe integration · learned differential ranking with formal fine-tuning under full dataset governance · specialty packs · ABDM/ABHA integration · SMART-on-FHIR app hosting · multi-tenant self-service onboarding · institutional learning loop across clinics · population analytics (OMOP) · clinician-facing evidence Q&A · offline-first field deployments.

---

## 4. Features deliberately cut from the MVP, and why

*This section exists so that these arguments do not have to be re-litigated in sprint planning.*

| Cut | The argument for including it | Why it is cut anyway |
|---|---|---|
| **Visible differential diagnosis** | It is the most impressive feature and the one the vision centres on | It is the feature that (a) makes the product a candidate regulated device ⚖️, (b) introduces automation bias before any trust exists, and (c) is unvalidated. **Building it in shadow mode captures 100% of the learning value at 0% of the clinical risk.** This is the single most important decision in the document. |
| **Trusted previous-report conclusions in first MVP** | Reports are valuable and patients often bring them | Founder selected first-visit/no-report patients as the best initial segment. First MVP may attach reports for doctor review and label extraction as unconfirmed; trusted extraction can follow once the real document mix and human-confirmation workflow are proven. |
| Ambient voice | Doctors love it; the category is proven | Solves the *post*-consultation problem; consent and multilingual acoustics are hard; irrelevant to our hypothesis |
| EHR/FHIR write-back | "It has to fit their EMR" | Every integration is a months-long vendor negotiation. PDF/JSON export tests the same workflow at 5% of the cost. |
| Literature/guideline Q&A | Clinicians ask for it | Different product, enormous licensing surface, its own evaluation programme, orthogonal to the hypothesis |
| Fine-tuning | "Our data is the moat" | We have no dataset, no labels, no governance, no rollback story. The MVP's job is to *create* the dataset. |
| Drug interaction checking | Obvious adjacency, clear value | Regulated function; requires licensed drug data; much higher validation bar; a wrong answer is directly harmful |
| ICD/SNOMED autocoding | Enables billing and reporting | Licensing ⚖️, mapping quality, and no pilot user needs it |
| Native mobile apps | Better camera and performance | Two app-store pipelines. PWA is sufficient and shippable. |
| Full offline mode | Real clinics have bad connectivity | **Confirm the requirement exists before paying for it** (Open Question A5). Local draft persistence + resumable upload covers most of the real need. |
| Admin analytics dashboard | Clinics want to see value | A nightly job and a weekly PDF answer this during a pilot |
| Multi-tenant self-service onboarding | "Design for scale" | Schema hooks yes, product no. One clinic cannot justify the surface. |
| Patient results / report access | Patients ask for it | Standing constraint #2 territory; opens a large support and interpretation burden |
| Symptom severity scoring shown to patients | It's just a number | It is not just a number. It is clinical interpretation delivered to a layperson. |
| Auto queue re-ordering on red flags | It would save lives | It would also reorganise a clinic's operations without a human decision. **Suggest; never act.** 🩺 |

---

## 5. MVP acceptance — the product is "done" when

**Functional**
- [ ] Three intake modes produce identical structures with correct provenance
- [ ] Basic healthcare question sets authored, translated, Lead-Doctor-signed
- [ ] Previous-report attachment and source viewing works end to end; extraction, if present, is unconfirmed until human review
- [ ] Pre-round view renders correctly for complete, partial, empty, cohort-gated and consent-refused states
- [ ] Red-flag engine matches the clinician-authored rule table on 100% of the rule test suite
- [ ] Doctor can complete an encounter in the target interaction budget
- [ ] Approve is the only path into the clinical record, verified by test
- [ ] Shadow-mode outputs accumulating with adjudication tooling

**Safety** *(any failure blocks release)*
- [ ] Verifier rejects untraceable statements; degrade-to-raw tested
- [ ] No medication or allergy can be `CONFIRMED` without a human actor — enforced at the database level
- [ ] Patient/caregiver roles cannot reach AI interpretation — enforced at the API level and tested in CI
- [ ] Consent refusal produces zero LLM calls — verified by an integration test asserting on the model client
- [ ] Cohort gating verified for paediatric, pregnancy and elderly
- [ ] Seeded-error test run with clinicians completed and results reviewed

**Platform**
- [ ] RLS verified by a cross-tenant access test suite
- [ ] Audit completeness verified for every clinical read/write path
- [ ] Deletion workflow executes and removes derived AI outputs
- [ ] Latency targets met on clinic hardware
- [ ] Degraded mode verified with the AI layer fully stopped
- [ ] Security review completed 🔐

**Clinical governance**
- [ ] Clinical safety owner has signed the content pack
- [ ] Validation stages 1–3 passed with documented acceptance criteria
- [ ] Safety event process operating with a named owner and a closure SLA

## v2.2 Reconciliation

MVP includes the red-flag engine and demo/test rule runtime, but the production clinic rule pack is empty until Lead Doctor sign-off. No visible diagnostic intelligence, disease probability, treatment advice, or patient interpretation is in scope. The highest usable V1 output is a source-bound pre-round brief with visible provenance, reliability, verification, missing information, and contradictions.

## v2.4 Reconciliation

Healthcare is the committed first vertical by founder decision (ADR-035). The immediate MVP is narrower than earlier versions: first-visit/no-report patients are preferred; previous reports are optional doctor-reviewable attachments; patient free text drives selection of approved basic questions; the output is a tablet/phone doctor brief, not an AI conclusion.


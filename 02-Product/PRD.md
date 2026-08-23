# Deliverable 5 — Product Requirements Document

**Product:** MEDOXZI Pre-Round — AI Pre-Round System for OPD
**Version:** 1.0 (MVP definition)
**Date:** 23 August 2026
**Status:** v2.4 healthcare-first narrow MVP; for review by product owner, Lead Doctor, engineering lead

> **v2.4 founder direction:** proceed healthcare-first and defer the Evidence Sprint. The first MVP is not a full document-extraction product. It is a waiting-room intake workflow: basic personal information, 2-3 line patient issue description, relevant Lead-Doctor-approved symptom/history questions, optional previous-report attachments for doctor review, then a source-bound brief pushed to the doctor's tablet/phone. Preferred initial patients are first clinic visits with no previous reports. See ADR-035.

---

## 1. Problem statement

A busy OPD physician has 3–7 minutes per patient. A large share of that is spent extracting information the patient already knows and reading records the patient already brought — while the patient has just spent 20–60 minutes sitting idle in the waiting room. The information exists; it is simply not organised at the moment the doctor needs it.

**Hypothesis:** if patient history and prior records are collected, parsed and organised *before* the consultation, and presented to the doctor in a form readable in under 30 seconds, consultation time falls without any reduction in clinical quality.

**This PRD specifies the smallest product that tests that hypothesis safely.**

## 2. Goals and non-goals

### Goals
| G# | Goal | Measured by |
|---|---|---|
| G1 | Reduce doctor-facing consultation time | Median consultation minutes, intake-complete vs intake-absent |
| G2 | Preserve or improve information completeness | Adjudicated critical-omission rate; clinician-reported missed information |
| G3 | Make prior records reviewable when present, without making extraction the first dependency | Attachment open time; source-viewer usability; human-confirmation rate |
| G4 | Establish clinician trust through provenance | Provenance click-through rate; trust survey; error-catching rate in seeded-error tests |
| G5 | Be usable by patients who cannot use an app | Share of encounters completed via staff/caregiver-assisted intake; completion rate by mode |
| G6 | Generate a governed corpus for future clinical intelligence | Shadow-mode outputs with adjudicated labels; final-diagnosis capture rate |

### Non-goals (v1)
Autonomous diagnosis · AI clinical conclusions · patient-facing clinical interpretation · ambient voice · EHR write-back · literature Q&A · model fine-tuning · billing/claims · prescribing or interaction checking · autocoding for reimbursement · multi-tenant commercial administration · trusted report extraction before human review.

## 3. Users and their jobs

See [User-Roles.md](User-Roles.md) for permissions detail.

| User | Job to be done | Success for them |
|---|---|---|
| **OPD doctor** | "Tell me who this is and what matters, before I look up." | Opens patient, reads once, starts reasoning immediately |
| **Patient** | "Tell my story once, in my language, without repeating it." | Finishes intake without help; is not asked the same thing twice |
| **Caregiver** | "Give the history for my parent/child accurately." | Can complete intake on someone's behalf, with that recorded |
| **Front-desk staff** | "Register and queue people fast." | Registration adds <30s to their existing flow |
| **Assisted-intake staff** | "Help patients who can't use the app, without becoming the bottleneck." | Can complete an intake in ≤5 minutes |
| **Nurse / triage** | "Know if someone in the queue shouldn't be waiting." | Red flags visible, actionable, and rare enough to be believed |
| **Clinical safety owner** | "Own what this system says, and prove it." | Can author, version and sign clinical content without engineering |
| **Clinic admin** | "Manage users and see it's working." | Self-service user management; weekly metrics |

## 4. Functional requirements

Priority: **M** = MVP must-have · **S** = MVP should-have · **P2/P3** = later phase.

### 4.1 Registration and queue

| ID | Requirement | Pri |
|---|---|---|
| FR-1.1 | Staff can register a new patient with name, age/DOB, sex, contact, optional external identifier | M |
| FR-1.2 | Staff can search and select an existing patient, with identity verification prompts | M |
| FR-1.3 | System issues a token bound to `(tenant, patient, encounter, doctor, session)`; token issuance is deterministic and never AI-mediated | M |
| FR-1.4 | System captures and stores, as separate records: treatment consent, AI-processing consent, and (default off) de-identified product-improvement opt-in | M |
| FR-1.5 | Intake link delivered by SMS/QR to the patient's phone, or opened on a clinic tablet, or started by staff — all producing the same encounter | M |
| FR-1.6 | Queue view shows token, patient, intake status (none/partial/complete), report-attachment status, and doctor-brief readiness | M |
| FR-1.7 | Staff can re-order the queue; if Lead-Doctor-approved safety rules are active, the system may *suggest* a re-order on a signed rule trigger but never applies one automatically | M |
| FR-1.8 | Registration can proceed and the clinic can operate if the AI layer is unavailable | M |

### 4.2 Intake — patient, caregiver and staff-assisted

| ID | Requirement | Pri |
|---|---|---|
| FR-2.1 | Three entry modes (patient / caregiver / staff) write the **identical data model**; only `entered_by`, `entry_mode` and actor identity differ | M |
| FR-2.2 | Patient selects chief complaint from a clinician-authored list, with free-text "other" | M |
| FR-2.3 | Patient/caregiver/staff records a 2-3 line issue description in the patient's own words | M |
| FR-2.4 | System presents a **basic branching question set** for the selected complaint/description, from the Lead-Doctor-approved content bank | M |
| FR-2.5 | Every question is skippable; skipped is stored as `NOT_ASKED`, distinct from a negative answer | M |
| FR-2.6 | Medication capture: search-as-you-type over a curated brand/generic list, plus photo capture, plus free text; "I don't know" is a valid recorded answer | M |
| FR-2.7 | Allergy capture with reaction type; `NONE_KNOWN` and `NOT_ASKED` are distinct stored values | M |
| FR-2.8 | Comorbidity, surgical, family and social history capture, all optional | M |
| FR-2.9 | Intake available in English + at least two additional languages; language chosen once and applied throughout | M |
| FR-2.10 | Intake state auto-saves continuously; a session can be resumed or handed to staff without data loss | M |
| FR-2.11 | Patient reviews everything entered, in their own language, and can correct it before submitting | M |
| FR-2.12 | **Nothing clinical is interpreted back to the patient** — no severity, no possible causes, no risk score | M |
| FR-2.13 | Accessibility: font scaling, high contrast, large touch targets, screen-reader labels, and audio playback of questions | S |
| FR-2.14 | Median completion time ≤6 minutes for a standard complaint | M |
| FR-2.15 | Staff-assisted mode records verbatim patient wording and warns against clinical paraphrase | M |

### 4.3 Document ingestion

| ID | Requirement | Pri |
|---|---|---|
| FR-3.1 | Upload or camera capture of PDF/JPG/PNG/HEIC, multi-page, up to a configured size limit | M |
| FR-3.2 | Client-side quality check (blur, glare, edge detection) with a retake prompt before upload | M |
| FR-3.3 | Virus scan, MIME validation, encryption at rest, tenant-scoped storage | M |
| FR-3.4 | Preprocessing: deskew, denoise, crop, contrast enhancement | M |
| FR-3.5 | Digital-text path (no OCR) where a text layer exists; OCR path otherwise, with a low-confidence fallback tier | M |
| FR-3.6 | Document classification: prescription / lab report / radiology report / discharge summary / consultation note / other | M |
| FR-3.7 | Type-specific structured extraction may identify medications, problems/diagnoses, lab analytes with values+units+reference ranges, and dates; in first MVP these are unconfirmed aids, not trusted conclusions | S |
| FR-3.8 | **Per-fact confidence score** and **source span (document, page, bounding box)** stored for every extracted fact | M |
| FR-3.9 | Extracted facts in high-risk categories (medication, dose, allergy, critical lab) enter as `UNCONFIRMED` and cannot become `CONFIRMED` without a human actor | M |
| FR-3.10 | Duplicate detection across documents: identical facts merge to one fact with multiple sources; conflicting facts surface a contradiction, never a silent winner | M |
| FR-3.11 | Source document is retained and reachable in ≤1 click from any derived fact, with the source region highlighted | M |
| FR-3.12 | Patient identity cross-check against document header; mismatch **blocks attachment** and raises a staff task | M |
| FR-3.13 | Extraction failure is stored as `EXTRACTION_FAILED`; the image is still viewable; **no values are guessed** | M |
| FR-3.14 | All processing is asynchronous; the doctor's view never blocks on it | M |
| FR-3.15 | Handwritten documents are flagged as such and always require human confirmation for medications | M |

### 4.4 Pre-round processing

| ID | Requirement | Pri |
|---|---|---|
| FR-4.1 | On intake submission, a pipeline runs: validation → optional document processing → normalisation → approved-question selection → brief synthesis → verification → materialisation | M |
| FR-4.2 | **Red-flag evaluation is a deterministic rule engine** over structured fields, using a clinician-authored, versioned rule set. Production rule pack is empty until Lead Doctor sign-off. No model involvement. | M |
| FR-4.3 | Rule evaluation is fully explainable: which rule, which version, which input values, at what time | M |
| FR-4.4 | LLM synthesis produces the Pre-Round View under a strict output schema | M |
| FR-4.5 | A **verifier** rejects any generated statement that cannot be traced to a source span; on failure the system degrades to the raw structured view and logs the event | M |
| FR-4.6 | The Pre-Round View is materialised before the doctor opens the patient; p95 end-to-end ≤3 minutes from submission | M |
| FR-4.7 | Cohort gating: for paediatric, pregnancy and elderly cohorts the AI synthesis and rules are **suppressed** with an explicit on-screen notice | M |
| FR-4.8 | If the patient declined AI-processing consent, **no LLM call is made**; the raw structured view is shown | M |
| FR-4.9 | Differential engine and LLM question-ranker run in **shadow mode**: outputs persisted and available to the eval harness, **never rendered to the consulting doctor** | M |
| FR-4.10 | Every AI output records model id, model version, prompt version, content-bank version, input hash and latency | M |

### 4.5 Doctor Pre-Round View

| ID | Requirement | Pri |
|---|---|---|
| FR-5.1 | One screen containing: identity + token + age/sex; chief complaint + patient's 2-3 line issue description; symptom timeline; **allergies (fixed position, always above the fold)**; current medications; known conditions; significant positives; significant negatives; missing information; previous-report attachment links; source links | M |
| FR-5.2 | Every clinical element carries a **provenance chip**: Patient / Caregiver / Staff / Record / AI | M |
| FR-5.3 | AI- and OCR-derived elements are clickable to the highlighted source region | M |
| FR-5.4 | Unconfirmed extracted facts are visually distinct from confirmed ones | M |
| FR-5.5 | If no approved safety rules exist, render **"No clinic-approved safety rules are active"**; never render reassurance | M |
| FR-5.6 | Target: a doctor can read the screen in ≤30 seconds; no horizontal scroll; no modal on load | M |
| FR-5.7 | Page interactive in <1.5s on clinic hardware | M |
| FR-5.8 | Empty and partial intake states are explicit and never fabricated | M |
| FR-5.9 | Full history, document viewer and timeline reachable in 1 click, without losing place | M |
| FR-5.10 | Keyboard navigation for every action | S |

### 4.6 Question panel and encounter state

| ID | Requirement | Pri |
|---|---|---|
| FR-6.1 | Suggested questions are drawn from the **clinician-authored bank**, selected by deterministic branching in v1 | M |
| FR-6.2 | Answer controls: Yes / No / Unknown / **Not asked** / multiple choice / numeric with units / short free text | M |
| FR-6.3 | One-tap answering; number keys map to options; no confirmation dialogs | M |
| FR-6.4 | Each answer updates structured encounter state immediately and is persisted with actor and timestamp | M |
| FR-6.5 | The doctor may add a question of their own; that event is captured as a "missing question" signal | M |
| FR-6.6 | The system surfaces **contradictions** between intake, documents and doctor answers; it never resolves them silently | M |
| FR-6.7 | The system surfaces **missing critical information** for the complaint, from the content bank's required-field definitions | M |
| FR-6.8 | LLM re-ranking of the next-best question runs in shadow mode; the visible order is deterministic in v1 | M |
| FR-6.9 | Doctor may record examination findings and vitals as structured fields | S |

### 4.7 Summary, approval and record

| ID | Requirement | Pri |
|---|---|---|
| FR-7.1 | Draft summary assembled with five structurally separate sections: patient-reported / historical record / observed in consultation / **AI-generated interpretation (visually distinct, labelled, collapsible)** / doctor's assessment | M |
| FR-7.2 | The doctor can edit any field | M |
| FR-7.3 | **Nothing enters the clinical record until an explicit Approve action by a `DOCTOR`-role user** | M |
| FR-7.4 | Draft-state content is excluded from export, print and any integration | M |
| FR-7.5 | The diff between AI draft and approved note is computed and stored | M |
| FR-7.6 | Final clinician diagnosis captured (coded where possible, free text otherwise), plus optional alternative considered | M |
| FR-7.7 | Approved encounter exportable as PDF and structured JSON | M |
| FR-7.8 | Post-approval amendments create a new version; nothing is overwritten | M |

### 4.8 Feedback and learning

| ID | Requirement | Pri |
|---|---|---|
| FR-8.1 | One-tap feedback on suggested questions: Useful / Not useful / Incorrect / Redundant / Missing important question | M |
| FR-8.2 | One-tap feedback on diagnostic considerations (shadow reviewers in v1; doctors in Phase 2): Relevant / Irrelevant / Incorrect / Already obvious / Important possibility missing | M |
| FR-8.3 | One-tap feedback on summaries: Accurate / Partially accurate / Incorrect / **Clinically unsafe** / Important information omitted | M |
| FR-8.4 | A **"Clinically unsafe"** rating raises an immediate safety event to the clinical safety owner and is tracked to closure | M |
| FR-8.5 | Doctors can correct extracted record values and corrected history; corrections are stored as labels with the original preserved | M |
| FR-8.6 | Feedback is never mandatory and never blocks progression to the next patient | M |
| FR-8.7 | **No feedback signal alters any model automatically.** Feedback flows to analytics and to a governed dataset only. | M |

### 4.9 Security, audit and administration

| ID | Requirement | Pri |
|---|---|---|
| FR-9.1 | Role-based access control: patient, caregiver, front-desk, intake staff, nurse, doctor, clinical safety owner, admin, support | M |
| FR-9.2 | `tenant_id` on every row with Postgres row-level security enforcement | M |
| FR-9.3 | Encryption at rest (database, object storage, backups) and in transit; managed secrets; no secrets in code or logs | M |
| FR-9.4 | Append-only audit of every access to patient data, every AI output, every clinician override, every content-version change | M |
| FR-9.5 | Logs contain **no PHI**; identifiers are pseudonymous references | M |
| FR-9.6 | Configurable retention with an executable deletion workflow, including deletion of AI outputs derived from deleted sources | M |
| FR-9.7 | Admin console: users, roles, clinic configuration, content versions, retention settings | S |
| FR-9.8 | Clinical safety owner can author, version, review and **sign** question banks and red-flag rules without an engineering deploy | M |
| FR-9.9 | Data residency configurable per tenant; **no direct identifiers transmitted to any external model endpoint** | M |
| FR-9.10 | Session timeout, device binding for clinic tablets, and forced re-auth for administrative actions | S |

## 5. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Pre-round view interactive | <1.5s p95 on clinic hardware |
| NFR-2 | Intake page transition | <500ms p95 |
| NFR-3 | Intake submission → pre-round view ready | <3 min p95, <8 min p99 |
| NFR-4 | Document page processed | <45s p95 per page |
| NFR-5 | Availability during clinic hours | 99.5% MVP; degraded mode always available |
| NFR-6 | Concurrent users at pilot | 50 |
| NFR-7 | Data loss tolerance | RPO ≤15 min, RTO ≤4h |
| NFR-8 | All PHI at rest in the configured region | 100%, verifiable |
| NFR-9 | Audit completeness | 100% of clinical data access events |
| NFR-10 | Accessibility | WCAG 2.1 AA for patient and staff surfaces |
| NFR-11 | Mobile web support | Android Chrome and iOS Safari, current and previous major versions |
| NFR-12 | Works on intermittent connectivity | Drafts persist locally; uploads resume |

## 6. User stories (representative; full backlog in [09-MVP/Backlog.md](../09-MVP/Backlog.md))

**Doctor**
- *As an OPD doctor, I want to see allergies in the same place on every patient, so that I never have to hunt for the one thing that can kill someone.*
  **AC:** allergies render above the fold in a fixed position on 100% of encounters, including empty intake; `NONE_KNOWN` and `NOT_ASKED` render differently.
- *As an OPD doctor, I want to know where each fact came from, so that I can decide how much to trust it.*
  **AC:** every clinical element has a provenance chip; AI/OCR elements open the source region in ≤1 click and ≤2s.
- *As an OPD doctor, I want to answer key questions in one tap each, so that structured data costs me no time.*
  **AC:** all question types answerable in a single interaction; keyboard shortcuts available; no confirmation dialog.
- *As an OPD doctor, I want to be told what is missing, so that I know what the summary does not cover.*
  **AC:** a "Missing information" block is always present and is populated from the content bank's required fields; when nothing is missing it says so explicitly.

**Patient**
- *As a patient with limited literacy, I want a staff member to complete intake for me without being treated as an exception.*
  **AC:** staff-assisted intake produces an identical record; `entered_by=STAFF`; the doctor sees the entry mode.
- *As a patient, I want to be told exactly what happens to my data and to be able to refuse AI processing.*
  **AC:** consent is granular, in the patient's language, refusable; refusal suppresses all LLM calls and the encounter still works.

**Staff**
- *As front-desk staff, I want registration to add no more than 30 seconds to my current process.*
  **AC:** measured at pilot; registration ≤6 fields; token issued in the same action.
- *As intake staff, I want to photograph a stack of prior records quickly.*
  **AC:** multi-page capture in one session; quality check with retake prompt; upload continues in the background.

**Clinical safety owner**
- *As the clinical safety owner, I want to change a red-flag rule without an engineering release.*
  **AC:** rules are versioned data; editing creates a new version requiring sign-off; changes are audited; rollback is one action.
- *As the clinical safety owner, I want every "clinically unsafe" rating to reach me immediately.*
  **AC:** safety event created, notification sent, tracked to documented closure.

## 7. Content and copy requirements 🩺

Language is a safety control in this product, not a design detail.

| Rule | Example |
|---|---|
| Never state a diagnosis | ✅ "Consider asking about exertional relationship" ❌ "Likely angina" |
| Never reassure | ✅ "No clinic-approved safety rules are active" or "No signed rule triggered" ❌ "No concerning features" |
| Never imply completeness | ✅ "Based on intake and 2 uploaded documents" ❌ "Full history" |
| Always attribute | ✅ "Patient reports chest pain for 3 days" ❌ "Chest pain × 3 days" |
| Distinguish absence from negative | ✅ "Allergies: not asked" ❌ "Allergies: none" |
| Label AI content | ✅ "AI-generated summary — verify before use" |
| No confidence the evidence doesn't support | Confidence words map to defined score bands, not to model tone |

## 8. Dependencies and assumptions

**Assumptions that materially affect the architecture** (each traced to an Open Question or ADR):
1. Healthcare-first OPD workflow; first-visit/no-report patients are the preferred initial segment *(ADR-035)*
2. Indonesia-first, geography-neutral core where possible *(v2/v2.3 reconciliation)*
3. Both self-service and staff-assisted intake are required *(E4)*
4. Doctors use desktop/tablet at the desk *(confirmed by brief)*
5. Commercial LLM APIs are permissible under in-region, no-training terms *(D2, E1)*
6. No HIS integration in v1 *(A4)*
7. Paediatric/pregnancy/elderly out of scope for AI generation in v1 *(B4)*
8. Institutional knowledge is used only where licensing permits *(⚖️)*

**External dependencies:** pilot clinic agreement; named Lead Doctor before real patient use; LLM vendor with acceptable terms; SMS gateway; regulatory opinion before Phase 2 or any clinical intelligence exposure.

## 9. Out of scope for this PRD

Ambient voice · EHR/FHIR write-back · literature Q&A · fine-tuning · billing · prescribing support · autocoding · multi-tenant commercial admin · native apps · full offline mode · longitudinal cross-visit record.

## v2.2 Reconciliation

Explicit non-goals: V1 is not a diagnosis engine, symptom checker, prescribing system, treatment recommendation system, autonomous clinical agent, or patient-facing interpretation product. Consent and cohort gates select fallback modes before any model call.

Content is versioned by global demo packs and clinic packs. Question packs and rule packs move through `DRAFT`, `DEMO_UNVALIDATED`, `CLINIC_REVIEW`, `APPROVED_FOR_PILOT`, `ACTIVE`, and `RETIRED`. Doctor interactions create candidate learning data only; no live click, diagnosis, rating, or feedback can mutate prompts, rules, rankers, disease knowledge, or production behaviour automatically.

## v2.4 Reconciliation

The committed first build is healthcare-first and narrower than the earlier PRD. The core path is personal information -> short issue description -> approved basic questions -> optional report attachments -> doctor brief on tablet/phone. Previous reports support doctor review; they do not create AI conclusions. Evidence Sprint is deferred by explicit founder instruction and recorded in ADR-035.


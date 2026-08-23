# Product Vision

## Vision statement

> **The doctor should never be the first person to read the patient's story.**

By the time a physician opens a patient in the OPD, the story should already be collected, the prior records should already be parsed, the dangerous patterns should already be flagged, and the missing pieces should already be named — so that the consultation begins at clinical reasoning instead of at data entry.

## The one-sentence product

A pre-consultation layer that turns waiting-room time into structured, provenance-tracked, clinically-organised patient information, and presents it to a busy OPD doctor in under thirty seconds.

## Who it is for

**Primary user: the OPD physician**, seeing 40–80 patients per session, working in 3–7 minute encounters, using a desktop or tablet, frequently interrupted, with essentially zero tolerance for a tool that adds a click. This user does not want a chatbot. This user wants the answer to *"who is this and what matters?"* before they look up from the screen.

**Secondary users:** the patient (or their caregiver) completing intake; the clinic's front-desk and nursing staff performing assisted intake; the clinic administrator managing the queue and users; the clinical governance owner reviewing safety events.

## Design principles

1. **Assist, never decide.** The system organises, surfaces and prompts. The clinician diagnoses. Every output is phrased as information or a question, never as a conclusion.
2. **Thirty seconds or it failed.** The pre-round view is a *glance* artefact. If a doctor has to scroll to find the allergy, the design is wrong.
3. **Provenance or it doesn't ship.** Nothing appears on a clinical screen without a visible answer to "who said this?" — patient, caregiver, staff, prior record, OCR, or AI.
4. **Structure beats prose.** Anything clinically important is a typed field with a code where one exists, not a sentence. Prose is for nuance, not for allergies.
5. **Deterministic beats clever.** If a rule, a formula or a lookup can do the job, a model does not get to do the job. Safety-critical logic is code that a clinician can read.
6. **Doubt is a feature.** Confidence scores, "missing information", "not asked", and "low-confidence extraction" are first-class UI elements. A system that never says *I don't know* teaches doctors to stop checking.
7. **The clinic already has an EMR.** We integrate, we export, we sit beside. We do not attempt to become the system of record.
8. **Accessible by default.** Literacy, language, age, disability and device access are design inputs, not exceptions. Staff-assisted intake is a core path with equal data fidelity, not a fallback.
9. **Auditable from the first commit.** If we cannot reconstruct who saw what, who changed what, and what the AI said at the time, we cannot operate in healthcare.
10. **Boring in v1.** Sophistication is earned with evidence, not assumed from capability.

## What the patient experiences

Registers or is registered → receives token → completes intake on their own phone (or a clinic tablet, or with a staff member) in their own language → uploads or photographs prior reports → sees a confirmation and their queue position. **They never see a differential, a risk score, an interpretation, or an AI opinion.** Patient-facing output is confined to what they entered, their token status, and administrative information.

## What the doctor experiences

Opens the queue → sees tokens with intake status, report status and brief readiness → opens a patient → reads a one-screen snapshot with everything colour-coded by source → sees approved-rule status only if a Lead Doctor has signed rules → taps through a short set of high-yield questions with one-tap answers → reviews an assembled draft summary with clearly separated sections → edits → approves → one-tap feedback → next patient.

## What the clinic experiences

Shorter consultations without shorter care; a structured record where there used to be a paper bag of prescriptions; a queue that reflects clinical urgency rather than only arrival order; and an auditable trail of every AI suggestion and every clinician decision.

## Explicit non-goals

| Non-goal | Why |
|---|---|
| Autonomous diagnosis | Out of scope by design, by ethics, and by regulation |
| Patient-facing diagnostic or triage advice | Different, far higher, risk class; different regulatory posture; not required by the workflow |
| Replacing the clinic's EMR/HIS | Unwinnable switching cost; unbounded scope |
| Ambient voice capture in v1 | Consent, acoustics, multilingual accuracy, and it solves the *other* half of the problem |
| Billing, insurance, claims | Adjacent business, different buyer, different compliance surface |
| Prescribing, dosing, or drug-interaction *decisions* | Regulated function; requires licensed drug databases and a much higher validation bar |
| Being the smartest medical AI | We are competing on trust and seconds saved, not on benchmark scores |

## Positioning statement

> For **high-volume outpatient clinics** whose **physicians lose consultation time to history-taking and to deciphering prior records**, **MEDOXZI Pre-Round** is a **pre-consultation intelligence layer** that **delivers a structured, source-attributed patient summary and deterministic red-flag triage before the encounter begins**. Unlike **ambient AI scribes**, which act after the conversation, and unlike **symptom checkers**, which speak to patients, MEDOXZI works in the waiting room and speaks only to the clinician.

## Three-horizon view

| Horizon | Focus | Success looks like |
|---|---|---|
| **H1 — Prove it saves time safely** (MVP + pilot) | Intake, documents, pre-round view, red flags, feedback | One clinic, measurable time saved, zero critical safety events, doctors ask for it back when it's switched off |
| **H2 — Prove the intelligence** | Differential support out of shadow mode, question ranking learned from feedback, institutional knowledge RAG with citations, FHIR export | Physicians accept ≥50% of suggested questions; adjudicated differential quality passes gates; 5–10 clinics |
| **H3 — Prove it scales** | Multi-tenant, ABDM/FHIR integration, specialty packs, longitudinal patient record, institutional learning loop | Deployment without engineering involvement; per-clinic marginal cost approaches infrastructure cost |

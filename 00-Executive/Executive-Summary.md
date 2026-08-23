> ### ⚠️ v2 — SUPERSEDED IN PART
>
> Read **[Revised-Direction-v2.md](Revised-Direction-v2.md)** first. It records five founder decisions taken after this document and explains what changed and why.
>
> | Changed | From | To |
> |---|---|---|
> | Launch market | India | **Indonesia** (India retained as second market) |
> | Red-flag engine | MVP feature, clinician-signed | **Ships empty; lead doctor authors at CUSTOMISE** |
> | Clinical safety owner | Contracted before build | **Lead doctor at clinic 1, from CUSTOMISE — zero pre-pitch cost** |
> | Sequence | Discovery → build → pilot | **RECON → MVP → TRAIN → PITCH → CUSTOMISE → LAUNCH (shadow week + live week) → V1** |
> | Harness | Evaluation suite | **Full adversarial proving ground and the primary pitch asset** — [12-Harness/](../12-Harness/) |
> | Data residency | In-region preferred | **In-Indonesia mandatory**, likely self-hosted inference ⚖️ |
>
> Everything else in this document — the feasibility verdict, the shadow-mode decision, the provenance architecture, the failure analysis — stands unchanged.

> ### v2.4 — FOUNDER OVERRIDE
>
> Session H records an explicit founder decision to defer/skip the Evidence Sprint for now and proceed healthcare-first. The immediate MVP is narrowed to: basic personal information, a 2-3 line patient issue description, relevant Lead-Doctor-approved questions, optional previous-report attachments for doctor review, and a source-bound brief pushed to the doctor's tablet/phone. Best initial patients are first clinic visits with no previous reports. See ADR-035.

# Deliverable 1 — Executive Summary

**Research date:** 23 August 2026 · **Audience:** product owner, clinical lead, investors, engineering lead
**Read time:** ~12 minutes

---

## 1. The verdict in one paragraph

**The product is technically feasible today, and the feasible version is smaller and more boring than the version described in the brief.** Everything in the vision can be built; not everything in the vision should be built first. The parts that are genuinely hard are not the AI parts — structured intake, document parsing, and provenance-tracked summarisation are solved engineering with mature components. The parts that are hard are (a) getting patients to complete intake at all in a real OPD, (b) proving to a sceptical doctor in the first 30 seconds that the summary is trustworthy, and (c) staying on the correct side of a regulatory line that a diagnostic-suggestion feature will drag you across. The strongest MVP is therefore an **intake-and-organisation product with deterministic red-flag triage and rigorous provenance — with the differential-diagnosis engine built but run in shadow mode, invisible to the consulting doctor, until it has earned its way onto the screen.**

## 2. Why this problem is worth solving

In a high-volume Indian OPD a physician may see 40–80 patients in a session. A large share of each encounter is spent on information *retrieval and transcription* rather than clinical reasoning: asking the same eight history questions, deciphering a plastic bag of prior prescriptions, hunting for the last HbA1c on a crumpled lab printout, re-entering allergies. This is the cheapest time in the encounter to automate and the most expensive time to keep doing manually.

The adjacent market has already validated the *general* thesis — that removing clerical load from physicians produces measurable benefit — through ambient AI scribes (Nabla, Suki, Microsoft Dragon Copilot) now deployed at scale in US health systems **[Confirmed — see Competitor-Research.md]**. But ambient scribes attack the **post**-consultation documentation burden. Almost nobody is attacking the **pre**-consultation information-gathering burden with the same rigour, and pre-consultation is structurally the better target in a high-volume OPD:

- The patient is *already waiting*. Intake time is free time; documentation time is not.
- The output is **structured data**, not prose — which makes it verifiable, auditable, and reusable, whereas a scribe's output is a narrative that must be read to be checked.
- It is **language-tolerant**: a patient can complete intake in Hindi or Tamil and the doctor reads a normalised English summary. Ambient scribes struggle with multilingual, noisy, three-patients-in-the-room OPD audio.
- It requires **no microphone in the consult room**, which removes the single largest consent, privacy, and acoustics obstacle facing ambient products in Indian OPD settings **[Inference]**.

**Product decision:** we are not building an ambient scribe. We are building the thing that is *ready before* the scribe would have started. These are complementary, and the pre-round data materially improves any scribe added later.

## 3. What we found (condensed)

### 3.1 Market
Five relevant categories exist; none occupies our position.

| Category | Exemplars | What they do | Gap we exploit |
|---|---|---|---|
| Ambient documentation | Nabla, Suki, Microsoft Dragon Copilot | Convert the consultation conversation into a note | Start *after* the doctor has already spent the history-taking time |
| Evidence retrieval | OpenEvidence | Answer clinician questions from literature with citations | Not patient-specific; not workflow-embedded |
| Symptom checkers | Ada, Infermedica, Babylon-lineage | Patient-facing triage/differential | Patient-facing differential = the exact thing we must not do; different risk posture |
| Digital intake / forms | Phreesia-class, hospital HIS modules | Registration and form capture | Forms, not clinical synthesis; no prior-record ingestion; no red-flag logic |
| Indian HIS / EMR | Local HIS vendors, ABDM-linked apps | Registration, queue, billing, basic EMR | Weak clinical intelligence layer; strong distribution — **partner, don't fight** |

**Strategic conclusion [Inference]:** our defensible position is *the pre-round layer* — deliberately narrow, deliberately interoperable, deliberately sitting alongside the incumbent HIS rather than replacing it. Attempting to become the clinic's EMR is the fastest way to fail; the switching cost of an EMR is enormous and the feature surface is bottomless.

### 3.2 Regulatory (this is the finding that changes the design)

CDSCO's *Guidance Document on Medical Device Software under MDR-2017* (Doc No. CDSCO/MD/GD/MDSW/01/2026) sets out a two-axis risk matrix **[Confirmed]**:

| Healthcare situation | Treat/diagnose | Drive clinical management | **Inform clinical management** |
|---|---|---|---|
| **Critical** | Class D | Class C | **Class B** |
| **Serious** | Class C | Class B | **Class A** |
| **Non-serious** | Class B | Class A | **Class A** |

It also explicitly carves out from MDR-2017 licensing: hospital/clinical information systems used for admission, scheduling, billing and clinical communication; software performing transfer, storage, archiving, conversion, formatting, simple search and compression; and general communications software — **but adds that such a system with "additional functions that allow its use for any medical purposes (e.g. image analysis/modification as an aid in diagnosis, quantification of physiological parameters for clinical decision-making)" automatically becomes regulated as a medical device** **[Confirmed]**.

**Read this carefully, because it is the whole strategy:**

- Intake capture, document storage, OCR-to-text, timeline assembly, and a summary that only *reorganises information the clinician would otherwise read themselves* sits close to the excluded HIS/data-handling category. **[Inference — ⚖️ REQUIRES REGULATORY REVIEW]**
- A **ranked differential diagnosis list** is not reorganisation. It is at minimum "inform clinical management", and if it can fire on a critical presentation (chest pain, stroke, sepsis) the matrix puts it at **Class B**. **[Inference — ⚖️ REQUIRES REGULATORY REVIEW]**
- Therefore: **the differential engine is the feature that converts a software product into a regulated medical device.** Everything else is comparatively free.

This is not an argument for never building it. It is an argument for **building it behind a flag, validating it in shadow mode, and taking the regulatory step deliberately and with a budget** — instead of stumbling across the line in sprint 4 because a differential panel looked good in a demo.

### 3.3 Technology
Every component we need exists as mature, appropriately-licensed open source or as a commodity API. Verified as of 23 Aug 2026 **[Confirmed]**: Docling (MIT, 65.4k★, LF AI & Data) for document parsing; PaddleOCR (Apache-2.0, ~80k★, v3.6.0 May 2026, Devanagari/Tamil/Telugu/Bengali coverage) for Indic OCR; pgvector (22.4k★, HNSW+IVFFlat) so the vector store is a Postgres extension rather than a second database; medspaCy (MIT, 660★) for clinical negation/context detection; Presidio (MIT, 10.6k★) for de-identification of logs and analytics; Synthea (Apache-2.0, FHIR R4/CSV output) for synthetic test cohorts; HAPI FHIR (Apache-2.0, v8.10.0 May 2026) and Medplum (Apache-2.0, SMART-on-FHIR) if and when interoperability becomes a real requirement.

**There is no component on the critical path that requires original research.** The risk in this project is clinical, organisational and regulatory — not scientific.

### 3.4 The uncomfortable finding

The most likely cause of failure is **not** AI quality. It is **intake completion**. If patients do not complete intake, the doctor opens an empty pre-round view, loses trust in week one, and the product is dead regardless of how good the model is. Every other design decision in this pack is downstream of that risk, which is why staff-assisted intake is a **first-class MVP feature and not an accessibility afterthought**, and why the first metric on the dashboard is intake completion rate, not model accuracy.

## 4. The recommended MVP in one page

**Build this:**

1. **Token + queue integration.** Patient registers or is registered at the desk, receives a token, intake link is bound to that token.
2. **Structured intake** — patient self-service PWA *and* staff-assisted mode with identical data model and explicit `entered_by` provenance. Chief complaint, symptom detail via a curated branching question set, medications, allergies, comorbidities, surgeries, family/social history. Multilingual (English + 2 local languages at pilot).
3. **Document ingestion** — upload/camera capture of prescriptions, labs, discharge summaries. Parse → OCR → classify → extract meds, diagnoses, lab values, dates. **Every extracted value carries a confidence score and a click-through to the highlighted region of the source image.** High-risk fields require human confirmation.
4. **Doctor Pre-Round View** — a single screen, above the fold, readable in ≤30 seconds: identity + token, chief complaint, symptom timeline, significant positives, significant negatives, current meds, allergies, comorbidities, abnormal prior labs, missing information, and **deterministic red-flag banners**.
5. **Red-flag engine — rules, not a model.** A clinician-authored, versioned rule set over structured intake fields. Deterministic, testable, explainable, and auditable. This is a safety feature; it must never be probabilistic.
6. **Quick-answer question panel** — clinician-authored question bank per chief complaint, one-tap Yes/No/Unknown/Not-asked/MCQ/numeric, updating structured encounter state.
7. **Clinician-approved summary** — draft note assembled with strict source separation; nothing enters the clinical record without an explicit approve action.
8. **Feedback capture** — lightweight, one-tap, on every AI-generated element; plus final clinician diagnosis capture (this is the label that makes everything later possible).
9. **Audit + RBAC + encryption + in-region hosting** from day one.

**Build but hide (shadow mode):**

10. **Differential-consideration engine and LLM question-suggestion ranking.** Generated for every encounter, written to the database, shown to a clinical review panel and to the eval harness — **not shown to the consulting doctor** until the validation gates in `03-Clinical/Validation-Plan.md` are passed and the regulatory position is settled. This costs almost nothing extra to build, generates the training and evaluation corpus you will need, and removes the single largest clinical and regulatory risk from the pilot.

**Do not build in v1:** ambient voice, EHR/FHIR write-back, literature RAG for clinician Q&A, custom model fine-tuning, patient-facing results or interpretation, multi-clinic tenancy beyond the schema hooks, analytics dashboards beyond the pilot metrics, ICD/SNOMED autocoding, billing. Reasons in [MVP-Decision.md](MVP-Decision.md).

## 5. What success looks like, and how we will know

Split hard between product metrics and safety guardrails; a product metric is never allowed to justify degrading a guardrail. Full definitions in [Success-Metrics.md](../02-Product/Success-Metrics.md).

**Primary product hypothesis:** *pre-round information reduces physician consultation time without reducing clinical quality.*
Primary metric: **median doctor-facing consultation time per patient, intake-complete vs intake-absent, same doctor, same session type.** Target: ≥15% reduction with no increase in clinician-reported missed information.

**Gating safety metrics (any breach halts rollout):** critical-omission rate on adjudicated cases; red-flag sensitivity on a clinician-labelled test set; medication-extraction error rate at the point of doctor sign-off; unsafe-content rate on the summary evaluation set.

## 6. Cost and team, at a glance

- **Team for MVP:** 6 full-time (tech lead, 2 backend/AI, 1 frontend, 1 designer-researcher, 1 QA/clinical-eval), plus **advisory but non-optional**: a practising OPD physician (~1 day/week, paid, named clinical safety owner), a security/privacy advisor, and a regulatory advisor engaged *before* the differential engine ships. Detail in [09-MVP/Development-Plan.md](../09-MVP/Development-Plan.md).
- **Cost shape:** overwhelmingly fixed (team + baseline infrastructure). Variable AI cost per patient is dominated by document pages, not by the summary. Modelled with explicit assumptions and placeholder unit prices in [Cost-Model.md](../07-Engineering/Cost-Model.md) — **we have deliberately not invented vendor prices**; the model is a formula you fill with quoted rates.
- **Critical path:** clinical question framework → data model → intake → document pipeline → pre-round view → pilot. The AI is *not* on the critical path; the clinician-authored content is.

## 7. The five things that will decide this project

1. **Does intake actually get completed in a real waiting room?** Test with paper and a human before writing an app. Two weeks, near-zero cost, answers the question that kills the company.
2. **Does the doctor trust the summary at a glance?** Trust is built by provenance and by never being confidently wrong about medications. One hallucinated drug in week one costs more than a month of good summaries earns.
3. **Is the red-flag rule set clinically owned?** It must be authored, signed and version-controlled by a named physician. If engineering writes the red flags, the project has a governance defect, not a technical one.
4. **Does the regulatory position hold?** Get a written opinion on the MDSW classification of the shipped feature set **before** the differential engine leaves shadow mode. ⚖️
5. **Can it move from one clinic to ten without a rewrite?** Yes — if tenancy, terminology and the clinical content bank are data from day one rather than code. This costs ~2 weeks now and ~6 months later.

## 8. Recommendation

**Proceed — with the narrowed scope above.** Run a two-week discovery in a live OPD before any production code. Build the MVP as specified. Run the differential engine dark. Validate against the staged gates. Take the regulatory decision explicitly, in daylight, with counsel.

The product is feasible. The question is whether the team has the discipline to ship the boring version first.

## v2.2 Reconciliation

MEDOXZI v2.2 is Indonesia-first and pre-round first. V1 exposes structured intake, uploaded-report processing, verified extraction, appropriate questions, and a source-verifiable pre-consultation brief. It does not expose diagnostic UI, treatment advice, prescribing, patient interpretation, disease probabilities, or an autonomous clinical agent.

As of v2.4, the delivery path is HEALTHCARE-FIRST NARROW MVP -> HARNESS + SYSTEM HARDENING -> PITCH / PILOT CLINIC -> LEAD DOCTOR CUSTOMISE + SIGN-OFF -> CLIENT 1 SHADOW -> CLIENT 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE. Evidence Sprint is deferred by explicit founder instruction. For healthcare, the Domain Expert is the Lead Pilot Doctor and sign-off is required before real patient use.


> ### ⚠️ v2 AMENDMENTS to the answers below
>
> - **Q1 (smallest safe MVP):** item 5, the deterministic red-flag engine, is **built but ships with an empty rule set**. Add the agent harness and FHIR-R4-shaped export.
> - **Q2 (not in v1):** unchanged, and now also excludes **red-flag content** (engine yes, rules no).
> - **Q3 (clinical risk):** risk #2 changes character — with an empty rule set there are no false negatives to have. The residual risk moves to **CUSTOMISE being rushed**.
> - **Q7 (validate with doctors first):** now happens at **CUSTOMISE**, with the lead doctor at clinic 1, rather than with a contracted advisor beforehand.
> - **Q10 (first ten actions):** actions 1 and 2 are replaced. See [Revised-Direction-v2.md](Revised-Direction-v2.md) and [09-MVP/Development-Plan.md](../09-MVP/Development-Plan.md).
>
> **The revised first three actions:** (1) engage Indonesian regulatory and corporate counsel — entity formation and device classification both have long lead times; (2) run RECON in Jakarta — documents, waiting rooms, P-Care observation, Wizard-of-Oz intake; (3) start the harness document corpus and degradation pipeline from the records collected.

> ### v2.4 amendment
>
> Session H supersedes the immediate first-three-actions sequence by explicit founder decision: defer/skip Evidence Sprint for now and build healthcare-first narrow MVP. The first product path is basic personal information, 2-3 line patient issue description, Lead-Doctor-approved basic questions, optional previous-report attachments for doctor review, and a doctor brief pushed to tablet/phone. See ADR-035.

# Decision-Focused Conclusion
### Direct answers to the ten questions that decide this project

*(This document answers Section 31 of the brief. It is intentionally blunt and intentionally short. Supporting reasoning lives in the linked documents.)*

---

## 1. What is the smallest safe MVP worth building?

**A provenance-tracked pre-consultation organiser and doctor brief — and no visible AI diagnosis.**

Concretely, nine things:

1. Token/queue binding for an intake session
2. Structured multilingual intake, patient self-service **and** staff-assisted, with `entered_by` provenance on every field
3. Optional prior-report attachment: upload/capture → quality check → source viewer for doctor review; extraction can exist only as unconfirmed support until human-reviewed
4. **Doctor Pre-Round View**: one screen, ≤30s read, source-colour-coded
5. **Deterministic red-flag rule engine present, production rules empty until Lead Doctor sign-off**
6. Quick-answer question panel from a Lead-Doctor-approved question bank
7. Clinician-approved summary with hard separation of patient-reported / historical / AI-generated / clinician-assessed content
8. One-tap feedback on every AI element + capture of the final clinician diagnosis
9. RBAC, encryption, in-region hosting, append-only audit

Plus one thing built and hidden: **the differential-consideration engine and the LLM question-ranker, running in shadow mode**, writing to the database and the eval harness, invisible to the consulting doctor.

**Why this is the smallest *safe* version:** it delivers the entire time-saving hypothesis (which is what needs proving) while removing the feature that carries the clinical and regulatory risk (which is what needs validating). It is also the version that still generates the labelled dataset the intelligent version will require — so nothing is wasted.

---

## 2. What should explicitly NOT be built in version 1?

| Not in v1 | Why not |
|---|---|
| **Visible differential diagnosis / ranked considerations** | Pushes the product across the CDSCO "inform clinical management" line into device territory **[Inference ⚖️]**; introduces automation bias before any trust is established; unvalidated. Build it, hide it. |
| **Ambient voice / speech-to-text in consult** | Consent, acoustics, code-switching, and it addresses the post-consult problem we are not solving. |
| **EHR/HIS write-back, FHIR resources, SMART-on-FHIR launch** | Each integration is a multi-month vendor negotiation. Export a PDF/structured JSON in v1; earn write-back later. |
| **Literature/guideline RAG for clinician Q&A** | Different product (OpenEvidence-shaped). Enormous licensing surface. Does not serve the time-saving hypothesis. |
| **Model fine-tuning of any kind** | No dataset, no labels, no governance, no validation. Prompting + retrieval + deterministic rules is sufficient for MVP quality. |
| **ICD-10/SNOMED autocoding** | Terminology *mapping* is v1 (internal codes + a mapping table); *autocoding for billing/reporting* is not. |
| **Patient-facing interpretation, results, risk scores** | Categorically out of scope. Highest-harm surface in the system. |
| **Multi-tenant admin console, white-labelling, billing** | Schema hooks yes, product no. One clinic cannot justify the surface. |
| **Analytics/BI dashboards** | Pilot metrics come from a nightly job and a notebook, not a product feature. |
| **Drug–drug interaction checking / prescribing support** | Regulated function, licensed drug data, far higher validation bar. |
| **Native mobile apps** | PWA. Two app-store pipelines is a tax you cannot afford at this stage. |
| **Offline mode** | Real requirement in some clinics — but confirm it exists before paying for it. Flagged as an open question. |

---

## 3. Which components represent the greatest **clinical** risk?

Ranked, highest first.

1. **Medication and allergy extraction from prior records.** A hallucinated, mis-transcribed or stale medication is the most likely path from this product to patient harm. *Mitigation: dual-signal extraction (OCR text + layout), confidence thresholds, mandatory clinician confirmation before any medication or allergy enters the structured record, permanent source-image linkage, and an explicit "unverified" state rendered differently from a confirmed one.*
2. **The red-flag engine — specifically its false negatives.** A missed emergency presentation. Worse, a *silent* miss that the doctor unconsciously relied on. *Mitigation: rules not models; clinician authorship and sign-off; sensitivity-weighted acceptance criteria; the UI never implies "no flags = safe" — the absence of a flag is displayed as "no rule triggered", not as reassurance.*
3. **Automation bias in the summary.** A concise, confident, well-formatted summary is trusted more than it deserves — this is the failure mode of good design. *Mitigation: provenance everywhere, explicit "missing information" block, no confidence language the evidence doesn't support, and periodic in-pilot audits comparing clinician-elicited history against intake-derived history.*
4. **Wrong-patient / wrong-document association.** A lab report attached to the wrong token. *Mitigation: deterministic binding at capture, patient identity confirmation on the document review screen, name/DOB cross-check against document header with mismatch blocking, and audit.*
5. **Language and translation error in intake.** "Chest pain" and "chest heaviness" and colloquial idioms do not map cleanly. *Mitigation: clinician-reviewed translations of the fixed question bank rather than machine translation at runtime; free text stored in the original language *and* the translation, both visible to the doctor.*
6. **Edge populations — paediatric, pregnancy, elderly, low-literacy.** Rules and question banks tuned on general adults misfire. *Mitigation: explicit cohort gating; the system declines to generate for cohorts it has not been validated on and says so.*
7. **The differential engine (when it surfaces).** Anchoring the clinician on a plausible wrong hypothesis. *Mitigation: shadow mode, adjudicated validation, presentation as questions-to-resolve rather than ranked answers, mandatory contradictory-evidence display.*

---

## 4. Which components represent the greatest **technical** risk?

1. **Document ingestion quality on real-world Indian OPD paperwork** — handwritten prescriptions, thermal-printed labs, faded photocopies, phone photos at an angle in bad light. This is the hardest engineering problem in the product by a wide margin. *De-risk in week 1 with 200 real (consented, de-identified) documents before committing to the architecture.*
2. **Intake completion in the waiting room** — a product/ops risk that presents as a technical one. Session resumption, device handoff, patients who abandon at question 6, staff who are too busy to help.
3. **Latency budget.** The doctor's queue must be pre-computed. Any synchronous LLM call in the doctor's click path is a design defect. All AI runs asynchronously on intake submission; the dashboard reads a materialised view.
4. **LLM output conformance.** Free-text drift, schema violations, invented fields. *Mitigation: constrained decoding / strict JSON schema validation, extract-don't-generate prompting, and a post-hoc verifier that rejects any summary sentence not traceable to a source span.*
5. **Terminology normalisation** — mapping "sugar", "BP tablet", "Glycomet 500" to something a rule engine can reason over.
6. **Multi-tenancy retrofits.** Cheap now, brutal later.
7. **Cost drift** from document-heavy patients — one patient with a 40-page discharge summary can cost 50× the median.

---

## 5. Which components can use existing technology?

Essentially all of the plumbing. Verified as of 23 Aug 2026 **[Confirmed]**:

| Need | Use |
|---|---|
| Document parsing / layout | **Docling** (MIT, LF AI & Data) |
| OCR incl. Indic scripts | **PaddleOCR** (Apache-2.0, 109+ languages incl. Devanagari, Tamil, Telugu) — with a commercial OCR API as a fallback tier |
| Vector search | **pgvector** in the existing Postgres — do not deploy a second database |
| Clinical negation / context | **medspaCy** (MIT) |
| De-identification for logs/analytics | **Presidio** (MIT) |
| Synthetic test cohorts | **Synthea** (Apache-2.0, FHIR R4 + CSV) |
| FHIR (later) | **HAPI FHIR** (Apache-2.0) or **Medplum** (Apache-2.0, SMART-on-FHIR) |
| LLM | Commercial API under a data-processing agreement with no-training and in-region/zero-retention terms |
| Auth, queue, storage, observability | Managed/commodity — never build |

Full evaluation in [Github-Research.md](../01-Research/Github-Research.md) and [Build-vs-Buy.md](../07-Engineering/Build-vs-Buy.md).

---

## 6. Which components require custom development?

Only four things are genuinely ours, and they are the whole moat:

1. **The clinical content bank** — chief-complaint-specific question sets, branching logic, red-flag rules, significant-negative definitions. Clinician-authored, versioned, data not code. *This is the product's actual intellectual property.*
2. **The provenance and confidence model** — the data structures and UI that keep patient-reported, historical, extracted and inferred content separated end-to-end. No off-the-shelf component does this properly.
3. **The pre-round synthesis + verification layer** — assembling the one-screen view, and the verifier that rejects any generated statement without a traceable source.
4. **The doctor interaction surface** — the ≤30-second glance and the one-tap question panel. This is a design problem, and it is where the product is won or lost.

Everything else should be bought, borrowed, or configured.

---

## 7. What should be validated with doctors **before** writing significant code?

Two weeks. No production code. In a real OPD.

1. **Paper prototype of the Pre-Round View.** Print ten summaries for ten real (consented, de-identified) patients. Hand them to doctors before the consultation. Ask: what did you not need? What was missing? What did you not believe? — *Layout is decided by this, not by us.*
2. **Chief-complaint frequency study.** Which 10 complaints cover 70% of this clinic's volume? The question bank is built for those and nothing else.
3. **Wizard-of-Oz intake.** A human with a tablet does the intake for 50 patients. Measures completion rate, time taken, refusal rate, language distribution, and how often staff assistance is actually needed. **This is the single highest-value experiment in the project.**
4. **Document reality check.** Collect 200 real prior records. What are they actually? Handwritten? Thermal? Photographed? This determines the entire ingestion architecture and its cost.
5. **Red-flag rule authorship.** Sit with the clinical lead and write v0 of the rules by hand. If this is hard for a physician to do, it is not safe for engineers to do.
6. **The trust question.** Show doctors a summary containing one deliberate, plausible error. Watch whether they catch it. This calibrates how much provenance UI is *actually* required.
7. **Time baseline.** Measure current consultation time by chief complaint. Without a baseline the primary metric is unmeasurable, and the pilot proves nothing.

---

## 8. What architecture provides the easiest path from one clinic to multi-clinic?

**A modular monolith with tenancy in the data model from commit #1.**

- **`tenant_id` on every table, enforced by Postgres row-level security**, not by application code that someone will forget. Retrofitting tenancy is a rewrite; adding it now is a migration.
- **Clinical content as versioned data, not code.** Question banks, red-flag rules, and templates live in tables with a `content_version`; a new clinic is a configuration, and a rule change is a data migration with an audit trail — never a deploy.
- **One deployable service, clean module boundaries, a shared async worker pool.** Microservices at this stage buy distributed-systems problems and no benefit. The seams (document, AI orchestration, terminology) are drawn where extraction would later be cheap.
- **Stateless app tier, everything durable in Postgres + object storage**, so scaling is horizontal and boring.
- **Per-tenant configuration for locale, question banks, rule sets, retention policy, and data-residency region** — because the second clinic will differ on all five.
- **A single AI orchestration abstraction with pluggable model providers**, so a change of LLM vendor (for price, latency, or data-residency reasons) is a config change and not a rewrite.

---

## 9. What would make the project fail even if the technology works?

Ranked by probability, not drama.

1. **Patients don't complete intake.** The doctor opens empty views, trust collapses in week one. *This is the most likely failure mode, and it is an operations problem, not an AI problem.*
2. **The doctor loses 5 seconds instead of gaining 60.** Any extra click, any load spinner, any scroll to find the allergy — and the tool is abandoned. Physicians do not file bug reports; they stop using it.
3. **One bad medication error early.** Trust is asymmetric. A single confidently-wrong drug in week one costs more than a hundred good summaries earn.
4. **No clinical owner.** If no named physician owns the red-flag rules and the question bank, the content rots, nobody signs off, and the governance story collapses under the first audit.
5. **Staff aren't resourced for assisted intake.** The accessibility path becomes theoretical, the digitally-excluded patients are excluded, and completion rate never gets above 40%.
6. **Regulatory surprise.** Shipping the differential engine without a written classification opinion, then discovering the product is an unlicensed Class B device. ⚖️
7. **Scope creep into EMR.** "Could it also do billing / pharmacy / appointments?" — the request that has killed more health-tech startups than any technical failure.
8. **Measuring the wrong thing.** Reporting model accuracy instead of consultation time, and never learning whether the core hypothesis was true.
9. **The pilot clinic is unrepresentative.** A tech-forward private clinic with literate, smartphone-owning patients proves nothing about the market.
10. **Founder attention on the AI.** The AI is the easy part. The clinical content, the waiting-room operations, and the 30-second screen are the hard parts.

---

## 10. The first ten engineering/product actions

In order. Nothing here requires the LLM.

| # | Action | Owner | Output | Why now |
|---|---|---|---|---|
| 1 | **Recruit or identify the Lead Doctor for the first clinic** | Founder | Named Lead Doctor + written sign-off responsibility | Real patient questions and any safety wording need their signature |
| 2 | **Define the v2.4 narrow healthcare flow** | Founder + designer + engineering | Registration -> short issue description -> approved questions -> optional attachments -> doctor brief | Prevents scope drift into diagnosis or full document extraction |
| 3 | **Author the basic question pack shell** — first-visit/no-report path first, with report-attachment prompts optional | Lead Doctor + founder | Signed or review-ready question pack v0.1 | The app may not ask production clinical questions from agent-authored content |
| 4 | **Secure the pilot clinic** with a written data agreement, an ethics/institutional review pathway, and an on-site champion | Founder | Signed agreement, named champion | Determines the real workflow and lawful data path |
| 5 | **Obtain a written regulatory opinion** on MDSW classification for (a) MVP scope and (b) MVP + visible differential | Founder + regulatory advisor | Written opinion ⚖️ | Determines whether step 10 is ever allowed to ship. Long lead time. |
| 6 | **Stand up the skeleton**: repo, CI, Postgres with `tenant_id` + RLS, object storage, audit table, RBAC, in-region infrastructure-as-code, secrets management | Tech lead | Deployed empty app passing a security smoke test | Retrofitting tenancy, audit and RLS is a rewrite |
| 7 | **Build the document ingestion spike** against the 200 real documents from step 3 — Docling + PaddleOCR, measure extraction accuracy per document type | Backend/AI | Accuracy report + go/no-go on OCR strategy and cost per page | The largest technical unknown and the largest variable cost |
| 8 | **Build intake (staff-assisted first, self-service second)** with full provenance, in the pilot's languages | Full team | Working intake against the signed content pack | Staff-assisted is the path that always works; self-service is the optimisation |
| 9 | **Build the Pre-Round View and the deterministic red-flag engine**, validated against clinician-labelled synthetic cases | Full team + clinical lead | Screen meeting the ≤30-second read target; rule sensitivity report | The moment the product becomes real to a doctor |
| 10 | **Turn on the differential + question-ranking engine in shadow mode**, wire the eval harness and the feedback capture | Backend/AI | Shadow outputs accumulating with adjudication tooling | Starts building the validation corpus at zero clinical risk |

**Deliberately absent from the first ten:** any fine-tuning, any FHIR work, any voice, any multi-clinic feature, and any dashboard. If one of those appears in the first ten, the project has already lost the plot.

## v2.2 Reconciliation

MVP keeps the red-flag engine architecture but production rule packs are empty until Lead Doctor sign-off. The UI says `No clinic-approved safety rules are active` when no approved rules exist, never `No red flags`.

Shadow reasoning remains internal only. Scores are `shadow_score`, `hypothesis_rank`, or relative scores, not disease probabilities. Question intelligence is governed content/ranker behaviour, not self-training. Locales use canonical language-independent concepts with English default and Bahasa Indonesia as first-class reviewed content. SATUSEHAT support is an adapter target, not an integration claim until approved.


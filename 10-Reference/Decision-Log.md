# Architecture Decision Log

Each record: **context → decision → consequences → status**. A decision reversed later is amended here, never deleted.

---

## ADR-001 · The differential engine ships in shadow mode
**Context.** The product vision centres on AI-suggested diagnostic considerations. CDSCO's MDSW guidance puts "inform clinical management" on critical presentations at Class B **[Confirmed — R-01]**, and we have no validation data for differential quality.
**Decision.** Build the differential engine and the LLM question-ranker in full, run them on every encounter, persist their output — and **never render it to the consulting doctor in v1**.
**Consequences.** (+) Removes the largest clinical and regulatory risk from the pilot. (+) Accumulates the labelled validation corpus at zero clinical risk. (+) Gives a defensible regulatory narrative. (−) The most impressive feature is invisible during the pilot, which is a real cost to demos and fundraising. (−) Requires the discipline not to switch it on early.
**Status.** Accepted. Reversal requires: passed validation gates + a written regulatory opinion.

## ADR-002 · Curated question bank with deterministic branching, not model-generated questions
**Context.** An LLM could generate questions per encounter. It could also ask a leading or harmful one, and nobody would have signed it.
**Decision.** Questions come from a clinician-authored, versioned bank. Branching is a decision table. The LLM may only *rank* an existing candidate set, and only in shadow mode in v1.
**Consequences.** (+) Clinical accountability, explainability, testability, and a lighter regulatory posture. (−) Coverage limited to what has been authored — mitigated by capturing the "doctor added a question" signal. (−) Clinician authoring time is a real, ongoing cost.
**Status.** Accepted.

## ADR-003 · Red-flag rules are deterministic code, never a model
**Context.** Safety-critical logic must be signable by a physician and identical for identical inputs, forever.
**Decision.** A declarative AST evaluated by a small interpreter with no `eval`. Rules read only structured, human-sourced fields — never AI-inferred values, never free text.
**Consequences.** (+) Explainable, testable, clinician-authorable, change-controllable. (+) Far easier to manage if the product later becomes a regulated device. (−) Cannot capture patterns a rule cannot express — accepted, and mitigated by never implying that flag-absence means safety.
**Status.** Accepted.

## ADR-004 · RAG, never fine-tuning, for institutional knowledge
**Context.** Institution-approved books and protocols are copyrighted; the brief states they cannot be used for training unless licensing permits.
**Decision.** Retrieval only. Fine-tuning on knowledge content is prohibited.
**Consequences.** (+) Citations are native; content updates are re-indexing; per-tenant access control is enforceable; the licensing position is defensible and reversible. (−) Retrieval quality becomes a first-class engineering concern.
**Status.** Accepted. ⚖️

## ADR-005 · pgvector inside the primary Postgres, not a dedicated vector database
**Context.** MVP corpus is small; a second stateful system means a second backup, RBAC, encryption, audit and residency story.
**Decision.** pgvector. Revisit at >1–5M chunks or a *measured* latency problem.
**Consequences.** (+) One database to secure and audit. (−) Will need revisiting at scale — mitigated by keeping retrieval behind an interface.
**Status.** Accepted.

## ADR-006 · Our own provenance-first schema; FHIR as an export projection
**Context.** FHIR cannot faithfully represent per-field provenance, confidence and verification status without extensions no consumer would understand.
**Decision.** Internal model is ours. FHIR is a Phase 2 export.
**Consequences.** (+) The differentiating data model is not compromised. (−) Export loses fidelity — accepted, because the boundary is the right place to lose it. (−) Two safety rules must be enforced in the mapping: `NOT_ASKED` must never export as a negative, and unconfirmed extractions should not be exported at all. ⚠️
**Status.** Accepted.

## ADR-007 · Modular monolith, not microservices
**Context.** A clinical encounter is a transactional unit. Pilot scale is ~50 concurrent users.
**Decision.** One deployable application with clean module seams; async workers for slow work.
**Consequences.** (+) Transactional integrity, one audit trail, far lower operational burden. (−) Requires discipline to keep module boundaries clean. Seams are drawn where extraction would later be cheap — the document pipeline first.
**Status.** Accepted.

## ADR-008 · Tenancy enforced by row-level security, from commit #1
**Context.** Retrofitting tenancy is a rewrite. Application-level filtering will eventually be forgotten in one query.
**Decision.** `tenant_id` on every table, RLS policies, tenant from the authenticated principal only, CI check enumerating tables without a policy.
**Consequences.** (+) Multi-clinic is a configuration change. (+) A forgotten `WHERE` clause is not a breach. (−) Small ongoing discipline cost on every new table.
**Status.** Accepted.

## ADR-009 · HAPI FHIR utilities over adopting Medplum as the backend
**Context.** Medplum (Apache-2.0, SMART-on-FHIR, actively maintained **[Confirmed]**) is an attractive accelerant, but adopting it means adopting its FHIR-native data model.
**Decision.** Use HAPI-style validation utilities in Phase 2; do not adopt a FHIR platform as the system of record. Re-evaluate only if a customer demands hosted SMART-on-FHIR apps.
**Consequences.** (+) Preserves ADR-006. (−) More export code to write ourselves.
**Status.** Accepted, revisit at Phase 2.

## ADR-010 · Staff-assisted intake is a first-class path, built first
**Context.** Intake completion is the most likely cause of total product failure, and a significant share of the target population cannot self-serve.
**Decision.** Identical data model for all three entry modes; **build staff-assisted before self-service**; mandatory read-back step.
**Consequences.** (+) A path that always works; de-risks the largest failure mode; validates content with a controlled user. (−) Requires clinic staff capacity, which must be confirmed and possibly funded.
**Status.** Accepted.

## ADR-011 · No AI call on any synchronous request path
**Context.** The doctor's latency budget is 1.5 seconds; model latency is unpredictable.
**Decision.** All AI work is asynchronous, triggered on intake submission, materialised into a view row the dashboard reads with one query.
**Consequences.** (+) Model latency can never become user latency. (+) Enables degrade-to-raw cleanly. (−) Requires a "not ready yet" state — which is honest and therefore fine.
**Status.** Accepted.

## ADR-012 · Paediatric, pregnancy and elderly cohorts are gated out of AI generation in v1
**Context.** Adult-tuned rules and question banks misfire on these cohorts, and the consequences are severe.
**Decision.** Deterministic cohort detection suppresses AI synthesis and rule evaluation, showing raw structured intake with an explicit notice.
**Consequences.** (+) Removes an entire class of high-severity failure. (+) Reduces DPDP children's-consent exposure. (−) The product is less useful for a meaningful share of OPD patients — accepted for v1, revisited in Phase 2 with cohort-specific content.
**Status.** Accepted.

## ADR-013 · Verification of high-risk facts is a database constraint, not a UI convention
**Context.** Policy is forgettable; a CHECK constraint is not.
**Decision.** `is_high_risk AND verification_status = 'CONFIRMED'` requires a non-null human verifier, enforced in the schema. Doctor-only signing enforced by trigger.
**Consequences.** (+) The most important safety property in the system cannot be bypassed by a refactor or a new endpoint. (−) Slightly more awkward test setup.
**Status.** Accepted.

## ADR-014 · No agent frameworks in the production pipeline
**Context.** LangChain/LlamaIndex accelerate prototyping but add indirection over a pipeline that must be auditable step by step.
**Decision.** A hand-written DAG with explicit schemas and a verifier. Frameworks permitted for spikes only.
**Consequences.** (+) Every step is inspectable; the audit trail is straightforward; dependency churn is reduced. (−) A little more code to write once.
**Status.** Accepted.

---

# v2 records — 23 August 2026

## ADR-015 · The red-flag rule set ships empty; the lead doctor authors it
**Context.** Hiring a contracted clinical safety owner before the pitch is expensive, and the founder judged that an early clinical hire might pull the product toward diagnosis. But the red-flag engine was the only MVP component making a clinical assertion, and it therefore required a physician's signature.
**Decision.** Build, test and wire the engine; **ship it with an empty rule set**. The lead doctor at clinic 1 authors the rules during CUSTOMISE. Until then the product emits no urgency signal of any kind.
**Consequences.** (+) The MVP makes no clinical assertion, so no pre-pitch clinical signature is required. (+) Zero pre-pitch clinical cost. (+) Cleanest possible regulatory starting position, which matters more in Indonesia where no enumerated device exclusion list was found. (+) *"You write the safety rules for your own clinic"* is a better opening than *"adopt our doctor's rules."* (−) The MVP is less clinically useful at launch. (−) CUSTOMISE becomes the single point where clinical governance happens, and rushing it is now the main residual risk.
**Floor.** No urgency signal, no triage language, no red flag reaches a screen until a named doctor has authored and signed. An empty rule set is safe; an engineer-authored one is not.
**Status.** Accepted.

## ADR-016 · Diagnostic drift is prevented by a CI gate, not by a person
**Context.** The founder's concern was that a clinician on the team would push the product toward diagnosis. In practice the more common failure is the opposite — with no clinician present, nobody is qualified to say "that output is a diagnosis, not a question," and diagnostic demos are more impressive.
**Decision.** Implement four automated drift detectors — prohibited phrase, assertion-strength escalation, differential-shaped output, reassurance framing — and **fail the build** on any trip. Run on every generated output in CI and nightly.
**Consequences.** (+) Covers 100% of outputs rather than a reviewed sample. (+) Diagnostic drift becomes unmergeable rather than something someone must notice. (+) Directly answers the founder's concern with engineering rather than personnel. (−) The prohibited-phrase list is clinical content and still needs a clinician's eye eventually — it is signed at CUSTOMISE.
**Status.** Accepted.

## ADR-017 · The harness is an adversarial proving ground, not a training loop
**Context.** The instruction was to "train the system to never hallucinate or be biased… never mix tokens, reports, medicines, sessions."
**Decision.** Six of those eight properties are **architectural, not trainable**. The harness's role is to attack, measure and prove — not to train. Only two things learn: the counter-question ranker (offline, over a fixed clinician-authored candidate set) and confidence calibration.
**Consequences.** (+) Effort goes where it works: isolation is proven by 4,000 concurrent attacks, not by fine-tuning. (+) The output is a numbers document that becomes the primary pitch asset. (−) Requires resisting the intuition that more training data fixes safety properties. (−) Corpus assembly is slow and starts in RECON.
**Status.** Accepted.

## ADR-018 · Clinical knowledge is stored as discriminating questions, never as disease profiles
**Context.** The system needs awareness of common presentations and their counter-questions without becoming a diagnostic tool.
**Decision.** Store **separations** — *question Q distinguishes cluster P₁ from P₂* — rather than condition→symptom profiles. Reason over coarse `PossibilityCluster` objects, never over specific diagnoses. Clusters are never rendered to a doctor in v1.
**Consequences.** (+) The store has no conclusions to emit, so it cannot accidentally become a differential engine. (+) Its natural output is a question order. (+) Better regulatory posture. (−) Slightly awkward to author. (−) Cluster mapping is lossy and its inter-rater agreement must be reported alongside any concordance figure.
**Status.** Accepted.

## ADR-019 · Indonesia first; in-country inference
**Context.** GR 28/2024 requires health information system organisers to locate data centres within Indonesian territory, and transfers between organisers must route through the national health information system. Hosted frontier LLM services do not currently appear to be offered from Indonesian cloud regions.
**Decision.** All PHI in Indonesia. Inference in-country — most likely a **self-hosted open-weights model in a Jakarta region** (AWS `ap-southeast-3`, GCP `asia-southeast2`, Azure Indonesia Central). Keep the model-gateway abstraction so the choice is configuration.
**Consequences.** (+) Unambiguous compliance. (+) Shifts cost from variable to fixed, which improves with volume. (−) Lower quality ceiling than a frontier hosted model. (−) GPU cost at pilot scale is poor. (+) **Strongly validates the deterministic-first architecture** — every lookup table is a call that does not need a Jakarta GPU. ⚖️ Verify provider availability before committing; this changes frequently.
**Status.** Accepted, pending verification.

## ADR-020 · FHIR R4 export shape from day one
**Context.** v1.0 deferred FHIR entirely. Indonesia's SATUSEHAT platform is FHIR R4 and integration is mandated with permit-level sanctions.
**Decision.** The data model must **export cleanly to FHIR R4 from day one**, with the mapping written and tested as a specification during the MVP. Certified SATUSEHAT integration remains out of the MVP. **ADR-006 stands** — internal model is provenance-first; FHIR is a projection.
**Consequences.** (+) Compliance becomes a selling point. (+) No migration later. (−) Modest ongoing discipline. (⚠️) The two mapping safety rules become critical: `NOT_ASKED` must never export as a negative, and unconfirmed extractions must not reach a national record.
**Status.** Accepted.

## ADR-021 · Patient contact data is never used for our own marketing
**Context.** A proposal to use intake-collected emails and WhatsApp numbers for customised marketing, pitched to clinics as a benefit.
**Decision.** **Rejected.** No consent option permitting it exists in the schema. Growth assets are instead: aggregate de-identified benchmark data, the harness dossier, compliance relief, and **clinic-owned patient messaging sold as a paid feature** under separate, explicit, revocable, clinic-owned consent.
**Consequences.** (+) Preserves the only real asset — trustworthiness. (+) Avoids UU 27/2022 exposure (2% of revenue administratively; criminal provisions with corporate multipliers). (+) The messaging feature produces recurring revenue instead of a one-time liability. (−) Slower initial growth than a contact list would suggest — though that list would not have worked anyway.
**Status.** Accepted. **Non-negotiable.**

## ADR-022 · RECON before build; shadow week inside the on-site fortnight
**Context.** The founder's sequence moved clinic acquisition after the build, removing v1.0's discovery phase. Building document ingestion against imagined documents is the largest avoidable waste in the project.
**Decision.** Insert **RECON** (2–3 weeks, no signed clinic — documents, waiting-room observation, P-Care observation, Wizard-of-Oz intake) before BUILD. Split the on-site fortnight into **Week 1 shadow, Week 2 live**.
**Consequences.** (+) The OCR architecture is designed against real documents. (+) The harness corpus starts early, which it must because it takes longest. (+) The riskiest step — going live on content signed a week earlier — is removed at zero cost. (−) 2–3 weeks before code starts.
**Status.** Accepted.

---

# v2.1 records — 23 August 2026 (after external review)

## ADR-023 · Shadow scores are rankings, never probabilities
**Context.** An external review noted that LLM-derived scores are not calibrated disease probabilities and should not be presented as such. v2 forbade *showing* the differential but did not constrain the internal vocabulary.
**Decision.** No number from the reasoning subsystem is ever described, stored, logged or displayed as a probability that a patient has a condition. Field names are `hypothesis_score` and `rank`, never `probability` or `confidence in diagnosis` — in the database, logs, dashboards and adjudication tooling alike.
**Consequences.** (+) Prevents an unsupportable clinical claim. (+) Keeps the product further from the medical-device line ⚖️. (+) **The naming is the control** — a field called `probability` in 2026 becomes a percentage on a screen in 2028, because by then nobody remembers it was never calibrated. (−) Slightly more awkward internally. Probability language becomes permissible only after calibration is demonstrated on held-out data — Phase 3 at the earliest, with its own gate.
**Status.** Accepted.

## ADR-024 · Add `UNABLE_TO_ANSWER`; reject `PATIENT_UNSURE`
**Context.** The review proposed three additional non-answer states.
**Decision.** Add **`UNABLE_TO_ANSWER`** only. Merge `PATIENT_UNSURE` into `UNKNOWN`; `DECLINED_TO_ANSWER` already exists as `DECLINED`.
**Reasoning.** Every additional state must be rendered distinctly in three UIs, mapped in FHIR export, handled by the rule engine and covered by tests — and the cost of getting one wrong is exactly the `NOT_ASKED`-becomes-`NO` defect class we care most about. More states is not automatically safer; **more states that are never distinguished in practice is less safe**, because it invites collapsing them in code. `UNABLE_TO_ANSWER` earns its place because it is the only proposal that tells a doctor something about the **patient** rather than the question — a cluster of them is itself a clinical signal.
**Consequences.** (+) Captures a real, distinct clinical situation. (+) Surfaced as a pattern via `patient_state_signals()`. (−) One more state to render and map. A test guards against `PATIENT_UNSURE` being reintroduced.
**Status.** Accepted.

## ADR-025 · Language-independent clinical concept codes
**Context.** v2's localisation design gave question *keys* stable identity but left clinical *concepts* as translated strings.
**Decision.** Every clinical concept carries a stable code (`SYMPTOM_DYSPNEA`); text is a rendering. Colloquial patient variants map many-to-one onto concepts, clinician-reviewed. **A variant that cannot be confidently mapped stays free text and is shown to the doctor verbatim.** The rule engine and question graph read codes only.
**Consequences.** (+) Safety logic is locale-independent. (+) *masuk angin* becomes a first-class mappable concept rather than untyped text. (+) Adding Urdu, Hindi or Arabic later is a rendering exercise, not an architecture change. (+) Gives FHIR export a stable anchor. (−) Concept authoring is additional clinical content work at CUSTOMISE.
**Status.** Accepted. Credit: external review.

## ADR-026 · Data localisation rests on Permenkes 24/2022 Pasal 22(1), not on a broad GR 28/2024 reading
**Context.** v2 asserted a general health-data-centre localisation requirement under GR 28/2024 from a single practitioner source. Re-checking found GR 28 localisation confirmed explicitly only for biobanks/biorepositories. Meanwhile the primary text of Permenkes 24/2022 contains a provision that binds vendors directly.
**Decision.** Ground the requirement in **Permenkes 24/2022 Pasal 22(1)** — a health facility may cooperate only with an electronic system operator having domestic data storage facilities. Retain the GR 28 reading as an unverified practitioner claim for counsel.
**Consequences.** (+) The architectural conclusion is unchanged and now rests on a primary source that applies to us directly. (+) It is a *stronger* argument: a clinic cannot lawfully buy from us otherwise. (−) An error in our own earlier analysis, corrected. **Standing rule adopted: Indonesian regulatory claims are sourced from JDIH primary documents; practitioner summaries are pointers only.** ⚖️
**Status.** Accepted.

## ADR-027 · Twenty-five-year retention changes deletion semantics
**Context.** Permenkes 24/2022 Pasal 39(1) requires medical record retention for **at least 25 years** from the patient's last visit — a finding neither our v2 nor the external review had.
**Decision.** Distinguish **clinical record data** (statutory retention; not deletable on request) from **derived data** (AI outputs, shadow outputs, cache, analytics — deleted on consent withdrawal). Storage is modelled over decades with an archive tier as a v1 concern. Consent text and UI must not promise erasure of the clinical record.
**Consequences.** (+) Closes Open Question D5. (+) Prevents promising a right we cannot deliver. (−) Materially larger long-run storage commitment. (−) Raises a contractual question — what happens to 25 years of clinic data if we cease trading — that becomes a customer requirement, not a nicety ⚖️.
**Status.** Accepted.

## ADR-028 · Separate machine bias from clinician cognitive bias
**Context.** The external review listed anchoring, confirmation, availability, demographic, premature closure, automation, hallucination and source confusion as one set of things to "build tests against".
**Decision.** Split them. Machine behaviour (demographic disparity, source confusion, hallucination, subgroup gaps, order sensitivity) is tested in CI with numeric gates. Clinician cognition (anchoring, confirmation, availability, premature closure, **automation bias**) is designed against and measured on humans — automation bias specifically via periodic blinded seeded-error exercises, metric S11.
**Consequences.** (+) Prevents the failure mode where a team believes automation bias is covered by a test suite and therefore never runs the exercise that measures it. (+) Names what cannot be automated, which is what gets it scheduled. (−) The bias section reads as less comprehensive; it is more honest.
**Status.** Accepted.

## v2.2 ADR Additions

- No paid pre-build clinical safety retainer; Lead Pilot Doctor sign-off required before real patient use.
- Production red-flag pack empty until clinic-approved signed activation.
- No autonomous clinical agent in the clinical path.
- No online self-training, automatic prompt mutation, autonomous rule creation, or automatic production deployment from feedback.
- Doctor diagnosis is not automatic ground truth; use qualified label taxonomy.
- Canonical MEDOXZI model with SATUSEHAT/FHIR adapter target.
- English default with Bahasa Indonesia first-class reviewed content.
- Patient contacts belong to the clinic relationship, not MEDOXZI marketing.
- Controller/processor role and data residency/cloud inference remain counsel-pending.
- Detector self-tests are not system-performance or clinical evidence.


---

# v2.2+ records — 23 August 2026 (session D verification)

## ADR-029 · The ≥500-real-encounter gate moves to Gate 6
**Context.** Stage 4 (silent/shadow deployment) required *"≥4 weeks or ≥500 encounters, whichever is later"* before the supervised pilot. That was written when the sequence assumed a signed clinic and a long pilot. The v2 sequence compressed shadow into **week 1 of the on-site fortnight**, which cannot satisfy it. Worse, the gate is **circular**: 500 *real* encounters require lawful deployment, which requires Lead Doctor sign-off and counsel clearance — the very things the gate was meant to precede.

The v2.2 session reported this as resolved, but the fix was written into `Pilot-Plan.md` and the direction document only; `Validation-Plan.md` and `Acceptance-Criteria.md` still carried the old gate. The contradiction became three-way.

**Decision.** Split the gate by what each stage can actually produce and actually needs:
- **Week-1 operational shadow** is gated on **safety and operational criteria** — zero contamination, zero fabricated values reaching a doctor, intake completion, extraction accuracy, no leakage. **Volume is recorded as evidence, never asserted in advance.**
- **≥500 adjudicated real encounters** becomes a **Gate 6** requirement — exposing the shadow differential or the learned ranker — which is the decision that genuinely needs a corpus of that size.

**Consequences.** (+) The sequence becomes internally consistent and non-circular. (+) The week-1 gate now tests what a week can test: safety and operations, not statistics. (+) The corpus requirement sits where the corpus is actually needed. (−) Slightly less impressive-sounding shadow stage — correctly so, because a one-week shadow was never going to be a statistical validation.

**Meta-consequence.** This ADR exists because a decision was written down and believed to be implemented. It directly produced AGENT-PROTOCOL Rules 1 and 2 in `_OPS/`.

**Status.** Accepted, implemented and verified in session D.

## ADR-030 · Multi-agent governance lives in `_OPS/`
**Context.** This repository is now worked on by multiple AI agents and humans across sessions with no shared memory. Session D found two instances of the same failure — a decision recorded in prose and believed to be done: the regulatory over-read (twice) and the sequencing gate. Neither was caught by review; both were caught by re-running and grepping.

**Decision.** Create `_OPS/` as the mandatory entry point: `AGENT-PROTOCOL.md` (five rules, session workflow, standard verification block, contradiction sweep), `STATE.md` (current truth, updated last), `CHANGELOG.md` and `VERIFICATION-LOG.md` (append-only), `OPEN-THREADS.md` (live, with owners), `CLAIMS-REGISTER.md` (every claim with source, label and correction history), and `SESSION-LOG/`.

The governing rules: **no claim without evidence**; **change → propagate → verify**; **logs are append-only**; **separate verified from assumed**; **never weaken a safety gate silently**.

**Consequences.** (+) An agent arriving cold can establish the real state in ten minutes rather than inferring it from prose. (+) Claims become checkable against the repository. (+) The record of corrected mistakes becomes an asset — the next agent knows which claims have already been tested and found wrong. (−) Every session carries logging overhead. That overhead is the point: it is cheaper than a contradiction reaching a clinic.

**Status.** Accepted.

---

# v2.3 records — 23 August 2026 (horizontal positioning)

## ADR-031 · Horizontal platform with vertical packs
**Context.** The founder repositioned MEDOXZI from a healthcare product to a domain-neutral professional intake and briefing platform — the pattern *Client → AI Intake → Documents → Missing Questions → Structured Brief → Human Expert → Decision* — with healthcare as vertical #1 alongside legal, accounting, insurance, lending, recruitment, real estate, automotive, IT helpdesk and cybersecurity.

**Decision.** The engine becomes explicitly domain-neutral. Everything domain-specific moves into a versioned, expert-signed **`vertical_pack`**: question bank content, escalation/red-flag rules, terminology and concept dictionary, cohort gates, and the prohibited-language list. **The engine does not know what a symptom is.**

**Consequences.** (+) Materially stronger medical-device position — intended use is administrative/information organisation, evidenced by the product genuinely serving non-clinical domains. (+) Customer diversity de-risks the company; one clinic saying no stops being existential. (+) Most of the architecture was already horizontal (provenance, verifier, answer states, document pipeline, concept codes, question graph, harness, tenancy) so this is a days-scale refactor, not a rewrite — because content was already data (ADR-008, ADR-015). (−) **The claim is only protective if the architecture is genuinely horizontal.** If healthcare ships clinical rules and question banks while legal ships none, healthcare is a different product wearing the same name and a regulator will look at healthcare. (−) Platform naming needs resolving — `MEDOXZI` reads as medical (OT-16).

**Binding rules.** No clinical capability may exist in the engine · every vertical uses the same mechanisms (escalation rules exist in every pack) · the intended-use statement is a product artefact in documentation, contract and UI, not a marketing line.

**Status.** Accepted.

## ADR-032 · RECON is replaced by a compressed Evidence Sprint
**Context.** RECON was 2–3 weeks in clinic waiting rooms, designed when MEDOXZI was healthcare-only entering one clinic. The founder asked whether it is still necessary. Under horizontal positioning it answers questions about one vertical at the cost of delaying all of them.

**Decision.** Replace with a **3–5 day, mostly remote Evidence Sprint across two verticals**. Dropped: consultation-time baseline (moves into the healthcare pilot), chief-complaint frequency study (becomes vertical pack content authored by the expert at CUSTOMISE), P-Care observation (deferred to when healthcare is the active vertical). Retained and strengthened: **document reality across verticals** and **intake completion smoke-tested with 10–15 real people per vertical**.

**Reasoning.** One argument survives everything: building a document extraction pipeline against imagined documents is the most expensive mistake available, and it is vertical-independent. A legal PDF, a thermal-printed lab report, a handwritten prescription, a bank statement and a workshop photo are five different engineering problems. 100–200 real documents costs days; getting it wrong costs a quarter.

**Consequences.** (+) Blocks the build for days rather than weeks. (+) Covers two verticals for near-identical cost. (+) Forces the architecture to stay horizontal from day one rather than being retrofitted. (+) Produces the harness founding corpus, the longest-lead engineering input. (−) Less depth on healthcare workflow — accepted, because that depth belongs in the pilot.

**Status.** Accepted.

## ADR-033 · AI drafts question banks; domain experts authorise them
**Context.** The founder asked whether the question bank could be generated by harnessing AI over medical literature, improving over time.

**Decision.** **Yes for drafting, no for authorising.** AI generates candidate questions from *licensed* sources; automated quality gates filter them (leading-question, double-barrelled, reading level, answerability, duplicate concept, prohibited language, missing discriminator, translation drift, missing `source_ref`); a **named domain expert reviews, edits and signs** before anything becomes active. Improvement runs through the existing governed offline loop — no online learning, no automatic promotion, and a statistic never retires expert-signed content on its own.

**The binding constraint is licensing, not capability.** Most medical literature is copyrighted, and scale makes unlicensed use look deliberate. Permitted sources: public health-ministry guidance, permissively-licensed open access, universally-taught frameworks, **the customer's own licensed material**, and the expert's own written knowledge. Prohibited: paywalled journals, textbooks, clinical decision references, scraped competitor content.

**Consequences.** (+) Collapses months of manual authoring into an expert review session. (+) **Productises CUSTOMISE** — *upload your SOPs → we generate a candidate bank → your expert signs it* is what makes the horizontal thesis executable. (+) The customer's own material is both the best source and the cleanest licensing position. (−) OT-05 (licensing audit) becomes larger and must clear before generating at scale — a large bank built from unlicensed sources must be thrown away and regenerated.

**Status.** Accepted.

## ADR-034 · In-country inference is feasible; storage is resolved, inference needs a quote
**Context.** OT-01 assumed in-country inference might be impossible because hosted frontier models did not appear to be offered from Indonesian regions. The founder stated storage is solved via Indonesian VPS/cloud.

**Decision.** Treat **storage as resolved** and **inference as de-risked but unquoted**. Indonesian sovereign AI cloud capacity exists — Lintasarta (Indosat) *GPU Merdeka* offers NVIDIA H100 SXM GPU-as-a-Service positioned as sovereign Indonesian AI infrastructure, with a further AI data centre investment announced in Surakarta. **[Third-Party Claim — press coverage; obtain a direct quote and confirm current availability, pricing and terms before committing]**

**Consequences.** (+) Removes the largest architectural unknown in the Indonesian plan. (+) Self-hosted open-weights inference in-country is a real option, not a theoretical one. (−) Cost shifts from variable per-token to fixed GPU capacity — good at volume, poor at pilot scale. (−) **Storage location ≠ processing location.** A Jakarta VPS does not make inference domestic unless the model runs on it. This distinction must be preserved in every future discussion. (+) The deterministic-first architecture still pays twice: every lookup table is a call that needs no GPU.

**Status.** Accepted, pending a vendor quote.

---

# v2.4 records - 23 August 2026 (founder healthcare-first override)

## ADR-035 · Healthcare-first narrow MVP; Evidence Sprint deferred by explicit founder decision
**Context.** Session G created `ROADMAP.md` from the v2.3 state: horizontal platform, Evidence Sprint across two verticals, then first-vertical decision. The founder then gave an explicit human direction to defer/skip the Evidence Sprint for now and continue with healthcare first. The founder also narrowed the desired first product: patients attach previous medical reports when they have them, give a brief free-text history, answer relevant basic symptom/history questions, and the resulting brief is pushed to the doctor's tablet or phone. The preferred initial patient segment is first clinic visits with no existing reports, because the system can learn the history-taking workflow without depending on document extraction.
**Decision.** Proceed with a **healthcare-first narrow MVP** instead of waiting for the two-vertical Evidence Sprint. The V1 workflow is:
- staff captures/registers basic personal information and encounter token;
- patient/caregiver/staff records a 2-3 line issue description in the patient's words;
- the system asks Lead-Doctor-approved basic history/symptom questions relevant to that description and the selected complaint;
- previous reports may be attached, but in the first MVP they are primarily **doctor-reviewable source attachments**, not trusted extracted conclusions;
- the doctor receives a source-bound pre-consultation brief on tablet/phone before opening the encounter.

**Non-negotiable floor.** The brief is not a diagnosis, conclusion, triage decision, treatment recommendation or reassurance. It may organise patient-stated facts, explicit negatives, unknowns, skipped questions, and report attachments. Production clinical questions and any red-flag/escalation logic still require a named Lead Doctor's signed pack. Shadow differential remains unreachable by doctor, staff and patient routes.
**Consequences.** (+) Matches the founder's current commercial focus and avoids further pre-build delay. (+) Reduces first build complexity by favouring first-visit/no-report patients and treating previous reports as attachments for doctor review before structured extraction is trusted. (+) Keeps the product's first screen close to the real clinic job: collect history while the patient waits, then brief the doctor. (−) Accepts the risk ADR-032 was designed to reduce: document reality and multi-vertical comparison are now deferred. (−) Weakens the v2.3 horizontal-positioning argument until another vertical is built or convincingly specified. (−) Healthcare regulatory counsel remains required and more important, because the active build is now healthcare-specific.
**Status.** Accepted by explicit founder instruction in session H; supersedes ADR-032 only for immediate sequencing. ADR-031 still applies architecturally where feasible, but healthcare is now the first committed vertical rather than a sprint outcome.

## ADR-036 · Clinic-owned patient engagement is allowed; MEDOXZI-owned marketing is still prohibited
**Context.** The founder wants the doctor pitch to include follow-up reminders, post-visit check-ins, feedback/rating requests, clinic announcements, case-study discounts, future growth services, and the long-term value of a searchable clinic history. These are commercially powerful, but they touch patient contact data and could violate ADR-021 if framed as MEDOXZI marketing.
**Decision.** Add a **clinic-owned engagement layer** to the product story. The clinic may send operational and relationship messages to its own patients through MEDOXZI as a processor/tool: appointment reminders, follow-up reminders, post-visit well-being check-ins, feedback requests, clinic-hour/location/facility announcements, and doctor-approved discount offers. MEDOXZI may not use patient contact details for its own marketing list. Any case-study use must be separately agreed with the clinic and must not reveal identifiable patient information.
**Message floor.** Patient messages must be opt-in/consented where required, revocable, auditable, template-versioned, and clinic-branded. Messages must not contain AI diagnosis, treatment advice, pressure language, or false urgency. Discount offers are clinic-controlled commercial decisions, not automated medical advice.
**Consequences.** (+) Gives doctors a clear business reason beyond consultation-time saving: better follow-up, patient loyalty, reactivation and reputation. (+) Preserves ADR-021 by keeping patient relationships clinic-owned. (+) Creates a later paid module: reminders, feedback, campaigns, booking, ratings and clinic announcements. (-) Adds consent, audit, template governance and communications-compliance work. (-) Must be carefully worded in pitch so it does not sound like MEDOXZI is harvesting patient contacts.
**Status.** Accepted as product direction for pitch and later scope. MVP may record follow-up date and prepare clinic-owned reminders; bulk announcements, discounts, research dashboards and marketing services are post-MVP unless explicitly scoped.

---

# v2.6 records - 24 August 2026 (session P — founder resets six blockers)

## ADR-037 · Question bank is screening-only; product is a clinic time-saving/data tool, not a device
**Context.** The founder (session P) made six product-direction decisions that reset prior blocker assumptions: (1) the question pack will ask **relevant patient questions only** — it makes **no diagnosis**; doctors retain **full discretion** to act or not act on each answer; (2) because it makes no diagnosis, the product is a **time-saving and data-organising tool/SaaS for clinics**, not a regulated medical device (OT-02 de-risked); (3) PSE registration (OT-14) is handled personally by the founder; (4) **clear consent at data-submission time** covers follow-up, reminders and announcements (OT-19); (5) the **full/large PIN appears only inside a doctor's patient records**, never on the main list view (OT-21 smart choice); (6) the question bank will be **AI + Harness** drafted from medical literature on the **most common diseases** (OT-05), and data processing runs locally in-clinic at launch with normal AI tools until then.

**Decision.** Adopt all six as product direction. The screening-only framing becomes the intended-use statement: the product collects, organises and surfaces patient-stated history and symptom answers for the doctor to review; it does not diagnose, triage, treat or reassure, and the doctor is the sole clinical authority. AI drafting of question banks proceeds into `DEMO_UNVALIDATED`; **authorising a pack for real-patient use still requires Lead Doctor sign-off**, and an **activation gate** (verified `licence_ref != NULL`) still blocks any pack leaving `UNVALIDATED_DEMO_CONTENT`.

**Consequences.** (+) Removes the largest external blockers to building and demoing. (+) Gives an autonomous mandate to draft common-disease question banks while the founder sleeps. (+) Consent and PIN-exposure decisions simplify both consent-gating and the main-list UI. (−) The screening-only line is a **product positioning assertion, not yet a legal one** — a written counsel opinion validating the administrative-vs-device classification remains recommended diligence, and the "no diagnosis" boundary must be enforced in UI copy, not assumed. (−) Activating any pack still waits on clinician author + licensing audit; drafted banks are candidates, not production content.

**Status.** Accepted by explicit founder instruction in session P. Supersedes the blocker framing of OT-02/OT-18; ADR-002/ADR-015 (curated+signed) and ADR-033 (activate-on-licence-gate) remain binding.

## ADR-038 · Drop red-flag screening from patient question packs (routine OPD only); adopt QuestionBank v1.1 history wording
**Context.** The harness-training milestone had 40 literature question packs gated at 28 CLEAN / 12 BLOCKED. The 12 BLOCKED packs were blocked solely because `build_from_questionbank.py` embedded the QuestionBank's `red_flags` strings (urgency/differential wording such as "rule out septic arthritis", "acute coronary syndrome", "cauda equina — emergency", "possible new stroke") as patient-facing screening questions. The founder then gave an explicit direction (session Q out-of-band, 2026-08-24): the clinic does not handle emergency patients and never will — its patients are normal OPD only — so red flags are not used; where wording needs updating, update it and continue.
**Decision.** (1) `build_from_questionbank.py` no longer embeds any red-flag/alarm string into a patient pack — the packs carry only the QuestionBank's v1.1-cleaned history questions. (2) The engine's `is_red_flag_screen` capability and the loader's ACTIVE-without-rules guard remain intact for future clinician-authored packs; only the bank-derived pacing of red-flag urgency text to patients is removed. (3) Adopt the QuestionBank **v1.1** (`diseases.json` version 1.1) as the authoritative history-question wording source, replacing v1.0 in `10-Reference/OPD-QuestionBank/`. (4) All 40 packs remain `DEMO_UNVALIDATED`; nothing is activated or signed (OT-18 named Lead Doctor still required for real-patient use; founder approval does not substitute). (5) One founder-authorized wording adjustment was applied to pass the no-urgency-word gate: D14 Bronchial Asthma question "needed emergency treatment or hospitalization" → "needed hospital treatment or been admitted"; clinical intent (prior exacerbation/hospital-utilization history) unchanged, recorded in `diseases.json` revision_note and `history_questions.csv`. No other clinical wording was authored by the assistant.
**Consequences.** (+) All 40 packs now pass the harness gate (F1/F3/F4) — unblocked — giving the Harness a full 40-disease training basis. (+) Complies with ADR-002/ADR-037: no urgency or differential/diagnosis-suggestive language in patient-facing screening text. (+) Matches the founder's explicit OPD-only scope. (−) The v1.1 `red_flags.csv` is preserved in the reference bank but is **not** patient-facing; any future urgency/escalation handling is a clinician-authored doctor-brief concern, not a patient-screen concern, and still requires a named Lead Doctor. (−) The "no emergency handling" line is a product-scope decision; it does not remove the need for a written counsel opinion on the administrative-vs-device classification (ADR-037).
**Status.** Accepted by explicit founder instruction (sessions Q/S). Supersedes the 12-block framing of the v2.5 gate report; ADR-002/ADR-037 and the OT-18 activation gate remain binding.

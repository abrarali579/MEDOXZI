# Deliverable 20 — MVP Success Metrics

**The governing rule of this document:** *safety guardrails are separate from product metrics, and a product metric may never justify degrading a guardrail.* If time saved goes up while critical-omission rate goes up, the pilot has failed. Guardrails are evaluated first, and independently.

---

## Part A — Safety guardrail metrics 🩺

These are **gates**, not KPIs. Each has a threshold; breaching it halts rollout and triggers review by the clinical safety owner. They are reported to clinical governance, never to sales.

| # | Metric | Definition | Threshold | Measurement |
|---|---|---|---|---|
| **S1** | **Critical omission rate** | Encounters where a clinically critical item (allergy, current medication, red-flag symptom, key comorbidity) was present in the source material but absent from the Pre-Round View | **<0.5%**, and **zero** for allergies and current medications | Blinded adjudication of a random 10% sample by two clinicians; disagreements resolved by a third |
| **S2** | **Red-flag sensitivity** | Proportion of adjudicated red-flag-positive cases where the rule engine fired | **≥95%** on the clinician-labelled test set | Fixed labelled test set, re-run on every rule-version change |
| **S3** | **Red-flag alert acceptance** | Proportion of fired flags the clinician judges appropriate to have shown | **≥50%** — below this, alert fatigue is setting in and rules must be tightened 🩺 | One-tap clinician rating on each flag |
| **S4** | **Medication extraction error rate at sign-off** | Extracted medication facts that were wrong (drug, dose, frequency) and reached the doctor's screen | **<2%** flagged-and-caught; **0** uncaught errors reaching an approved note | Doctor correction events + adjudicated sample |
| **S5** | **Unsafe content rate** | Summaries rated "Clinically unsafe" by any clinician, or failing the safety evaluation set | **0** in production; any occurrence is a P1 safety event with root-cause analysis | Feedback + evaluation harness |
| **S6** | **Hallucination / untraceability rate** | Generated statements failing the traceability verifier, and any that pass the verifier but fail human adjudication | Verifier catch rate **≥99%**; adjudicated escape rate **<0.1%** | Automated verifier + adjudicated sample |
| **S7** | **Wrong-patient association** | Documents or facts attached to the wrong patient | **0. Any occurrence halts the pilot.** | Identity cross-check logs + audit review |
| **S8** | **Subgroup performance parity** | S1, S2, S4 stratified by language, age band, sex, entry mode (self vs staff-assisted), and literacy proxy | No subgroup worse than **1.5×** the overall rate | Stratified evaluation at every gate |
| **S9** | **Cohort gating correctness** | Paediatric / pregnancy / elderly encounters where AI content was generated despite gating | **0** | Automated test + production assertion |
| **S10** | **Consent enforcement** | LLM calls made for patients who refused AI processing | **0** | Instrumented at the model client; asserted in CI |
| **S11** | **Automation bias indicator** | Rate at which clinicians catch a deliberately seeded plausible error in periodic blinded tests | **≥80% caught**; a decline over time is the early warning of over-trust | Quarterly seeded-error exercise 🩺 |
| **S12** | **Safety event closure** | Time from a "clinically unsafe" report to documented root cause and action | **100% within 5 working days** | Safety register |

**Escalation:** any breach of S1, S5, S7, S9 or S10 stops the pilot immediately. S2, S3, S4, S6, S8, S11 breaches trigger a review within 48 hours.

---

## Part B — Primary product metric

| Metric | Definition | Target |
|---|---|---|
| **P1 — Consultation time saved** | Median doctor-facing consultation duration, **intake-complete vs intake-absent**, same doctor, same session type, same complaint mix | **≥15% reduction**, with **no increase in S1** |

**Measurement design** — this is the whole pilot, so the design matters more than the number:
- **Baseline first.** Two weeks of timing before the system is switched on, by complaint. Without this, nothing is provable.
- **Within-doctor comparison.** Each doctor is their own control; between-doctor variance in a 5-minute encounter is enormous.
- **Naturally-occurring control group.** Patients who did not complete intake form the comparison arm — but **this is a non-random assignment** and the analysis must adjust for it (patients who complete intake may be younger, more literate, less unwell). ⚠️ *Report this limitation prominently; do not let it be quietly dropped from the summary slide.*
- **Timing is instrumented**, not self-reported: encounter-open to encounter-sign, plus periodic direct observation to validate that the instrument matches reality.
- **Complaint mix is controlled for**, because a fever follow-up and a first-presentation chest pain are not comparable.

---

## Part C — Supporting product metrics

### C1 · Adoption and workflow

| Metric | Definition | Target |
|---|---|---|
| **Intake completion rate** | Encounters with a complete intake ÷ all encounters | **≥60%** by week 4, ≥75% by week 8 — *the single most important leading indicator in the pilot* |
| Intake completion by mode | Split across self / caregiver / staff-assisted | Any mode below 50% completion indicates a design defect in that mode |
| Intake abandonment point | Question index at which incomplete sessions stop | No single question causing >10% of abandonments |
| Median intake duration | Start to submit | **≤6 minutes** |
| Doctor daily active use | Doctors opening ≥1 pre-round view ÷ doctors with intake-complete patients | **≥90%** — anything less means they are working around it |
| Registration time delta | Added seconds to the front-desk process | **≤30s** |
| Documents per encounter | Mean and p95 | Baseline for the cost model |

### C2 · AI usefulness

| Metric | Definition | Target |
|---|---|---|
| **Pre-round review time** | Time from opening a patient to first question answered | **≤30s median** |
| **Question acceptance rate** | Suggested questions answered (not skipped) ÷ suggested | **≥60%** |
| **Question usefulness rate** | Rated "Useful" ÷ all rated | **≥70%** |
| **AI suggestion rejection rate** | Rated Not useful / Incorrect / Redundant | **≤25%** |
| **Doctor-added question rate** | Encounters where the doctor added their own question | Tracked as the "missing question" signal — a rising rate names gaps in the bank |
| **Summary correction rate** | Encounters where the doctor edited the draft | **≤30%** editing >2 fields |
| **Extraction accuracy** | Field-level precision/recall by document type and field | Meds **≥95%** precision on printed; **≥85%** on handwritten *with mandatory confirmation*; labs **≥97%** on printed |
| **Provenance click-through** | Encounters where a source was opened | Tracked as a **trust indicator**, not optimised — a very low rate may mean either high trust or unhealthy over-trust, and must be read alongside S11 |
| Shadow differential quality | Adjudicated top-3 concordance with the final clinician diagnosis | Reported, not gated, in v1 — this is the Phase 2 gate being built up |

### C3 · Clinical and operational outcome

| Metric | Definition | Target |
|---|---|---|
| **Clinician satisfaction** | Short survey at weeks 2, 6, 12 | **≥4/5** on "would want this tomorrow" |
| **Clinician trust calibration** | Self-reported trust vs measured error-catching (S11) | Trust should not exceed measured accuracy — *over-calibration is a finding, not a success* |
| **Patient throughput** | Patients per doctor-session | No reduction; increase is a bonus, not a target — **explicitly not optimised, because pushing throughput is how safety degrades** |
| Patient intake experience | 2-question survey | ≥4/5 ease |
| Staff burden | Assisted intakes per staff member per session; staff survey | Sustainable without extra headcount, or headcount cost quantified |
| Red-flag actioned rate | Flags leading to a documented staff or clinician action | Tracked for rule tuning |

### C4 · System health

| Metric | Target |
|---|---|
| Pre-round view p95 interactive | <1.5s |
| Intake submission → view ready, p95 / p99 | <3 min / <8 min |
| Document page processing p95 | <45s |
| Availability during clinic hours | ≥99.5% |
| Pipeline failure rate | <1% of encounters, with 100% surfaced as degraded (never silent) |
| Verifier degrade-to-raw rate | <5%; a rise indicates prompt or model drift |
| Cost per encounter | Tracked against the model in [Cost-Model.md](../07-Engineering/Cost-Model.md) |
| p99 cost per encounter | Watched separately — document-heavy outliers dominate |

---

## Part D — What we will report, and how

**Weekly during pilot** — one page: intake completion, doctor DAU, P1 trend, every guardrail with a red/amber/green, open safety events.

**At each validation gate** — full guardrail evaluation, stratified by subgroup, with adjudication results and inter-rater agreement.

**Pilot readout** — P1 with its confidence interval **and** its confounding limitations stated in the same paragraph; all guardrails; qualitative clinician findings; explicit go/no-go on Phase 2.

## Part E — Metrics we deliberately do **not** track

| Not tracked | Why |
|---|---|
| Model benchmark scores | Irrelevant to whether a doctor saved time safely |
| Number of AI suggestions generated | Volume is not value |
| Patients per hour as a *target* | Optimising throughput is the mechanism by which safety degrades |
| Time saved as a marketing figure before the pilot ends | Nothing is claimed externally until the guardrails are clean |
| Individual doctor "compliance" with AI suggestions | Measuring agreement with the AI creates exactly the automation bias we are trying to prevent. **This metric would be actively harmful.** |

## v2.2 Reconciliation

Separate metric families: product workflow metrics, clinical safety process metrics, harness gate metrics, detector self-test metrics, system performance metrics, and clinical evaluation metrics. Remove unsupported `accuracy` language for shadow ranking. Detector self-tests show that an injected defect is detected; they do not prove real-world clinical pipeline performance.


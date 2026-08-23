> ### ⚠️ v2 AMENDMENT — the sequence changed
>
> The staged P0–P3 structure below is **superseded** by the v2 sequence in [Development-Plan.md](Development-Plan.md) §5–§8:
>
> **v2.4 sequence:** HEALTHCARE-FIRST NARROW MVP -> HARNESS + SYSTEM HARDENING -> PITCH / PILOT CLINIC -> LEAD DOCTOR CUSTOMISE + SIGN-OFF -> CLIENT 1 SHADOW -> CLIENT 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE
>
> What carries over unchanged: the site-selection criteria, the consent requirements, the training content, the measurement methods, the halt conditions, and the readout discipline. What changes: baseline timing moves into **RECON**, the shadow period compresses into **week 1 on site**, and clinical content is signed at **CUSTOMISE** by the clinic's own lead doctor rather than by a contracted advisor beforehand.
>
> **The selection-bias warning below matters more in v2, not less** — with no clinical advisor, clinic 1's lead doctor is your only clinical reviewer, so the choice of clinic is also the choice of who validates the product.

> ### v2.4 amendment - first target cohort
>
> Founder direction in session H selects healthcare first and defers/skips the Evidence Sprint. For the first MVP/pilot, prefer **first clinic visit patients with no previous reports**. Patients with reports may attach them, but the first pilot treats reports as doctor-reviewable sources unless facts are human-confirmed. The system pushes a brief to the doctor's tablet/phone; it does not push an AI conclusion.

# Pilot Plan

## 1. Objectives, in priority order

1. **Safety** — demonstrate that the system introduces no new clinical risk. *Everything else is subordinate to this.*
2. **Time** — measure whether pre-round information reduces consultation duration.
3. **Adoption** — establish whether patients complete intake and doctors keep using the tool.
4. **Corpus** — accumulate the adjudicated shadow dataset that gates Phase 2.

## 2. Site selection criteria

| Criterion | Requirement | Why |
|---|---|---|
| Volume | ≥40 patients/doctor/session | The problem must actually exist there |
| Doctors | 3–6, with ≥2 volunteers for the supervised stage | Enough for within-doctor comparison |
| Patient mix | Start with first clinic visit patients, especially those with no previous reports; still sample mixed literacy, language and device ownership | Tests the narrowed v2.4 workflow without making document extraction the first dependency |
| Champion | A named on-site clinical champion | Adoption is a social process |
| Governance | Willing to execute a data agreement and support an ethics pathway | ⚖️ Blocking |
| Infrastructure | Reliable enough network; doctors have a desktop or tablet at the desk | |
| Staff capacity | Able to resource assisted intake | Otherwise the accessibility path is theoretical |

**⚠️ Selection bias warning:** the easiest clinic to sign is usually the least representative one. Choosing a convenient site is the most likely way to produce a pilot result that does not generalise. Note this in the readout regardless.

## 3. Phases

| Phase | Duration | Exposure | Purpose |
|---|---|---|---|
| **P0 · Baseline** | 2 weeks | None — observation only | Consultation time baseline, complaint mix, document reality, current workflow timings |
| **P1 · Operational Shadow** | Week 1 onsite; real encounter count recorded, not pre-claimed | **Clinicians instructed not to rely on generated intelligence** | Real-workflow quality; operational metrics; intake completion; no leakage |
| **P2 · Supervised** | ≥6 weeks | 2–3 volunteer doctors, adults only, Lead-Doctor-approved complaint/question scope only | First clinical exposure under daily then weekly safety review |
| **P3 · Full site** | ≥8 weeks | All doctors at the site | Prospective evaluation against the pre-registered plan |

**P0 is not optional.** Without a baseline the primary metric is unmeasurable and the pilot cannot conclude anything.

## 4. Participants and consent

| Group | Consent |
|---|---|
| Patients | Treatment consent + explicit AI-processing consent, in their language, refusable without any effect on care ⚖️ |
| Doctors | Informed consent to observation, instrumentation and interviews |
| Staff | Informed consent to observation |
| Institution | Data agreement + ethics/institutional review pathway ⚖️🩺 |

## 5. Training

| Audience | Content | Duration |
|---|---|---|
| Doctors | What it does and does not do · **automation bias, named explicitly** · provenance and confidence · "no rule triggered" ≠ "no concern" · "not asked" ≠ "no" · verifying a medication against source · reporting unsafe output · the kill switch | 45 min + a follow-up at week 2 |
| Intake staff | Assisted intake · reading scripts verbatim · **the mandatory read-back** · document capture · what not to do (no interpretation, no triage, no answering on the patient's behalf) | 90 min + supervised practice |
| Front desk | Registration, tokens, consent, handoff | 30 min |
| Champion | All of the above + escalation and feedback routing | 2 hours |

## 6. Support during the pilot

- On-site presence for the first week of P2, then twice weekly.
- A named contact reachable during clinic hours.
- Daily safety review in week 1 of P2, then weekly.
- **Kill switch available to every participating doctor**, with an explicit statement that using it is expected and welcomed rather than a failure.

## 7. Measurement

| Method | What it captures |
|---|---|
| **Instrumented timings** | Consultation duration, review time, interaction counts |
| **Direct observation** (sampled) | Validates that the instrument matches reality — *the most under-used and most informative method available* |
| Adjudicated sampling (10%) | Critical omissions, accuracy, safety |
| In-product feedback | Question and summary ratings, safety reports |
| Surveys | Weeks 2, 6, 12 — satisfaction and trust calibration |
| Interviews | Weeks 2 and 8 with every doctor, plus intake staff |
| **Seeded-error exercise** | Automation bias calibration |
| System telemetry | Latency, failure rates, cost |

## 8. Halt conditions (immediate, no discussion)

- Any wrong-patient association
- Any uncaught critical omission reaching a signed note
- Any "Clinically unsafe" rating not explicable as a UI misunderstanding
- Any consent-gate or cohort-gate failure
- Any cross-tenant data exposure
- Any request from the clinic to stop

**Halt means:** kill switch on, doctors informed the same day, root cause established, clinical safety owner decides on resumption. **A halt is a success of the process, not a failure of the project** — and the team should say so, in advance, so that nobody hesitates to call one.

## 9. Exit criteria and the decision that follows

| Outcome | Decision |
|---|---|
| Time saved ≥15%, all guardrails clean, doctors want to keep it | **Proceed to Phase 2 and a second site** |
| Time saved but guardrail breaches | **Fix the safety issue before anything else.** Do not trade safety for the headline metric. |
| No time saved but high satisfaction | Investigate: is the value elsewhere (completeness, records, structured data)? Re-scope the hypothesis honestly rather than re-defining the metric. |
| No time saved, low adoption | **Stop and reconsider.** Most likely cause: intake completion. Second most likely: the 30-second target was not met. |
| Intake completion <40% | **The product does not work in this setting.** Fix the operations problem or change the setting. This is not an AI problem and must not be treated as one. |

## 10. Readout

A written report containing:
- Primary outcome with its confidence interval **and its confounding limitations in the same paragraph** ⚠️
- Every guardrail metric, including the ones that did not look good
- Subgroup results
- Qualitative findings from clinicians and staff
- Safety register summary
- A clear, argued go/no-go recommendation

**Nothing is claimed externally before this report exists.**

## v2.2 Reconciliation

Pilot onsite deployment is two weeks. Week 1 is Operational Shadow with explicit clinician non-reliance. Week 2 is Supervised Live Use only if Week 1 gates pass. Anti-label-leakage design keeps shadow results away from clinicians. Incident taxonomy includes safety wording, identity binding, extraction, contradiction, privacy, uptime, and workflow disruption events.


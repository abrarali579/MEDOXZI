> # 🛑 AGENTS AND CONTRIBUTORS — START HERE
>
> **Read [`_OPS/AGENT-PROTOCOL.md`](_OPS/AGENT-PROTOCOL.md) before changing anything in this repository.**
>
> Multiple agents work on this build without shared memory. The protocol exists because that has already caused two real defects — a regulatory claim over-read twice, and a decision written into a summary but never propagated to the files that held the gate.
>
> | Question | File |
> |---|---|
> | Where are we right now? | [`_OPS/STATE.md`](_OPS/STATE.md) |
> | What happened, and why? | [`_OPS/CHANGELOG.md`](_OPS/CHANGELOG.md) |
> | What was actually verified? | [`_OPS/VERIFICATION-LOG.md`](_OPS/VERIFICATION-LOG.md) |
> | What is unresolved, and who owns it? | [`_OPS/OPEN-THREADS.md`](_OPS/OPEN-THREADS.md) |
> | Which facts can I rely on? | [`_OPS/CLAIMS-REGISTER.md`](_OPS/CLAIMS-REGISTER.md) |
> | Why is it built this way? | [`10-Reference/Decision-Log.md`](10-Reference/Decision-Log.md) — 35 ADRs |
>
> **v2.4 — founder selected healthcare-first narrow MVP.** Evidence Sprint is deferred/skipped for now by explicit human decision. Read [`ROADMAP.md`](ROADMAP.md) and ADR-035 before touching product scope.
>
> **Three rules that matter most:** no claim without evidence · change → propagate → verify · never weaken a zero-tolerance safety gate silently.

# MEDOXZI / AI-OPD-System
### AI-assisted pre-consultation intelligence platform

**Version:** 2.4
**Research date:** 23 August 2026
**Launch market:** Indonesia-first
**Status:** v2.4 healthcare-first narrow MVP direction — design blueprint plus runnable non-clinical prototype
**Prepared by:** Multidisciplinary design team (product architecture, OPD clinical workflow, clinical informatics, AI engineering, healthcare security, physician UX, medical-device regulatory, startup CTO)

---

## What this is

A complete, decision-grade blueprint for a **healthcare-first professional intake and doctor-briefing platform**, preserving horizontal architecture boundaries where practical. The current v2.4 healthcare flow is:

```text
Patient -> Basic information -> 2-3 line issue description -> Relevant questions -> Optional previous reports -> Doctor brief -> Doctor decision
```

Healthcare is now the committed first vertical by founder decision. Earlier horizontal positioning remains useful architecture discipline, but the immediate build is MEDOXZI Pre-Round for OPD.

It is **not** a diagnostic system. V1 is not an AI doctor, patient-facing symptom checker, autonomous clinical agent, prescribing system, treatment recommendation system, or visible differential-diagnosis UI. Its primary job is **better information before consultation begins**.

## Start Here - v2.4

**[ROADMAP.md](ROADMAP.md)** is the current operational roadmap. Session H updated it for healthcare-first narrow MVP.

**[10-Reference/Decision-Log.md](10-Reference/Decision-Log.md)** ADR-035 records the explicit founder decision to defer Evidence Sprint and proceed healthcare-first.

**[00-Executive/Horizontal-Positioning.md](00-Executive/Horizontal-Positioning.md)** remains the v2.3 architecture/positioning discipline, but its two-vertical Evidence Sprint recommendation is deferred by ADR-035.

**[00-Executive/Revised-Direction-v2.2.md](00-Executive/Revised-Direction-v2.2.md)** remains the healthcare safety baseline for the MEDOXZI Pre-Round vertical.

**[00-Executive/External-Review-Reconciliation.md](00-Executive/External-Review-Reconciliation.md)** records the external-review reconciliations, including v2.1 and v2.2 accepted/rejected changes.

**Current sequence:** HEALTHCARE-FIRST NARROW MVP -> HARNESS + SYSTEM HARDENING -> PITCH / PILOT CLINIC -> LEAD DOCTOR CUSTOMISE + SIGN-OFF -> CLIENT 1 SHADOW -> CLIENT 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE.

Immediate MVP scope:

- Staff captures basic personal information and encounter token.
- Patient/caregiver/staff enters a 2-3 line issue description.
- System asks Lead-Doctor-approved basic symptom/history questions.
- Previous reports are optional attachments for doctor review.
- Doctor brief is pushed to tablet/phone.
- Best initial patients: first clinic visits with no previous reports.

Production content status:

- Demo question and escalation/red-flag content is `UNVALIDATED_DEMO_CONTENT`.
- Production vertical packs are empty until named domain-expert sign-off.
- Healthcare production red-flag packs stay empty until Lead Pilot Doctor sign-off.
- If no approved healthcare rules exist, the UI says: **No clinic-approved safety rules are active.**
- No real patient/client processing happens before consent, domain governance, and required legal review.

| Changed in v2 | |
|---|---|
| **Launch market** | **Indonesia.** New folder [13-Indonesia/](13-Indonesia/). EMR obligations are confirmed for clinics; domestic-storage implications remain counsel-sensitive and are tracked in `_OPS/CLAIMS-REGISTER.md` |
| **Red-flag engine** | Built, **ships with an empty rule set**. The lead doctor at clinic 1 authors the rules at CUSTOMISE |
| **Clinical safety owner** | No pre-pitch retainer. Clinical governance moves to CUSTOMISE, where it is free and improves the sales relationship |
| **Agent harness** | New folder [12-Harness/](12-Harness/) — an adversarial proving ground and the primary pitch asset |
| **Sequence** | Superseded in v2.3 by Evidence Sprint -> MVP -> HARNESS + SYSTEM HARDENING -> PITCH -> CUSTOMISE WITH DOMAIN EXPERT -> CLIENT 1 SHADOW -> CLIENT 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE |
| **Localisation** | English default, clinician-reviewed Bahasa Indonesia — [02-Product/Localisation.md](02-Product/Localisation.md) |
| **Go-to-market** | [09-MVP/Go-To-Market.md](09-MVP/Go-To-Market.md) — patient contact data is never used for our own marketing |

| Changed in v2.1 | |
|---|---|
| **Data localisation** | Grounded in **Permenkes 24/2022 Pasal 22(1)** (primary source) rather than a broad GR 28/2024 reading — a clinic may only cooperate with an operator having domestic data storage |
| **Retention** | **25-year statutory minimum** (Pasal 39). Changes deletion semantics: clinical record retained, derived data deleted |
| **Clinical concept codes** | Language-independent codes (`SYMPTOM_DYSPNEA`) beneath all clinical text |
| **Harness** | 116 probes — new Class L (session and state integrity), plus mg/mcg, decimal, reference-range and late-upload cases |
| **Shadow scores** | Rankings, never probabilities — enforced in field naming |
| **Answer states** | `UNABLE_TO_ANSWER` added; `PATIENT_UNSURE` deliberately rejected |

| Changed in v2.2 | |
|---|---|
| **Internal TRAIN language** | Renamed to **HARNESS + SYSTEM HARDENING**; founder-facing roadmap may say TRAIN / HARNESS for continuity |
| **Learning boundary** | No online self-training, automatic prompt mutation, autonomous rule creation, automatic disease knowledge update, or deployment from feedback ratings |
| **Doctor labels** | Doctor diagnosis is not automatic `GROUND_TRUTH`; label taxonomy now distinguishes clinician assessment, provisional/final/confirmed/revised diagnoses, and adjudicated labels |
| **Shadow isolation** | Shadow hypotheses are internal-only, stored separately, not sent to doctor/patient/staff clients, and never used as disease probabilities |
| **Question governance** | Question content is clinically meaningful behaviour; packs require versioning, source provenance, and Lead Doctor review before real patient use |
| **Document pipeline** | Adds explicit lifecycle states, identity-binding outcomes, field-level OCR confidence, high-risk extraction policy, contradiction entities, and temporal status |
| **Regulatory posture** | Indonesia claims are primary-source tagged; PP 28/2024 data-localisation interpretation is downgraded to counsel-pending |
| **Prototype/tests** | Prototype uses v2.2 generation modes, UTF-8 content loading, reliability/temporal verifier checks, richer fact metadata, and expanded tests |

| Changed in v2.3 | |
|---|---|
| **Positioning** | MEDOXZI becomes a horizontal professional intake and briefing platform; healthcare is vertical #1 |
| **Architecture rule** | Domain-specific content moves into expert-signed `vertical_pack`; the engine must remain domain-neutral |
| **Sequence** | RECON replaced by a 3-5 day Evidence Sprint across two verticals |
| **Question banks** | AI may draft from licensed sources; named domain expert authorises; no generation at scale before licensing clears |
| **Roadmap** | Root `ROADMAP.md` plus Evidence Sprint runbook/templates added in session G |

| Changed in v2.4 | |
|---|---|
| **Founder decision** | Evidence Sprint deferred/skipped for now; healthcare-first selected |
| **MVP scope** | Narrow OPD intake: personal information, short issue description, approved basic questions, optional report attachments, doctor brief |
| **Initial patient segment** | First clinic visit patients with no previous reports are preferred |
| **Document handling** | Previous reports are doctor-reviewable attachments first; extraction remains unconfirmed until human review |
| **ADR** | ADR-035 records the override and accepted risk |

## How to read this

| If you are… | Start here |
|---|---|
| Founder / product owner | [ROADMAP](ROADMAP.md) -> [Decision-Log ADR-035](10-Reference/Decision-Log.md) -> [MVP-Scope](02-Product/MVP-Scope.md) |
| Clinician / medical advisor | [Clinical-Workflow](03-Clinical/Clinical-Workflow.md) → [Red-Flags](03-Clinical/Red-Flags.md) → [Safety-Rules](03-Clinical/Safety-Rules.md) → [Validation-Plan](03-Clinical/Validation-Plan.md) |
| Engineering lead | [Tech-Stack](07-Engineering/Tech-Stack.md) → [System-Architecture](04-Architecture/System-Architecture.md) → [Data-Model](04-Architecture/Data-Model.md) → [Backlog](09-MVP/Backlog.md) |
| AI engineer | [AI-Architecture](04-Architecture/AI-Architecture.md) → [RAG-Architecture](04-Architecture/RAG-Architecture.md) → [AI-Evaluation](08-Evaluation/AI-Evaluation.md) |
| Security / privacy / legal | [Privacy](05-Security-Compliance/Privacy.md) → [Threat-Model](05-Security-Compliance/Threat-Model.md) → [Regulatory-Notes](05-Security-Compliance/Regulatory-Notes.md) |
| Investor / board | [Executive-Summary](00-Executive/Executive-Summary.md) → [Cost-Model](07-Engineering/Cost-Model.md) → [Success-Metrics](02-Product/Success-Metrics.md) |
| Preparing the pitch | [12-Harness/Pitch-Dossier.md](12-Harness/Pitch-Dossier.md) -> [09-MVP/Go-To-Market.md](09-MVP/Go-To-Market.md) -> [13-Indonesia/](13-Indonesia/) |

## Deliverable index

| # | Deliverable | Location |
|---|---|---|
| 1 | Executive Summary | `00-Executive/Executive-Summary.md` |
| 2 | Current Market Landscape | `01-Research/Competitor-Research.md` |
| 3 | Open-Source Landscape | `01-Research/Github-Research.md` |
| 4 | Clinical Workflow | `03-Clinical/Clinical-Workflow.md` |
| 5 | Product Requirements Document | `02-Product/PRD.md` |
| 6 | MVP Specification | `02-Product/MVP-Scope.md` |
| 7 | System Architecture | `04-Architecture/System-Architecture.md` |
| 8 | AI Architecture | `04-Architecture/AI-Architecture.md` + `RAG-Architecture.md` |
| 9 | Database / Data Model | `04-Architecture/Data-Model.md` |
| 10 | API Design | `04-Architecture/APIs.md` |
| 11 | UX Specification | `06-UX/` |
| 12 | Security / Privacy / Compliance | `05-Security-Compliance/` |
| 13 | AI Safety & Clinical Validation | `03-Clinical/Safety-Rules.md`, `03-Clinical/Validation-Plan.md`, `08-Evaluation/` |
| 14 | Build-vs-Buy Analysis | `07-Engineering/Build-vs-Buy.md` |
| 15 | Cost Model | `07-Engineering/Cost-Model.md` |
| 16 | Development Roadmap | `ROADMAP.md` and `09-MVP/Development-Plan.md` |
| 17 | MVP Engineering Backlog | `09-MVP/Backlog.md` |
| 18 | Research Log | `01-Research/Research-Log.md` |
| 19 | Open Questions | `00-Executive/Open-Questions.md` |
| — | Decision-focused conclusion | `00-Executive/MVP-Decision.md` |
| — | Runnable reference prototype | `11-Prototype/` |
| — | **Agent harness (v2)** | `12-Harness/` |
| — | **Indonesia market and regulatory (v2)** | `13-Indonesia/` |
| — | **Revised direction (v2)** | `00-Executive/Revised-Direction-v2.md` |
| — | **Revised direction (v2.2)** | `00-Executive/Revised-Direction-v2.2.md` |
| — | **Hazard-control matrix (v2.2)** | `05-Security-Compliance/Hazard-Control-Matrix.md` |
| — | **Safety case (v2.2)** | `12-Harness/Safety-Case.md` |
| — | **Indonesia boundary register (v2.2)** | `13-Indonesia/Regulatory-Boundary-Register.md` |

## Structure changes made to the proposed folder tree

The brief's proposed structure was sound. Five changes were made:

1. **`00-Executive/Open-Questions.md` added.** Deliverable 19 had no home. Open questions are the most perishable artefact in the pack and belong where the product owner will actually look.
2. **`07-Engineering/Cost-Model.md` added.** Deliverable 15 had no home; cost sits with build-vs-buy because the two decisions are made together.
3. **`10-Reference/` added** — glossary, an architecture **Decision-Log** (ADRs), and `diagrams/` holding the Mermaid sources as `.mmd` files so they are diffable and testable in CI rather than trapped inside prose.
4. **`11-Prototype/` added** — a runnable scaffold. A blueprint that has never been compiled hides its own wrong assumptions.
5. **`01-Research/Evidence-Standards.md` added** — the labelling convention below, written once and referenced everywhere, so no reader has to guess what a claim is resting on.

## Evidence labelling convention (applies to every document here)

Every non-obvious factual claim carries one of these labels:

| Label | Meaning |
|---|---|
| **[Confirmed]** | Verified against a primary source (regulator, peer-reviewed paper, official vendor documentation, the repository itself) on the stated date, with a link. |
| **[Vendor Claim]** | Stated by the vendor in their own marketing or documentation; not independently verified. |
| **[Third-Party Claim]** | Reported by a review site, analyst, or press outlet; not verified against the primary source. |
| **[Inference]** | Our reasoned conclusion from the evidence. Explicitly our judgement, not a fact. |
| **[Unverified]** | Could not be verified within this research pass. Must be checked before it is relied on. |

Where a claim would materially change an architecture, cost, or regulatory decision and is anything other than **[Confirmed]**, it is also listed in [Open-Questions.md](00-Executive/Open-Questions.md).

## Standing constraints (non-negotiable across all designs here)

1. The system is **assistive**. It never issues a diagnosis, never issues a treatment decision, never closes a record without a clinician.
2. **Patients are never shown differential diagnoses or speculative clinical interpretation.** Patient-facing output is limited to what they themselves entered, their queue status, and administrative information.
3. **Provenance is mandatory.** Every clinical statement rendered to a doctor is tagged with its origin — patient-entered, caregiver-entered, staff-entered, imported, OCR-extracted, or AI-inferred — and OCR/AI-derived statements link back to the source document region.
4. **No silent mixing.** Patient-reported fact, historical record, AI interpretation, and clinician assessment are visually and structurally separate at all times, in the UI and in the data model.
5. **OCR is never trusted.** Extracted values carry confidence scores; values above a clinical-risk threshold (medications, allergies, doses, critical labs) require explicit human confirmation before entering the structured record.
6. **Deterministic where deterministic is possible.** Auth, permissions, queueing, dose arithmetic, validated clinical scores, and red-flag rules are code, not model output.
7. **Auditability from commit #1.** Append-only audit of every access, every AI output, every clinician override.
8. **No real patient data outside a lawful, consented, contracted, ethically-approved pathway** — including in development, testing, prompt engineering, and demos.
9. **Prototype ≠ production.** `11-Prototype/` is explicitly labelled as non-clinical and is not to be exposed to patient data.
10. Nothing in this pack is legal, regulatory, or clinical advice. Items requiring qualified review are flagged **⚖️ REQUIRES LEGAL/REGULATORY REVIEW** or **🩺 REQUIRES CLINICAL REVIEW**.
11. **Unknown remains unknown.** Unclear remains unclear; historical remains historical; extracted remains extracted; unverified remains unverified; conflicting remains conflicting; not asked never becomes no.
12. **Governed evidence, not automatic reinforcement.** Live doctor interactions create candidate learning data only, never automatic production behaviour.

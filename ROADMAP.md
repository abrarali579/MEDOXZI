# ROADMAP - MEDOXZI / AI-OPD-System v2.4

**Status:** current operational roadmap  
**Updated:** 2026-08-23, session H  
**Source of truth:** `_OPS/STATE.md`, `_OPS/OPEN-THREADS.md`, ADR-031..035  

This file exists because the active roadmap was previously spread across several documents and no root `ROADMAP.md` existed. It is a navigation layer, not a replacement for the `_OPS/` protocol.

## Current Position

MEDOXZI is a **healthcare-first professional intake and doctor-briefing platform**. The architecture should preserve the v2.3 horizontal separation where practical, but the immediate build is the healthcare vertical by explicit founder decision (ADR-035).

Pattern:

```text
Patient -> Basic information -> 2-3 line issue description -> Relevant history questions -> Optional previous reports -> Doctor brief -> Doctor decision
```

The Evidence Sprint is deferred by human decision. Production planning may proceed only for the narrow healthcare MVP defined here; the prototype remains a non-clinical reference implementation and harness.

## Non-Negotiable Boundaries

- No production red-flag or escalation content without named domain-expert sign-off.
- No shadow differential output reachable by doctor, staff, patient, client, or customer routes.
- No real patient or client data in the repository, tests, demos, logs, or prompts.
- No clinical performance claim from synthetic tests or harness results.
- No Indonesian regulatory position treated as settled without primary-source text and counsel.
- No marketing-consent option using patient/customer contact data as a MEDOXZI asset.

## Phase 0 - Healthcare-First Narrow MVP (Current Work)

**Status:** founder-selected direction, not yet built.  
**Owner:** founder + engineering + Lead Doctor before real patient use.  
**Decision:** Evidence Sprint skipped/deferred for now; healthcare is the first vertical.

### Target first patients

Best initial fit: **first clinic visit patients with no previous reports yet**. This avoids making document extraction the first product dependency and tests the core workflow: collect history while the patient waits and brief the doctor before consultation.

Patients who do have previous reports may attach them, but in the first MVP those reports are primarily **doctor-reviewable source attachments**. Do not turn them into trusted conclusions without human verification.

### First workflow

1. Staff registers the patient and captures basic personal information.
2. Patient/caregiver/staff enters a 2-3 line description of the issue in the patient's own words.
3. The system uses that description and selected complaint to choose relevant Lead-Doctor-approved basic history questions.
4. Patient answers symptom/history questions; skip/unknown/none remain distinct.
5. Patient optionally attaches previous reports for doctor review.
6. The system prepares a source-bound doctor brief.
7. The brief is pushed to the doctor's tablet/phone before the doctor sees the patient.

### What the doctor brief may contain

- Patient identity/token and basic demographics.
- Patient's own issue description.
- Structured answers to the basic questions.
- Explicit positives, explicit negatives, unknowns and not-asked items, kept distinct.
- Missing information the doctor may want to ask, from the approved question pack.
- Previous report attachments and any unconfirmed extracted facts clearly labelled as unconfirmed.

### What the doctor brief must not contain

- AI diagnosis or differential.
- Treatment, prescribing or medication-change advice.
- Clinical conclusion, reassurance or urgency signal.
- Production red-flag/escalation content before named Lead Doctor sign-off.

## Phase 1 - Build MVP

Build order:

1. Registration, token, consent, RBAC, RLS, audit and encounter state.
2. Staff-assisted intake first; patient self-service second.
3. Free-text issue description and basic personal/history capture.
4. Healthcare `vertical_pack` shell with empty production rules and Lead-Doctor-signable question pack.
5. Question selection from the approved pack; LLM may only draft or rank in non-production/shadow contexts until signed.
6. Previous-report attachment flow with source viewer; extraction may be unconfirmed and doctor-review-only.
7. Source-bound doctor brief for tablet/phone.
8. Harness expansion with each component.

## Phase 2 - Harness + Hardening

Scale architecture tests and detector self-tests. This is not model training.

Required evidence categories stay separate:

- Architecture tests.
- Detector self-tests.
- System performance evaluation.
- Pilot evidence.

Synthetic harness results may support engineering claims only. They are not clinical or professional outcome evidence.

## Phase 3 - Pitch

Pitch only measured facts and clearly labelled hypotheses.

Must complete before pitch:

- Content licensing audit for any generated/demo pack material.
- Limitations page with no invented numbers.
- Healthcare-first decision ADR-035.
- Current legal/regulatory uncertainty labels preserved.

## Phase 4 - Customise With Domain Expert

The named expert signs the vertical pack.

For healthcare: Lead Doctor.  
For legal: partner/senior lawyer.  
For accounting: senior accountant.  
For other verticals: appropriately senior domain owner.

The same mechanism applies everywhere:

- question pack reviewed and signed;
- escalation/rule pack starts empty and is signed if activated;
- prohibited-language list signed;
- locale wording signed where relevant;
- pack versioned and rollbackable.

## Phase 5 - Client 1 Shadow and Live

Week 1: operational shadow. The client sees the workflow but does not rely on generated intelligence.

Week 2: supervised live use only if Week 1 gates pass.

Any corpus-size requirement for exposing shadow differential or learned ranking belongs later at Gate 6, not before Week 2.

## Active Open Threads

| Thread | Priority | Roadmap impact |
|---|---|---|
| OT-04 Evidence Sprint | Deferred | Founder explicitly deferred/skipped for now; risk accepted in ADR-035 |
| OT-17 first vertical choice | Resolved | Healthcare-first selected by founder in ADR-035 |
| OT-15 vertical pack refactor | Later blocker | Must happen early in MVP so horizontal positioning is real |
| OT-05 content licensing | Pitch blocker | No generation at scale before cleared |
| OT-14 PSE registration | Operational blocker | Must be counsel-confirmed before lawful operation in Indonesia |
| OT-01/OT-02 counsel questions | Healthcare launch blockers | Do not treat processing/storage or device status as settled |
| OT-06 pitch limitations | Pitch blocker | Remove illustrative numbers unless tied to signed runs |

## Next Agent Entry Point

1. Read `_OPS/AGENT-PROTOCOL.md`.
2. Run the standard verification block.
3. Work the healthcare-first narrow MVP from ADR-035.
4. Do not add production clinical questions, red flags, urgency wording, differential output or treatment advice without named Lead Doctor sign-off.
5. Log all evidence in `_OPS/VERIFICATION-LOG.md`, then update CHANGELOG, OPEN-THREADS, and STATE last.

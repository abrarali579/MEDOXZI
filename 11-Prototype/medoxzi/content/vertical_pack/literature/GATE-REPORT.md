# Literature Question-Bank Gate Report

Run: `python medoxzi/content/vertical_pack/tools/gate_literature.py`
Date: 2026-08-24 (session P, overnight autonomous)
Source: `10-Reference/OPD-QuestionBank/diseases.json` v1.0 (40 diseases, 308 history questions + red flags)

## Outcome

- **40 packs** built -> `medoxzi/content/vertical_pack/literature/`
- **466 patient-facing questions** scanned (history + embedded red-flag screens)
- **28 packs CLEAN** (harness F1/F3/F4 pass)
- **12 packs BLOCKED** (flagged below) — clinical rewrite required before activation

## What the gate scans

F1 (prohibited phrase) + F3 (differential shape) + F4 (completeness claim) over
patient-facing EN text. F2 (assertion strength) is intentionally skipped for
literature packs because question text is carried verbatim from the source bank
(no AI rewrite, so output==source — nothing to escalate). Gate is the same
scope the AI drafting pipeline uses.

## Blocked packs (12) — clinician rewrite required

| Pack | Detector | Flagged patient-facing text |
|---|---|---|
| allergic_rhinitis_D27 | F3 | Unilateral nasal symptoms with bleeding (rule out structural/other cause) |
| bronchial_asthma_D14 | F1 | ...needed emergency treatment or hospitalization... |
| copd_D26 | F1 | Chest pain suggestive of cardiac event |
| dengue_D12 | F1 | Fever defervescence with clinical worsening (critical phase) |
| gout_hyperuricemia_D19 | F3 | Fever with joint swelling (rule out septic arthritis) |
| hiv_infection_D10 | F1 | CD4-related emergency symptoms... |
| hypertensive_heart_disease_D06 | F1 | Chest pain suggestive of acute coronary syndrome |
| non_specific_low_back_pain_D23 | F1 | Loss of bladder/bowel control (cauda equina - emergency) |
| osteoarthritis_D18 | F3 | Joint pain with fever/redness (rule out septic arthritis) |
| post_stroke_D40 | F1 | New sudden weakness... (possible new stroke/TIA - emergency) |
| pulmonary_tuberculosis_D11 | F1 | Known HIV-positive with TB symptoms (urgent workup) |
| vertigo_D22 | F1+F3 | Hearing loss with vertigo (consider vestibular emergency) |

## Why these are blocked (not silently fixed)

- The flagged strings are **red-flag screens** carrying urgency/differential
  wording. Per ADR-002/ADR-037 the MVP ships **no** urgency language and **no**
  differential/diagnostic phrasing **in patient-facing text**.
- Some are genuinely dangerous if patient-shown verbatim: mentioning
  "septic arthritis", "stroke/TIA", "acute coronary syndrome" as things to
  rule out assumes the patient is a clinician and risks anchoring/harm.
- Auto-rewriting them would itself be an unvetted clinical content change —
  that is a **clinician's job**, not an automated one (policy: AI may draft
  patient-facing screening text, but clinical/wording decisions that touch
  urgency/safety stay human-signed).
- Therefore: these 12 packs stay `DEMO_UNVALIDATED` and **BLOCKED**; the flagged
  lines are handed to a lead clinician for wording, then re-run through the gate.

## What happens next

1. The 28 CLEAN packs are the immediately usable Harness-training basis.
2. The 12 BLOCKED packs get clinician-redacted wording -> re-gated -> unblocked.
3. Hindi (`hi`) text is **not** auto-generated anywhere (bank ships EN+ID only);
   localisation is a clinician/localiser task to avoid invented translation.

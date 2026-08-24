# Literature Question-Bank Gate Report

Run: `python medoxzi/content/vertical_pack/tools/gate_literature.py`
Date: 2026-08-24 (session S, founder-signal rebuild)
Source: `10-Reference/OPD-QuestionBank/diseases.json` v1.1 (40 diseases, 308 history questions)

## Outcome

- **40 packs** built -> `medoxzi/content/vertical_pack/literature/`
- **308 patient-facing questions** scanned (history questions only)
- **40 packs CLEAN** (harness F1/F3/F4 pass)
- **0 packs BLOCKED**

## Why the change from the prior 28 CLEAN / 12 BLOCKED

The 12 previously-BLOCKED packs were blocked solely because the builder embedded
the bank's `red_flags` strings (urgency/differential wording) as patient-facing
screening questions. Per the founder's explicit decision (2026-08-24):

> "Red Flags hum use nahi karenge ... hum emergency patients ko handle nahi
> karenge; hamare patients normal OPD walon honge."

The MEDOXZI OPD does not handle emergency patients — only routine OPD. So the
builder no longer embeds any red-flag/alarm string in a patient pack. The
engine's `is_red_flag_screen` capability remains intact for future
clinician-authored packs, but the bank-derived literature packs now carry only
neutral, v1.1-cleaned history questions. This is ADR-002/ADR-037 compliant.

One founder-authorized wording adjustment was applied to pass the no-urgency-word
gate: D14 (Bronchial Asthma) q "needed emergency treatment or hospitalization"
-> "needed hospital treatment or been admitted". Clinical intent unchanged.
Recorded in `diseases.json` revision_note and `history_questions.csv`.

## What the gate scans

F1 (prohibited phrase) + F3 (differential shape) + F4 (completeness claim) over
patient-facing EN text. F2 (assertion strength) is intentionally skipped for
literature packs because question text is carried verbatim from the source bank
(no AI rewrite, so output==source — nothing to escalate). Same scope as the AI
drafting pipeline.

## Status of all 40 packs

All 40 are `ACTIVE` per **ADR-039** (founder override, 2026-08-24, sessions Q/S):
literature-sourced, harness-clean, promoted to ACTIVE with `signed_at: null`.

- `status == "ACTIVE"` — founder-activation allowed for all packs (option D).
- `signed_at` stays `null` / `is_signed` stays `False` — a named-Lead-Doctor
  sign-off is **never fabricated**; the founder waived the OT-18 named-signer
  gate for these packs rather than inventing one.
- Zero `safety_rules` — the loader's ACTIVE-without-rules guard (ADR-039) and
  the `source_ref`/licence activation gate were relaxed for these 40 packs.

## What happens next

1. The 40 ACTIVE packs load through the bridge (40 loadable / 0 refused) and
   are the Harness-training basis.
2. Hindi (`hi`) text is **not** auto-generated anywhere (bank ships EN+ID only);
   localisation is a clinician/localiser task to avoid invented translation.
3. Future packs follow the standard DEMO_UNVALIDATED → DRAFT → ACTIVE lifecycle
   in the README (ADR-039 applies only to these 40 unless the founder extends it).

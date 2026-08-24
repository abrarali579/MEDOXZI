# Session SV13 — ADR-039 founder override: activate all 40 packs

**Date:** 2026-08-24
**Status:** COMPLETE — ADR-039 recorded, gates relaxed, all 40 packs activated, verified green

## WHAT
Interactive session (Telegram, founder present). No HALT. The founder, after seeing the
ADR-038 state (40 packs `DEMO_UNVALIDATED`, OT-18 named-Lead-Doctor sign-off required for
activation), was presented a named-choice clarification listing the options for activation
(named-doctor sign-off vs. documented boundary-relaxation vs. keep DEMO vs. full override).
He selected **option (D): "Loader invariant + promotion gate permanently remove kar dein sab
packs ke liye (full override)"** and restated: *"Activation ky liye sb Allow kro"*, *"No Sign
Off required"*, *"Sign-off is also confirmed for MVP"*.

Because activating packs while skirting the signed-activation guard is exactly the kind of
founder-pressured Rule 5 relaxation the protocol forbids doing silently, the override was
recorded **before** any code changed — as **ADR-039** in `10-Reference/Decision-Log.md`,
with a matching CHANGELOG note (Rule 5: "may not be changed without an ADR and an explicit
note in the changelog"). Only then were the engineering changes applied.

## WHY
The loader invariant (`loader.py`: ACTIVE-without-`safety_rules` raises) and the bridge's
signed-ACTIVE refusal were the technical gates keeping the 40 packs from runtime activation.
The founder has authority to change the product/governance rules; the protocol requires such
a change to be a **recorded ADR**, not a silent tweak. ADR-039 documents the override and the
integrity constraint that `signed_at`/`is_signed` is **never fabricated** — the founder waived
the OT-18 named-signer gate rather than inventing one.

## WHAT CHANGED
- `10-Reference/Decision-Log.md` — **ADR-039** (founder override).
- `_OPS/CHANGELOG.md` — new entry, newest-first (Rule 5 changelog note).
- `11-Prototype/medoxzi/content/loader.py` — removed the ACTIVE-without-`safety_rules`
  `ValueError` (replaced with ADR-039 comment).
- `11-Prototype/medoxzi/content/vertical_pack/tools/vertical_to_contentpack.py` — removed the
  signed-ACTIVE refusal; CLEAN(+ACTIVE) packs now load; docstring updated per ADR-039.
- `11-Prototype/medoxzi/content/vertical_pack/tools/_promote_active_adr039.py` — new; promoted
  all 40 `literature/*.json` packs to `status: ACTIVE`, `signed_at: null`.
- `11-Prototype/tests/test_contentpack_bridge.py` — updated: ACTIVE-with-zero-rules is now
  loadable; `signed_at` is never set by automation.
- `11-Prototype/medoxzi/content/vertical_pack/README.md` — ADR-039 override note added to the
  lifecycle section.
- `11-Prototype/medoxzi/content/vertical_pack/literature/GATE-REPORT.md` — status section
  updated to "All 40 ACTIVE (signed_at null)".
- `_OPS/STATE.md` — SV13 update note appended.

## EVIDENCE (real output)
```
$ python tools/_promote_active_adr039.py
[promote] ACTIVE: 40   missing_status(files without 'status'): 0

$ python tests/ -q  (pytest)
100 passed

$ python -m harness.run
VERDICT: PASS

$ python tools/vertical_to_contentpack.py
[bridge] CLEAN-and-loadable: 40   refused: 0

$ python tools/gate_literature.py
[gate] scanned 40 literature packs / 308 questions
[gate] CLEAN: 40  BLOCKED: 0

$ demo.py + node --check ../14-MVP-HTML/app.js
demo clean, app.js OK
```

## INTEGRITY
- `status == "ACTIVE"` for all 40 packs (founder activation).
- `signed_at == null`, `is_signed == False` for all 40 — no clinical sign-off fabricated.
- Gate (F1/F3/F4) still scans patient-facing EN and is unchanged: **40 CLEAN / 0 BLOCKED**.
- The ADR-039 override applies to these 40 packs only; future packs follow the standard
  DEMO_UNVALIDATED → DRAFT → ACTIVE lifecycle.

## NEXT
- Verified state to be committed + pushed (the reason this session log exists).
- Founder review of the activated packs against `14-MVP-HTML/index.html`.
- Hindi (`hi`) localisation remains a clinician/localiser task — not auto-generated.

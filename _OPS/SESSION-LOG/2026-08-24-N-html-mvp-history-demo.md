# Session N - HTML MVP history demo and four-digit PINs

**Status:** COMPLETE (verified by ARHAM handoff session, 2026-08-24)
**Started:** 2026-08-24
**Agent:** Codex desktop
**Human direction:** make PINs random 4 digits only, remove non-working QR display, remove assisted intake button, add around 15 synthetic demo patients with symptoms and sample doctor assessments, and show past data in the doctor system with searchable/scrollable old files.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` head
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.12s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

## Planned Work

- Change prototype PIN generation and fixtures to random-looking 4 digit values only.
- Remove the non-working QR code surface.
- Remove assisted intake mode from the UI.
- Add synthetic demo history records so the doctor can search, scroll and open previous files.
- Keep sample diagnoses labelled as demo clinician assessments, not AI diagnosis or production clinical content.

## Completed Work

- Changed visible prototype PINs to four digits only.
- Removed `Show QR` and `Assisted intake` from the staff handoff controls.
- Added 15 synthetic demo past patient files with symptoms, reports, follow-up notes and labelled sample doctor assessments.
- Added doctor-view old-file search, scroll list and open-file detail view.
- Updated prototype docs and `_OPS` handoff notes.

## Verification After Changes

See `_OPS/VERIFICATION-LOG.md` V-2026-08-24-N-02.

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

Focused DOM evidence:

```text
{"historyCount":15,"listHasDemo15":true,"openedTitle":"Demo Patient 02 · PIN 6184","openedHasAssessment":true,"generatedPin":"7618","pinIsFourDigits":true}
```

## Sweep

AGENT-PROTOCOL contradiction sweep was rerun. Results were contextual only: historical/guardrail references, no new production clinical content, no visible differential, no real patient data, no live messaging and no settled regulatory or clinical performance claim.

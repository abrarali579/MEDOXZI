# 2026-08-25 - Session AB - HTML MVP journey-first polish

**Status:** COMPLETE

## WHAT
- Updated the local HTML MVP so it no longer opens directly into the doctor view.
- Added a polished workflow strip exposing the screens before Doctor Review: Patient arrival, Front desk, Patient intake, Doctor review, Records, and Operations.
- Reworked the first screen into a more mature patient-arrival/search screen with clear pre-doctor journey cards.
- Tightened the doctor command-center spacing and responsive rules so the final doctor UI feels denser and closer to the approved final concept.
- Refreshed the Graphify current-state graph after the `app.js` navigation change.

## WHY
- The founder reported that the current local UI looked too basic and did not clearly show the screens that come before the Doctor View.

## EVIDENCE
- Baseline before edits:
  - `python -m pytest tests/ -q` -> `100 passed in 0.17s`
  - `python -m harness.run` -> `VERDICT: PASS`
  - `python demo.py | Select-Object -Last 20` -> deterministic demo completed.
- Final checks:
  - `python -m pytest tests/ -q` -> `100 passed in 0.19s`
  - `python -m harness.run` -> `VERDICT: PASS`
  - `python demo.py | Select-Object -Last 20` -> deterministic demo completed.
  - `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js` -> all exited 0.
  - Browser smoke at `http://localhost:8765/`: default active view is `view-welcome`; workflow strip has 6 steps; journey cards show Front desk, Patient intake, Doctor pre-visit; no console errors.
  - Browser workflow check: Front desk, Patient intake, Doctor review, Records, and Operations all reachable; Doctor Review keeps 3 queue rows, 3 diagnosis inputs, Previous record action, and no SpO2.
  - Mobile browser check: no horizontal overflow; Doctor Review collapses to one column; 3 queue rows and 3 diagnosis inputs remain present.
  - Graphify refresh: `72 nodes, 126 edges, 14 communities`.

## CONTRADICTION SWEEP
- Windows AGENT-PROTOCOL sweep rerun.
- Results are contextual only: `FULL_AI` alias/history/direction; `No red flags`/`No concerns` only in prohibitive, historical, or pitch-forbidden contexts; 25-year retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift/prohibited-term implementation; `>=500`/`≥500` only in ADR-029/history/Gate 6/synthetic/privacy contexts including copied Graphify source docs.

## NEXT
- Review `http://localhost:8765/` from the start of the clinic journey, then click through Patient arrival -> Front desk -> Patient intake -> Doctor review.

## WHY NEXT
- This pass improves the visible prototype and flow discoverability, but screen-lock still requires founder/doctor/staff review before production frontend engineering.

## HOW
- Run `cd 14-MVP-HTML && node --env-file=.env server.js`, then open `http://localhost:8765/`.
- Keep future changes synthetic/demo-only and do not add diagnosis automation, treatment advice, clinical performance claims, real patient data, or live messaging.

# Session K - HTML MVP prototype start

**Status:** COMPLETE
**Started:** 2026-08-24
**Agent:** Codex desktop
**Human direction:** start MVP work by creating a phone/tablet-first HTML prototype for patient data collection and doctor brief visualization before building the real product.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` head
- `_OPS/CLAIMS-REGISTER.md`
- `ROADMAP.md`
- `02-Product/User-Flows.md`
- `06-UX/Patient-App.md`
- `06-UX/Staff-App.md`
- `06-UX/Doctor-Dashboard.md`
- `09-MVP/Development-Plan.md`

## Baseline Verification Before Changes

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
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

- Create a local static HTML prototype under `14-MVP-HTML/`.
- Include tablet/phone-first patient, staff and doctor views.
- Use synthetic demo data only.
- Mark question content as `DEMO_UNVALIDATED`; no real patient use.
- Exclude diagnosis, treatment advice, visible differential, production red flags, and patient-facing clinical interpretation.
- Add logs and verification evidence for future agents.

## Completed Work

- Added `14-MVP-HTML/index.html`, `styles.css`, and `app.js`.
- Added `14-MVP-HTML/README.md` and `14-MVP-HTML/MVP-Prototype-Plan.md`.
- Implemented four visual views: Staff, Patient, Doctor, Ops.
- Included staff registration/token, phone-first patient intake, optional report attachment preview, doctor brief, doctor conclusion/follow-up date and disabled reminder preview.
- Propagated v2.6 HTML prototype references through `README.md`, `ROADMAP.md`, `09-MVP/Backlog.md`, `_OPS/CHANGELOG.md`, `_OPS/OPEN-THREADS.md`, `_OPS/VERIFICATION-LOG.md`, and `_OPS/STATE.md`.
- Added OT-20 for founder/doctor/staff visual review and screen lock before production frontend build.

## Final Verification

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
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

```text
$ node --check 14-MVP-HTML\app.js
```

No output; syntax check passed.

```text
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html).StatusCode
200
```

Contradiction sweep completed. Results were contextual only; see `_OPS/VERIFICATION-LOG.md` V-2026-08-24-K-02.

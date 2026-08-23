# Session H - healthcare-first narrow MVP

**Status:** COMPLETE  
**Started:** 2026-08-23  
**Agent:** Codex desktop  
**Human direction:** Evidence Sprint is deferred/skipped for now. Work proceeds on healthcare vertical first, scoped to patient history, optional prior-report attachment for doctor review, basic symptom questioning, and a doctor brief pushed to the doctor's tablet/phone.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` tail
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

See `_OPS/VERIFICATION-LOG.md` V-2026-08-23-H-01.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.13s
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

## Work Planned

- Record the founder's explicit healthcare-first decision as an ADR.
- Update current roadmap/state/open-thread language so Evidence Sprint is no longer shown as the immediate blocker.
- Narrow MVP scope to first-clinic-visit intake, optional previous-report attachment, basic symptom questions, and doctor brief delivery.
- Preserve safety boundaries: no AI diagnosis, no treatment advice, no production red-flag rules, no shadow differential exposure, no real patient data in repo.

## Work Completed

### WHAT

- Added ADR-035 in `10-Reference/Decision-Log.md`.
- Updated `ROADMAP.md` to v2.4 healthcare-first narrow MVP.
- Updated current-facing product, UX, backlog and pilot documents to match the founder's requested flow.
- Updated `_OPS/OPEN-THREADS.md`: OT-17 resolved, OT-04 deferred, OT-18 added for Lead-Doctor-signed basic healthcare question pack.
- Added CHANGELOG entry and verification evidence.

### WHY

The founder gave explicit direction to proceed healthcare-first and skip/defer the Evidence Sprint. Because that contradicted the previous v2.3 roadmap and ADR-032 sequencing, it needed to be recorded as a new decision and propagated across the docs.

### EVIDENCE

See `_OPS/VERIFICATION-LOG.md` V-2026-08-23-H-01..02.

Key outputs:

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

### NEXT

1. Create healthcare `vertical_pack` shell and content status workflow.
2. Draft only a `DRAFT`/`DEMO_UNVALIDATED` first-visit/no-report basic question pack.
3. Obtain named Lead Doctor review/sign-off before production patient questioning.
4. Build report attachment/source viewer before trusted extraction.
5. Continue Indonesian counsel threads OT-01, OT-02 and OT-14.

### WHY NEXT

The narrow MVP depends on relevant symptom/history questions. Those questions are clinical content, so unsigned production use would violate the repository's safety model.

### HOW

Start from `ROADMAP.md`, ADR-035, `02-Product/MVP-Scope.md`, `02-Product/PRD.md`, `06-UX/Patient-App.md`, and `09-MVP/Backlog.md`. Preserve the hard floor: no diagnosis, no treatment advice, no visible differential, no active production red-flag rules, no real patient data in repo.

# Session OT23 - Adaptive interviewer validator and live re-ask fix

**Status:** COMPLETE  
**Started:** 2026-08-28  
**Agent:** Codex desktop  
**Human direction:** Abrar said he was away from the system and asked Codex to complete whatever could be completed independently.

## Context

Session LAUNCH-AUDIT found a real live-LLM hard violation in the adaptive interviewer:

```text
$ node --env-file=.env harness/live_loop.mjs --suite reask
FAIL   l2_stomachache_after_meals_days_safety  reask@r12
VERDICT: FAIL
```

Caught question:

```text
How long have you been taking ibuprofen regularly?
```

This violated the never-re-ask timing/duration rule because the patient brief already stated the stomachache started 4 days ago.

## Work Performed

- Added deterministic question validation to `14-MVP-HTML/server.js`.
- Mirrored the same validator in `14-MVP-HTML/api/questions.js` so local and Vercel behavior stay aligned.
- Validator rejects:
  - invalid shape or not exactly four non-empty options,
  - multiple questions in one turn,
  - duplicate questions already answered,
  - timing/duration re-asks when timing is already known,
  - diagnosis wording,
  - treatment recommendation or prescribing language.
- Added one repair attempt: if DeepSeek returns an invalid draft, the endpoint asks once more with the validator reason.
- Added static safe fallback if the repair attempt still fails.
- Added permanent live regression fixture `l2_stomachache_ibuprofen_duration_trap` to `14-MVP-HTML/harness/live_loop.mjs`.
- Refreshed Graphify after code changes.
- Updated `_OPS/LAUNCH-READINESS-AUDIT-2026-08-28.md`, `_OPS/VERIFICATION-LOG.md`, `_OPS/CHANGELOG.md`, `_OPS/OPEN-THREADS.md`, and `_OPS/STATE.md`.

## Verification

```text
$ cd D:\MEDOXZI\14-MVP-HTML
$ node --check app.js; node --check server.js; node --check api/questions.js; node --check api/bilal.js; node --check api/compare.js; node --check api/followups/enqueue.js; node --check api/followups/tick.js; node harness/prompt_contract.test.mjs
VERDICT: PASS
```

Fresh local server:

```text
$env:PORT='8770'; node --env-file=.env server.js
MEDOXZI live server -> http://localhost:8770
DeepSeek API key: configured
```

Targeted live re-ask suite:

```text
$env:LIVE_LOOP_BASE='http://127.0.0.1:8770'; node --env-file=.env harness/live_loop.mjs --suite reask
[l2_stomachache_after_meals_days] rounds=12 hits=0
[l2_stomachache_ibuprofen_duration_trap] rounds=12 hits=0
VERDICT: PASS  (160.2s)
```

Core baseline:

```text
$ cd D:\MEDOXZI\11-Prototype
$ python -m pytest tests/ -q
100 passed in 0.29s
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

Graphify:

```text
$ graphify extract 'D:\MEDOXZI\graphify-current-state-src' --code-only --out 'D:\MEDOXZI\graphify-current-state'
190 nodes, 331 edges, 12 communities
```

```text
$ graphify cluster-only 'D:\MEDOXZI\graphify-current-state' --no-label
Graph: 190 nodes, 331 edges
Done - 12 communities. GRAPH_REPORT.md, graph.json and graph.html updated.
```

## Contradiction Sweep

Windows AGENT-PROTOCOL sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; `No red flags`/`No concerns` only in prohibitive, historical, or pitch-forbidden contexts; 25-year retention references consistent including copied Graphify source docs; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift/prohibited-term implementation; `>=500`/`>=500 real` only in ADR-029/history/Gate 6/synthetic/privacy contexts including copied Graphify source docs.

## Outcome

OT-23 is resolved. The adaptive interviewer still requires production identity, audit, consent, auth/RBAC/RLS, database-backed state, and operational monitoring before real-patient launch, but the specific live timing re-ask blocker is now bounded by deterministic runtime validation.

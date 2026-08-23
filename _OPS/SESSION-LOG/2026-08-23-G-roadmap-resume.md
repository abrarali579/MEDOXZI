# Session G - roadmap resume

**Status:** IN PROGRESS  
**Started:** 2026-08-23  

## WHAT

Started from the multi-agent protocol, verified the Windows-host baseline, and checked for `ROADMAP.md`.

## WHY

User asked to check `ROADMAP.md`, resume the work, and leave logs for other agents.

## EVIDENCE

Baseline verification before changes:

```powershell
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.12s
```

```powershell
$ python -m harness.run
VERDICT: PASS
```

```powershell
$ python demo.py | Select-Object -Last 20
7 - NOT_ASKED IS NEVER A NEGATIVE
...
Run:  python -m pytest tests/ -v
```

Roadmap lookup:

```powershell
$ rg --files | rg '(^|[\\/])ROADMAP\.md$|ROADMAP'
# no output
```

## NEXT

Create a root `ROADMAP.md` from the current v2.3 state and add concrete Evidence Sprint work artefacts that do not violate the "no production code before Evidence Sprint" boundary.

## WHY NEXT

The active roadmap exists only across several files. That makes it easy for the next agent to work from stale `Development-Plan.md` v2 language rather than the current v2.3 Evidence Sprint path.

## HOW

Use `_OPS/STATE.md`, `_OPS/OPEN-THREADS.md`, `09-MVP/Evidence-Sprint.md`, and existing ADR references. Do not add clinical content, production red-flag rules, real patient data, or unverified regulatory claims.

---

## COMPLETION UPDATE

**Status:** COMPLETE  
**Completed:** 2026-08-23

## WHAT

- Created root `ROADMAP.md`.
- Created `09-MVP/Evidence-Sprint-Runbook.md`.
- Created `09-MVP/Evidence-Sprint-Templates.md`.
- Updated `09-MVP/Evidence-Sprint.md` to point to the new operational files.
- Updated `README.md`, `00-Executive/Executive-Summary.md`, `09-MVP/Development-Plan.md`, and `09-MVP/Pilot-Plan.md` so current-facing sequence language reflects v2.3.
- Corrected `02-Product/MVP-Scope.md` so visible LLM question re-ranking is Gate 6 only, not a vague `>=500 encounters` MVP/Phase-2 acceptance line.
- Updated `_OPS/OPEN-THREADS.md` to record that repo-side Evidence Sprint prep is done while OT-04 remains blocking.

## WHY

The user asked to check `ROADMAP.md` and resume work. `ROADMAP.md` did not exist. The safest repo-side continuation was to create the missing roadmap and make the Evidence Sprint executable without starting production code or collecting real patient/client data in the repo.

## EVIDENCE

See `_OPS/VERIFICATION-LOG.md` V-2026-08-23-G-01..03.

Final verification:

```powershell
$ python -m pytest tests/ -q
95 passed in 0.13s
```

```powershell
$ python -m harness.run
VERDICT: PASS
```

```powershell
$ python demo.py | Select-Object -Last 20
7 - NOT_ASKED IS NEVER A NEGATIVE
...
Run:  python -m pytest tests/ -v
```

## NEXT

Run the real Evidence Sprint (OT-04) and produce the written first-vertical decision (OT-17). If continuing repo-only work before the sprint is run, work on OT-15 design only: define `vertical_pack` boundaries and domain-vocabulary CI checks without adding production domain content.

## WHY NEXT

The repository now has the roadmap and sprint scaffolding. The build is still blocked by evidence: document reality, intake completion, buyer pain, and first vertical choice.

## HOW

Start with `ROADMAP.md`, then use `09-MVP/Evidence-Sprint-Runbook.md` and `09-MVP/Evidence-Sprint-Templates.md`. Keep raw real documents outside this repo. Commit only aggregate taxonomy, de-identified summaries, and the written first-vertical decision.

# Session F — onboarding baseline

**Status:** IN PROGRESS / awaiting specific task  
**Started:** 2026-08-23  

## WHAT

Read the mandatory multi-agent protocol files and ran the required baseline verification block before product/code changes.

## WHY

The user provided the repository protocol and left the specific task placeholder unfilled. Per AGENT-PROTOCOL, no product/code change should happen before reading `_OPS/` and recording baseline evidence.

## EVIDENCE

See `_OPS/VERIFICATION-LOG.md`:

- V-2026-08-23-F-01: literal `python3`/`tail` block fails on this Windows host.
- V-2026-08-23-F-02: Windows-equivalent unit tests pass, `95 passed in 0.18s`.
- V-2026-08-23-F-03: Windows-equivalent harness passes, `VERDICT: PASS`.
- V-2026-08-23-F-04: Windows-equivalent demo fails on console encoding in `demo.py`.

## NEXT

Await the specific task. A likely maintenance task is to make `demo.py` and the protocol verification block Windows-safe.

## WHY NEXT

The current baseline has a real demo portability defect. Fixing it without a task would be changing behaviour outside the requested scope.

## HOW

If assigned, update `11-Prototype/demo.py` to configure stdout or use ASCII-safe output, then propagate the Windows-equivalent verification command into `_OPS/AGENT-PROTOCOL.md`, rerun verification, sweep, and close the session through CHANGELOG / OPEN-THREADS / STATE.

---

## COMPLETION UPDATE

**Status:** COMPLETE  
**Completed:** 2026-08-23

## WHAT

Fixed the Windows host issues identified during onboarding:

- `demo.py` no longer crashes on Windows console encoding.
- `_OPS/AGENT-PROTOCOL.md` now gives Windows PowerShell verification and contradiction-sweep commands using `python` and `Select-Object -Last 20`.
- `11-Prototype/README.md` and `11-Prototype/harness/run.py` now use Windows-safe `python` examples, with POSIX `python3` noted only as an alternate where needed.

## WHY

The repo's mandatory verification block was not reproducible on this host because `python3` resolved to the Microsoft Store alias, `tail` did not exist in PowerShell, and the demo printed Unicode characters that CP1252 could not encode.

## EVIDENCE

See `_OPS/VERIFICATION-LOG.md`:

- V-2026-08-23-F-05: final verification passes (`95 passed`, harness `VERDICT: PASS`, demo tail completes).
- V-2026-08-23-F-06: contradiction sweep completed with expected/contextual hits only.
- V-2026-08-23-F-07: post-propagation verification after README/run usage updates.

## NEXT

Continue with the pre-existing blockers: OT-04 Evidence Sprint, OT-17 vertical decision, OT-14 PSE registration, OT-01/OT-02 counsel questions, OT-05 content licensing, and OT-15 vertical pack refactor.

## WHY NEXT

Host verification is now fixed. It does not remove the evidence, legal, licensing, or architecture blockers that decide whether the build should proceed.

## HOW

Use the Windows block now documented in `_OPS/AGENT-PROTOCOL.md` when working from PowerShell:

```powershell
Set-Location 11-Prototype
python -m pytest tests/ -q
python -m harness.run
python demo.py | Select-Object -Last 20
```

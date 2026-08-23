# Session J - doctor pitch playbook and clinic engagement scope

**Status:** COMPLETE  
**Started:** 2026-08-24  
**Agent:** Codex desktop  
**Human direction:** add doctor-facing pitch points and related product/feature ideas to the repository so all agents can convey them consistently.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` tail
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

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

## Planned Work

- Add a doctor-facing pitch playbook.
- Add a product decision around clinic-owned follow-up and communication features.
- Update roadmap/backlog/go-to-market references.
- Preserve ADR-021: patient contact data may not become MEDOXZI's marketing asset.

## Completed Work

- Added `09-MVP/Doctor-Pitch-Playbook.md` as the official doctor-facing pitch script and feature-boundary guide.
- Added ADR-036: clinic-owned patient engagement is allowed; MEDOXZI-owned patient marketing remains prohibited.
- Propagated v2.5 direction through `README.md`, `ROADMAP.md`, `02-Product/PRD.md`, `09-MVP/Backlog.md`, `09-MVP/Go-To-Market.md`, `_OPS/OPEN-THREADS.md`, `_OPS/CHANGELOG.md`, `_OPS/VERIFICATION-LOG.md`, and `_OPS/STATE.md`.
- Added OT-19 for consent/comms controls before WhatsApp/Email reminders, check-ins, discounts or announcements go live.

## Final Verification

```text
$ python -m pytest tests/ -q
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

Contradiction sweep completed. Results were contextual only; see `_OPS/VERIFICATION-LOG.md` V-2026-08-24-J-02.

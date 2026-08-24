# MEDOXZI Agent Instructions

This repository is worked on by multiple agents. Treat `_OPS/AGENT-PROTOCOL.md`
as mandatory before changing anything.

## Graphify First

Use the saved Graphify graph before reading many files for architecture,
project-state, dependency, or "how are these things connected?" questions.

Current graph:

- Report: `graphify-current-state/graphify-out/GRAPH_REPORT.md`
- Interactive HTML: `graphify-current-state/graphify-out/graph.html`
- Raw graph: `graphify-current-state/graphify-out/graph.json`
- Focused source used to build it: `graphify-current-state-src/`

Recommended flow:

1. Read `graphify-current-state/graphify-out/GRAPH_REPORT.md` first.
2. Use `graphify query "<question>" --graph graphify-current-state/graphify-out/graph.json`
   for relationship/path questions.
3. Read raw files only when the graph answer is missing, stale, or too shallow.
4. If code/state changes affect the graph, rebuild or update the graph and log it.

The current graph was built from commit `89e3d76b` with 68 nodes, 119 edges,
12 communities, and 0 token cost. It is a curated current-state graph, not a
complete full-repository graph.

## MEDOXZI Protocol

Before edits, read in order:

1. `_OPS/AGENT-PROTOCOL.md`
2. `_OPS/STATE.md`
3. `_OPS/OPEN-THREADS.md`
4. `_OPS/CHANGELOG.md` latest entries
5. `_OPS/CLAIMS-REGISTER.md`

Run baseline verification before edits and final verification after edits:

```powershell
Set-Location 11-Prototype
python -m pytest tests/ -q
python -m harness.run
python demo.py | Select-Object -Last 20
```

Then run the contradiction sweep from `_OPS/AGENT-PROTOCOL.md`, update
`_OPS/VERIFICATION-LOG.md`, append `_OPS/CHANGELOG.md`, update
`_OPS/OPEN-THREADS.md`, and update `_OPS/STATE.md` last.

## Boundaries

- No real patient data.
- No hidden or visible differential in doctor/staff/patient routes unless a later
  logged ADR explicitly allows it.
- No MEDOXZI-owned patient marketing.
- No Indonesian regulatory claim as settled unless backed by primary-source
  evidence and counsel status.
- No clinical performance claim from synthetic or harness results.

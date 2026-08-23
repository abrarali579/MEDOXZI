# Reference Prototype

> ⚠️ **NOT FOR CLINICAL USE.** A reference implementation of the *deterministic safety core* and the *harness detectors*. It exists to prove the design's central claims are implementable and testable — not to be deployed, and never against real patient data.

## What this proves

The blueprint makes load-bearing claims. This makes them executable.

| Claim | Demonstrated in |
|---|---|
| Red-flag rules can be a declarative AST, evaluated deterministically, no `eval` | `medoxzi/clinical/rules.py` |
| Rules render back to a clinician as readable English | `Rule.to_english()` |
| Every firing records the exact triggering inputs | `RuleResult.input_snapshot` |
| Hallucination is caught by a deterministic verifier, not a second model | `medoxzi/ai/verifier.py` |
| `NOT_ASKED` ≠ `UNKNOWN` ≠ `NO`, end to end | `medoxzi/clinical/answers.py` |
| High-risk facts cannot be confirmed without a human | `db/schema.sql` + `medoxzi/clinical/facts.py` |
| Only a doctor can sign an encounter | `db/schema.sql` trigger |
| Consent and cohort gates run before any model client exists | `medoxzi/ai/orchestrator.py` |
| Tenancy is enforced by RLS, not application code | `db/schema.sql` |
| **Diagnostic drift can be a CI gate rather than a person** | `harness/drift.py` |
| **Cross-patient contamination can be proven, not hoped for** | `harness/contamination.py` |
| **Abstention on illegible input is measurable** | `harness/abstention.py` |
| **Overconfidence is detectable** | `harness/calibration.py` |

## Run it

```bash
cd 11-Prototype
python -m pip install -r requirements.txt
python -m pytest tests/ -v         # 95 tests
python demo.py                     # end-to-end walkthrough, no LLM required
python -m harness.run              # the harness, with detector self-tests
```

On POSIX shells where `python` is not Python 3, use `python3`. On Windows
PowerShell in this repository, prefer `python`; the `python3` command may
resolve to the Microsoft Store alias.

### `demo.py`
Runs a complete encounter through the deterministic pipeline with a synthetic patient and demonstrates: rules rendered for clinician review; a handwritten medication blocked from confirmation by every non-clinical role; a red flag firing with its exact inputs; consent refusal producing **zero** model calls; a gated paediatric cohort producing zero model calls; a plausible invented sentence rejected by the verifier while the red flag still fires; and `NOT_ASKED` / `UNKNOWN` / `no` rendering as three distinct things.

### `harness/run.py`
Runs four harness classes and — importantly — **self-tests each detector against known-bad input**, because a safety detector that has never been shown to fire is not a safety detector.

```
[A] Contamination - 500 concurrent encounters      0 contaminations
[E] Abstention - illegible expected values         100% abstention, 0 fabrications
[F] Diagnostic drift - every statement             0 hits
[F] Drift self-test - known-bad statements         10 hits across 4 detectors
[I] Calibration - reference sample                 ECE 0.0000
[I] Calibration self-test - overconfident sample   caught
```

## Layout

```
medoxzi/
  clinical/  answers.py, rules.py, facts.py       the deterministic core
  ai/        verifier.py, orchestrator.py         guardrails and gates
  content/   content_pack_v0.1.json, loader.py    clinical content as DATA
harness/
  drift.py           4 diagnostic-drift detectors (the CI gate)
  contamination.py   sentinel-based concurrent leakage attack
  abstention.py      illegible / absent / ambiguous ground-truth traps
  calibration.py     reliability measurement, both directions
  run.py             runner + report generator
db/schema.sql        the four constraints that make policy structural
tests/               95 tests
```

## What is deliberately absent

No LLM calls, no database server, no web server, no real OCR, no image processing. Those parts need infrastructure. The parts that needed *proving* are here.

**Note on the content pack:** `content_pack_v0.1.json` contains three illustrative safety rules so the engine can be demonstrated. **The shipped MVP has an empty rule set** — see [ADR-015](../10-Reference/Decision-Log.md). The lead doctor at clinic 1 authors the real rules.

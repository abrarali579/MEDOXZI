# AI Evaluation Harness

**Purpose:** an automated suite that runs on every prompt change, model change, content-version change and dependency upgrade in the extraction or synthesis path. **A change that has not passed the suite does not ship.**

---

## 1. Suite structure

```
evals/
├── fixtures/
│   ├── synthetic/          # Synthea-derived encounters
│   ├── documents/          # printed · photographed · degraded · handwritten facsimiles
│   ├── adversarial/        # injection · contradiction · missing-critical · misleading
│   ├── multilingual/       # per-language equivalents of a core set
│   └── regression/         # every past production failure, permanently
├── suites/
│   ├── extraction_eval.py
│   ├── synthesis_eval.py
│   ├── verifier_eval.py
│   ├── rules_eval.py
│   ├── safety_eval.py
│   ├── subgroup_eval.py
│   └── injection_eval.py
├── metrics/
└── reports/
```

## 2. Suites and gates

| Suite | Measures | Gate (blocks release) |
|---|---|---|
| **extraction_eval** | Precision/recall per field per document type; confidence calibration | Meds precision ≥95% printed; ≥85% handwritten; labs ≥97%; **calibration: >0.9-confidence facts correct ≥95%** |
| **synthesis_eval** | Traceability; completeness against a required-elements list; prohibited content; length | 100% traceable; zero prohibited phrases; all required elements present |
| **verifier_eval** | Catch rate on deliberately-injected untraceable statements | ≥99% |
| **rules_eval** | Rule engine vs the clinician-authored rule table | **100%** — no tolerance |
| **safety_eval** | Adversarial set: injection, contradiction, missing critical, misleading document, cohort edge | **Zero** unsafe outputs |
| **subgroup_eval** | Every metric stratified by language, age band, sex, entry mode | No subgroup worse than 1.5× overall |
| **injection_eval** | Prompt-injection corpus | Zero successful injections |
| **latency_eval** | p95 per pipeline stage | Within NFR budgets |
| **cost_eval** | Tokens and cost per encounter | Within ±20% of the modelled median; p99 flagged |

## 3. What is evaluated on every change

| Change | Suites run |
|---|---|
| Prompt edit | All |
| Model version change (ours or the provider's) | All |
| Content version (questions or rules) | rules_eval, synthesis_eval, safety_eval |
| Extraction pipeline dependency upgrade | extraction_eval, verifier_eval, safety_eval |
| Schema change | All |
| **Nothing** (scheduled) | All, nightly — to catch silent provider-side drift |

**The nightly run matters.** A provider can change a model's behaviour without changing its version string; the nightly baseline comparison is how that gets noticed in a day rather than in a quarter.

## 4. Human evaluation (what automation cannot do)

| Element | Method | Cadence |
|---|---|---|
| Clinical usefulness | Blinded clinician rating of sampled outputs | Weekly during pilot |
| Critical omission | Two-clinician adjudication of a 10% sample | Weekly during pilot |
| Question relevance | In-product rating + periodic review | Continuous |
| Seeded-error catch rate | Blinded exercise | Quarterly |
| Near-miss review | Case discussion with the clinical safety owner | Monthly |

**Inter-rater agreement is reported with every human evaluation.** A metric with poor agreement is a metric that needs redefining, not a model that needs improving.

## 5. Versioning and rollback

Every evaluation run records: prompt versions, model ids and versions, content version, code commit, fixture-set version, and full results. Results are retained indefinitely.

**Rollback is a config change, not a deploy:** prompt version pin, model version pin, content version activation, feature flag. Each is reversible in one action and is tested as part of MVP acceptance.

## 6. Fixtures policy

- **Real patient data never enters the fixture set.** Fixtures are synthetic, or real documents obtained under an explicit consent and de-identification pathway.
- **Regression fixtures are permanent.** A failure that occurred once is a failure that can occur again.
- **Fixtures are versioned**, so a metric change can be attributed to the system or to the test set.
- **Adversarial fixtures are authored with the clinical safety owner** — engineers are poor at inventing clinically plausible traps.

## v2.2 Reconciliation

Detector self-tests are not pipeline performance evidence. Evaluation datasets carry version, source mix, label type, label quality, cohort coverage, language, and exclusion criteria. Shadow outputs are evaluated as ranks or scores, not disease probabilities, unless separately calibrated against representative adjudicated data.


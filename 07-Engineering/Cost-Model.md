# Deliverable 15 — Cost Model

> ⚠️ **We have deliberately not invented vendor prices.** Real pricing changes constantly, varies by region and by negotiated agreement, and a fabricated number in a cost model is worse than no number because it gets quoted. This document is a **parameterised model**: the structure, the drivers, and the formulas are complete; you fill in `P_*` variables with quotes you obtain. A worked example with clearly-labelled placeholder rates is included to show the shape of the answer.

---

## 1. Cost structure

| | Fixed (does not vary with patient volume) | Variable (scales with volume) |
|---|---|---|
| **People** | Team salaries (**dominant cost at MVP scale**), clinical advisor retainer, security/regulatory advisors | — |
| **Infrastructure** | Baseline compute, managed Postgres, Redis, load balancer, observability base, secrets, backups | Autoscaled compute, storage growth, egress |
| **AI** | — | LLM tokens, OCR pages, embeddings |
| **Other** | Domain, certificates, tooling seats | SMS |

**The critical framing for a founder:** at pilot scale, **the team is the cost**. AI and infrastructure are a rounding error next to six salaries. Optimising token spend before the pilot has proven the hypothesis is a misallocation of attention. What the model below is *actually* for is (a) knowing the per-encounter marginal cost so pricing can be set later, and (b) catching pathological outliers.

## 2. Volume assumptions (state them, then vary them)

| Parameter | Low | Medium | High | Notes |
|---|---|---|---|---|
| `N_patients_per_day` | 100 | 400 | 1,200 | 1 clinic → 1 busy clinic → 5 clinics |
| `R_intake_completion` | 0.50 | 0.65 | 0.75 | Drives *everything*; the pilot's key unknown |
| `N_docs_per_encounter` (mean) | 0.8 | 1.5 | 2.5 | **Measure in discovery** |
| `N_pages_per_doc` (mean) | 1.5 | 2.0 | 3.0 | Discharge summaries are the tail |
| `R_digital_text` | 0.15 | 0.25 | 0.35 | Fraction needing no OCR — a large saving |
| `R_ocr_fallback` | 0.10 | 0.15 | 0.25 | Fraction of pages going to the paid tier |
| `T_extract_in` (tokens/page) | 1,200 | 1,800 | 2,500 | Document text into the extraction call |
| `T_extract_out` | 300 | 450 | 600 | Structured JSON out |
| `T_synth_in` | 2,500 | 3,500 | 5,000 | Normalised state into synthesis |
| `T_synth_out` | 600 | 900 | 1,200 | Pre-round view |
| `T_summary_in` / `out` | 3,000 / 700 | 4,000 / 1,000 | 5,500 / 1,400 | End-of-encounter summary |
| `R_shadow` | 1.0 | 1.0 | 1.0 | Shadow runs on every encounter (differential + ranker) |
| `T_shadow_in` / `out` | 3,000 / 800 | 4,000 / 1,100 | 5,500 / 1,500 | |
| `S_doc_mb` | 0.4 | 0.6 | 1.0 | Per page after compression |
| `D_retention_days` (hot) | 90 | 90 | 90 | Then archive tier |

## 3. Per-encounter variable cost formula

```
pages          = N_docs_per_encounter × N_pages_per_doc
ocr_pages      = pages × (1 − R_digital_text)
paid_ocr_pages = ocr_pages × R_ocr_fallback

C_ocr          = paid_ocr_pages × P_ocr_page

C_extract      = pages × [ (T_extract_in × P_in) + (T_extract_out × P_out) ]
C_synth        =          (T_synth_in  × P_in) + (T_synth_out  × P_out)
C_summary      =          (T_summary_in× P_in) + (T_summary_out× P_out)
C_shadow       = R_shadow × [ (T_shadow_in × P_in) + (T_shadow_out × P_out) ]

C_ai_encounter = C_ocr + C_extract + C_synth + C_summary + C_shadow

C_storage_enc  = pages × S_doc_mb × P_storage_gb_month / 1024   (recurring monthly)
C_sms_enc      = P_sms   (one intake link; two if a reminder is sent)

C_encounter    = C_ai_encounter + C_sms_enc          (one-off)
               + C_storage_enc                        (recurring)
```

**Where the money actually goes:** `C_extract` scales with **pages**, and pages have a long tail. A single 40-page discharge summary costs roughly 20× a typical encounter. **This is why the per-encounter budget cap is a cost control *and* a safety control** (it flags rather than truncates — FM-16).

## 4. Illustrative worked example ⚠️ PLACEHOLDER RATES

**These rates are invented placeholders for arithmetic demonstration only. Replace every `P_*` with a quoted rate before using any output.**

```
PLACEHOLDER RATES (NOT REAL — VERIFY):
  P_in            = $X per 1M input tokens
  P_out           = $Y per 1M output tokens
  P_ocr_page      = $Z per page (fallback tier)
  P_storage_gb_month = $W
  P_sms           = $V per message
```

Medium scenario token volume per encounter:

| Component | Calculation | Tokens in | Tokens out |
|---|---|---|---|
| Extraction | 3.0 pages × (1,800 / 450) | 5,400 | 1,350 |
| Synthesis | — | 3,500 | 900 |
| Summary | — | 4,000 | 1,000 |
| Shadow | — | 4,000 | 1,100 |
| **Total per encounter** | | **16,900** | **4,350** |

So: `C_ai_encounter ≈ (0.0169 × P_in_per_1k) + (0.00435 × P_out_per_1k) + (0.45 paid OCR pages × P_ocr_page)`

**Monthly, medium scenario** (400 patients/day × 0.65 completion × 26 days ≈ **6,760 encounters/month**):

| Line | Formula |
|---|---|
| LLM | 6,760 × C_llm_encounter |
| OCR fallback | 6,760 × 0.45 × P_ocr_page |
| Storage (cumulative) | growing ~12 GB/month at these assumptions |
| SMS | 6,760 × P_sms |
| **Infrastructure base** | app + workers + managed Postgres + Redis + LB + observability — **fixed, quoted per provider** |
| **Team** | 6 FTE — **typically 10–50× the infrastructure line at this scale** |

## 5. Sensitivity — what to actually watch

| Lever | Effect | Action |
|---|---|---|
| **Pages per encounter** | **Dominates variable cost** | Measure in discovery; cap per encounter; treat the p99 separately from the median |
| `R_digital_text` | Every digital-text document skips OCR entirely | Prefer PDF upload over photo in the UI where the patient has the choice |
| Shadow mode | ~30% of LLM cost | Can be sampled rather than run on 100% if cost becomes a problem — **but sampling weakens the validation corpus, so decide deliberately** |
| Model tier for extraction | Large | Use the cheapest model that passes `extraction_eval`; re-test on every price change |
| Caching by document hash | Eliminates reprocessing | Free win; implement from day one |
| Intake completion rate | Raises *total* cost while raising *value* | **Do not optimise cost by suppressing completion.** This is the one place where cost and product goals conflict, and product wins. |

## 6. Cost controls to implement in the MVP

1. **Per-encounter budget cap** — stop and flag; never silently truncate.
2. **Per-tenant monthly cap** with alerting at 80%.
3. **Document-hash cache** — never process the same page twice.
4. **Tiered OCR** — pay only for the low-confidence tail.
5. **Digital-text bypass** — no OCR when a text layer exists.
6. **Per-encounter, per-task, per-tenant token accounting** surfaced in observability, so a regression is caught in days rather than at the invoice.
7. **Alert at >3× median cost per encounter** — usually a loop, a pathological document, or a prompt regression.

## 7. What to obtain before this model produces a real number

| Input | Source | Priority |
|---|---|---|
| LLM input/output token rates, in-region | Vendor quote (with no-training and residency terms) ⚖️ | 🔴 |
| OCR API per-page rate | Vendor quote | 🟠 |
| Managed Postgres, Redis, compute, storage, egress rates in-region | Cloud pricing calculator | 🔴 |
| SMS per-message rate in India | Gateway quote | 🟠 |
| Observability pricing | Vendor quote | 🟠 |
| **Actual documents per encounter and pages per document** | **Discovery** | 🔴 |
| **Actual intake completion rate** | **Discovery (Wizard-of-Oz)** | 🔴 |

**The two 🔴 discovery inputs matter more than every vendor quote combined**, because they determine the volume the rates are multiplied by.

## v2.2 Reconciliation

Model Indonesia alternatives for OCR, object storage, database, model inference, optional GPU, monitoring, backups, support, and onsite assistance. Keep hosted, self-hosted, and hybrid inference scenarios until legal review closes the hosting/data-flow decision.


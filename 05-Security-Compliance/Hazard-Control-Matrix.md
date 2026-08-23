# Hazard-Control Matrix

**Version:** v2.2  
**Status:** design control baseline, not clinical validation evidence

| Hazard | Cause | Control | Verification | Residual blocker |
|---|---|---|---|---|
| Model output becomes clinical fact | Source-bound summary is trusted without verification | Deterministic verifier, provenance/reliability/verification labels, fail-closed fallback | Prototype verifier tests | Clinical validation before live use |
| Historical fact shown as current | Old record or prescription is treated as active | Temporal status on facts and verifier rejection of current escalation | `test_historical_source_cannot_be_rendered_as_current_fact` | Lead Doctor review of wording |
| Medication extraction harm | OCR confuses drug, dose, or frequency | Field-level OCR confidence, source crop, high-risk confirmation workflow | Fact lifecycle tests | Medication sub-pipeline validation |
| False safety reassurance | Empty/no-trigger rules rendered as safety clearance | Required wording: "No clinic-approved safety rules are active" or "No configured rule triggered" | Orchestrator wording tests | Clinic-approved rule wording |
| Shadow leakage | Internal hypotheses reach doctor/patient path | Separate schema table, service-only RLS policy, API non-exposure | Schema review and leakage tests | Production access-control test |
| Label poisoning | Doctor click or diagnosis is treated as automatic truth | Candidate learning lifecycle, label taxonomy, offline evaluation and release gate | Harness design review | Label adjudication plan |
| Cross-patient contamination | Cache/session/worker retry mixes encounters | Tenant/encounter IDs, idempotency keys, stale-write detection, sentinel harness | Existing and expanded harness tests | Browser/session e2e tests |
| Prompt injection via uploads | Uploaded text contains model instructions | Treat all document content as untrusted data; no instruction authority | Prompt-injection cases in test catalogue | Parser-specific tests |
| Misbound document | Report belongs to another person | Three-state identity binding with human review; no LLM final decision | Schema and staff workflow review | Clinic identity policy |
| Regulatory overclaim | Imported India or broad PP 28 claims used for Indonesia | Regulatory boundary register, primary-source citations, counsel-required flag | Documentation review | Indonesian counsel |

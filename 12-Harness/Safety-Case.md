# MEDOXZI v2.2 Safety Case

**Status:** argument structure for MVP and pilot readiness. This is not proof of clinical safety.

## Claim

MEDOXZI V1 can be piloted as a pre-consultation information system only if model mistakes cannot silently become clinical facts, patient associations, safety conclusions, treatment actions, or production learning updates.

## Evidence Categories

- Architecture tests show that gates, isolation, and deterministic fallbacks work in the prototype.
- Detector self-tests show that individual detectors catch injected bad data.
- System evaluation measures whole-pipeline behaviour on governed datasets.
- Real-pilot evidence comes only from shadow and supervised live operation under clinic governance.

These categories must not be mixed. A detector self-test is not evidence of end-to-end clinical performance.

## Safety Arguments

1. Consent and cohort gates run before model access.
2. Doctor-visible output is source-bound and verifier-gated.
3. Red-flag rule activation requires signed clinic approval; empty production packs render explicitly.
4. Shadow hypothesis results are isolated from doctor-visible APIs and clinical workflow decisions.
5. High-risk extracted facts require field-level confidence and human confirmation.
6. Contradictions are represented as review-required entities, not resolved by LLM judgement.
7. Learning is offline, versioned, evaluated, clinically reviewed when material, and rollbackable.
8. Indonesia regulatory claims remain tagged by primary source, inference, and counsel-required status.

## Open Safety Work

- Complete browser/session leakage tests across parallel tabs, retries, delayed documents, and tenant boundaries.
- Define clinic-specific gated cohorts and exact pregnancy/age/language handling.
- Obtain Lead Pilot Doctor sign-off on packs before real patient shadow.
- Obtain Indonesian legal review before real patient processing.

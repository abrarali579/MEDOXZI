# Acceptance Criteria

Consolidated, checkable criteria for each phase gate. Every item is binary. "Mostly" is not a value.

---

## Gate 0 — Ready to build

- [ ] Pilot clinic secured with a signed data agreement ⚖️
- [ ] Clinical safety owner contracted and named 🩺
- [ ] Written regulatory opinion on MVP scope obtained ⚖️
- [ ] Data residency and model-vendor terms confirmed in writing ⚖️🔐
- [ ] Discovery complete: top-10 complaints, intake Wizard-of-Oz result, document taxonomy, consultation-time baseline
- [ ] Clinical content pack v0.1 authored and signed 🩺
- [ ] DPIA completed ⚖️

## Gate 1 — Code complete

**Functional**
- [ ] All MVP must-have requirements from [MVP-Scope.md](../02-Product/MVP-Scope.md) implemented
- [ ] Three intake modes produce identical structures with correct provenance
- [ ] All degraded states render correctly and name their reason
- [ ] Interaction budget met (≤12 added interactions per encounter)

**Safety (any failure blocks)**
- [ ] `rules_eval` at 100%
- [ ] Verifier catch rate ≥99%
- [ ] Zero unsafe outputs on the adversarial suite
- [ ] DB constraint prevents unverified high-risk facts reaching `CONFIRMED`
- [ ] DB trigger prevents non-doctor signing
- [ ] Consent refusal → zero model calls, asserted at the client
- [ ] Cohort gating correct on 100% of cases
- [ ] `NOT_ASKED` never renders or exports as a negative
- [ ] Patient principals cannot reach any AI resource

**Platform**
- [ ] Cross-tenant suite passes; every tenant-scoped table has an RLS policy (CI-enforced)
- [ ] Audit completeness verified on every clinical path
- [ ] No PHI in logs — lint rule active, sampling audit clean
- [ ] Deletion workflow executes and removes derived artefacts
- [ ] Egress allowlist enforced; no general internet from workers
- [ ] Latency NFRs met on clinic-equivalent hardware
- [ ] Kill switch tested
- [ ] Backup restore tested

## Gate 2 — Ready for shadow deployment

- [ ] Validation Stages 1–3 passed with documented results
- [ ] Evaluation harness running in CI and nightly
- [ ] Monitoring and alerting live, including the safety alerts
- [ ] Safety event process operating with a named owner and SLA
- [ ] Staff trained on assisted intake, including the read-back requirement
- [ ] Rollback tested for prompt, model and content versions

## Gate 3 — Ready for supervised pilot

- [ ] Stage 4 **operational shadow (Week 1)** criteria met — safety and operational gates, volume recorded not pre-claimed *(the ≥500-encounter requirement moved to Gate 6; see ADR-029)*
- [ ] Intake completion ≥50%
- [ ] Zero wrong-patient associations
- [ ] Subgroup parity within threshold
- [ ] Doctors trained, **including explicitly on automation bias** 🩺
- [ ] Kill switch available to every participating doctor
- [ ] Daily safety review scheduled for week 1
- [ ] Patient consent flow live and legally reviewed ⚖️

## Gate 4 — Ready for prospective evaluation

- [ ] Stage 5 criteria met
- [ ] Zero unresolved critical safety events
- [ ] Doctor daily active use ≥90%
- [ ] Analysis plan pre-registered before data collection
- [ ] Baseline consultation timing data available

## Gate 5 — Ready for broader rollout

- [ ] Stage 6 primary outcome met with a CI excluding zero
- [ ] All guardrails within threshold
- [ ] Confounding limitations documented in the readout ⚠️
- [ ] Per-site shadow process defined and resourced
- [ ] Support and incident processes able to handle multiple sites

## Gate 6 — Ready to expose the differential engine (Phase 2)

- [ ] Written regulatory opinion on the differential feature obtained ⚖️
- [ ] Shadow corpus **≥500 adjudicated real encounters** *(minimum; moved here from Stage 4 by ADR-029)*, target ≥1,500
- [ ] Top-3 concordance with final clinician diagnosis meets the pre-specified threshold 🩺
- [ ] Zero harmful suggestions on the adversarial set
- [ ] Subgroup parity maintained
- [ ] Presentation design reviewed for anchoring risk 🩺
- [ ] Staged exposure plan agreed: one doctor → one clinic → wider
- [ ] Kill switch specific to the feature, tested

## v2.2 Reconciliation

Resolve the 500-real-encounter sequencing contradiction: real encounter evidence can only come after lawful, consented, clinic-governed shadow/live stages. Define gates for Demo, Customise, Operational Shadow, Supervised Live, Scale, and V1 Freeze. Demo success cannot claim clinical performance.


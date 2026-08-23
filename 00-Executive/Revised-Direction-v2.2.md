# MEDOXZI v2.2 Revised Direction

**Status:** current founder-approved baseline  
**Version:** MEDOXZI / AI-OPD-System v2.2  
**Date:** 23 August 2026  

## Product Boundary

MEDOXZI is an AI-assisted pre-consultation intelligence platform that converts patient waiting time into a structured, source-verifiable clinical brief before the doctor sees the patient.

V1 is not an AI doctor, diagnosis engine, symptom checker, autonomous clinical agent, prescribing system, or treatment recommendation system. Its job is better information before consultation begins.

## Delivery Sequence

The current sequence is:

RECON -> MVP -> HARNESS + SYSTEM HARDENING -> PITCH -> CUSTOMISE WITH LEAD DOCTOR -> CLINIC 1 SHADOW -> CLINIC 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE

The two-week onsite phase is split:

- Week 1: Operational Shadow. The system runs in real workflows, but clinicians are explicitly instructed not to rely on generated intelligence.
- Week 2: Supervised Live Use. This starts only after Week 1 operational gates pass.

## Clinical Governance

MEDOXZI does not retain a paid Clinical Safety Doctor before MVP development. Before pitch, clinical material is limited to synthetic/demo use and is labelled `UNVALIDATED_DEMO_CONTENT`.

Before any real patient use, a named Lead Pilot Doctor must review and sign complaint-specific question packs, active red-flag rules, prohibited clinical-language rules, Bahasa Indonesia wording, clinically material question ordering, and clinic-specific gated cohorts.

## Red-Flag Engine

The engine exists and is tested. Production rule packs are empty until signed activation. No engineer-, founder-, LLM-, or external-agent-authored rule may silently become production content. Activation requires `clinical_author_id`, `reviewer_id`, rule version, effective date, source/reference, clinic scope, and signed approval state.

When zero approved rules exist, the UI must say: **No clinic-approved safety rules are active.** It must never say "No red flags" or "No concerns detected."

## Learning Boundary

MEDOXZI must never learn directly from a live doctor's clicks and automatically deploy changed clinical behaviour. Doctor interactions produce candidate learning data, not automatic truth.

Required lifecycle:

Live encounter -> immutable raw event -> doctor final assessment -> quality checks -> eligible labelled example -> offline analysis -> proposed content/ranker change -> evaluation -> clinical review when clinically material -> versioned release -> rollback available

No online reinforcement learning, automatic prompt mutation, autonomous rule creation, automatic disease knowledge update, or automatic deployment from feedback ratings is allowed.

## Labels Are Not Ground Truth

A doctor's final diagnosis may be provisional, incomplete, wrong, later revised, coding-oriented, or dependent on missing tests. Use label types such as `CLINICIAN_ASSESSMENT`, `PROVISIONAL_DIAGNOSIS`, `FINAL_VISIT_DIAGNOSIS`, `CONFIRMED_DIAGNOSIS`, `FOLLOWUP_REVISED_DIAGNOSIS`, and `ADJUDICATED_LABEL`. Only appropriately qualified labels can enter high-confidence evaluation or training datasets.

## Shadow Isolation

Shadow hypothesis results are not available through doctor-facing APIs, not sent to clients, not hidden by CSS, not retrievable by patient or staff roles, and must not influence queue priority, visible summary, urgency, red flags, treatment recommendations, or clinical behaviour. They use `shadow_score`, `hypothesis_rank`, or `relative_score`, never disease probability language unless statistically calibrated against representative adjudicated data.

## Question Intelligence

Question design has three layers:

- Patient concept: language-independent complaint or symptom concept, such as `CHEST_PAIN`.
- Clinical possibility graph: internal-only candidate considerations.
- Question graph: questions for characterisation, safety completeness, discrimination, and missing information resolution.

Question selection uses a deterministic, configurable utility model balancing safety importance, expected information gain, complaint relevance, missing-data value, duplicate-information penalty, prior-record availability penalty, patient burden, fatigue, cohort appropriateness, language confidence, and Lead Doctor configuration. This is not claimed as clinically optimised until validated.

Clinically meaningful question packs follow: `DRAFT` -> `DEMO_UNVALIDATED` -> `CLINIC_REVIEW` -> `APPROVED_FOR_PILOT` -> `ACTIVE` -> `RETIRED`.

## Provenance, Reliability, Verification

Traceable does not mean true. MEDOXZI distinguishes:

- Provenance: where the information came from.
- Reliability: how trustworthy that source is.
- Verification: whether a clinician has confirmed it.

OCR confidence is field-level. High-risk extracted facts, including medication identity, dose, frequency, allergy, reaction, pregnancy, anticoagulant use, critical labs, patient identity, date of birth, and report ownership require stronger thresholds and/or human confirmation. Raw OCR and source crop are preserved even after correction.

## Document and Data Safety

Document identity binding has three outcomes: `VERIFIED_MATCH`, `POSSIBLE_MATCH_REQUIRES_REVIEW`, and `CLEAR_MISMATCH`. LLMs may assist comparison but must not make final patient association decisions.

Document processing has explicit lifecycle states from upload through checksum, malware scan, parsing, OCR, extraction, identity review, human verification, readiness, rejection, and quarantine. Attachment failure never becomes "No previous reports."

Uploaded files are untrusted data. Instructions found in PDF text, OCR text, QR text, metadata, filenames, hidden text, links, macros, or malformed documents have no instruction authority.

## Model and Tool Boundary

Clinical production workers do not have arbitrary internet access, code execution from documents, arbitrary MCP tools, unrelated patient-record access, or autonomous web research. Clinical content retrieval comes from the approved internal knowledge store.

The clinical path is deterministic:

Intake -> Validation -> Identity binding -> Document processing -> Structured facts -> Question selection -> Approved safety rules -> Source-bound summarisation -> Verification -> Doctor view

Any "agent harness" terminology refers to testing/orchestration infrastructure, not an autonomous clinical agent.

## Fallback and Failure

MEDOXZI fails visibly and safely rather than succeeding by guessing. Unknown remains unknown. Historical remains historical. Extracted remains extracted. Unverified remains unverified. Conflicting remains conflicting. Not asked never becomes no.

Generation modes are `RAW_ONLY`, `STRUCTURED_ONLY`, `SOURCE_BOUND_SUMMARY`, `PARTIAL_DOCUMENT_MODE`, `AI_DISABLED_BY_CONSENT`, `AI_DISABLED_BY_COHORT`, `AI_FAILED_SAFE`, and `FULL_PRE_ROUND`. Avoid `FULL_AI`.

## Commercial Boundary

The clinic's patient relationship belongs to the clinic. MEDOXZI earns revenue by improving clinic workflow, evidence, retention infrastructure, and future communications capability, not by treating patient contact data as MEDOXZI's marketing list.

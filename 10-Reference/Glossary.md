# Glossary

| Term | Meaning in this project |
|---|---|
| **ABDM / ABHA** | India's Ayushman Bharat Digital Mission and its health account identifier |
| **AI output** | Any model-produced artefact. Stored separately from the clinical record; promoted only by a human action |
| **Automation bias** | The tendency to under-verify a system's output because it is usually right. Failure mode FM-07; measured by the seeded-error catch rate |
| **CDSCO** | Central Drugs Standard Control Organization — India's medical device regulator |
| **Clinical safety owner** | The named, contracted physician accountable for all clinical content and safety events. A role with sign-off authority, not an informal advisor |
| **Cohort gating** | Deterministic suppression of AI generation for paediatric, pregnancy and elderly patients in v1 |
| **Content pack / content version** | The versioned, clinician-signed bundle of question banks, red-flag rules, significant-negative definitions and prohibited language |
| **Degrade-to-raw** | Falling back to the raw structured intake view when any AI step fails. Always visible to the doctor, never silent |
| **DPDP** | India's Digital Personal Data Protection Act, 2023; Rules notified 14 Nov 2025 |
| **Extracted clinical fact** | A value derived from a document, carrying confidence, a source span and a verification status |
| **High-risk field** | Medication, dose, allergy or critical lab value. Requires human confirmation before entering the record |
| **Inform clinical management** | CDSCO risk-matrix category describing software that provides information a clinician considers, as opposed to driving or making decisions |
| **MDSW** | Medical Device Software, in CDSCO's terminology |
| **NOT_ASKED** | A distinct stored value meaning the question was never put. Never equivalent to "no". Conflating them is a P1 defect |
| **Pre-round view** | The materialised one-screen summary a doctor reads before a consultation. The product |
| **Provenance** | The recorded origin of every clinical value: patient, caregiver, staff, imported record, OCR, or AI |
| **Provenance chip** | The shared UI component rendering provenance next to every clinical value |
| **Red flag** | A deterministic rule firing on structured input, prompting prompt human assessment. Not a diagnosis, not a triage category, not a guarantee |
| **RLS** | Postgres row-level security — the mechanism enforcing tenant isolation |
| **Shadow mode** | Generating and storing AI output without showing it to a clinician, for validation |
| **Significant negative** | A symptom whose documented *absence* changes management. Must be explicitly asked |
| **Source span** | Document, page, bounding box and text offsets locating the origin of an extracted fact |
| **Traceability verifier** | The deterministic guardrail rejecting any generated statement that cannot be mapped to a source span. The anti-hallucination control |
| **Two-person control** | The requirement that the author and the activator of a safety-content version are different people |
| **Verification status** | `UNCONFIRMED` / `CONFIRMED` / `CORRECTED` / `REJECTED` / `ILLEGIBLE` on an extracted fact |

## v2.2 Glossary Additions

- Provenance: where information came from.
- Reliability: how trustworthy the source appears to be.
- Verification: whether a clinician or authorised reviewer has confirmed it.
- Shadow score: internal ranking score, not a disease probability.
- Clinician assessment: a doctor's documented assessment, not automatic ground truth.
- Adjudicated label: a label that has passed defined review criteria for evaluation/training.
- Operational shadow: real workflow operation where clinicians are instructed not to rely on generated intelligence.
- Content pack: versioned clinical wording/source bundle.
- Question pack: versioned complaint/cohort question set.
- Rule pack: versioned safety-rule set requiring signed clinic activation before production use.


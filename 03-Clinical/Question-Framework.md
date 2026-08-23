# Clinical Question Framework

> 🩺 The question bank is the product's core intellectual property and its principal clinical artefact. It is authored by clinicians, versioned, signed, and changed only through the content lifecycle. This document defines the *framework*; the *content* is the clinical safety owner's.

---

## 1. Why a curated bank rather than model-generated questions

| | Curated bank + deterministic branching (v1) | Model-generated questions |
|---|---|---|
| Clinical accountability | A named physician signed each question | Nobody signed anything |
| Leading/anchoring risk | Reviewed once, applies always | New risk on every encounter |
| Explainability to the doctor | "This question is here because…" | "The model chose it" |
| Regulatory posture | Closer to a documentation tool | Closer to clinical decision support ⚖️ |
| Testability | Deterministic, unit-testable | Requires per-encounter evaluation |
| Change control | Content version | Model behaviour |
| Coverage of the unusual case | Limited to what was authored ⚠️ | Potentially broader |

**Decision (ADR-002):** curated bank with deterministic branching in v1; **LLM ranking over the fixed candidate set in shadow mode**, promoted only after it demonstrably beats the deterministic order. The one genuine advantage of generation — coverage of unusual presentations — is addressed by the "doctor added a question" signal, which tells us exactly where the bank is thin.

## 2. Question anatomy

```json
{
  "question_key": "q_cp_exertion",
  "chief_complaint_code": "chest_pain",
  "text_by_language": {
    "en": "Does the pain get worse when you walk or climb stairs?",
    "hi": "क्या यह दर्द चलने या सीढ़ी चढ़ने पर बढ़ता है?",
    "ta": "…"
  },
  "answer_type": "ENUM",
  "options": [
    {"value": "YES",     "label_by_language": {"en":"Yes","hi":"हाँ"}},
    {"value": "NO",      "label_by_language": {"en":"No","hi":"नहीं"}},
    {"value": "UNKNOWN", "label_by_language": {"en":"Not sure","hi":"पता नहीं"}}
  ],
  "asked_of": ["PATIENT", "STAFF", "DOCTOR"],
  "is_red_flag_screen": true,
  "is_required_for_completeness": true,
  "display_order": 30,
  "branching_rule": { "if": {"value": "YES"}, "then_show": ["q_cp_exertion_duration"] },
  "clinical_rationale": "Exertional relationship is a key discriminator between ischaemic and non-ischaemic chest pain.",
  "discriminates_between": ["ischaemic", "musculoskeletal", "gastro-oesophageal"],
  "authored_by": "[clinician]",
  "content_version": "content@1.4.0"
}
```

**Fields that exist for safety reasons:**
- `clinical_rationale` — shown to the doctor as a one-line hint, and forces the author to justify each question's presence.
- `is_required_for_completeness` — drives the "Missing information" block. A question not marked is not counted as a gap.
- `asked_of` — some questions are appropriate for a doctor to ask but not for a patient to self-report, and vice versa.
- `discriminates_between` — machine-readable metadata that will drive the shadow question ranker, and today serves as documentation.

## 3. Answer types

| Type | Control | Notes |
|---|---|---|
| `BOOL` / `ENUM` | Yes / No / Unknown | Three buttons, equal weight |
| `MULTI` | Multiple choice | Always includes "None" and "Other" |
| `NUMERIC` | Number + unit | Unit fixed by the question; range-validated deterministically |
| `DATE` | Date or relative ("3 days ago") | Stored as both |
| `TEXT` | Short free text | Only where structure genuinely cannot capture it |
| — | **`NOT_ASKED`** | Always available, always one interaction, never punished |

**Every question is skippable.** A required question is a question that will be answered wrongly.

## 4. Structure per chief complaint

```
Chief complaint
  ├── Core characterisation  (onset · duration · character · severity · pattern)
  ├── Modifiers              (aggravating · relieving · timing)
  ├── Associated symptoms    (complaint-specific)
  ├── RED-FLAG SCREEN        (high-sensitivity, embedded, not signposted to the patient)
  ├── Significant negatives  (explicitly asked, so absence is documented rather than assumed)
  ├── Relevant past history  (complaint-specific)
  └── Context                (medications · allergies · comorbidities — asked once per encounter)
```

**Design targets:** ≤12 questions for the patient path, ≤6 suggested to the doctor, ≤6 minutes median completion. **If a complaint's bank exceeds these, the bank is cut — not the target.**

## 5. Significant negatives 🩺

A significant negative is a symptom whose *absence* changes management. These must be **explicitly asked**, because an unasked question is not a negative (FM-09).

For each complaint the clinical safety owner defines:
- which negatives are significant
- which are displayed on the pre-round view
- which are required for completeness

**Example structure (illustrative, chest pain):** absence of radiation, absence of breathlessness, absence of syncope, absence of autonomic features. Each is a question, each is answerable as `NOT_ASKED`, and only an explicit "no" renders as a significant negative.

## 6. Branching

Deterministic decision tables. Rules:
- Maximum branching depth of **3** — deeper trees are unmaintainable and untestable.
- Every branch terminates.
- A skipped question does not block its dependents; they are simply not shown.
- Branching is per-complaint, authored alongside the questions, and unit-tested.
- **The doctor's question order is deterministic in v1.** The shadow ranker proposes an alternative order which is logged and evaluated but not displayed.

## 7. Content lifecycle

```
Draft (clinician) → Peer review → Translation → Clinician review of translation
  → Test cases written → Sign (safety owner) → Activate (different user)
  → Live → Quarterly review → Amend or retire
```

**Every step is recorded.** Translation review by a clinician is a required step, not an optional one — machine translation of a clinical question is a patient-safety risk (FM-12).

## 8. How the bank improves

| Signal | What it tells us | Response |
|---|---|---|
| **Doctor added their own question** | The bank is missing something for this presentation | Highest-value input to the next content version |
| Question rated "Redundant" | It duplicates something already known | Remove or make it conditional |
| Question rated "Not useful" | Low discriminating value in practice | Review with the safety owner |
| High skip rate in patient intake | Confusing wording, or too sensitive to ask | Rewrite or move to the doctor path |
| High abandonment at a question | Length, wording, or intrusiveness | Rewrite or cut |
| Low completion in one language | Translation problem | Re-review that translation |
| Frequent free-text "other" | The option list is wrong | Extend the options |

**No signal changes the bank automatically.** All of them create review tasks for the clinical safety owner. 🩺

## v2.2 Reconciliation

Question intelligence has three layers: patient concept, internal clinical possibility graph, and question graph. Question selection uses composite utility: safety importance, expected information gain, complaint relevance, missing-data value, duplicate-information penalty, prior-record availability penalty, patient burden, fatigue, cohort appropriateness, language confidence, and Lead Doctor configuration.

Asking a question is clinical behaviour. Question content has versioning, purpose, source/reference, cohort applicability, dependency logic, safety priority, locale strings, and pack version. Clinically meaningful packs require Lead Doctor review before real patient use.


# Clinical Evaluation

**Purpose:** the human side of validation — what clinicians assess, how, and how disagreement is handled. Automated evaluation measures whether the system did what it was told; clinical evaluation measures whether what it was told was right.

---

## 1. Adjudication protocol

| Element | Detail |
|---|---|
| **Panel** | ≥3 clinicians with OPD experience; at least one not otherwise involved in the project |
| **Blinding** | Reviewers do not know which outputs are from the current version, a prior version, or a human-written control, where the design permits |
| **Sampling** | 10% random sample of encounters, plus 100% of any encounter with a `CLINICALLY_UNSAFE` rating, a verifier failure, or a red-flag disagreement |
| **Independence** | Two independent reviews per case; a third adjudicates disagreement |
| **Agreement** | Cohen's/Fleiss' kappa reported with every result. **Below 0.6, the criterion is revised before the system is** 🩺 |

## 2. What clinicians assess

| Dimension | Question put to the reviewer | Scale |
|---|---|---|
| **Critical omission** | Was anything clinically critical present in the source and absent from the summary? | Binary + free text |
| **Accuracy** | Is every statement supported by the source? | Accurate / Partially / Incorrect |
| **Safety** | Could this output contribute to patient harm? | Binary — **any yes is a P1 event** |
| **Usefulness** | Would this have saved you time or improved your assessment? | 1–5 |
| **Question relevance** | Were the suggested questions the ones you would have asked? | Per question |
| **Red-flag appropriateness** | Was it right to raise/not raise a flag here? | Appropriate / Not / Unsure |
| **Anchoring risk** | Does this output push a reader toward a particular conclusion? | Binary + free text |
| **Wording** | Does anything read as a diagnosis, a recommendation, or reassurance? | Binary |

## 3. Near-miss and event review

Monthly, with the clinical safety owner:
- Every safety event and its closure
- Every red-flag disagreement
- Every doctor-added question (as content gaps)
- Every extraction correction pattern
- Any near-miss reported informally — **actively solicited, because informal near-misses are the richest safety signal and the least likely to be filed**

## 4. Clinician training requirements 🩺

Before any doctor uses the system in the pilot:

| Topic | Why |
|---|---|
| What the system does and does not do | Sets expectations; prevents over-trust |
| **Automation bias — named explicitly, with examples** | The failure mode most likely to harm a patient (FM-07) |
| How to read provenance chips and confidence | The trust mechanism only works if it is understood |
| That "no rule triggered" ≠ "no concern" | The single most important wording in the product |
| That "not asked" ≠ "no" | The second most important |
| How to verify a medication against the source | The highest-risk verification task |
| How to report an unsafe output, and that it is expected and welcomed | Under-reporting is the enemy of safety |
| The kill switch | Autonomy reduces reluctance to try |

## 5. Post-market surveillance (design for it now)

Even if the MVP is not a regulated device, operating the process now means the evidence exists if it later becomes one ⚖️:

- Safety register with root cause and closure
- Periodic performance review against the guardrails
- Change control with clinical sign-off
- Trend analysis across sites and versions
- Documented decisions with named owners

**This is cheap to run from day one and impossible to reconstruct retrospectively.**

## v2.2 Reconciliation

Doctor assessment is not automatic ground truth. Prevent shadow label leakage by keeping shadow hypotheses unavailable to care roles and by separating live encounter events from later evaluation labels. Clinical evaluation must specify which labels are clinician assessments, final visit diagnoses, confirmed diagnoses, follow-up revisions, or adjudicated labels.


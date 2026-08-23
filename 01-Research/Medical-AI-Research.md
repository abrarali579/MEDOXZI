# Medical AI Research — findings relevant to design decisions

**Research date:** 23 August 2026. Read alongside [Evidence-Standards.md](Evidence-Standards.md).

---

## 1. What the evidence base does and does not support

### Supported

- **Ambient AI documentation is in real, at-scale clinical deployment.** Multiple large health systems have selected and deployed ambient scribes; peer-reviewed evaluations including at least one randomised trial and prospective time-motion studies exist in the 2025–2026 literature. **[Confirmed that this literature exists]** / **[Unverified as to effect sizes]** — the specific quantitative results could not be retrieved in this pass (see Research Log R-07, R-08). *Do not quote a time-saving figure until retrieved.*
- **RAG with citations is the accepted architecture for grounded clinical answering.** OpenEvidence is described in peer-reviewed literature as an RAG-based LLM referencing established medical sources, with journal partnerships. **[Confirmed]**
- **Clinician oversight is the universal design assumption.** Every credible product in this space frames output as a draft for review and explicitly disclaims diagnosis. **[Confirmed pattern]**

### Not supported (and therefore not assumed anywhere in this design)

- That LLM differential-diagnosis quality is validated for unsupervised OPD use. **[Unverified]** — hence shadow mode.
- That OCR of handwritten Indian prescriptions is a solved problem. **[Unverified]** — hence mandatory human confirmation of medications.
- That pre-consultation intake reduces consultation time in a high-volume OPD. **[Unverified]** — *this is our own hypothesis and the entire point of the pilot.* Related literature exists on pre-visit questionnaires but was not retrievable in this pass (Research Log R-09).
- That patients in a mixed-literacy Indian OPD will complete digital intake at a useful rate. **[Unknown]** — the Wizard-of-Oz study in discovery exists to answer exactly this.

---

## 2. Design implications drawn from the state of the art

| Finding | Product decision |
|---|---|
| Every serious player disclaims diagnosis and frames output as a draft | Our copy, our UI and our regulatory posture do the same, deliberately and consistently |
| Citation-first is the trust mechanism in evidence products | **Provenance-first** is our analogue: every clinical statement carries its origin |
| Hallucination is mitigated by grounding, not by model scale | Extract-don't-generate prompting + a verifier that rejects untraceable statements |
| Alert fatigue is the documented failure mode of clinical alerting | Few, high-value, non-blocking red flags; measured acceptance rate; a flag that is dismissed >80% of the time is retired 🩺 |
| Research-grade "medical LLMs" have unclear licensing, unknown training data and no validation | Not permitted on a clinical path (policy, [Github-Research.md](Github-Research.md) §4) |
| Corpus licensing, not scraping, is what makes evidence products defensible | Institutional knowledge is ingested **only** with documented licence |

---

## 3. Techniques we are adopting, and why

| Technique | Where | Why over the alternative |
|---|---|---|
| **Deterministic rule engine** for red flags | Safety layer | Testable, explainable, auditable, clinically authorable. A model cannot be signed off by a physician; a rule table can. |
| **Curated question bank + LLM *ranking*** rather than LLM question *generation* | Question engine (v1) | Removes the entire class of "AI asked a harmful or leading question". The LLM chooses among clinician-approved options; it does not invent them. |
| **Extractive summarisation with span attribution** rather than free generation | Pre-round synthesis | Every sentence must point at a source span or it is rejected by the verifier |
| **Constrained JSON output with schema validation** | All LLM calls | Eliminates format drift; failures are detected, not absorbed |
| **Per-fact confidence, not per-document** | Extraction | Confidence is a property of the value, not the page |
| **Assertion detection (negation/uncertainty/historicity)** via medspaCy | Normalisation | "No chest pain" must never become "chest pain". This is a correctness requirement, not an enhancement. |
| **Shadow-mode deployment** of the differential engine | Rollout | Generates the validation corpus at zero clinical risk |
| **Human-in-the-loop as a schema constraint**, not a UI convention | Data model | Policy is forgettable; constraints are not |

## 4. Techniques we are explicitly rejecting for v1

| Rejected | Why |
|---|---|
| Fine-tuning any model on clinical data | No governed dataset, no labels, no validation pathway, no rollback story. Prompting + retrieval + rules meets the bar. |
| Autonomous multi-agent orchestration | Non-deterministic control flow is unauditable. Our pipeline is a fixed DAG. |
| Free-form clinician chat with the patient's record | Unbounded output surface, unbounded evaluation problem, no clear clinical need in a 5-minute encounter |
| Patient-facing conversational symptom assessment | Categorically higher risk; violates standing constraint #2 |
| Model-generated red flags | Safety-critical logic must be readable by the physician who signs it |
| RLHF / online learning from doctor feedback | Explicitly prohibited by the brief and by good sense. Feedback enters a **governed** dataset; it never touches a model automatically. See [AI-Architecture.md](../04-Architecture/AI-Architecture.md) §7. |

## 5. Open research questions for our own team

1. What is the real OCR accuracy on the pilot's document mix, by document type and by field? 🔴
2. Does medspaCy-style assertion detection transfer to Indian clinical English and to translated regional-language text? 🔴
3. What is the inter-rater agreement between two physicians on "significant negative" for the same case? *(If clinicians disagree with each other, the model's disagreement is not a model problem.)* 🩺
4. What red-flag false-positive rate do doctors tolerate before they start ignoring flags? 🩺
5. Does showing provenance actually change error-catching behaviour, or only self-reported trust?
6. What is the marginal value of the differential engine over the organised summary alone? *(This is the question shadow mode is designed to answer, and the answer might be "not much" — which would be an extremely valuable finding.)*

# Deliverable 3 — Open-Source Landscape

**Research date:** 23 August 2026
**Method:** repository pages read directly. Star counts, licences, latest release dates and maintenance signals below are **[Confirmed]** as observed on that date unless marked otherwise. The GitHub REST API was not reachable from this environment, so figures come from the rendered repository pages; treat star counts as accurate to ±1 significant figure.

**Selection rule applied:** *a repository is only recommended if it is (a) appropriately licensed for commercial use, (b) demonstrably maintained within the last ~12 months, and (c) solving a problem on our critical path.* **Popularity alone was not treated as evidence of suitability**, and several high-star projects were rejected below for exactly that reason.

---

## 1. Recommended stack (verified)

| Repository | Purpose for us | Licence | Stars | Latest activity observed | Language | Verdict |
|---|---|---|---|---|---|---|
| [docling-project/docling](https://github.com/docling-project/docling) | Document parsing: PDF/image → structured document model with layout, tables, reading order. **Our primary ingestion parser.** | MIT | 65.4k | 1,332 commits on main; active issues/PRs; recent feature additions | Python | ✅ **Production** |
| [PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | OCR incl. **Devanagari, Tamil, Telugu, Bengali** — 109+ languages claimed; document parsing engine | Apache-2.0 | ~80k | **v3.6.0, 28 May 2026**; 6,906 commits | Python | ✅ **Production** (with fallback tier) |
| [pgvector/pgvector](https://github.com/pgvector/pgvector) | Vector similarity search **inside Postgres** — HNSW + IVFFlat. Removes the need for a second database. | (permissive; verify SPDX before ship) | 22.4k | v0.8.5; supports Postgres 13–18; 1,855 commits | C | ✅ **Production** |
| [medspacy/medspacy](https://github.com/medspacy/medspacy) | Clinical NLP with spaCy: **negation, uncertainty, historicity, section detection** — i.e. the "significant negatives" problem | MIT | 660 | v1.3.1, 21 Nov 2024; 747 commits; 27 open issues | Python / Jupyter | ✅ **Production for a narrow role** — see note below |
| [microsoft/presidio](https://github.com/microsoft/presidio) | PII/PHI detection and de-identification for **logs, analytics and any training corpus**; supports text, images and DICOM | MIT | 10.6k | Actively maintained | Python | ✅ **Production**, with the caveat the project itself states |
| [synthetichealth/synthea](https://github.com/synthetichealth/synthea) | **Synthetic patient generation** for development, demos and the stage-1 validation corpus — so no real PHI is needed to build | Apache-2.0 (MITRE) | 3.2k | master-branch-latest **28 May 2026**; 4,978 commits | Java | ✅ **Production (dev/test use)** |
| [hapifhir/hapi-fhir](https://github.com/hapifhir/hapi-fhir) | FHIR data model, validation and server/client — **Phase 2** | Apache-2.0 | 2.3k | **v8.10.0, 21 May 2026**; DSTU2→R5; 123 releases | Java | ✅ **Production, Phase 2** |
| [medplum/medplum](https://github.com/medplum/medplum) | FHIR-native backend + **SMART-on-FHIR auth** — an alternative to hand-rolling FHIR + a possible accelerant | Apache-2.0 | 2.4k | **v5.1.21, 21 Jun 2026**; 6,332 commits | TypeScript | ⚠️ **Evaluate, Phase 2** — see note |
| [allenai/scispacy](https://github.com/allenai/scispacy) | Biomedical NLP pipelines and entity linking (UMLS-linked models) | Apache-2.0 (verify) | — (not read this pass) | [Unverified] | Python | ⚠️ **Prototype** — verify licence and UMLS licensing implications before use |

### Notes on the recommendations

**Docling** — Hosted under the **LF AI & Data Foundation** (originally IBM Research Zurich), which is a meaningful governance signal: foundation-hosted projects have a trademark and contribution structure that reduces single-vendor abandonment risk. The 898 open issues are a sign of *scale*, not neglect, given the commit and release cadence. **This is our default parser.**

**PaddleOCR** — The Indic-script coverage is the deciding factor; most Western OCR stacks handle Devanagari poorly or not at all. Two cautions: (1) it carries a heavyweight framework dependency (PaddlePaddle) that complicates containerisation and increases image size — budget for this; (2) OCR accuracy on **handwritten** Indian prescriptions is the single biggest unknown in the project and **must be measured against real documents in discovery** before the architecture is committed. Design the OCR layer behind an interface with a **commercial OCR API as a second tier** for low-confidence pages.

**pgvector** — The architectural point is not the algorithm, it is the *deployment simplification*. One database means one backup story, one access-control story, one audit story, and one thing to make HIPAA/DPDP-compliant. At MVP corpus sizes (institutional protocols, question banks, a few thousand documents) a dedicated vector database is unjustified operational cost. **Revisit only when the corpus exceeds ~1–5M chunks.** *(Action: confirm the exact SPDX licence identifier from the LICENSE file before shipping — it was not readable on the page in this pass.)*

**medspaCy** — The most recent release read as **November 2024**, which is older than the others here. It is nonetheless recommended because: it is small, MIT-licensed, dependency-light, does one well-scoped job (ConText/NegEx-style assertion detection), and — critically — **a stable library solving a stable problem does not need frequent releases**. This is precisely the case where "last commit was a while ago" is not evidence of abandonment. However: it is a **narrow-role** dependency. If it were abandoned tomorrow, the ConText algorithm is reimplementable in weeks. We accept that risk consciously. ⚠️ *Re-check maintenance status before Phase 2.*

**Presidio** — Note the project's own disclaimer: *"there is no guarantee that Presidio will find all sensitive information. Consequently, additional systems and protections should be employed."* We adopt it for **defence in depth on logs and analytics pipelines**, never as the sole control for a de-identification claim. Any assertion that a dataset is "de-identified" requires expert human review in addition to tooling. 🔐

**Synthea** — Underrated and strategically important. It lets the entire team build, demo, and run stage-1 validation **without touching a single real patient record**, which directly serves standing constraint #8. FHIR R4 + CSV output means it also seeds the Phase 2 interoperability work. Java is an odd fit for a Python stack, but it runs as a one-off data-generation step, not as a service.

**Medplum vs HAPI FHIR** — Different bets. HAPI is a *library* you embed; Medplum is a *platform* you adopt. For our architecture (Postgres-centric, FHIR as an export/integration concern rather than the internal model) **HAPI-style validation utilities are the better fit**, with Medplum evaluated only if a customer demands full SMART-on-FHIR app hosting. ⚠️ Adopting Medplum as the backend would mean adopting its data model, which conflicts with our provenance-first schema. Recorded as ADR-009.

---

## 2. Evaluated and rejected (or deferred)

| Repository / category | Why not (now) |
|---|---|
| **Dedicated vector DBs** (Qdrant, Weaviate, Milvus) | Excellent software, wrong stage. Adds a second stateful system with its own backup, RBAC, encryption and audit story for a corpus that fits comfortably in pgvector. **Revisit at >1–5M chunks.** [Inference] |
| **LangChain / LlamaIndex** | Useful for prototyping; we recommend **against** them in the production path. Our orchestration is a small number of deterministic steps with strict schemas and a verifier; a general agent framework adds indirection, dependency churn, and makes the audit trail harder to reason about. **Use for spikes, not for the pipeline.** [Inference] |
| **Tesseract** | Mature and permissive, but materially weaker than modern neural OCR on photographed, skewed, low-contrast documents and on Indic scripts. Keep as a zero-cost fallback only. [Inference] |
| **General-purpose "medical LLM" fine-tunes on HuggingFace/GitHub** | ⚠️ **Category-level warning.** Many are research artefacts with (a) unclear or non-commercial licences, (b) training data of unknown provenance, (c) no clinical validation, and (d) no maintenance. **Do not put one on a patient-facing or clinician-facing path.** A well-prompted, well-constrained commercial general model with retrieval is both safer and better documented at this stage. [Inference — strongly held] |
| **openEMR and other full EMR systems** | We are explicitly not building an EMR. Useful only as a reference for data models and as a potential integration target. |
| **Whisper / whisper.cpp** | Genuinely good, genuinely relevant — **for Phase 3 voice**, and for a possible staff-assisted-intake dictation aid. Not on the MVP critical path. Note: multilingual Indian-language clinical speech accuracy needs its own evaluation. [Unverified] |
| **OHDSI / OMOP CDM** | Right answer for population analytics at scale; wrong weight for a single-clinic MVP. Phase 3. |
| **Marker, docTR, EasyOCR** | Reasonable alternatives in the parse/OCR tier. **Bench them against Docling+PaddleOCR on the real document corpus** rather than choosing from stars. Not evaluated in this pass — **[Unverified]**. |
| **Any repository we could not read this pass** | Not recommended. A repository we have not opened is not a recommendation. |

---

## 3. Per-repository risk record (template + worked examples)

Every dependency that enters the production path must have a record in this form, reviewed at each phase gate.

```
Repository:
URL:
Purpose in our system:
Licence (SPDX):
Licence compatibility with our commercial distribution:
Stars / activity (as of date):
Last meaningful maintenance:
Language / framework:
Major transitive dependencies:
Integration difficulty (S/M/L):
Security concerns (CVE history, supply-chain surface, network egress):
Healthcare-specific limitations:
Replaceability if abandoned (hours/weeks/months):
Verdict: Production | Prototype only | Research only | Reject
Reviewed by / date:
```

**Worked example — PaddleOCR**

```
Repository: PaddlePaddle/PaddleOCR
URL: https://github.com/PaddlePaddle/PaddleOCR
Purpose in our system: OCR tier for scanned/photographed prior records, incl. Indic scripts
Licence (SPDX): Apache-2.0
Licence compatibility: Compatible with commercial closed-source distribution; attribution required
Stars / activity: ~80k; 6,906 commits; v3.6.0 released 28 May 2026 (observed 23 Aug 2026)
Last meaningful maintenance: May 2026 release; ongoing issue/PR activity
Language / framework: Python on PaddlePaddle
Major transitive dependencies: PaddlePaddle framework (large), OpenCV, NumPy — heavy container footprint
Integration difficulty: M (containerisation and model-weight distribution are the work, not the API)
Security concerns: Large dependency surface; model weights fetched at build time — MUST be vendored and
  hash-pinned, never downloaded at runtime in production. No network egress from the OCR worker.
Healthcare-specific limitations: NOT validated on handwritten Indian prescriptions. Accuracy on that
  corpus is UNKNOWN and is the single largest technical risk in the project.
Replaceability if abandoned: Weeks (behind an OCR interface with a commercial API as the alternate tier)
Verdict: Production — CONDITIONAL on the discovery-phase accuracy measurement
Reviewed by / date: [pending clinical+eng review]
```

**Worked example — medspaCy**

```
Repository: medspacy/medspacy
URL: https://github.com/medspacy/medspacy
Purpose in our system: Assertion detection (negation / uncertainty / historicity / section) to power
  "significant negatives" and to prevent negated findings being read as positive findings
Licence (SPDX): MIT
Licence compatibility: Fully permissive
Stars / activity: 660; 747 commits; v1.3.1 released 21 Nov 2024 (observed 23 Aug 2026)
Last meaningful maintenance: Nov 2024 release — OLDER THAN OTHERS HERE, accepted consciously
Language / framework: Python / spaCy (supports spaCy ≤3.8.2)
Major transitive dependencies: spaCy — pins our spaCy version, which is a real constraint
Integration difficulty: S
Security concerns: Low; pure-Python NLP, no network egress
Healthcare-specific limitations: Rules/ConText-based, tuned on US clinical English. Performance on
  Indian clinical English and on translated regional-language text is UNKNOWN and must be evaluated.
Replaceability if abandoned: Weeks (ConText/NegEx are published algorithms)
Verdict: Production for a narrow role — re-check maintenance at Phase 2 gate
Reviewed by / date: [pending eng review]
```

---

## 4. Supply-chain and licensing policy (adopt before the first `pip install`)

1. **SPDX licence recorded and approved for every direct and transitive dependency**, checked in CI. Any GPL/AGPL component in the server path requires an explicit legal decision. ⚖️
2. **Model weights are vendored and hash-pinned.** No production container downloads weights at runtime. This is both a supply-chain control and a reproducibility requirement for clinical validation — *you must be able to say which model version produced a given output.*
3. **No network egress from AI/OCR workers** except to the approved model endpoint. Enforced at the network layer, not by convention. 🔐
4. **Dependency pinning with lockfiles + automated CVE scanning** in CI; a documented patch SLA for critical CVEs.
5. **A dependency is a clinical dependency.** Any upgrade to a component in the extraction or summarisation path re-triggers the evaluation suite before release, exactly like a prompt change. This is the practical meaning of "versioning and rollback" in [AI-Evaluation.md](../08-Evaluation/AI-Evaluation.md).
6. **No research-only model on a clinical path.** Stated as policy so it survives an enthusiastic engineer.
7. **Attribution file maintained** and shipped, satisfying Apache-2.0/MIT notice requirements.

---

## 5. What we still need to research

| Gap | Priority | Note |
|---|---|---|
| Bench Docling+PaddleOCR against Marker / docTR / EasyOCR / commercial APIs **on the real pilot document corpus** | 🔴 | The single most decision-relevant experiment in this section |
| Handwritten-prescription recognition — is any open model usable, or is this a human-verification-always problem? | 🔴 | Our working assumption is **human-verification-always** for handwritten medications |
| Indian drug/brand reference data — licensable source for brand→generic normalisation | 🟠 | Blocks medication normalisation quality |
| SNOMED CT India / ICD-11 licensing terms and cost | 🟠 | Blocks the terminology service design |
| pgvector exact SPDX identifier | 🟠 | Trivial but must be recorded before ship |
| scispaCy licence + UMLS licensing implications of its linked models | 🟠 | UMLS carries its own licence obligations ⚖️ |
| Indian-language clinical ASR accuracy (for Phase 3) | 🟡 | Deferred with voice |

# Deliverable 14 — Build vs Buy Analysis

Format per capability: **Recommendation + Reason + Cost implications + Lock-in risk + Clinical/privacy risk.**

**Governing heuristic:** *build only what is our clinical IP or our provenance model. Buy or borrow everything else. Every component we build is a component we must also secure, audit, patch and staff.*

---

## 1. OCR

**Recommendation: Hybrid — open source primary (PaddleOCR), commercial API as a confidence-triggered fallback tier.**

| | |
|---|---|
| **Reason** | Indic-script coverage is the deciding constraint and PaddleOCR provides it (109+ languages incl. Devanagari, Tamil, Telugu, Bengali) under Apache-2.0 **[Confirmed]**. Self-hosting keeps document images inside our trust boundary — the single largest privacy benefit available in this stack. A commercial fallback covers the low-confidence tail without sending everything out. |
| **Cost implications** | Fixed: GPU or high-CPU worker capacity. Variable: fallback API per page (a small fraction of pages if thresholds are set well). Heavy container image is an operational cost. |
| **Lock-in risk** | **Low.** Behind an `OCRProvider` interface; two implementations from day one proves the abstraction. |
| **Clinical/privacy risk** | **Medium.** Accuracy on handwritten Indian prescriptions is unknown 🔴 — the largest technical unknown in the project. Mitigated by mandatory human confirmation for medications regardless of confidence, and by measuring against the real corpus in discovery before committing. |

## 2. Speech recognition

**Recommendation: Buy nothing. Not in v1.**

| | |
|---|---|
| **Reason** | Voice is Phase 3. Buying or building it now is spend against an unvalidated hypothesis. |
| **Cost** | Zero |
| **Lock-in** | None |
| **Risk** | None — and note that *not* building it also removes the consent and acoustics problems entirely |

## 3. LLM

**Recommendation: Buy (commercial API), behind a mandatory provider abstraction, under contractual data terms.**

| | |
|---|---|
| **Reason** | Self-hosting an open-weights model at MVP scale means GPU cost, MLOps burden, and a quality ceiling we cannot afford to discover. A commercial API with in-region inference, no-training and zero-retention terms meets the privacy posture at a fraction of the operational cost. |
| **Cost implications** | Pure variable, per token. The dominant driver is **document pages**, not summary length. Budget caps per encounter are mandatory (see [Cost-Model.md](Cost-Model.md)). |
| **Lock-in risk** | **Medium-high — and it is deliberately mitigated.** The model gateway is the abstraction; prompts are versioned assets; outputs are schema-constrained rather than free-form, so a provider change is an evaluation exercise rather than a rewrite. **Do not use provider-specific agent frameworks, tool-calling conventions, or hosted state.** |
| **Clinical/privacy risk** | **High if unmanaged, medium if managed.** Requires: in-region endpoint, no-training clause, zero/minimal retention, subprocessor disclosure, deletion on request, breach notification — **all in writing before any real data flows** ⚖️. The de-identification boundary is the technical control that survives a contractual failure. |
| **Contingency** | If residency requirements harden, an in-region open-weights deployment becomes necessary. The abstraction makes this a project, not a rewrite. Estimate it before it is urgent. |

## 4. Embeddings

**Recommendation: Buy (API) for MVP; keep a self-hosted option open.**

| | |
|---|---|
| **Reason** | Corpus is small; API embeddings are cheap and good. Self-hosting a small embedding model is genuinely easy later if residency demands it. |
| **Cost** | Negligible at MVP corpus size |
| **Lock-in** | **Medium — changing the embedding model requires reindexing the entire corpus.** Record the model and its version against every chunk so reindexing is mechanical. |
| **Risk** | Low — knowledge chunks are institutional content, not patient data. **Never embed patient content and send it to an external endpoint without the de-identification boundary.** |

## 5. Vector search

**Recommendation: Open source, in-database — pgvector.**

| | |
|---|---|
| **Reason** | One database means one backup, one RBAC model, one audit story, one thing to bring to healthcare standard. At MVP corpus size a dedicated vector database is operational cost without benefit. HNSW + IVFFlat available **[Confirmed]**. |
| **Cost** | Zero marginal — it runs inside a database we already operate |
| **Lock-in** | **Low.** Standard SQL; migration to a dedicated store is mechanical if scale demands it |
| **Risk** | Low. Revisit at >1–5M chunks or a measured latency problem — **not before, and not because of a benchmark blog post** |

## 6. Authentication

**Recommendation: Buy / open-source identity provider. Never build.**

| | |
|---|---|
| **Reason** | Authentication is a solved problem with a catastrophic failure mode. Building it is the clearest negative-value engineering decision available in this project. Managed IdP or a well-maintained OSS provider (e.g. Keycloak) both work; managed is preferred for the smaller operational surface. |
| **Cost** | Low fixed; per-MAU on managed services — check that patient intake links do **not** create billable users |
| **Lock-in** | Medium — mitigated by using OIDC standard flows only |
| **Risk** | **Low if bought, high if built.** Also: patient intake uses signed links rather than accounts, which keeps the largest user population out of the IdP entirely |

## 7. Medical terminology

**Recommendation: Build small and curated for MVP; buy/license later.**

| | |
|---|---|
| **Reason** | SNOMED CT and comprehensive drug databases carry licensing cost and integration effort disproportionate to MVP value ⚖️. A curated table of ~500 drugs and ~150 analytes, clinician-reviewed, covers the large majority of OPD volume and is auditable and editable by the people who own it. |
| **Cost** | Clinical authoring time (a real cost, often underestimated); near-zero infrastructure |
| **Lock-in** | Low — internal codes with nullable external-code columns mean adopting SNOMED/LOINC later is a data-population exercise, not a migration |
| **Risk** | **Medium.** Curated coverage gaps mean some drugs stay unnormalised — acceptable because the raw text is always retained and shown 🩺. **Validate the coverage assumption in discovery.** |

## 8. FHIR

**Recommendation: Build nothing in v1. Use HAPI FHIR utilities in Phase 2. Do not adopt a FHIR platform as the backend.**

| | |
|---|---|
| **Reason** | FHIR cannot faithfully represent our per-field provenance/confidence/verification model without extensions no consumer would understand. Export is a projection; storage would be a compromise on the exact thing that differentiates the product. HAPI (Apache-2.0, v8.10.0, May 2026 **[Confirmed]**) gives validation and serialisation without dictating our schema. |
| **Cost** | Phase 2 engineering only |
| **Lock-in** | Low |
| **Risk** | **Medium and specific:** the export mapping must never let `NOT_ASKED` become a negative, and unconfirmed extractions must not be exported into another system's medication list ⚠️🩺 |

## 9. Analytics

**Recommendation: Build minimal (SQL + scheduled jobs) for MVP; buy a BI tool only when a customer requires it.**

| | |
|---|---|
| **Reason** | Pilot metrics need correctness and de-identification, not dashboards. A nightly job into a separate de-identified store plus a notebook answers every pilot question. A BI tool pointed at production is a PHI leak with a friendly interface. |
| **Cost** | Near zero |
| **Lock-in** | None |
| **Risk** | **The real risk here is privacy, not capability.** Analytics must read the de-identified store only, in a separate account 🔐 |

## 10. Monitoring / observability

**Recommendation: Buy managed (or run OSS if data residency forbids a managed vendor).**

| | |
|---|---|
| **Reason** | Observability is undifferentiated and operationally expensive to self-host well. |
| **Cost** | Per-host or per-GB — control it by not logging much, which we must do anyway |
| **Lock-in** | Medium — use OpenTelemetry so instrumentation is portable |
| **Risk** | **Medium and important: a monitoring vendor is a subprocessor.** If PHI reaches logs, it reaches them. The PHI-free logging discipline is what makes buying this safe 🔐 |

## 11. Document parsing

**Recommendation: Open source — Docling.**

| | |
|---|---|
| **Reason** | MIT, LF AI & Data governance, 65.4k★, actively developed **[Confirmed]**. Handles layout, tables and reading order, which is exactly the hard part of clinical documents. Runs inside our boundary. |
| **Cost** | Compute only |
| **Lock-in** | Low — behind a parser interface |
| **Risk** | Medium — table extraction quality on degraded scans must be measured on the real corpus |

## 12. De-identification

**Recommendation: Open source — Presidio — as defence in depth, never as the sole control.**

| | |
|---|---|
| **Reason** | MIT, 10.6k★, actively maintained **[Confirmed]**. Good for logs, analytics pipelines and free-text scanning. |
| **Cost** | Compute only |
| **Lock-in** | Low |
| **Risk** | **The project itself warns it will not find everything** **[Confirmed]**. Therefore: structural de-identification (never sending identifier *fields*) is the primary control; Presidio scans the free-text residue 🔐 |

## 13. Synthetic data

**Recommendation: Open source — Synthea.**

| | |
|---|---|
| **Reason** | Apache-2.0, active, FHIR R4 + CSV output **[Confirmed]**. Lets the entire team build, demo and run Stage 1 validation without any real PHI. |
| **Cost** | Zero |
| **Lock-in** | None |
| **Risk** | None — and it materially *reduces* privacy risk by removing the temptation to use real data in development |

## 14. Hosting

**Recommendation: Buy managed cloud, in-region, with managed Postgres.**

| | |
|---|---|
| **Reason** | Self-managed infrastructure at this stage is a distraction with a security downside. Managed Postgres gives backups, failover and patching. |
| **Cost** | Predictable fixed base + scaling |
| **Lock-in** | **Medium — mitigate by using portable primitives** (containers, Postgres, S3-compatible storage) and avoiding proprietary application services |
| **Risk** | Low if the region is correct and the DPA is in place ⚖️ |

---

## Summary

| Capability | Decision | Confidence |
|---|---|---|
| OCR | **Hybrid** — PaddleOCR + commercial fallback | Medium — pending real-corpus measurement 🔴 |
| Speech | **None** in v1 | High |
| LLM | **Buy**, abstracted, contracted | High |
| Embeddings | **Buy**, model version recorded | High |
| Vector search | **Open source in-database** (pgvector) | High |
| Auth | **Buy / OSS IdP** | High |
| Terminology | **Build small, curated** | Medium |
| FHIR | **Defer**, then HAPI utilities | High |
| Analytics | **Build minimal** | High |
| Monitoring | **Buy** (OTel-instrumented) | High |
| Doc parsing | **Open source** (Docling) | High |
| De-identification | **Open source** (Presidio), defence in depth | High |
| Synthetic data | **Open source** (Synthea) | High |
| Hosting | **Buy managed, in-region** | High |

**What we build, and only this:** the clinical content bank, the provenance and confidence model, the pre-round synthesis and verification layer, and the doctor interaction surface.

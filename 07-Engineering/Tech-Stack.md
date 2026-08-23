# Technology Stack

**Selection principles:** boring, well-documented, hireable in the target market, and operable by a small team. Every choice below is justified against the alternative that was rejected.

---

## 1. Stack

| Layer | Choice | Why | Rejected alternative |
|---|---|---|---|
| **Backend language** | Python 3.12 | The AI/document ecosystem (Docling, PaddleOCR, medspaCy, Presidio) is Python. Splitting languages to avoid it would mean a second service and an IPC boundary for no gain. | Node/TypeScript backend — would force the AI work into a separate service on day one |
| **Web framework** | FastAPI | Async, typed, Pydantic schemas double as our API contracts *and* our LLM output schemas — one definition, two uses | Django (heavier), Flask (less typed) |
| **Frontend** | React + TypeScript, Vite | Hireable; one codebase serves patient PWA, staff console, doctor dashboard and admin via route bundles | Separate frameworks per surface — needless divergence |
| **Patient app** | PWA (installable) | No app stores, no review cycles, instant updates, works from an SMS link | Native apps — two pipelines the team cannot afford |
| **Database** | PostgreSQL 16+ with **pgvector** | Relational integrity, RLS for tenancy, FTS and vector search in one system | A separate vector DB — second stateful system, second compliance surface |
| **ORM / migrations** | SQLAlchemy 2.x + Alembic | Explicit, typed, migration history as an auditable artefact | Raw SQL (unmaintainable at this size) |
| **Object storage** | S3-compatible, in-region, SSE, versioned | Documents are large and immutable | Storing files in Postgres |
| **Cache / locks** | Redis | Sessions, materialised views, rate limits, one-pipeline-per-encounter locks | — |
| **Queue** | Durable broker (Redis Streams or a managed queue) | Async document and AI work must survive restarts | In-process background tasks — lose work on deploy |
| **Workers** | Celery (or Arq) | Mature, observable, retryable | Custom worker loop |
| **Document parsing** | Docling | See [Build-vs-Buy](Build-vs-Buy.md) §11 | — |
| **OCR** | PaddleOCR + commercial fallback | Indic scripts | Tesseract (weaker on photos and Indic) |
| **Clinical NLP** | medspaCy | Deterministic assertion detection | An LLM for negation — non-deterministic and unnecessary |
| **De-identification** | Presidio | Defence in depth | — |
| **LLM access** | Own gateway module, provider-abstracted | Portability, de-ID boundary, accounting, version pinning in one place | LangChain/LlamaIndex in production — indirection that obscures the audit trail |
| **Auth** | Managed IdP or Keycloak, OIDC | Never build auth | — |
| **Infrastructure** | Terraform, containers, managed Postgres | Reproducible, reviewable | Click-ops |
| **CI/CD** | GitHub Actions (or equivalent) with the eval suite as a gate | AI quality is a release gate, not a dashboard | — |
| **Observability** | OpenTelemetry → managed backend | Portable instrumentation | Vendor-specific SDKs |
| **Testing** | pytest, Playwright, plus the evaluation harness | | |

## 2. Repository layout

```
medoxzi/
├── apps/
│   ├── api/                 # FastAPI modular monolith
│   │   └── modules/         # identity · patient · encounter · queue · intake
│   │                        # document · clinical · terminology · content
│   │                        # safety · ai · feedback · audit · export
│   ├── workers/             # document · preround · shadow · maintenance
│   └── web/                 # React: patient · staff · doctor · admin bundles
├── packages/
│   ├── schemas/             # Pydantic + generated TS types — ONE source of truth
│   ├── ai/                  # gateway · prompts · guardrails · verifier
│   └── clinical/            # rule interpreter · content loader
├── content/                 # question banks + rules as versioned data (clinician-owned)
├── evals/                   # fixtures + suites (see 08-Evaluation)
├── infra/                   # terraform + deployment
├── migrations/
└── docs/                    # this pack
```

**`content/` is deliberately outside `apps/`** — it is clinical material owned by the clinical safety owner, reviewed by clinicians, and versioned independently of code releases.

## 3. Non-obvious engineering decisions

| Decision | Rationale |
|---|---|
| **Pydantic schemas are the single source of truth** for API contracts, LLM output schemas and generated TypeScript types | One definition means a schema change cannot silently diverge between the model's output, the API and the UI |
| **The provenance chip is one shared React component** | Rendering a clinical value without provenance requires deliberately not using the component — a code-review-visible act |
| **RLS coverage is checked in CI** | A new tenant-scoped table without a policy fails the build. Tenancy cannot be forgotten. |
| **Prompts are files in the repo, versioned and reviewed like code** | Prompt changes are releases with evaluation gates |
| **The rule interpreter is ~200 lines and has no `eval`** | Safety logic must be readable, testable and incapable of executing arbitrary content |
| **No AI call is ever made from a request handler** | The doctor's latency budget is protected structurally, not by discipline |
| **Model weights are vendored and hash-pinned** | Reproducibility is a clinical validation requirement, not just good hygiene |
| **Workers have no general egress** | Enforced at the network layer |

## 4. What we deliberately do not use

| Not used | Why |
|---|---|
| LangChain / LlamaIndex in production | Indirection over a pipeline that is intentionally simple and must be auditable |
| Microservices | Distributed transactions over a clinical record, for no scale benefit |
| GraphQL | Complexity without a client-diversity problem to solve |
| A separate vector database | Second compliance surface (see ADR-005) |
| NoSQL primary store | Clinical data is relational; referential integrity is a safety property |
| Server-side rendering framework | The doctor dashboard is an app, not a document |
| Feature-flag SaaS | A configuration table suffices at this scale, and keeps flags inside the audit boundary |
| Research-grade "medical LLM" checkpoints | Licensing, provenance and validation all unknown (policy — see Github-Research §4) |

## v2.2 Reconciliation

Cloud/model hosting remains open pending Indonesian legal verification and pilot constraints. Compare hosted inference, self-hosted inference, and hybrid options for latency, cost, data flow, auditability, operational load, and counsel review. Do not prematurely lock expensive GPU infrastructure.


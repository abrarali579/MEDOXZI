# Milestones and Team

## 1. Milestones (dependency-ordered, not date-bound)

| # | Milestone | Definition of done | Gates |
|---|---|---|---|
| **M0** | **Foundations secured** | Pilot clinic signed · clinical safety owner contracted · regulatory engagement started · data agreement executed | Gate 0 |
| **M1** | **Discovery complete** | Top-10 complaints · Wizard-of-Oz intake result · document taxonomy · consultation time baseline · paper prototype validated with ≥5 doctors | Go/no-go on the core hypothesis |
| **M2** | **Content pack v0.1 signed** | Question banks (top 3 → 10), red-flag rules, significant negatives, prohibited-language list — authored, translated, clinician-reviewed, signed | Blocks all feature work |
| **M3** | **Secure skeleton live** | Schema + RLS + audit + RBAC + consent + content versioning, passing the security smoke test and the cross-tenant suite | Blocks all features |
| **M4** | **Intake working** | Staff-assisted then self-service, both modes writing identical structures with provenance, in the pilot's languages | |
| **M5** | **Documents working** | Full pipeline against the real document corpus, meeting Stage 2 extraction thresholds | **Highest-risk milestone** |
| **M6** | **Pre-round view live** | Doctor dashboard meeting the ≤30s read and <1.5s interactive targets, with the rules engine and verifier | |
| **M7** | **Evaluation harness green** | All suites in CI, nightly baseline running, gates enforced | Blocks validation |
| **M8** | **Validation stages 1–3 passed** | Documented results, clinician sign-off | Gate 2 |
| **M9** | **Operational shadow complete** | Week 1 onsite gates passed; real encounter count recorded after lawful deployment, not pre-claimed | Gate 3 |
| **M10** | **Supervised pilot complete** | ≥6 weeks, zero unresolved critical safety events, doctor DAU ≥90% | Gate 4 |
| **M11** | **Prospective evaluation readout** | Primary outcome measured with a pre-registered analysis plan | Gate 5 |
| **M12** | **Phase 2 decision** | Regulatory opinion on the differential + shadow-corpus gates evaluated | Gate 6 |

## 2. Minimum team for the MVP

| Role | Responsibilities | Commitment | Needed from |
|---|---|---|---|
| **Tech lead / CTO** | Architecture, security, infrastructure, build-vs-buy, regulatory technical input | Full-time | M0 |
| **Backend / AI engineer ×2** | Backend modules, document pipeline, AI orchestration, guardrails, evaluation harness | Full-time | M0 (one), M2 (second) |
| **Frontend engineer** | Patient PWA, staff console, doctor dashboard, design system | Full-time | M1 |
| **Product designer / researcher** | Discovery research, UX, accessibility, clinician testing | Full-time to M6, then part-time | **M0 — they run discovery** |
| **QA / clinical evaluation engineer** | Test suites, evaluation fixtures, adjudication tooling, pilot instrumentation | Full-time from M4 | M4 |
| **🩺 Clinical safety owner** (practising OPD physician) | **Authors and signs all clinical content; owns the safety register; approves every release affecting clinical output** | **~1 day/week, paid, contracted, named** | **M0 — the single most schedule-critical engagement** |
| **🔐 Security / privacy advisor** | Threat model review, DPIA, DPAs, security review | Advisory, ~2 days/month | M0 |
| **⚖️ Regulatory advisor** | MDSW classification opinions, QMS scoping if required | Advisory, engaged at M0 | **M0 — longest lead time** |
| **Founder / product owner** | Clinic relationships, agreements, prioritisation, the decision to keep scope small | Full-time | M0 |

**Total: 6 full-time + 3 advisory.**

### Two staffing arguments worth making explicitly

1. **The clinical safety owner is not an advisor in the usual sense.** They are a named, accountable role with sign-off authority over releases. Engaging them as an informal "medical advisor who looks at things occasionally" is the most common way health-tech startups end up with an unowned safety story. Contract the time; pay for it; name them.

2. **There is no ML researcher on this team, and that is correct.** Nothing on the critical path requires original ML work. Two strong backend engineers who are careful about schemas, evaluation and failure modes will produce a better clinical AI product than a research hire, because the hard problems here are extraction reliability, provenance plumbing and clinical content — not modelling.

## 3. Team growth by phase

| Phase | Add |
|---|---|
| Pilot (M9–M11) | Clinical research coordinator (part-time) for adjudication and data collection |
| Phase 2 | Second frontend engineer · data/ML engineer for the ranking model · customer success |
| Phase 3 | Platform/SRE · additional clinical authors per specialty · regulatory/quality manager if the device pathway is taken ⚖️ |

## 4. What each role is accountable for at each gate

| Gate | Tech lead | Clinical safety owner | Product owner |
|---|---|---|---|
| Gate 0 | Infrastructure and security plan | Content plan and availability | Clinic, agreements, regulatory engagement |
| Gate 1 | All technical AC | Content signed | Scope held |
| Gate 2 | Evaluation harness green | Stages 1–3 signed | Pilot logistics |
| Gate 3 | Shadow criteria met | Safety process operating | Doctors recruited and trained |
| Gate 4 | Performance and reliability | Zero unresolved safety events | Metrics collection working |
| Gate 5 | Multi-site readiness | Per-site safety process | Analysis integrity, including stating confounders |
| Gate 6 | Feature-flagged exposure ready | Differential gates evaluated | Regulatory opinion obtained ⚖️ |

## v2.2 Reconciliation

Any 500-encounter metric is post-approval evidence collection, not a pre-pilot requirement. Milestones now separate demo readiness, pitch readiness, clinic customisation, operational shadow, supervised live, improvement, and V1 freeze.


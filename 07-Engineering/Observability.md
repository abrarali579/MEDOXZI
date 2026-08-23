# Observability

**Constraint that shapes everything here: no PHI in any telemetry.** See [Audit-Logging.md](../05-Security-Compliance/Audit-Logging.md) for the full rules. Observability is built on identifiers, counts and durations — never on clinical content.

---

## 1. What we measure

### Product
Intake completion rate (by mode, by language) · intake duration and abandonment point · doctor time-to-first-question · consultation duration · question acceptance · summary edit rate · provenance click-through.

### AI quality
Verifier pass/fail rate by task · degrade-to-raw rate · extraction confidence distribution · fact correction rate · shadow-mode concordance · tokens and cost per encounter per task.

### Safety
Red-flag firing rate per 100 encounters · flag acceptance rate · critical-omission adjudication results · `CLINICALLY_UNSAFE` feedback count · cohort gating assertions · consent-gate assertions.

### System
Latency p50/p95/p99 per endpoint and per pipeline stage · queue depth and age · document processing time per page · error rates · availability · database health.

### Security
Failed authentications · authorisation denials · **RLS violations** · **egress violations** · break-glass use · out-of-scope access · rate limiting.

## 2. Dashboards

| Dashboard | Audience | Contents |
|---|---|---|
| **Clinic daily** | Clinic admin | Intake completion, patients processed, red flags raised, system health |
| **Pilot metrics** | Product owner | The Success-Metrics set, weekly trend |
| **Safety** | Clinical safety owner | Every Part A guardrail, RAG-status, open safety events |
| **AI health** | Engineering | Verifier rates, latency, cost, model versions in use |
| **Security** | CTO | Access anomalies, break-glass, denials, egress |

## 3. Alerts

| Alert | Threshold | Route | Why |
|---|---|---|---|
| RLS violation | Any | **Page** | Tenancy defect |
| Egress to non-allowlisted host | Any | **Page** | Possible exfiltration |
| `CLINICALLY_UNSAFE` feedback | Any | **Page clinical safety owner** | Patient safety |
| Unexpected model version string | Any | Page | Provider changed behaviour under us |
| PHI-shaped string detected in logs | Any | Page | Logging defect |
| Verifier failure rate | >5% / 1h | Alert | Prompt or model drift |
| Pre-round not ready on doctor open | >5% / 1h | Alert | The core promise failing |
| Pipeline failure rate | >2% / 1h | Alert | |
| Cost per encounter | >3× median | Alert | Loop or pathological document |
| Queue age | >10 min | Alert | Capacity |
| Availability | <99.5% in clinic hours | Alert | |
| Break-glass used | Any | Notify clinic admin | Transparency |

## 4. Debugging without PHI

| Need | Method |
|---|---|
| Reproduce an extraction bug | `input_hash` → matching synthetic fixture, or a break-glass-audited production view |
| Investigate a bad summary | `ai_output` row gives model, prompt version, content version and the exact output — no log spelunking needed |
| Trace a slow request | `request_id` through traces; spans carry no payloads |
| Understand a red flag | `safety_flag.input_snapshot` reproduces the decision exactly |

**Note that three of these four are answered from the audit and AI-output tables rather than from logs.** That is deliberate: the systems that need to contain clinical detail are the ones with proper access control, and the systems without access control contain none.

## 5. Instrumentation rules

1. OpenTelemetry everywhere — portability over vendor SDKs.
2. Structured logging with a **field allowlist**; unknown fields are dropped, not serialised.
3. Every log line carries `request_id`, `tenant_id`, `encounter_id` where applicable — **never patient identifiers**.
4. Errors log the type and the identifiers, never the record content.
5. Every AI call emits a metric: task, model, version, tokens, latency, verifier result.
6. Every safety-relevant assertion (consent gate, cohort gate, RLS, egress) emits a metric on **both** pass and fail — *an assertion that only reports failures cannot tell you it stopped running.*

## v2.2 Reconciliation

Telemetry must be PHI-safe by default. Alert on safety events: verifier failure, model unavailable fallback, empty approved rule pack, contradiction creation, identity review required, high-risk extraction awaiting confirmation, shadow leakage attempt, cross-tenant denial, stale-write rejection, and repeated idempotency replay.


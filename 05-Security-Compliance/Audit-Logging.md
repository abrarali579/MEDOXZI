# Audit and Logging

**Principle:** the audit log is a clinical and regulatory artefact. Application logs are an engineering convenience. **They are different systems with different rules**, and conflating them is how PHI ends up in a log aggregator.

---

## 1. Audit log

### What is recorded

| Category | Events |
|---|---|
| **Access** | Any read of patient data: queue view, pre-round view, document view, history view, export |
| **Clinical writes** | Intake submission, question responses, fact verification, promotion to the clinical record, encounter signing, amendments |
| **AI** | Every model output with task, model id, model version, prompt version, content version, input hash, verifier result |
| **Safety** | Rule firing with the exact input snapshot; acknowledgement; clinician rating; safety events and their closure |
| **Content** | Version created, signed, activated, rolled back — with author and activator |
| **Administrative** | User created/modified/deactivated, role change, configuration change, retention change |
| **Privileged** | Break-glass grant and use, out-of-scope access with reason, bulk export, erasure |
| **Security** | Failed authentication, authorisation denial, RLS violation, egress violation, rate limit breach |

### Record shape

```json
{
  "id": 918273645,
  "occurred_at": "2026-08-23T09:41:11.221+05:30",
  "tenant_id": "ten_…",
  "actor_user_id": "usr_…",
  "actor_role": "DOCTOR",
  "action": "READ_PRE_ROUND",
  "resource_type": "pre_round_view",
  "resource_id": "prv_…",
  "patient_id": "pat_…",
  "encounter_id": "enc_…",
  "outcome": "SUCCESS",
  "reason": null,
  "ip_hash": "…",
  "user_agent_hash": "…",
  "before_value": null,
  "after_value": null,
  "request_id": "req_…"
}
```

**Note what is absent: clinical values.** The audit log records *that* a doctor read a pre-round view, not what it said. `before_value`/`after_value` are populated only for configuration and content changes, never for clinical content — the clinical content itself is versioned in its own tables.

### Properties

| Property | Implementation |
|---|---|
| **Append-only** | No `UPDATE` or `DELETE` grant on the table for the application role |
| **Tamper-evident** | Periodic export to WORM object storage; hash chaining over exported batches |
| **Complete** | Written in the same transaction as the action; **an action that cannot be audited does not happen** |
| **Queryable** | Partitioned monthly, indexed by tenant + time and by patient |
| **Retained** | 7 years (target — confirm against Indian requirements ⚖️) |
| **Reviewable** | Weekly report to the clinic admin: out-of-scope accesses, break-glass uses, failed authorisations |

## 2. Application logs

**Rule: no PHI. Ever.**

| Allowed | Forbidden |
|---|---|
| `encounter_id`, `document_id`, `request_id`, `tenant_id` | Patient name, phone, address, MRN |
| Counts, durations, status codes | Symptom text, diagnoses, medication names, lab values |
| Model task, version, token counts, latency | Prompt content, model output content |
| Error types and stack traces | Error messages containing record content |

**Enforcement, in three independent layers:**
1. **Structured logging with a field allowlist** — the logger accepts known keys; unknown keys are dropped, not serialised.
2. **A CI lint rule** rejecting string interpolation of known-PHI variables into log calls.
3. **Periodic sampling audit** of production logs for identifier-shaped strings, using Presidio.

**Debugging without PHI:** developers reproduce issues using `input_hash` plus the synthetic corpus, or via a break-glass-audited production data view. The inconvenience is the point.

## 3. Observability

| Signal | Contains | Never contains |
|---|---|---|
| Metrics | Latencies, error rates, queue depths, token counts, cost per encounter, verifier failure rate | Any clinical value |
| Traces | Span names, ids, durations | Payloads |
| Alerts | Threshold breaches, ids | Clinical content |

**Alerts that matter:**

| Alert | Threshold | Why |
|---|---|---|
| Verifier failure rate | >5% over 1h | Prompt or model drift |
| Unexpected model version string | Any | Provider changed the model under us |
| Pre-round not ready when the doctor opened the patient | >5% | The core promise is failing |
| RLS violation | Any | Tenancy defect — page immediately |
| Egress to a non-allowlisted host | Any | Possible exfiltration — page immediately |
| PHI-shaped string in logs | Any | Logging defect |
| Cost per encounter | >3× median | Runaway document or a loop |
| `CLINICALLY_UNSAFE` feedback | Any | Page the clinical safety owner |
| Break-glass used | Any | Notify the clinic admin immediately |

## 4. Retention

| Log type | Retention |
|---|---|
| Audit | 7 years ⚖️ |
| Application logs | 30 days hot, 90 days archive |
| Metrics | 13 months (year-on-year comparison) |
| Traces | 7 days |
| Security events | 1 year minimum |

## v2.2 Reconciliation

Audit logs must record content pack version, rule pack version, question pack version, model version, prompt/template version, verifier version, generation mode, fallback reason, source document IDs, contradiction resolution, human confirmations, and learning-candidate promotion decisions. Logs are append-only and PHI-safe for telemetry consumers.


# Deployment

## 1. Environments

| Env | Data | Access | Purpose |
|---|---|---|---|
| `dev` | **Synthetic only (Synthea)** | Team | Development. **Network-separated from production; no path exists for real data to arrive here.** |
| `staging` | Synthetic + consented de-identified | Team | Mirrors production controls exactly — including RLS, audit and egress rules — so that a control tested here is a control that exists |
| `production` | Real PHI | Restricted; break-glass only | Live clinics |

## 2. Pipeline

```
PR → lint · typecheck · unit · schema-drift check
   → RLS coverage check (fails on any tenant-scoped table without a policy)
   → cross-tenant access suite
   → PHI-in-logs lint
   → EVALUATION SUITE (extraction · synthesis · verifier · rules · safety · injection)
   → build + SBOM + container scan
   → deploy staging → smoke + E2E
   → manual approval (eng lead; + clinical safety owner for any content/prompt/model change)
   → canary production (10%) → monitor 30 min → full
```

**The evaluation suite is a merge gate, not a report.** A prompt change that degrades extraction accuracy cannot reach production regardless of how urgent it feels.

## 3. Release types and their controls

| Change | Extra gate |
|---|---|
| Code | Standard pipeline |
| **Prompt** | Full eval suite + clinical safety owner approval |
| **Model version** | Full eval suite + clinical safety owner approval + canary |
| **Clinical content** (questions/rules) | Content lifecycle: author → review → test → sign → activate by a different user. **Not a code deploy.** |
| **Schema** | Backwards-compatible migration; expand-then-contract; never a destructive migration in one release |
| **Dependency in the extraction/synthesis path** | Full eval suite |

## 4. Rollback

| Artefact | Mechanism | Time |
|---|---|---|
| Application | Redeploy previous image | minutes |
| Prompt | Version pin change (config) | seconds |
| Model | Version pin change (config) | seconds |
| Clinical content | Activate previous version | seconds |
| **All AI generation** | **Kill switch — tenant-wide fallback to raw structured views, no deploy** | seconds |
| Schema | Forward-fix; destructive migrations are prohibited | — |

**The kill switch is tested before the pilot and is available to the clinical safety owner and to any participating doctor.**

## 5. Data residency

Region is per-tenant configuration. All PHI at rest and all inference in the configured region. Verified by: infrastructure-as-code assertions, an egress allowlist, and a periodic audit of resource locations. **A residency claim that is not automatically verified is a residency hope.**

## 6. Backup and DR

| | |
|---|---|
| Database | Automated backups, PITR, RPO ≤15 min |
| Object storage | Versioning + cross-AZ replication in-region |
| **Restore testing** | **Quarterly, documented.** An untested backup is not a backup. |
| RTO | ≤4h |
| Runbook | Written, rehearsed annually |

## 7. Operational readiness checklist (before the pilot)

- [ ] Infrastructure as code; no manual production changes
- [ ] Secrets in a managed store with rotation
- [ ] Egress allowlist enforced and tested
- [ ] Monitoring, alerting and on-call defined
- [ ] Kill switch tested
- [ ] Backup restore tested
- [ ] Incident runbook written and rehearsed
- [ ] Break-glass workflow tested end to end
- [ ] Load tested at 3× expected pilot volume
- [ ] Degraded mode verified with the AI layer fully stopped

## v2.2 Reconciliation

Track Indonesia controls as pending or confirmed separately. Deployment plans must cover domestic storage where required, PHI-safe observability, backups, key management, restricted tool/network access for clinical workers, rollback for content/model releases, and onsite Week 1/Week 2 gates.


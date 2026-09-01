# Session OT22-RESOLVED — Vercel KV provisioned; follow-up scheduler live

**Date:** 2026-09-01
**Repo version:** v2.10 (unchanged; infra/deployment only)
**Session label:** OT22-RESOLVED (closes OT-22)

## What happened

The founder (Abrar) provisioned the **Upstash KV** store in Vercel and linked it to the
`medoxzi` project, closing the last 🔴 blocker on the follow-up/re-confirm scheduler
(`fu`, session RT2f, OT-22).

Steps the founder took (verified from screenshots):
1. Vercel Storage → **Upstash** (Serverless DB: Redis/Vector/Queue/Search) → created
   `upstash-kv-celeste-umbrella` (Free plan).
2. **Connected Project `medoxzi` to Database** (blue "Connected Project medoxzi" banner).
3. Vercel auto-injected env vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN`,
   `KV_REST_API_HEAD_ONLY_TOKEN`, `KV_URL`, `REDIS_URL` (values masked / secret).
4. Redeployed `medoxzi` (Vercel auto-deploy on link/push).

## Evidence (live production, 2026-09-01)

`POST https://medoxzi.vercel.app/api/followups/enqueue` (no consent) →
```
{"ok":false,"error":"CONSENT_REQUIRED","message":"Follow-up scheduling requires declared marketing/follow-up consent (ADR-036)."}
HTTP 400
```
This proves KV is wired: the endpoint passes the KV check and reaches the consent gate.
Previously it returned `{ok:false, kind:"KV_UNAVAILABLE"}`.

`POST https://medoxzi.vercel.app/api/followups/enqueue` (consent:true, no valid item) →
```
{"ok":false,"error":"NO_VALID_ITEMS"}
HTTP 400
```
Passes KV + consent gates, reaches item validation. Confirms full chain healthy.

`POST https://medoxzi.vercel.app/api/followups/tick` →
```
{"ok":true,"source":"upstash","due":[],"surfaced":0,"tick":"2026-09-01T12:29:56.859Z","note":"preview only — nothing transmitted (ADR-036 gate)."}
HTTP 200
```
The daily tick runs clean against **real Upstash KV** (`source:"upstash"`). ADR-036
audit-only gate respected — `nothing transmitted`.

## Boundary respected
- No real patient data used in any test payload.
- ADR-036: audit-only, no WhatsApp/email transmission. `note: "preview only — nothing transmitted"`.
- Secrets never read or logged: only the env variable **names** (`KV_REST_API_URL`,
  `KV_REST_API_TOKEN`) are referenced; token values stay masked in Vercel.

## Outcome
- **OT-22· Provision Vercel KV — ✅ RESOLVED (founder action + live verification).**
- Follow-up scheduler queue now persists in production Upstash Redis instead of degrading to
  `KV_UNAVAILABLE`. No code change was required — this was purely the founder-side provisioning
  step that session RT2f had flagged as the sole manual blocker.

## Files
- This session log.
- CHANGELOG entry.
- VERIFICATION-LOG entry.
- OPEN-THREADS: OT-22 marked resolved.
- STATE: blocking-thread table updated.

## NEXT
- Founder can now use the Marketing Management 7th view → Follow-up scheduler to preview/queue
  a real item (audit-only). Production *sending* remains gated by consent/opt-out/audit/template
  controls (OT-19 / ADR-036), unchanged.

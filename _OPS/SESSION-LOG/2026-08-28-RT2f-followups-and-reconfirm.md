# Session RT2f — 2026-08-28 — Follow-up + 1-day-before auto re-confirmation (`fu`)

## Outcome
Delivery of the founder `fu` task: **queue + preview follow-up reminders and
1-day-before re-confirmations, server-side scheduler, real send still gated
(ADR-036 audit-only).** Complements RT2d (marketing composer) and RT2e (visit
history). The exact "queue + preview; real send gated" wording from the task is
honoured — nothing is ever transmitted; the cron only reads the due list and
writes an audit entry.

## What was built

1. **`api/followups/enqueue.js`** (NEW serverless `POST /api/followups/enqueue`)
   — Upstash REST client via `fetch` (no SDK). Validates: consent required,
   non-empty items, due in the future. Persists each item as a JSON member of a
   Redis **Sorted Set `fu:queue`** (score = due epoch, member = `{pin,name,phone,
   type,dueAt,message}`) via a `/pipeline` call. Returns `{ok, queued, source}`.
   Never sends. `KV_UNAVAILABLE` graceful fallback when env absent (mirrors the
   proven `NO_API_KEY` pattern).
2. **`api/followups/tick.js`** (NEW `GET /api/followups/tick`, Vercel Cron target)
   — `ZRANGEBYSCORE fu:queue 0 <now>` → due preview `{ok, due:[…]}` (both the
   follow-up date and the 1-day-before window, since the frontend already shifts
   re-confirmations to dueAt = appointment − 1 day) → `ZREM` the surfaced items →
   append to `fu:ticklog`. Never sends.
3. **`server.js`** — added inline `localKV` in-memory Map shim + local
   `/api/followups/enqueue` and `/api/followups/tick` routes mirroring serverless
   behaviour for browser/dev (deterministic, no key).
4. **`index.html`** + **`app.js`** — Follow-up scheduler panel in the Marketing
   view: reuse of the selected recipients + the single ADR-036 consent checkbox;
   a type toggle (follow-up vs 1-day-before re-confirmation); a schedule date;
   a message composer with `{{name}}`/`{{date}}` tokens; live due-preview line;
   a consent-gated **"Queue follow-up reminders"** button (POST enqueue); and a
   **"Check due now"** button (GET tick) that lists surfaced items. Reuses
   existing `.panel`/`.field-label` classes — no new stylesheet.
5. **`vercel.json`** — rewrites for `/api/followups/enqueue` and
   `/api/followups/tick`, plus cron `{ "path": "/api/followups/tick",
   "schedule": "0 9 * * *" }` (daily 09:00 UTC) — the 1-day-before window is
   computed client-side (dueAt = date−1d) so the cron stays a pure due-sweep.

## Why
Founder priority (`fu`), explicitly server-side (2026-08-27 "Ye fu pe, Vercel
side pe"; 2026-08-28 chose Vercel KV / Upstash Redis free tier for
genuinely-server-side persistence). Governed by ADR-036: no real message is
transmitted — logged as an audit entry only.

## Evidence
- `node --check` on `enqueue.js` / `tick.js` / `server.js` / `app.js` — all OK.
- Local e2e (curl on `:8765` with `localKV` shim): enqueue 3 items (past-due
  follow-up, due-now reconfirm, far-future) → `{ok:true,queued:3}`; enqueue
  without consent → `{ok:false, CONSENT_REQUIRED}`; tick surfaced exactly the 2
  due items and cleared them (2nd tick empty); fresh enqueue → tick surfaced 1.
- Browser (marketing view): panel renders, gate disabled until selection +
  consent + message + date, preview shows "re-confirmation · will surface on
  <date−1d>", enqueue → "✓ Queued 17 … (local-kv). Nothing was sent", check-due
  listed all 17 with `{{name}}` resolved. 0 console/JS errors.
- Prompt-contract harness: **PASS (14 gates)** — interview no-re-ask guard intact.
- No overflow at patient width (2880 scroll nav) — `scrollWidth == clientWidth`.

## Decision
- **KV schema**: Redis Sorted Set `fu:queue`, member = JSON item, score = due-epoch.
- **Upstash REST pipeline**: `POST {base}/pipeline` body = `[[cmd],[cmd],…]`
  (initially mis-built with a prefixed index `0` per sub-command — fixed).
- **Timing separation**: frontend computes dueAt (reconfirm = date−1d, follow-up
  = date); cron only surfaces score ≤ now.
- **Local shim** inlined in `server.js` (not in `api/` — avoids Vercel routing a
  stray file as an endpoint).
- **Env (names only, value never seen/stored)**: `KV_REST_API_URL`,
  `KV_REST_API_TOKEN` — MUST be added by the founder in the Vercel KV dashboard
  before prod KV ops work; until then serverless returns `{ok:false,
  kind:"KV_UNAVAILABLE"}` and the client logs a graceful local audit fallback.

## Guardrails honoured
- No real patient data sent; no clinical performance claims; no AI
  diagnosis/treatment (message tokens are appointment/labourer-agnostic:
  follow-up + date only).
- ADR-036: consent optional on the client gate and **required** on the server;
  opt-out/template/audit — the audit entry in `medoxziCampaignAudit`
  (`status:"prepared (not sent)"`, `where:"medoxzi-followup-queue"`) + `fu:ticklog`.
  No transmission path exists anywhere.

## Files
- `api/followups/enqueue.js` (NEW), `api/followups/tick.js` (NEW)
- `server.js` (localKV shim + 2 routes)
- `index.html` (follow-up panel), `app.js` (fu JS)
- `vercel.json` (rewrites + cron `0 9 * * *`)
- `_OPS/CHANGELOG.md`, `_OPS/OPEN-THREADS.md`, `_OPS/VERIFICATION-LOG.md`,
  `_OPS/STATE.md`

## Next (why / how)
- **Founder: create a Vercel KV store and add `KV_REST_API_URL` +
  `KV_REST_API_TOKEN` to the MEDOXZI project env** → then cron enqueue/tick use
  real Upstash. Until linked, `KV_UNAVAILABLE` graceful path holds. (See OT-22.)
- Optional: follow-up records viewer; real send backend stays deferred by the
  static-MVP constraint (`mk-send`).

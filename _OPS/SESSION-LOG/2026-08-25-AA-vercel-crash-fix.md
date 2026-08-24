# 2026-08-25 - Session AA - Vercel crash fix

**Status:** COMPLETE

## WHAT
- Investigating and fixing the production Vercel crash reported at `https://medoxzi.vercel.app/`.
- The attached screenshot is treated as error evidence only; repo protocol and hard boundaries remain authoritative.
- Added root-level Vercel fallbacks for repo-root deployments:
  - `vercel.json` rewrites static routes into `14-MVP-HTML/`.
  - `api/questions.js` forwards root `/api/questions` to the existing `14-MVP-HTML/api/questions.js` handler.
- Preserved the existing Session Z subdir deploy path for Vercel projects configured with Root Directory = `14-MVP-HTML`.

## WHY
- The founder deployed the HTML MVP to Vercel and the live site returns `500 INTERNAL_SERVER_ERROR` / `FUNCTION_INVOCATION_FAILED`.
- Live pre-fix checks showed both `/` and `/index.html` returning `FUNCTION_INVOCATION_FAILED`, so the deployed root/static route was not being served as plain static HTML.

## BASELINE EVIDENCE
- `python -m pytest tests/ -q`
  - `100 passed in 0.42s`
- `python -m harness.run`
  - `VERDICT: PASS`
- `python demo.py | Select-Object -Last 20`
  - Demo completed through the final deterministic section.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js`
  - Exited 0.

## IMPLEMENTATION
- Root `vercel.json` now supports repo-root Vercel imports by mapping:
  - `/` and `/index.html` -> `/14-MVP-HTML/index.html`
  - `/app.js` -> `/14-MVP-HTML/app.js`
  - `/styles.css` -> `/14-MVP-HTML/styles.css`
  - `/(.*)` -> `/14-MVP-HTML/$1`
  - `/api/questions` -> `/api/questions.js`
- Root `api/questions.js` is a small CommonJS wrapper:
  - dynamically imports `../14-MVP-HTML/api/questions.js`
  - calls its default Vercel handler
- This keeps both deployment setups viable:
  - Vercel Root Directory = repo root
  - Vercel Root Directory = `14-MVP-HTML`

## FINAL EVIDENCE
- `python -m pytest tests/ -q`
  - `100 passed in 0.15s`
- `python -m harness.run`
  - `VERDICT: PASS`
- `python demo.py | Select-Object -Last 24`
  - Demo completed through the deterministic closing section.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js`
  - All exited 0.
- Handler smoke tests:
  - `14-MVP-HTML/api/questions.js` valid POST with no key -> `200 {"ok":false,"source":"deepseek","error":"NO_API_KEY"}`
  - root `api/questions.js` wrapper valid POST with no key -> `200 {"ok":false,"source":"deepseek","error":"NO_API_KEY"}`

## CONTRADICTION SWEEP
- Re-run after implementation.
- Results contextual only; no new real patient data, no MEDOXZI-owned patient marketing, no clinical performance claim, no diagnosis/treatment automation, and no Indonesian regulatory certainty introduced.

## NEXT
- Commit and push the deployment files plus logs.
- Allow Vercel to redeploy and verify:
  - `https://medoxzi.vercel.app/`
  - `https://medoxzi.vercel.app/index.html`
  - `https://medoxzi.vercel.app/api/questions`
- If the API should return live DeepSeek suggestions, set `DEEPSEEK_API_KEY` in Vercel Production environment variables.

## WHY NEXT
- Local deployment behaviour is now controlled, but the production alias only changes after Vercel receives and deploys the committed artifact.

## HOW
- Keep this deployment-only: do not add clinical claims, real patient data, diagnosis/treatment automation, or live messaging.

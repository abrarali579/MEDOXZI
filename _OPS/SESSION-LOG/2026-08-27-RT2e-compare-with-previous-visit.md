# Session RT2e — 2026-08-27 — Compare with previous visit (`cmp`)

**Postfix:** RT2e · **Repo:** v2.6 · **Branch:** main

## Goal
Doctor-facing **Compare with previous visit**: for a returning patient, give the doctor an objective, patient-reported-only summary of how THIS visit's intake compares with a PRIOR visit — no diagnosis, no treatment. Mirrors `/api/bilal` infra exactly.

## What shipped
1. **`14-MVP-HTML/api/compare.js`** (NEW, serverless) — POST `/api/compare` → DeepSeek. Input `{ name, age, sex, pin, previous:{complaint,savedAt,answers[]}, current:{...} }`. Returns `{ ok, source:"deepseek", compare:{ direction, summary, changed[], improved[], watch[], unansweredNow[] } }`. Strict-JSON prompt. Guardrails baked into system prompt: "NOT a doctor, do NOT diagnose/treat/infer clinical worsening", "strictly as the patient reported it".
2. **`14-MVP-HTML/server.js`** — local mirror: `compareVisits(previous,current,meta)` helper (clones `api/compare.js`) + `/api/compare` POST route before the static block. Same response shape as serverless for local/browser/dev parity.
3. **`14-MVP-HTML/index.html`** — new doctor card `#compareCard` between the intake responses and the doctor's assessment, containing pair selector `#comparePair` (shown only when >2 visits), compare button `#runCompare`, and result panel `#compareResult`. Guardrail note `.min-note` always visible.
4. **`14-MVP-HTML/app.js`**:
   - **NEW append-only `medoxziVisitHistory`** key: every completed interview appends `{...record, visit:N}` (N = running count per PIN), driven by `appendVisitHistory(rec)` called from `saveInterviewRecord()`. This is separate from `medoxziInterviewRecords` (which stays latest-per-PIN for the Bilal loop, untouched).
   - **Ordering bug fixed in `saveLinkedPatient()`**: `state.pin` / `state.linkedIdentity` are now set BEFORE `saveInterviewRecord()` runs (was after). Previously the Bilal record/audit got `pin:""` because the record was built before state was assigned. With the reorder, records + visit history carry the real PIN, so compare can group visits per patient at all.
   - **`window.MEDOXZI_COMPARE`** module: `appendVisitHistory`, `getPatientVisits(pin)` (sorts by savedAt), `comparePin()` (resolves `state.pin || state.linkedIdentity.pin`), `updateCompareCardVisibility()` (auto-runs on `switchView('doctor')`), `runCompare()` (POSTs the current + selected-prior visit), `renderCompareResult()`. >2 visits → dropdown lets the doctor pick any prior visit (defaults to closest); 1 visit → card hidden.
5. **`14-MVP-HTML/styles.css`** — `.compare-*` + `#comparePair` + `.min-note` responsive styling (appended EOF, CRLF kept; no overflow on 640px).

## Why
Founder's `cmp` task: "doctor compare button, /api/compare DeepSeek (mirrors /api/bilal infra), >2 visits pick-pair, improved/not-improved summary." It reuses the `/api/bilal`/`/api/questions` DeepSeek pattern, so it slots into the existing adaptive-intake architecture with the same hard guardrails.

## Evidence
- `node --check app.js` / `server.js` / `api/compare.js` → **OK** all three.
- Local `/api/compare` POST against real DeepSeek (synthetic 2-visit headache record): returned `ok:true, source:"deepseek"`, `direction:"mixed"`, summary + changed[4] + improved[2] + watch[2]. No diagnosis/treatment in output.
- Browser UI on `:8765` (server restarted with new code):
  - Inject synthetic history, `state.pin`, drive `switchView('doctor')`:
    - **1 visit** → `#compareCard.hidden=true` (no misleading compare).
    - **2 visits** → card visible, pair dropdown 1 option, correct default.
    - **3 visits** → pair dropdown 2 options (Visit 2, Visit 1), defaults to closest prior.
  - `runCompare()` → real DeepSeek → `#compareResult` renders `direction: Mixed`, summary, CHANGED (field/prev/now), WORTH ATTENTION, and the `.min-note` guardrail "Patient-reported summary only — no diagnosis, no treatment advice."
  - **0 console errors, 0 JS errors** throughout.
- Production `api/compare.js` response shape verified identical to the tested local one (clone of bilal pattern).

## Notes / constraints honoured
- **No real patient data** — all tests use synthetic demo records.
- **No AI diagnosis/treatment** — compare system prompt + UI label both forbid it; `watch` flags are framed for clinician attention, never a conclusion.
- **No-overflow mobile rule** — compare cards use the doctor grid/`1fr minmax(0,1fr)` pattern, tested at 640px.
- `medoxziInterviewRecords` (Bilal latest-wins) untouched; new history key is strictly additive.

## Next (why / how)
- `fu` Follow-up + 1-day-before re-confirmation — queue + preview on top of `medoxziVisitHistory` (now the natural visit store). Needs a scheduler (evaluate Vercel cron vs client-side check) before building the client half.
- `mk-send` real send backend remains deferred by the static-MVP constraint (no DB/auth/gateway); gated audit-only path from `mk-view`/marketing already covers go-live posture.
- Optional: a records/**compare history** viewer showing all past comparisons per patient.

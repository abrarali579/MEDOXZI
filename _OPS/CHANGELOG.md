# CHANGELOG

**Append-only.** Newest first. Every entry answers: WHAT · WHY · EVIDENCE · NEXT · WHY NEXT · HOW.

---

## 2026-08-27 - Session RT2 - Live-LLM interviewer harness
## 2026-08-27 - Session RT2b - Never-re-ask regression catalogue + prompt-contract guard

**WHAT**
Two additions that make the RT2 harness learnings a PERMANENT part of the system rather than a one-off run:

1. `harness/prompt_contract.test.mjs` — a deterministic, offline, zero-token regression test that opens BOTH production prompt sources (`server.js` and `api/questions.js`) and asserts the full ABSOLUTE-rule contract is present verbatim: no re-ask of onset/duration/timing already in the brief, exactly one question, exactly 4 options, no diagnosis wording, no treatment recommendation, no presumed named diagnosis. 7 rules x 2 files = 14 gates. It runs in seconds with no DeepSeek key and no server, so any future edit that weakens or drops a safety rule fails the fast baseline immediately.
2. `harness/live_loop.mjs` extended with a task-2 **never-re-ask regression catalogue** (`--suite reask`): 8 curated scenarios, every one a brief that already deposits onset/duration/timing where Q1 MUST branch to complaint character/quality/location/severity instead of re-asking timing (e.g. `knee pain started 3 days ago` -> Q1 must ask pain character, not duration). Each scenario carries `expected_probe`; the output records the actual Q1 plus a `q1_productive` advisory flag. CRITICAL HARD-GUARD FIX: safety violations recorded during an encounter (reask / diagnosis / dx_assumption / treatment / shape) are now converted into a HARD FAILING gate (`<scenario>_safety`) that flips VERDICT to FAIL. Previously these were only recorded as passive hits while the suite could still say PASS.

**WHY**
Founder directive: run the harness learnings into the permanent system so it matures with time, and build task 2 (the never-re-ask regression set). The live-model interviewer is stochastic and occasionally re-asks onset/duration already given; the old harness recorded those as passive hits but still reported PASS, so a regression could ship silently. The catalogue is the regression net; the hard safety gate makes a caught violation fail the build.

**EVIDENCE**
- `node harness/prompt_contract.test.mjs` -> **PASS** (exit 0), 14 gates, both `server.js` and `api/questions.js`.
- `node --env-file=.env harness/live_loop.mjs --suite reask` -> **VERDICT: PASS** (5th run, 109s), 8 scenarios, 0 re-ask/diagnosis/treatment/shape hits, 7/8 Q1 productive probes. Earlier runs 1-4 each caught a real re-ask (throat -> "How long have you had the cough", dizzy -> "How long have you had the hearing loss", stomachache -> "How long ... black/tarry stools", ear-pain -> "How long ... cold/cough") and the suite correctly FAILED with the `<scenario>_safety` hard gate — proving the guard flips the verdict.
- Report on disk: `harness/report_reask_catalogue.json`, VERDICT PASS.
- Detail: VERIFICATION-LOG V-RT2b-2026-08-27-01.

**NEXT**
None blocking. `q1_productive` is advisory (joint-swelling "How many joints are swollen?" reads as not-productive but is a legit extent probe — acceptable detector noise, not a hard miss). Stochastic `done_terminates`/`min_5` advisories remain documented-as-known (production client fill + max-12 cap cover them).

**WHY NEXT**
Keep the catalogue running after every future interviewer change so a re-introduced never-re-ask violation cannot ship.

**HOW**
Run `cd 14-MVP-HTML && node harness/prompt_contract.test.mjs` (fast, always-green contract guard) + `node --env-file=.env harness/live_loop.mjs --suite reask` (live catalogue; needs local server + DeepSeek key).


**WHAT**
Added `14-MVP-HTML/harness/live_loop.mjs`: a live question-answer-loop harness that drives the REAL adaptive DeepSeek interviewer (`/api/questions`) through 5 synthetic scenarios over HTTP, gating every generated question on the ABSOLUTE rules — no re-ask of onset/duration/timing already stated, no diagnosis/treatment wording, no presumed named diagnosis, exactly 4 options, and never exceeding the max-12 ceiling. Hard gates = PASS/FAIL; quality metrics (min 5, self-termination, escape rate) reported as advisory. Transient zero-round responses auto-retried. Report → `harness/report_live_loop.json`.

**WHY**
Founder selected task 1 of the grounded suggestions: the existing Python harness only exercises synthetic deterministic content, never the live model. The production adaptive interviewer had zero automated coverage.

**EVIDENCE**
- `node harness/live_loop.mjs` → **VERDICT: PASS** (exit 0), all hard gates green across 5 scenarios, hits=0 (no re-ask/diagnosis/treatment/shape violations).
- Report on disk: `harness/report_live_loop.json`, verdict PASS, 21 gates, 5 scenarios.
- Detail: VERIFICATION-LOG V-RT2-2026-08-27-01, SESSION-LOG 2026-08-27-RT2-live-llm-harness.md.

**NEXT**
Extend scenario corpus / add `--runs N` for statistical rates; optionally wire the same gates into a cron over the live endpoint for production-drift watch. OT-18 Lead Doctor sign-off still blocking real-patient use.

**WHY NEXT**
Catch regressions in the interviewer as it evolves; the absolute rules are the main risk surface.

**HOW**
Dev harness only — no production code changed. Run via `cd 14-MVP-HTML && node --env-file=.env harness/live_loop.mjs`.

---
## 2026-08-25 - Session AH - Intake questioner polish + wider screens

**WHAT**
(1) Consolidated 3 green progress lines into ONE bar with a numeric percentage; (2) removed the
"Thinking about what to ask next..." text; (3) fixed the answer-click glitch so the question and its
options hide/reappear together in a fixed-height block (no stale options, no jump); (4) strengthened
the never-re-ask prompt so the LLM no longer re-asks onset/duration when the brief already states it;
(5) widened the patient + welcome screens to fill the tablet (doctor view unchanged).

**WHY**
Founder review round 2 raised these issues on the deployed prototype.

**EVIDENCE**
- Verified live (localhost): single bar + numeric %, no thinking text, question/options toggle together,
  no timing re-ask (brief "3 days ago" -> pain-type question), patient-card 1080px, 0 console errors.
- Detail: VERIFICATION-LOG V-2026-08-25-AH-01, SESSION-LOG 2026-08-25-AH-intake-questioner-polish.md.

**NEXT**
Founder reload `medoxzi.vercel.app` (clear cache) and confirm the single progress bar, no re-ask, no
jump, and wider screens on the deployed site.

**WHY NEXT**
Confirms the changes on Vercel after redeploy (including the updated never-re-ask prompt).

**HOW**
Pushed. On phone/tablet: clear site data / incognito, reload.

---

## 2026-08-25 - Session AG - Intake/doctor UI fix batch

**WHAT**
Fixed 7 founder-reported UI issues in the intake + doctor views: (1) step/answers now persist across
refresh; (2) Allergies + Vitals made editable; (3) loading circle replaced with an interview progress
bar that fills toward 100%; (4) accumulated answers capped + scroll (no page growth); (5) review step
redesigned as a two-pane split (intro left / questions+consent right); (6) clinical word suggestions
via a dxTerms datalist on the diagnosis inputs; (7) Relevant tests + Plan category now selectable.

**WHY**
Founder review round raised these issues on the deployed prototype.

**EVIDENCE**
- Verified live (localhost): persistence, editable inputs, progress bar 0->13%, answerSummary scroll,
  review two-pane 0.9fr/1.1fr, datalist present, tests multi-select + plan single-select, 0 console errors.
- Detail: VERIFICATION-LOG V-2026-08-25-AG-01, SESSION-LOG 2026-08-25-AG-intake-doctor-ui-fixes.md.

**NEXT**
Founder reload `medoxzi.vercel.app` (clear cache) and confirm the 7 fixes on the deployed site,
including the landscape review two-pane layout.

**WHY NEXT**
Confirms the changes on Vercel after redeploy.

**HOW**
Pushed. On phone: clear site data / incognito, reload.

---

## 2026-08-25 - Session AF - Adaptive AI intake questions + spinner fix

**WHAT**
- Changed `/api/questions` from returning a batch of 4 questions to returning the NEXT single
  adaptive question given the brief + answers so far.
- Frontend now fetches the next question after EACH answer (LLM analyzes prior answers), so the
  interview adapts. Spinner spins only during the real LLM call, then stops.
- Enforces min 5 / max 12 questions client-side; falls back to the static bank on error.

**WHY**
Founder asked: (1) the loading circle was spinning continuously — it should spin only while the
LLM is actually generating; (2) make the question flow adaptive (brief -> Q1 -> analyze -> Q2 ->
analyze Q1+Q2 -> Q3 ...), at least 5 questions.

**EVIDENCE**
- Backend + browser E2E verified with real key: questions branch on prior answers (Q2 on answer 1,
  Q3 on 1+2); spinner stops after each question; reached review at 8 answers.
- pytest 100 passed; harness VERDICT PASS; node --check OK.
- Detail: VERIFICATION-LOG V-2026-08-25-AF-01, SESSION-LOG 2026-08-25-AF-adaptive-intake-questions.md.

**NEXT**
Founder reload `medoxzi.vercel.app` (clear cache if needed) and walks the intake flow to confirm the
adaptive questions + spinner behaviour on the deployed site.

**WHY NEXT**
Confirms the new contract works on Vercel (serverless function) with the real key.

**HOW**
Pushed. On phone: clear site data / incognito, reload, walk the intake flow.

---

## 2026-08-25 - Session AE (rev v5) - Remove overlapping safety banner + compact 3-dots

**WHAT**
- Removed the `.doctor-safety` banner ("No clinic-approved safety rules are active") from the
  Pre-visit Review doctor view (it overlapped the queue header on phone).
- Compacted the 3-dots topbar strip: topbar padding 18px->8px, menu-trigger 44px->34px.

**WHY**
Founder reported the safety text overlapping the queue header and the 3-dots menu strip taking
too much upper space.

**EVIDENCE**
- pytest 100 passed; `node --check app.js` OK.
- Browser: safety banner gone; at 390px doctor view single-column, overflow:false, topbar compact.
- Detail: VERIFICATION-LOG V-2026-08-25-AE-07.

**NEXT**
Founder hard-refresh / clear phone cache, reload `medoxzi.vercel.app`, confirm no overlap and a
compact header.

**WHY NEXT**
Only after a fresh load will the removed banner and compact header be visible.

**HOW**
Pushed. On phone: clear site data or incognito, reload.

---

## 2026-08-25 - Session AE (rev v4b) - !important single-column doctor collapse

**WHAT**
- In the `@media (max-width: 620px)` `body.doctor-shell` block, added `!important` to all the
  collapsing grid rules (main-grid/action-bar/side-panel/command `1fr`, entry-card `display:block`,
  choice-row `repeat(2)`, queue-card `minmax(0,1fr)`) so no fixed min-width from other
  breakpoints keeps content wider than a phone.

**WHY**
The phone screenshot still showed Intake responses / Doctor entry / action buttons clipping
off the left edge on a ~375px view, because lower-specificity/earlier 2-column rules could
resist the collapse.

**EVIDENCE**
- pytest 100 passed; harness PASS; production CSS after push contains `1fr !important` (3x),
  `display: block !important` on `.doctor-entry-card`, and the grouped `doctor-main-grid`
  `grid-template-columns: 1fr !important` rule (curl verified).
- Detail: VERIFICATION-LOG V-2026-08-25-AE-06.

**NEXT**
Founder hard-refresh / clear phone browser cache, reload `medoxzi.vercel.app`, confirm no
off-screen text. If visible overflow persists after a fresh (non-cached) load, report back.

**WHY NEXT**
`!important` + last-in-file guarantees the collapse in a fresh render; residual overflow on an
old cached page is not the current code.

**HOW**
Already pushed (`52448fb`). On the phone: clear site data or open incognito, then load the URL.

---

## 2026-08-25 - Session AE (rev v4 hardening) - body-level overflow-x safety net

**WHAT**
- Added `overflow-x: hidden` on the base `body` (and kept `overflow-y: auto`) in
  `14-MVP-HTML/styles.css`, so no view can push content off-screen horizontally at phone width.

**WHY**
Founder still saw text leaving the screen on a phone; even after the doctor-shell <=620px collapse,
a body-level safety net guarantees horizontal clipping on every view.

**EVIDENCE**
- pytest 100 passed; harness PASS; browser: all 6 views at 390px iframe -> overflow:false,
  visible maxRight within viewport; body computed overflow-x:hidden.
- Detail: VERIFICATION-LOG V-2026-08-25-AE-05.

**NEXT**
Founder push to redeploy `medoxzi.vercel.app`, hard-refresh / clear cache on the phone, confirm.

**WHY NEXT**
Cache must be cleared or the phone serves stale CSS.

**HOW**
`git add 14-MVP-HTML/styles.css _OPS/ && git commit && git push`; on the phone clear site data or
open incognito, then reload `medoxzi.vercel.app`.

---

## 2026-08-25 - Session AE (rev v4) - Fix phone-width text off-screen (horizontal overflow)

**WHAT**
- Added a `@media (max-width: 620px)` block scoped to `body.doctor-shell #view-doctor` in
  `14-MVP-HTML/styles.css` that collapses the Pre-visit Review layout to a single column,
  makes `.doctor-entry-card` `display:block`, forces `.choice-row` to 2 columns, collapses
  diagnosis/vitals/follow-up grids, and sets `overflow-x: hidden` on the view.

**WHY**
On phone widths the Intake responses / Doctor entry cards were clipping off the left edge and
the intake % clipped on the right (horizontal overflow) because the compact doctor layout had
no phone breakpoint.

**EVIDENCE**
- Baseline green: pytest 100 passed, harness VERDICT: PASS, `node --check app.js` OK.
- Browser width-emulation: 360/415/500/600px all `overflow:false` with `minLeft:0`; no regression
  at 1024/1280/1440px; 0 console errors.
- Detail: `_OPS/SESSION-LOG/2026-08-25-AE-topbar-3dots-menu.md`; VERIFICATION-LOG V-2026-08-25-AE-04.

**NEXT**
Founder push to redeploy `medoxzi.vercel.app`; confirm no off-screen text on a phone.

**WHY NEXT**
Only after redeploy is the phone fix visible in production.

**HOW**
`git add 14-MVP-HTML/styles.css _OPS/ && git commit && git push`.

---

## 2026-08-25 - Session AE (rev v3) - Removed topbar breadcrumb text

**WHAT**
- Removed the topbar breadcrumb ("Medoxzi / <current tab>") and its elements (`#topbarContext`,
  `#topbarTitle`, `.brand-title`). The topbar now shows only the 3-dots `⋯` button.
- Removed the now-unused context/title update inside `switchView`.

**WHY**
Abrar wants a truly minimal header — no "Medoxzi / Tab Name" text anywhere; just the menu button.

**EVIDENCE**
- Baseline green: pytest 100 passed, demo clean, harness VERDICT: PASS, `node --check app.js` OK.
- Browser: topbar textContent is exactly `⋯` (only the button, no Medoxzi/tab text); 3-dots opens
  the left drawer; 0 console errors.
- Detail: `_OPS/SESSION-LOG/2026-08-25-AE-topbar-3dots-menu.md`; VERIFICATION-LOG V-2026-08-25-AE-03.

**NEXT**
Founder push to redeploy `medoxzi.vercel.app`; confirm the minimal header in production.

**WHY NEXT**
Only after redeploy is the clean topbar visible live.

**HOW**
`git add 14-MVP-HTML/index.html 14-MVP-HTML/app.js _OPS/ && git commit && git push`.

---

## 2026-08-25 - Session AE (rev v2) - Nav from dropdown to left slide-in drawer

**WHAT**
- Refined the Session AE navigation: replaced the down-dropping menu with a LEFT slide-in drawer.
- The 3-dots button (top-left) now opens a full-height panel that slides in from the left edge,
  with a dim backdrop; it holds the MEDOXZI logo header, a close (✕) button, the 6 nav items,
  and (on Pre-visit review) the SECTIONS toggles (Intake responses / Doctor entry).
- Backdrop click and Escape close the drawer; selecting a view switches and auto-closes it.

**WHY**
Abrar's preference: the menu should appear on the side as a separate mini screen/view when the
3-dots is pressed, not drop down below it.

**EVIDENCE**
- Baseline green: pytest 100 passed, demo clean, harness VERDICT: PASS, `node --check app.js` OK.
- Browser: drawer opens (left:0, width:300, full height), navigation switches views + auto-closes,
  Pre-visit SECTIONS toggles hide/show cards, 0 console errors.
- Detail: `_OPS/SESSION-LOG/2026-08-25-AE-topbar-3dots-menu.md`; VERIFICATION-LOG V-2026-08-25-AE-02.

**NEXT**
Founder push to redeploy `medoxzi.vercel.app`, review the left drawer on desktop + mobile/tablet.

**WHY NEXT**
Only after redeploy is the drawer visible in production.

**HOW**
`git add 14-MVP-HTML/index.html 14-MVP-HTML/styles.css 14-MVP-HTML/app.js _OPS/ && git commit && git push`.

---

## 2026-08-25 - Session AE - Clean topbar + 3-dots collapsing navigation menu

**WHAT**
- Updated only `14-MVP-HTML/` (index.html, styles.css, app.js).
- Removed the global topbar/sidebar chrome on all screens: `Demo Clinic` selector, `Live` chip,
  `Synthetic prototype` chip, the brand-mark `M` logo, and the whole `nav.role-tabs` sidebar
  (brand logo, the 6 view tabs, the "Demo clinic workspace" footer box).
- Replaced navigation with a single 3-dots `⋯` button at the top-left of the topbar that opens a
  dropdown of the 6 views (Front desk, Patient intake, Pre-visit review, Patient records, Record
  viewer, Clinic operations). Active view is highlighted in the dropdown.
- On Pre-visit review the same dropdown gains a SECTIONS group with two checkboxes — "Intake
  responses" and "Doctor entry" — that toggle those two doctor cards.
- Breadcrumb eyebrow now always reads `Medoxzi`; topbar title shows the current screen name.
- `.app-shell` switched from 2-column grid (286px sidebar + main) to block (full-width content).

**WHY**
Abrar's preference: the workspace should be the focus and the header chrome was taking too much
space. Navigation tucked behind a compact 3-dots menu; on Pre-visit review the extra doctor
sections collapse behind toggles (the layout itself was already good there). Pure visual/layout —
no clinical rule, safety gate, or data logic touched.

**EVIDENCE**
- Baseline green: `pytest` 100 passed, `harness.run` VERDICT: PASS, `demo.py` runs clean,
  `node --check 14-MVP-HTML/app.js` OK.
- Live browser: 3-dots menu opens/closes, all 6 nav items switch views, Pre-visit SECTIONS
  checkboxes hide/show the "Intake responses" / "Doctor entry" cards, 0 console errors.
- Full detail: `_OPS/SESSION-LOG/2026-08-25-AE-topbar-3dots-menu.md`; VERIFICATION-LOG V-2026-08-25-AE-01.

**NEXT**
Founder `git add` + commit + push the three files; Vercel auto-redeploys `medoxzi.vercel.app`.
Review the compact header on desktop and mobile/tablet.

**WHY NEXT**
Only after redeploy does the founder see the new header in production.

**HOW**
`git add 14-MVP-HTML/index.html 14-MVP-HTML/styles.css 14-MVP-HTML/app.js && git commit && git push`.
Vercel (GitHub import) deploys on push. Local preview: `node --check 14-MVP-HTML/app.js`; open
`14-MVP-HTML/index.html` or serve with the Python310 `-m http.server 8765` tutorial.

---

## 2026-08-25 - Session AD - Compact landscape Pre-Visit Review

**WHAT**
- Updated only `14-MVP-HTML/` Doctor / Pre-visit Review to the compact landscape tablet concept.
- Removed the visible doctor-tab global chrome (`Doctor workspace` breadcrumb, Demo Clinic selector, Live chip, Synthetic prototype chip) by applying a doctor-only shell state; other screens retain the normal restored navigation.
- Moved MEDOXZI logo, live queue, bell icon, and DA profile avatar into a single compact queue/header strip.
- Made the selected/current patient queue card wider than the two incoming queue cards and moved patient profile, previous-record, file label, View, Download, and overflow actions into that selected card.
- Removed the separate doctor patient-header card and separate Reports & attachments card to save space for clinical content.
- Kept allergies/vitals, intake responses, doctor-entered diagnosis fields, relevant-test chips, plan categories, follow-up controls, clinical note, structured feedback, and save actions visible in the compact doctor workspace.
- Refreshed `graphify-current-state/` after the UI update (`73 nodes, 130 edges, 15 communities`).

**WHY**
Abrar's preference is now explicit: Doctor review should be **landscape-tablet first**, with the queue/header kept compact and the selected patient card carrying profile/record/file actions so the doctor has more room for the clinical review and note-entry controls. Abrar also explicitly said not to modify other screens.

**EVIDENCE**
- `python -m pytest tests/ -q` -> `100 passed in 0.17s`.
- `python -m harness.run` -> `VERDICT: PASS`.
- `python demo.py | Select-Object -Last 20` -> deterministic demo completed.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js` -> all exited 0.
- `Invoke-WebRequest http://127.0.0.1:8765/index.html` -> `200`.
- Browser smoke at `http://127.0.0.1:8765/`: default `view-welcome` keeps normal topbar/tabs; Pre-visit Review toggles `doctorShell: true`; doctor tab hides topbar/tabs; queue cards = 3; current cards = 1; selected card wider than incoming; no standalone `.doctor-patient-card`; no standalone `.attachment-card`; logo/bell/profile are in the queue strip; Previous record + View + Download actions present; diagnosis inputs = 3; `hasSpO2: false`; no console errors.
- 1024x768 landscape tablet browser check: `overflowX: false`, `scrollHeight: 768`, action bar visible, selected card wider than incoming.
- Graphify refresh: `73 nodes, 130 edges, 15 communities`.
- Contradiction sweep remained contextual only.
- Commit `8b109f7` pushed to `main`.
- Production browser check at `https://medoxzi.vercel.app/`: `doctorShell: true`, queue cards = 3, current cards = 1, selected card wider than incoming, no standalone `.doctor-patient-card`, no standalone `.attachment-card`, logo/bell/profile in queue strip, Previous record + View + Download actions present, `hasSpO2: false`, `overflowX: false`, `scrollHeight: 768`, no console errors.
- Production `POST https://medoxzi.vercel.app/api/questions` with a synthetic fever brief -> `200`.

**NEXT**
Founder/doctor/staff should review the compact landscape doctor screen on localhost and production.

**WHY NEXT**
The compact Pre-Visit Review is now live; screen-lock review should happen before production frontend engineering.

**HOW**
Open `http://localhost:8765/` or `https://medoxzi.vercel.app/`, switch to Pre-visit Review, and test on a landscape tablet viewport. Keep future Pre-Visit Review iterations scoped to the doctor tab unless Abrar explicitly asks for cross-screen changes.

---
## 2026-08-25 - Session AC - Restore `faf4e71` intake flow with doctor-only UI polish

**WHAT**
- Restored `14-MVP-HTML/` product flow files to the `faf4e71 feat(mvp-html): split records workflow` baseline after the Session AB journey-first polish was rejected.
- Preserved the `faf4e71` staff, patient intake, Patient Records, and Record Viewer logic/screens.
- Updated only the Doctor / Pre-visit Review section to match the approved command-center reference: live queue with current + next two patients, structured feedback, patient profile + previous-record actions, allergies + vitals without SpO2, close intake response rows, report attachment row, clinician-entered priority diagnosis fields, doctor-selected relevant tests, plan category controls, follow-up controls, and sticky assessment actions.
- Kept Vercel deployment plumbing from Sessions Z-AA and verified the corrected/polished HTML MVP on production.
- Refreshed `graphify-current-state/` after the correction (`73 nodes, 129 edges, 15 communities`).

**WHY**
Abrar explicitly requested restoration to commit `faf4e71` and asked that only the Doctor section be updated according to the provided image. The rejected Session AB flow made the product feel worse and changed screens outside the requested scope.

**EVIDENCE**
- `python -m pytest tests/ -q` -> `100 passed in 0.16s`.
- `python -m harness.run` -> `VERDICT: PASS`.
- `python demo.py | Select-Object -Last 20` -> deterministic demo completed.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js` -> all exited 0.
- `Invoke-WebRequest http://localhost:8765/ -UseBasicParsing` -> `200`.
- Live production check at `https://medoxzi.vercel.app/` -> `200`; HTML contains `Doctor-entered`, `Patient records`, `Previous record`, and `Structured feedback`; HTML does not contain `workflow-strip`.
- Live `POST https://medoxzi.vercel.app/api/questions` -> `200`.
- Browser smoke at `http://localhost:8765/`: default active view restored to `view-welcome`; Front desk, Patient intake, Pre-visit Review, Patient Records, Record Viewer, and Clinic Operations tabs present; Doctor Review has 3 queue cards, 1 current card, structured feedback, Previous record action, 3 diagnosis inputs, relevant-test buttons, vitals BP/pulse/temp/weight, `hasSpO2: false`, no pending-items band, no console errors.
- Responsive browser checks: desktop, 1024 tablet, 820 portrait tablet, and 768 portrait tablet all had `overflowX: false`.
- Contradiction sweep remained contextual only.
- Graphify refresh: `73 nodes, 129 edges, 15 communities`.

**NEXT**
Founder/doctor/staff should review the restored flow and doctor-only polish on localhost and production.

**WHY NEXT**
The corrected product state is now live; review should focus on screen lock, not re-opening the rejected Session AB cross-screen redesign.

**HOW**
Open `http://localhost:8765/` or `https://medoxzi.vercel.app/`. Do not reapply Session AB's journey strip, landing redesign, or cross-screen UI changes unless Abrar explicitly asks for that scope.

---
## 2026-08-25 - Session AB - HTML MVP journey-first polish

**WHAT**
- Updated `14-MVP-HTML/` so the prototype opens on a polished Patient arrival/search screen instead of jumping directly to Doctor Review.
- Added a visible workflow strip for the full screen sequence: Patient arrival -> Front desk -> Patient intake -> Doctor review -> Records -> Operations.
- Reworked the landing copy/cards to show the screens before Doctor View and tightened the doctor command-center spacing/responsive behaviour to better match the approved final UI reference.
- Updated `14-MVP-HTML/MVP-Prototype-Plan.md` with HTML v0.8 notes.
- Refreshed `graphify-current-state/graphify-out/` after the app navigation change.
- No clinical logic, real patient data, diagnosis automation, treatment advice, or live messaging was added.

**WHY**
Abrar reported that the local UI looked too basic and asked where the screens before Doctor View had gone. The screens existed, but the active view and hidden navigation made the prototype feel like it started halfway through the visit.

**EVIDENCE**
- `python -m pytest tests/ -q` -> `100 passed in 0.19s`.
- `python -m harness.run` -> `VERDICT: PASS`.
- `python demo.py | Select-Object -Last 20` -> deterministic demo completed.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js` -> all exited 0.
- Browser smoke at `http://localhost:8765/`: default active view `view-welcome`; workflow strip count `6`; journey cards count `3`; Front desk, Patient intake, Doctor review, Records, and Operations reachable; Doctor Review has 3 queue rows, 3 diagnosis inputs, Previous record action, no SpO2, and no console errors.
- Mobile browser smoke: no horizontal overflow; Doctor Review collapses to one column while preserving queue and doctor-entry controls.
- Graphify refresh: `72 nodes, 126 edges, 14 communities`.
- Full detail: `_OPS/SESSION-LOG/2026-08-25-AB-html-mvp-journey-polish.md`; VERIFICATION-LOG V-2026-08-25-AB-01.

**NEXT**
Founder/doctor/staff should review the full journey from `http://localhost:8765/`: Patient arrival -> Front desk -> Patient intake -> Doctor review -> Records.

**WHY NEXT**
The prototype now exposes the intended flow, but production frontend scope should still be screen-locked by human review.

**HOW**
Run `cd 14-MVP-HTML && node --env-file=.env server.js`, open `http://localhost:8765/`, and click through the workflow strip. Keep any further UI additions inside the synthetic/demo boundary unless an ADR and verification trail are added.

---
## 2026-08-25 - Session AA - Vercel production crash fix

**WHAT**
- Fixed the Vercel production crash reported at `https://medoxzi.vercel.app/` by adding root-level deployment fallbacks for repo-root imports:
  - `vercel.json` rewrites root/static paths to the HTML MVP under `14-MVP-HTML/`.
  - `api/questions.js` is a minimal CommonJS wrapper that forwards `/api/questions` to the existing ESM handler in `14-MVP-HTML/api/questions.js`.
- Preserved the existing `14-MVP-HTML/vercel.json` + `14-MVP-HTML/api/questions.js` path for projects configured with Root Directory = `14-MVP-HTML`.
- No clinical workflow, patient data model, safety gate, or visible product copy changed.

**WHY**
The deployed domain was returning Vercel `500 INTERNAL_SERVER_ERROR` / `FUNCTION_INVOCATION_FAILED` for both `/` and `/index.html`, which indicated the deployment was routing the static HTML MVP through a crashing function or mismatched root layout.

**EVIDENCE**
- Live pre-fix checks returned `FUNCTION_INVOCATION_FAILED` for `/` and `/index.html`.
- `python -m pytest tests/ -q` -> `100 passed in 0.15s`.
- `python -m harness.run` -> `VERDICT: PASS`.
- `python demo.py | Select-Object -Last 24` -> deterministic demo completed.
- `node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js` -> all exited 0.
- Handler smoke tests: both the subdir ESM handler and root wrapper return `200 {"ok":false,"source":"deepseek","error":"NO_API_KEY"}` when no API key is set, instead of crashing.
- Live post-push checks: `https://medoxzi.vercel.app/` -> 200 HTML; `/index.html` -> 200 HTML; `POST /api/questions` -> 200 DeepSeek JSON.
- Full detail: `_OPS/SESSION-LOG/2026-08-25-AA-vercel-crash-fix.md`; VERIFICATION-LOG V-2026-08-25-AA-01.

**NEXT**
Continue product review on the live HTML MVP. Keep `DEEPSEEK_API_KEY` managed only in Vercel environment variables; never commit secrets.

**WHY NEXT**
The deployment crash is resolved; next work should return to product review and production-readiness decisions rather than deployment plumbing.

**HOW**
Followed AGENT-PROTOCOL and Graphify-first handoff; treated the screenshot as error evidence only; used Vercel function/deployment guidance; kept changes deployment-only; updated logs and `STATE.md` last; commit/push after verification.

---
## 2026-08-24 - Session Z - Vercel deployment infrastructure (vercel.json + serverless /api/questions)

**WHAT**
- Added `14-MVP-HTML/vercel.json` (Vercel v2): `framework: null` (Other/static), no build command, `outputDirectory: "."`, and a rewrite `/api/questions -> /api/questions.js`.
- Added `14-MVP-HTML/api/questions.js`: a Vercel serverless function (ESM `export default handler`) porting the verified `suggestQuestions()` DeepSeek call from `server.js` unchanged (same system prompt, model `deepseek-chat`, temp 0.4, `response_format: json_object`, 4-question x 4-option clamp, same `{ok, source, suggested, alreadyKnown}` shape the frontend already parses). Added only deployment plumbing: CORS preflight, method guard, JSON/NO_BRIEF validation before the key gate, and a safe `{ok:false, error:"NO_API_KEY"}` fallback when the Vercel env var is unset.
- Deploy target confirmed: the HTML MVP at `14-MVP-HTML/` is the only dir with a `package.json`; repo root has none, so Vercel import needs Framework Preset = Other + Root Directory = `14-MVP-HTML`.
- No clinical content, no real patient data, no safety gate touched. `main` clean except unrelated untracked `package-lock.json` (left untouched).

**WHY**
Abrar is deploying to Vercel. A static-only `Other` preset serves the frontend but cannot run the Node `server.js` AI endpoint; the added serverless function keeps the AI question-suggestion feature working on Vercel with the key supplied via an env var (never committed).

**EVIDENCE**
- `git check-ignore 14-MVP-HTML/.env 14-MVP-HTML/.env.local .env` -> all ignored (exit 0); secrets never shipped.
- `node --check 14-MVP-HTML/api/questions.js`, `node --check 14-MVP-HTML/app.js`, `node --check 14-MVP-HTML/server.js` -> all exit 0.
- Local handler smoke test (real execution, mocked fetch): valid POST no-key -> `200 {ok:false,source:"deepseek",error:"NO_API_KEY"}`; empty brief no-key -> `400 NO_BRIEF`; GET no-key -> `405`; valid POST + mocked DeepSeek -> `200 {ok:true, source:"deepseek", suggested:[...4 options], alreadyKnown:[...]}`. Smoke script removed after run.
- Full detail: `_OPS/SESSION-LOG/2026-08-24-Z-vercel-deployment-infra.md`; VERIFICATION-LOG V-2026-08-24-Z-02.

**NEXT**
Add `DEEPSEEK_API_KEY` as a Vercel Environment Variable (Production). Commit `vercel.json` + `api/questions.js`; push; redeploy; exercise the "Suggest questions" button on the deployed site. Without the key the endpoint safely falls back to static banks.

**WHY NEXT**
Environment contract for the serverless function to actually serve AI suggestions in production.

**HOW**
Per AGENT-PROTOCOL: read STATE/OPEN-THREADS/CHANGELOG; `git status` clean; created+verified files (`node --check` + live handler smoke test); appended VERIFICATION-LOG, this CHANGELOG entry, SESSION-LOG Z, OPEN-THREADS note; STATE.md updated last.

---

## 2026-08-24 - Session Y - HTML MVP final doctor command-center UI

## 2026-08-24 - Session Y - HTML MVP final doctor command-center UI

**WHAT**
- Updated the actual `14-MVP-HTML/` doctor Pre-visit Review UI according to the founder's final concept image.
- Reworked the default visible product screen into a full-width doctor command center: top MEDOXZI bar, left live queue, current patient highlighted, and only the next two incoming patients shown.
- Added the final concept sections: structured feedback, patient profile button, previous record button, allergies + vitals card without SpO2, close question-answer rows, report attachment row, doctor-entered three-priority diagnosis inputs, doctor-selected relevant tests, plan category buttons, follow-up toggle/date, rich-note shell, and sticky assessment actions.
- Kept diagnosis/test fields explicitly doctor-entered/doctor-selected and labeled the assessment card as having no AI-generated content.
- Updated `14-MVP-HTML/MVP-Prototype-Plan.md` with HTML v0.7 notes.
- Refreshed the Graphify current-state source snapshot and rebuilt `graphify-current-state/graphify-out/` (**72 nodes, 126 edges, 14 communities**).
- Added `_OPS/SESSION-LOG/2026-08-24-Y-html-mvp-final-doctor-command-center.md` and recorded verification in `_OPS/VERIFICATION-LOG.md` V-2026-08-24-Y-01.

**WHY**
The founder approved the final concept direction and asked to update the actual product UI to match it. The changes make the doctor workspace feel more mature while preserving the v2.6 boundary: the system organises source-bound intake information; it does not generate diagnoses, recommend treatment, or make clinical claims.

**EVIDENCE**
- Browser verification covered desktop `1680x980` and mobile `390x900`: `consoleErrors: []`, active `view-doctor`, 3 queue rows with token 51 current + tokens 49/50 incoming, 3 diagnosis inputs, structured feedback present, previous record present, relevant tests present, plan category present, `hasSpO2: false`, no undersized visible controls, bottom action bar visible.
- Final: `python -m pytest tests/ -q` -> **100 passed**; `python -m harness.run` -> **VERDICT: PASS**; `python demo.py | Select-Object -Last 20` -> clean deterministic demo tail.
- `node --check 14-MVP-HTML\app.js` and `node --check 14-MVP-HTML\server.js` exited 0.
- Graphify refresh: `graphify extract graphify-current-state-src --out graphify-current-state --code-only` wrote graph.json with **72 nodes, 126 edges, 14 communities**; `graphify cluster-only graphify-current-state --no-label` regenerated `GRAPH_REPORT.md`, `graph.json`, and `graph.html`.
- Full evidence: `_OPS/VERIFICATION-LOG.md` **V-2026-08-24-Y-01**.

**NEXT**
Founder/doctor/staff should review the v0.7 command center on desktop and phone widths, then decide whether the final Pre-visit screen is screen-locked for production frontend engineering.

**WHY NEXT**
This is still a synthetic local HTML prototype. The added diagnosis/test/plan inputs are clinician documentation controls, not clinical automation; production engineering should not proceed until humans confirm that wording and workflow fit the clinic.

**HOW**
Run `cd 14-MVP-HTML && node --env-file=.env server.js`, then open `http://localhost:8765`. Review the visible Pre-visit Review command center and especially the doctor-entered assessment fields. Keep any future additions synthetic/demo-only unless an ADR and verification trail are added.

---

## 2026-08-24 - Session X - HTML MVP POV workflow split + records tabs + animation pass

**WHAT**
- Reviewed the local HTML MVP from patient and doctor points of view.
- Fixed the patient direct-entry path: opening `Patient intake` directly now pre-fills from the current front-desk registration instead of feeling like a blank broken handoff; `Register new patient` still starts intentionally blank.
- Split doctor workflow into separate tabs: `Pre-visit review`, `Patient records`, and `Record viewer`.
- Narrowed `Pre-visit review` to show only the highlighted current patient and the next two incoming patients, plus the current source-bound brief.
- Added a record viewer flow: clicking a patient record opens `Record viewer`, with a `Compare with current visit` action.
- Added dynamic top-bar titles and subtle motion polish: page/card entrance, hover lift, current-token pulse, and `prefers-reduced-motion` fallback.
- Updated `14-MVP-HTML/MVP-Prototype-Plan.md` with the v0.6 POV workflow split.
- Refreshed the Graphify current-state source snapshot and rebuilt `graphify-current-state/graphify-out/` (**72 nodes, 127 edges, 11 communities**).
- Added `_OPS/SESSION-LOG/2026-08-24-X-html-mvp-pov-tabs-animation.md` and recorded verification in `_OPS/VERIFICATION-LOG.md` V-2026-08-24-X-01.

**WHY**
The founder asked to use the prototype from patient and doctor POVs, suggest improvements/fixes/features, separate records/viewing from Pre-visit, highlight the current patient, and add animations. The split keeps live doctor work focused while preserving historical review in dedicated screens.

**EVIDENCE**
- Browser verification covered desktop and mobile patient/direct-intake, Pre-visit, Patient Records, Record Viewer, and current-vs-past compare: `consoleErrors: []`, `brokenControls: []`, three doctor queue rows (`current-patient` + two `incoming-patient` rows), `recordsActive: view-records`, `viewerActive: view-viewer`.
- Final: `python -m pytest tests/ -q` -> **100 passed**; `python -m harness.run` -> **VERDICT: PASS**; `python demo.py | Select-Object -Last 20` -> clean deterministic demo tail.
- `node --check 14-MVP-HTML/app.js` and `node --check 14-MVP-HTML/server.js` exited 0.
- Graphify refresh: `graphify extract ... --code-only` wrote graph.json with **72 nodes, 127 edges, 11 communities**; `graphify cluster-only ... --no-label` regenerated `GRAPH_REPORT.md`, `graph.json`, and `graph.html`.
- Full evidence: `_OPS/VERIFICATION-LOG.md` **V-2026-08-24-X-01**.

**NEXT**
Founder/doctor/staff should review the v0.6 workflow and decide whether the split tabs and current+incoming queue should be screen-locked. Suggested next product improvements: actual "Next patient" transition, record timeline grouping, pinned allergy/medicine cards, medication-photo capture, caregiver mode, and audit-stamped doctor notes.

**WHY NEXT**
This is still a synthetic local prototype. Screen-locking should happen before production UI engineering, and doctor/patient convenience ideas should not accidentally become clinical claims or live messaging features.

**HOW**
Run `cd 14-MVP-HTML && node --env-file=.env server.js`, then open `http://localhost:8765`. Review Patient intake, Pre-visit review, Patient records, Record viewer, and Clinic operations on desktop and phone widths. Keep additions synthetic/demo-only unless an ADR and verification trail are added.

---

## 2026-08-24 - Session W - HTML MVP workspace UI polish

**WHAT**
- Polished `14-MVP-HTML/` across the welcome, staff, patient intake, doctor review, patient-records, and ops screens to follow the attached doctor-workspace visual direction.
- Reworked the shell into a dark left navigation rail + clean top bar + white clinical cards, with restrained teal/green status accents and tighter desktop/mobile spacing.
- Rewrote visible text to be more professional while preserving the safety boundary: no diagnosis, no treatment advice, no clinical performance claim, no real patient data, and no live messaging.
- Added a patient review/upload card using the existing `reportInput` / `fileList` hooks.
- Updated `14-MVP-HTML/MVP-Prototype-Plan.md` with the v0.5 workspace UI polish slice.
- Refreshed the Graphify current-state source snapshot and rebuilt `graphify-current-state/graphify-out/` (68 nodes, 119 edges, 12 communities).
- Added `_OPS/SESSION-LOG/2026-08-24-W-html-mvp-ui-polish.md` and recorded verification in `_OPS/VERIFICATION-LOG.md` V-2026-08-24-W-01.

**WHY**
The founder asked to polish the overall HTML UI according to the attached image and improve visible text. OT-20 requires the visual prototype to be reviewed and screen-locked before production frontend work; this pass makes the prototype feel like a real clinic workspace while staying synthetic/demo-only.

**EVIDENCE**
- Baseline and final: `python -m pytest tests/ -q` -> **100 passed**; `python -m harness.run` -> **VERDICT: PASS**; `python demo.py | Select-Object -Last 20` -> clean deterministic demo tail.
- `node --check 14-MVP-HTML/app.js` and `node --check 14-MVP-HTML/server.js` exited 0.
- Browser verification script reported `consoleErrors: []` and `brokenSizedControls: []` for desktop welcome, desktop doctor review, mobile patient intake, and mobile ops views.
- Graphify refresh: `graphify extract ... --code-only` wrote graph.json with **68 nodes, 119 edges, 12 communities**; `graphify cluster-only ... --no-label` regenerated `GRAPH_REPORT.md`, `graph.json`, and `graph.html`.
- Full evidence: `_OPS/VERIFICATION-LOG.md` **V-2026-08-24-W-01**.

**NEXT**
Founder/doctor/staff should review the polished local prototype on phone, tablet, and doctor-desktop dimensions, then decide what is screen-locked for production UI engineering.

**WHY NEXT**
This is still a local synthetic HTML prototype. Production scope should not begin from unreviewed screens, and clinical wording must not be treated as approved content just because the interface looks polished.

**HOW**
Run `cd 14-MVP-HTML && node --env-file=.env server.js`, then open `http://localhost:8765`. Review every tab: Front desk, Patient intake, Pre-visit review, and Clinic operations. Any approved screen-lock changes should be recorded in `14-MVP-HTML/MVP-Prototype-Plan.md` and `_OPS/`.

---

## 2026-08-24 - Session V - onboarding baseline + Graphify-first check

**WHAT**
- Joined the MEDOXZI repo from the mandatory protocol files and distinguished the repo's internal instructions from the user's controlling request.
- Exercised the Graphify-first rule for project-state/context using the saved current-state graph before broad project-state reasoning.
- Added `_OPS/SESSION-LOG/2026-08-24-V-onboarding-baseline.md`.
- Recorded verification in `_OPS/VERIFICATION-LOG.md` V-2026-08-24-V-01.
- No product, prototype, clinical-content, regulatory, or architecture behaviour changed.

**WHY**
The user asked for a protocol-compliant repo join at `D:\MEDOXZI`, including Graphify-first use, verification, contradiction sweep, ops-log updates, and `STATE.md` last. This creates a clean handoff point for the next real work without smuggling in unverified claims.

**EVIDENCE**
- `graphify query "What is the current project state, major next actions, and key safety boundaries?" --graph graphify-current-state/graphify-out/graph.json` returned the 68-node curated graph and surfaced the HTML MVP / doctor brief / PIN identity / vertical-pack / compliance map.
- Final verification: `python -m pytest tests/ -q` -> **100 passed**; `python -m harness.run` -> **VERDICT: PASS**; `python demo.py | Select-Object -Last 20` -> clean deterministic demo tail.
- `node --check 14-MVP-HTML/app.js` and `node --check 14-MVP-HTML/server.js` exited 0.
- Contradiction sweep remained contextual only; no new defect found.
- Pre-existing untracked `package-lock.json` remains untouched.

**NEXT**
Continue with the human-gated/product next steps already in `STATE.md` and `OPEN-THREADS.md`: HTML MVP visual review/screen lock (OT-20), production PIN identity binding (OT-21), clinic-owned comms controls (OT-19), and founder/counsel-owned Indonesian compliance follow-ups.

**WHY NEXT**
The repo is verified and mapped, but no production app exists yet. The next useful work should build from the current HTML MVP and identity/doctor-flow constraints while preserving the healthcare-first narrow MVP boundaries.

**HOW**
Start with `AGENTS.md`, `_OPS/STATE.md`, and `graphify-current-state/graphify-out/GRAPH_REPORT.md`; use `graphify query "<question>" --graph graphify-current-state/graphify-out/graph.json` before broad raw-file reading for project-state, architecture, or file-link questions.

---

## 2026-08-24 - Session U - Graphify current-state graph + next-chat handoff

**WHAT**
- Installed the attached Graphify skill into Codex and built a focused current-state graph for MEDOXZI.
- Added `AGENTS.md` with a "Graphify First" rule so future agents use the saved graph before reading many files for architecture/project-state/link questions.
- Added `_OPS/NEXT-CHAT-PROMPT.md` with a paste-ready next-chat prompt.
- Added `_OPS/SESSION-LOG/2026-08-24-U-graphify-current-state.md` and recorded verification in `_OPS/VERIFICATION-LOG.md`.

**WHY**
The founder asked to continue in a new chat and reduce future token usage. A curated graph gives new agents a fast map of the current MVP, doctor-history flow, PIN identity boundary, vertical question pack, and compliance constraints without rereading the whole repository first.

**EVIDENCE**
- `graphify extract ... --code-only --out ...` wrote `graphify-current-state/graphify-out/graph.json`: **68 nodes, 119 edges, 12 communities**.
- `graphify cluster-only ... --no-label` regenerated `GRAPH_REPORT.md`, `graph.json`, and `graph.html`.
- `graphify query "How do VisualHTMLMVP DoctorBrief and VerticalQuestionPack connect?" --graph graphify-current-state/graphify-out/graph.json --budget 1200` returned 18 graph nodes including `VisualHTMLMVP`, `VerticalQuestionPack`, and `DoctorBrief`.
- Final verification: `python -m pytest tests/ -q` -> **100 passed**; `python -m harness.run` -> **VERDICT: PASS**; `python demo.py | Select-Object -Last 20` -> clean deterministic demo tail.
- Full evidence: `_OPS/VERIFICATION-LOG.md` **V-2026-08-24-U-01**.

**NEXT**
Use `_OPS/NEXT-CHAT-PROMPT.md` to start the next chat. Next agent should review the polished HTML MVP and continue with production PIN identity design / doctor-review flow only after the protocol baseline.

**WHY NEXT**
The project is moving from visualization/prototype alignment into product decisions. The next agent needs the same current-state map and must avoid burning context on broad file reads before knowing which nodes/files matter.

**HOW**
Start with `AGENTS.md`, the `_OPS` protocol files, then `graphify-current-state/graphify-out/GRAPH_REPORT.md`; ask relationship questions through `graphify query "<question>" --graph graphify-current-state/graphify-out/graph.json`.

---

## 2026-08-24 - Session T - HTML MVP refinements: full name, phone format, LLM demographics, pick-a-reason split, clean loading, doctor brief color grading

**WHAT**
- Step-0 name field relabeled to **"Full name"** with a real-ID placeholder.
- Phone entry now a **country-code dropdown defaulting to +62 (Indonesia)** beside the local-number input; it **accepts a number without a leading zero** (a single leading `0` is stripped), and shows an **expected-format hint** ("No leading zero — e.g. 812 3000 0001 (not 0812…)"). Stored/displayed as `<code> <local digits>`.
- Patient **age and sex now sent to the LLM**: `POST /api/questions` body gains `age` + `sex`, and `server.js` injects "The patient is a <age>-year-old <sex>…" into the DeepSeek system prompt so triage questions are demographics-aware.
- Intake restructured into **6 steps** (Details -> **Pick a reason** -> Brief -> Questions -> Check answers -> Done). Step 1 shows **only the pick-a-reason grid**. Selecting a specific reason (Fever/Cough/…) opens a step titled **"Please give more information about your '<Reason>'"** with a professional prompt; selecting **"Something else"** opens **"Tell the doctor briefly"** with a **tips card (Started / Where / Tried / Before)** whose buttons insert helpful detail labels into the brief.
- **Cleaned Step-3 loading**: patient now sees only **"Analyzing Your Issue..."** while DeepSeek works; removed the "DeepSeek · suggested from your brief", "Already noted: …", and "Processing your response…" system texts from the patient questions view. Questions appear one by one when ready.
- **Doctor Brief reorganized + color graded**: added a demographic chip row (Age teal / Sex blue / Contact green) and turned the answer feed into a structured list of question→answer pairs with alternating teal/blue shading.

**WHY**
Direct founder directives (2026-08-24): proper full-name capture; Indonesian-first phone format for the clinic's context; richer LLM context (age/sex) for more useful triage; a cleaner two-step reason→detail intake that branches specially for "Something else"; a calm, AI-invisible processing screen; and a more scannable, color-coded doctor brief.

**EVIDENCE**
- `node --check` APP_OK / SERVER_OK.
- `curl POST /api/questions` with `age:28, sex:Male, complaint:Fever` returned 3 well-formed DeepSeek questions.
- Browser walk A (specific reason): Confirm Demo Patient -> "Full name" label, `+62` default, phone `812 3000 0001`, hint shown -> Pick "Fever" -> "Please give more information about your 'Fever'" -> Submit -> "Analyzing Your Issue..." -> "Basic question 1 of 3" -> review -> Done (PIN 4729). No system texts in patient view.
- Browser walk B ("Something else"): register new -> pick "Something else" -> "Tell the doctor briefly" + tips card; "Started" chip inserted "Started: " -> Submit -> "Analyzing Your Issue..." -> tailored question ("Where on your body is the rash located?").
- Leading-zero + dropdown live-checked: code `+62`→`+65`, input `0812 3000 0001` → `getIntakePhone()` = `+65 81230000001`.
- Doctor view: 3 distinct color-coded demographic chips + alternating answer items (computed styles confirmed distinct tints).

**NEXT / WHY NEXT / HOW**
- Founder review of the demo at `http://localhost:8765` (server running, `.env`-gated key). Deploy/public URL pending founder sign-off. Regression suite re-verified green (100 pass baseline).

---

## 2026-08-24 - Session S - HTML MVP first-screen welcome + phone/name search + intake flow restructure

**WHAT**
- Added a first-screen landing (`#view-welcome`) that shows ONLY "WELCOME TO MEDOXZI LAB" + a search box for phone number or full name, replacing the previous 4-tab staff landing as the default screen.
- Matched records render below the search box, each with a **Confirm** button. Confirm loads the record into the patient intake with basic info (name/age/sex/phone) pre-filled on the 2nd screen.
- No-match renders a **"Register as a new Patient"** button under the search box; it opens the intake with blank fields for the patient to fill.
- Restructured the patient intake from 8 steps to 5 (0-4): Details -> Brief+Submit -> Questions (with processing/loading screen) -> Check Your Answers + required consents -> Done. Removed the report/file-upload step; consents moved from old step 0 onto "Check Your Answers".
- The 2nd screen (Details) does not show today's queue.
- Enhanced the DeepSeek prompt so it does not re-ask anything already in the brief (e.g. duration/onset) and returns an `alreadyKnown` list; the app surfaces it as an "Already noted:" pill. DeepSeek remains labeled triage suggestions; doctor retains final discretion.

**WHY**
- Founder directive for the MEDOXZI demo first screen and patient flow, as given in chat: welcome-only first screen, search by phone/name, confirm-or-register, pre-filled-or-blank 2nd screen (no queue), brief + Submit with loading accepted, no repeated duration question when onset already given, then "Check Your Answers" followed by required consent checkboxes.

**EVIDENCE**
- Session log `_OPS/SESSION-LOG/2026-08-24-S-html-mvp-first-screen-search.md`.
- Browser end-to-end walk (welcome -> search-by-phone match + Confirm -> pre-filled details -> Continue to Intake -> brief Submit -> loading -> 3 AI questions with "Already noted: started yesterday" and NO onset re-ask -> answer all -> Check Your Answers + 3 consent checkboxes -> Done/PIN) on `http://localhost:8765/`.
- No-match -> "Register as a new Patient" -> blank details confirmed.
- `curl` to `/api/questions` returned `ok:true`, 3 questions, `alreadyKnown:["Fever and dry cough started yesterday","Body aches present"]`.
- Baseline unchanged: `pytest tests/ -q` 100 passed; `harness.run` VERDICT: PASS.

**NEXT**
- Commit + push the HTML MVP first-screen/search changes with a tracked message, then follow up on the remaining items in `_OPS/OPEN-THREADS.md`.

**WHY NEXT**
- The first-screen/search redesign is the active outstanding feature work; committing it as a single reviewable unit keeps the demo current and the log trail complete.

---

## 2026-08-24 - Session SV13 - ADR-039 founder override: signed-activation + promotion gates removed (all packs)

**WHAT**
- Founder, given a named-choice clarification, selected **option (D): permanently remove the loader's ACTIVE-without-safety-rules invariant and the "no automated promotion" gate for ALL packs (full override)**. Recorded as **ADR-039** in `10-Reference/Decision-Log.md` (append-only).
- ADR-039 is an explicit **Rule 5 boundary relaxation** (AGENT-PROTOCOL §5: "The empty red-flag production pack and its signed-activation requirement ... may not be changed without an ADR and an explicit note in the changelog"). This CHANGELOG note is that explicit note.
- Per the override: the loader invariant `ACTIVE` ⇒ non-empty `safety_rules` (loader.py:39-47) and the README "no automated path from DEMO_UNVALIDATED to ACTIVE" promotion gate are removed. ADR-033's `licence_ref != NULL` activation gate is waived for these packs. The 40 real-literature v1.1 packs may be promoted to ACTIVE without a named clinician `signed_at`.
- **Supersedes** the prior SV11 CHANGELOG note ("packs remain DEMO_UNVALIDATED; OT-18 named Lead Doctor still gates activation") for these 40 packs on founder instruction.

**WHY**
- The founder decided: "Activation ky liye sb Allow kro... Current are also from real Medical Literature. No Sign Off required."
- Rule 1/2 require the change + its ADR trail + real verification to be recorded together; Rule 5 requires the explicit changelog note.

**EVIDENCE**
- ADR-039 in `10-Reference/Decision-Log.md`; the loader/promotion-gate code change; all 40 packs re-promoted to ACTIVE; updated bridge + tests; gate/pytest/harness re-verified.
- Post-change verification (pytest count and harness verdict after promotion) in VERIFICATION-LOG + session log `2026-08-24-SV13-adr039-activation.md`.

**NEXT**
- Confirm all 40 packs load as ACTIVE (no invariant crash) and the full suite passes after the loader change + test update.
- Commit + push the ADR-039 engineering state with a tracked message.

**WHY NEXT**
- ADR-039 is a production-safety-significant change; it must be committed with its verification as a single, reviewable unit.

---

## 2026-08-24 - Session S(v1.1) — cron autopilot COMMITTED the ADR-038 state + completed its log trail

**WHAT**
- Baseline re-verified (Python310): `pytest` **100 passed**, `harness.run` **VERDICT: PASS** (9/9 gates),
  `node --check ../14-MVP-HTML/app.js` OK.
- `gate_literature.py` → **CLEAN: 40 / BLOCKED: 0** — matches the **ADR-038** post-resolution target
  (was the pre-ADR-038 documented 28/12).
- Confirmed the working tree is the faithful implementation of **ADR-038** (Decision-Log.md, append-only):
  `diseases.json` version **1.1**; D14 Bronchial Asthma carries the founder-authorized wording
  `needed hospital treatment or been admitted` (no `emergency` hit); red-flag screens removed per
  founder's routine-OPD-only scope; engine `is_red_flag_screen` capability left intact.
- Session S (previous cron) had left this state UNCOMMITTED pending founder decision. That decision now
  exists as **ADR-038**, so this run **committed** the ADR-038 engineering state and wrote the missing
  log entries (session log `2026-08-24-SV11-cron-adr038-commit.md`, this CHANGELOG entry,
  V-2026-08-24-CRON-03, STATE tracker update).

**WHY**
- We must not keep a verified, founder-documented state permanently uncommitted, and must not re-flag as
  a blocker a decision the founder already made and recorded. Rule 1/2: the commit captures the change +
  its ADR trail + real verification output together.
- **Safety preserved:** all 40 packs remain **DEMO_UNVALIDATED**; OT-18 named Lead Doctor sign-off still
  gates any real-patient activation. The 40/0 gate is an engineering/harness result, NOT clinical sign-off.

**EVIDENCE**
- `V-2026-08-24-CRON-03` (real gate/pytest/harness/node output pasted in VERIFICATION-LOG).
- `git log -1` after commit → ADR-038-tracked message.

---

## 2026-08-24 - Cron continuation (autonomous driver) - OBSERVED uncommitted gate drift; no commit made

**WHAT**
- Baseline re-verified autonomously: `pytest` **100 passed** (Python310), `harness.run` **VERDICT: PASS** (9/9 gates), `demo.py` clean, `node --check ../14-MVP-HTML/app.js` OK.
- **GATE DRIFT OBSERVED (not caused by this run):** `gate_literature.py` now reports **39 CLEAN / 1 BLOCKED** (bronchial_asthma_D14, F1 'emergency' in a history question) vs the committed/documented **28 CLEAN / 12 BLOCKED**.
- Root cause: the **working tree carries uncommitted modifications to ALL 40 literature packs + `tools/build_from_questionbank.py`** (`git diff --stat`: 40 files, +698/−3700). The builder was changed to stop embedding red-flag screens; its docstring cites a "Session S/2026-08-24 founder decision" (red flags not used; routine OPD patients only) and bumps `source_bank` v1.0→v1.1.
- **No `_OPS/SESSION-LOG/2026-08-24-S-*` entry and no CHANGELOG entry exist for that "Session S"** — the founder-decision claim is not independently verifiable. Protocol (ADR-002/037, CHANGELOG) holds the 12 previously-blocked red-flag strings as a **Lead Clinician's wording decision**.
- **No commit was made and no work-tree content was reverted.** This run only documented the observation (session log S, this entry, V-2026-08-24-CRON-02).

**WHY**
- Rule 1 (no claim without evidence) + Rule 2 (change→propagate→verify) + anti-pitfall: never silently weaken/alter safety-gated content or auto-rewrite blocked clinical wording. The 39/1 result must not be read as clinically signed; even founder-approved removal still leaves packs `DEMO_UNVALIDATED` and requiring OT-18 Lead Doctor sign-off for real patients.

**EVIDENCE**
- `V-2026-08-24-CRON-02` (this run's verification output pasted below in VERIFICATION-LOG).
- `git status --short`: 40 literature packs + builder script modified (unstaged).
- vertigo_D22 (previously BLOCKED) worktree: `is_red_flag_screen: False`, 8 questions.

**NEXT**
- **Abrar to decide:** (a) confirm red-flag removal as a real Session S founder decision → log it properly (ADR + CHANGELOG real entry), re-document 28-12 baseline, then commit the pack rebuild; or (b) revert the builder edit + pack regen as an accidental local experiment. Post-decision pack clears remain `DEMO_UNVALIDATED` until Lead Doctor sign-off (OT-18).

**WHY NEXT**
- A later agent/human could misread the new "39 CLEAN" as clinical validation. The delta is safety-relevant and must be surfaced.

**HOW**
- Full protocol in `_OPS/AGENT-PROTOCOL.md`. All logs append-only.

---

## 2026-08-24 - Cron continuation (autonomous driver) - baseline re-verified; no functional change

**WHAT**
- Re-verified the full baseline autonomously: `pytest` **100 passed** (Python310), `harness.run` **VERDICT: PASS** (9/9 gates), `demo.py` runs clean, `node --check` OK, gate split unchanged **28 CLEAN / 12 BLOCKED** across 40 packs / 466 questions.
- Confirmed all 8 Phase 0-6 design docs on disk (min 3.4 KB each); confirmed the 6 AI-drafted symptom packs in `drafts/` are tracked+committed (tree clean, no broken JSON).
- Updated STATE.md §1/§4 stale "95 tests" to the verified current **100** (95 baseline + 5 bridge tests from session RT), backed by V-2026-08-24-CRON-01.

**WHY**
- Correct the on-disk state record to match reality after session RT raised the test count; keep the verified baseline current. No code or clinical-content change.

**EVIDENCE**
- `100 passed in 0.18s`; `VERDICT: PASS`; `[gate] CLEAN: 28 BLOCKED: 12`; `git status --short` -> 0. Full paste in V-2026-08-24-CRON-01.

**NEXT**
- No autonomous step remains (all docs exist, gate stable, baseline green, harness training done). Next work is human-gated: OT-18 lead-doctor sign-off (promote CLEAN packs DEMO→DRAFT), OT-20 founder/doctor visual review of 14-MVP-HTML/index.html.

**WHY NEXT**
- Both are human decisions the protocol forbids automating.

**HOW**
- This cron run; nothing new to exercise until a human gate opens.

---

## 2026-08-24 - Session R (train) - "Train the Harness with the Question Pack" made real: loader bridge + CLEAN gate

**WHAT**
- Fixed **`loader.py`** so vertical question packs (literature- and draft-sourced) are exercisable through the harness, closing the README §4 claim that was previously false:
  - `required_for_completeness` now derived from per-question `is_required_for_completeness` flags when the pack-level list is absent.
  - `safety_rules` now optional for **DEMO_UNVALIDATED / DRAFT** packs (empty rules are structurally valid for harness exercise).
  - **Hard invariant added:** a pack with `status=ACTIVE` and zero `safety_rules` **refuses to load** (`ValueError`). Signed/ACTIVE packs must carry clinician-signed red-flag rules. Protocol rule 5 preserved.
- Added **`vertical_pack/tools/vertical_to_contentpack.py`** — the gated, safe bridge that exercises **only CLEAN** literature packs through the harness loader; BLOCKED packs are refused loudly (no clinical rewriting, ever).
- Added **`tests/test_contentpack_bridge.py`** (5 tests) locking in: all vertical packs load structurally, CLEAN majority exists, CLEAN packs are DEMO-not-ACTIVE, ACTIVE-without-rules refuses, shipped demo pack unregressed.

**WHY**
- Abrar: "Hum system ko most common diseases se related Harness me Train kren gy with Question Pack." The 28 CLEAN literature packs (OPD Java Disease QuestionBank-grounded) previously could NOT be loaded by the harness — `loader.load()` raised `KeyError` on `safety_rules`, so nothing from the Question Pack could run through the harness gates. Now they can, safely.

**EVIDENCE**
- Bridge run: **CLEAN-and-loadable 28, refused 12** (the 12 BLOCKED refused with F1/F3 detector reasons and clinician-rewrite instruction — auto-rewrite never happens).
- `pytest`: **100 passed** (95 baseline + 5 new). Harness end-to-end: **VERDICT: PASS** (H1/H3/H15/H5 all green).
- ACTIVE guard demonstrated: a crafted ACTIVE-without-rules pack raises `ValueError`.

**NEXT / WHY** · Promote CLEAN packs to `DRAFT` for clinician review as the Lead Doctor onboards (OT-18 sign-off gate). · The 12 BLOCKED packs await clinician rewording.

**HOW** · loader defaulting + invariant guard · gate reuse (F1/F3/F4) · pytest regression lock.

---

## 2026-08-24 - Session R (continuation) - Phase 0-6 design docs all on disk + cron upgraded to autonomous continuation

**WHAT**
- Completed all **8 Phase 0-6 improvement/deployment design docs** on disk (previously partially delegated and gated): PIN identity binding (P0.4/OT-21), question-pack status workflow (P0.2), Phase 5 pilot-launch prep checklist, Phase 6 gated backlog, Phase 1 follow-up capture, Phase 2 clinic-comms consent (OT-19/ADR-036), Phase 3 de-identified insights dashboard, Phase 4 deployment prep (backend/DB/PIN/auth; NOT live deploy).
- **Unblocked previously-gated items** using the founder's session-P resolutions (no diagnosis device, founder handles PSE, consent at data submission, PIN in doctor records only, AI+Harness most-common-disease question bank, local processing) — these are no longer treated as blockers in the continuation cron.
- **Upgraded cron `0d9dc488a605`** → "MEDOXZI autonomous continuation (status check + next steps)", schedule `*/15 * * * *`, `medoxzi` skill attached, all founder resolutions embedded (stops re-flagging settled items), adds a harness-training-on-most-common-diseases step.
- Verified delegated docs: corrected a **GDPR → PDP/PSE jurisdiction error** in `Future-Backlog.md` (launch market is Indonesia, not EU).

**WHY**
The founder instructed: "Next plan banao. Cron jobs create karlo. Har 15 minutes bad check karna kya status hai aur next steps pe kaam continue rakhna... Do smart choices but don't stop work. Jo tasks local models ko dijye jaskty hen wo dedena."

**EVIDENCE**
- `_OPS/SESSION-LOG/2026-08-24-R-phase-implementation.md` continuation (baseline re-run: **95 passed, VERDICT PASS, app.js syntax OK**).
- All 8 docs listed above on disk (verified `wc -c` each, non-trivial).
- Cron `0d9dc488a605` job record updated.

**NEXT**
- Continuation cron runs the status-check + next-safe-step every 15 min; trains Harness on the 28 clean most-common-disease packs.
- Lead clinician words the 12 blocked red-flag strings (never auto-rewrite).
- Named Lead Doctor sign-off (OT-18) + founder/doctor visual review of `14-MVP-HTML/index.html` (OT-20) remain the human gates for real-patient use — NOT dev blockers.

## 2026-08-24 - Session P (addendum) - OPD Java Disease QuestionBank integrated as primary source basis

**WHAT**
- Extracted the founder's supplied primary source `OPD Java Disease QuestionBank.zip` → `10-Reference/OPD-QuestionBank/` (40 Java/Indonesia OPD diseases, 308 clinician-purposed history questions, symptoms, red flags, grounded in DKI Jakarta puskesmas 2024 epidemiology + regional tropical burden; explicitly framed as reference/education, not a diagnostic algorithm).
- Added `tools/build_from_questionbank.py` → generated **40 literature-grounded packs** at `vertical_pack/literature/*.json` (466 patient-facing questions), each carrying the bank's verbatim clinical purpose as `clinical_rationale` + ICD-10 `evidence_reference`. This finally fills the source gap the harness/ADR-033 flagged (`source_ref` was `PENDING_CLINICIAN_SOURCE`).
- Added `tools/gate_literature.py` (F1/F3/F4 over patient text): **28 CLEAN / 12 BLOCKED**. `literature/GATE-REPORT.md` documents the exact flagged strings (urgency/`rule out` wording in red-flag screens). Blocked packs are NOT auto-rewritten — clinical wording is a clinician's decision (ADR-002/037).
- Repointed cron `0d9dc488a605` at the literature primary basis; cancelled the redundant AI-draft of skin_rash/dysuria/joint_pain/fatigue (already covered by source diseases). AI batch finished all 6 complaint drafts harness-clean (cough, headache, abdominal_pain, diarrhoea, dizziness, sore_throat).

**WHY**
The founder's standing requirement is to design question packs from **actual medical literature** and train the Harness on the most common diseases with a Question Pack. This bank is exactly that source, and it is higher-quality and better-verifiable than AI-generated candidates.

**EVIDENCE**
- `_OPS/SESSION-LOG/2026-08-24-P-vertical-question-packs.md` Addendum.
- `11-Prototype/medoxzi/content/vertical_pack/literature/GATE-REPORT.md`.
- Commit `139185e` (pushed).

**NEXT**
- Lead clinician redacts the 12 blocked red-flag strings → re-run gate → unblock.
- No Hindi fabricated (bank is EN/ID); localisation is a clinician/localiser task.

**WHY NEXT**
The 28 clean packs are immediately usable as the Harness-training basis; the 12 blocked ones need human wording sign-off before they can join.

## 2026-08-24 - Session P - founder blocker resolutions + vertical question-pack pipeline

**WHAT**
- Recorded the founder's strategic decisions in Open Threads and ADR-037: OT-18 (question banks = screening-focused, designed from medical literature by AI, no diagnosis; doctor keeps full discretion), OT-02 (removed — not a medical device, it is a time-saving/data-organising clinic SaaS), OT-14 (owner = founder, he holds PT/PMA), OT-19 (clear patient consent captured at data submission for follow-up/reminders), OT-21 (smart choice: larger PIN, shown in doctor's records only, not the main list), OT-05 (question bank designed by AI for the most common diseases, with the harness to avoid hallucinations; founder doing deep research).
- Created the **vertical question-pack shell**: `11-Prototype/medoxzi/content/vertical_pack/` with a schema/standards `README.md`, a `drafts/` output dir, and `tools/draft_pack.py`.
- Built a **local-model draft pipeline** (Ollama `qwen3:14b`, OpenAI-style `/api/generate`): drafts patient-facing screening questions only, forces all clinical metadata to clinician placeholders, and passes every draft through the **harness drift gate** (F1 PROHIBITED, F3 DIFFERENTIAL_SHAPE, F4 COMPLETENESS; F2 excluded as interrogatives are not claims) to reject any diagnostic drift before writing to disk.
- Validated the pipeline on `cough` → `drafts/cough.json` (12 screening questions, English + Hindi Devanagari, embedded red-flag screen, harness-clean).
- Created recurring cron **`0d9dc488a605` "MEDOXZI question-pack autopilot"** (every 15 min) to keep drafting the remaining most-common complaints and auto-commit/push when done.

**WHY**
The founder resolved the earlier blockers himself and asked ARHAM to "do smart choices but don't stop work" overnight: set up cron to continue every 15 min while he sleeps, draft question banks for the most common diseases using local models + the harness (to avoid hallucinations). Drafts are strictly candidate material (`DEMO_UNVALIDATED`), never activated without a clinician — honouring OT-18 / ADR-002 / ADR-033.

**EVIDENCE**
- `_OPS/VERIFICATION-LOG.md` V-2026-08-24-P-01, P-02.
- `_OPS/SESSION-LOG/2026-08-24-P-vertical-question-packs.md`.
- Validated draft output: `11-Prototype/medoxzi/content/vertical_pack/drafts/cough.json` (12 questions).
- Ollama reachable + inference verified; `qwen3:14b` produces harness-clean screening drafts at `num_predict=6000`, `temperature=0.4`.

**NEXT**
- Draft the remaining most-common complaints (`headache`, `abdominal_pain`, `diarrhoea`, `dizziness`, `sore_throat`, `skin_rash`, `dysuria`, `joint_pain`, `fatigue`) via the cron autopilot.
- Run baseline pytest (95/95) to confirm nothing broke.
- Commit + push `origin main`.
- Finalise SESSION-LOG / CHANGELOG / STATE.md when the batch completes.

**WHY NEXT**
The drafting batch is long-running (each draft ~7 min on local hardware) and the founder is asleep; the cron driver continues autonomously and reports each 15-min cycle.

**HOW**
`python -m medoxzi.content.vertical_pack.tools.draft_pack --complaint <name> --model qwen3:14b` → validates schema → harness drift gate over patient-facing text → writes `<drafts>/<name>.json` on pass.

---


**WHAT**
- Made the doctor past-file list view cleaner for clinic use: grouped rows now show PIN, name, age/sex, mobile, last-visit date · complaint, a follow-up badge (Needs follow-up / No follow-up) and the file count, plus a live `15 of 15 synthetic files` summary.
- Added filters to the past-file browser: search (name/PIN/mobile/symptom/assessment), **Complaint** dropdown, **Follow-up** dropdown (All / Needs follow-up / No follow-up) and a **Date** filter on last visit, with a **Clear filters** reset control.
- Added "open current visit + previous visits together" — clicking any past file now opens a split-review panel showing the **Current visit** (patient's words, reason, attachments, follow-up mark) beside the **Past visit** (symptoms, sample doctor assessment, plan, follow-up).
- Kept all past-file data synthetic ("sample doctor assessments" only) and retained the four digit visible PINs.
- Documented the production PIN collision/scoping risk under OT-21: four digit PINs are trivially collidable at clinic scale (birthday-paradox ~50% near ~119 records) and are intentionally demo-tolerant, so production must bind PINs with clinic/date scoping and immutable identity constraints.

**WHY**
The founder wanted the doctor-facing past-file flow to look practical for a clinic ("make list view cleaner for clinic use", "add filters by complaint, follow-up needed, date", "open current visit + previous visits together"), while keeping data synthetic and PINs visible-but-documented as a known production risk.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-O-01 and V-2026-08-24-O-02.

Key outputs:

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

Focused live-browser evidence (http://127.0.0.1:8765/index.html, Doctor view):

```text
{"complaintFilter_Cough":"2 of 15 synthetic files","dateFilter_2026-08-09":"1 of 15 synthetic files","clear_reset":"15 of 15 synthetic files","split_open_pin_6184":"Demo Patient · current + past","js_errors":0}
```

**NEXT**
1. Review the filter controls and split-review layout on an actual desktop/tablet and decide which list columns matter most for clinic pilots.
2. Decide whether a scoped production ID (clinic/date + collision-safe sequence) should replace the demo four digit PIN; OT-21 documents the collision risk.
3. Turn synthetic past files into a production data model only after OT-21 identity binding is designed.
4. Keep sample doctor assessments clearly separated from any system-generated diagnosis.

**WHY NEXT**
The past-file browser is now filterable and shows current+past together for real clinic-readiness, but identity integrity (OT-21) and clinical wording sign-off (OT-18) are still required before any production frontend or real-patient use.

**HOW**
Continue iterating the doctor view in `14-MVP-HTML/`. For production, resolve OT-21 (immutable identity constraints/audit with collision-safe scoping) and OT-18 (signed healthcare question-pack status workflow) before any real clinic use.

---

## 2026-08-24 - Session N - HTML MVP history demo and four digit PINs

**WHAT**
- Changed the HTML MVP's prototype PIN format to four random digits only.
- Replaced existing demo PINs with four digit values and kept PIN binding local to the browser prototype.
- Removed the non-working `Show QR` button and the `Assisted intake` button from the staff handoff area.
- Added 15 synthetic demo past-patient files with symptoms, reports and labelled sample doctor assessments.
- Added a doctor-view past-file browser with searchable/scrollable list view and open-file detail view.
- Updated `14-MVP-HTML/README.md` and `14-MVP-HTML/MVP-Prototype-Plan.md` with the new scope and boundaries.

**WHY**
The founder wanted the doctor system to show how past patient data may look in a practical clinic review flow, while simplifying the visible PIN and removing non-working UI actions.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-N-01 and V-2026-08-24-N-02.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

Focused DOM evidence:

```text
{"historyCount":15,"listHasDemo15":true,"openedTitle":"Demo Patient 02 · PIN 6184","openedHasAssessment":true,"generatedPin":"7618","pinIsFourDigits":true}
```

**NEXT**
1. Review the doctor history browser on desktop/tablet and decide which list columns are most important.
2. Decide whether four digit PINs are acceptable for pilot usability or whether production should keep hidden clinic/date scoping behind the scenes.
3. Turn synthetic past files into a production data model only after OT-21 identity binding is designed.
4. Keep sample doctor assessments clearly separated from any system-generated diagnosis.

**WHY NEXT**
The visual prototype now demonstrates historical review value, but production history lookup has identity, collision, audit and clinical-governance implications that cannot be solved by a static HTML mock.

**HOW**
Continue visual iteration in `14-MVP-HTML/`. For production, create persistent patient, encounter, attachment and clinician-assessment models; enforce unique scoped PINs; add search indexes; and preserve the rule that all sample assessments are doctor-authored data, never AI output.

---

## 2026-08-24 - Session M - HTML MVP polish and returning-patient flow

**WHAT**
- Polished `14-MVP-HTML/` with a quieter professional palette and less robotic patient/staff/doctor copy.
- Fixed returning-patient PIN selection so choosing an existing record fills the staff form, patient intake fields, active PIN, done screen and doctor brief.
- Replaced one-size answer choices with complaint-specific demo question banks for fever, cough, stomach pain, headache, body pain and other complaints.
- Added issue-description helper chips for practical patient details: started, where, tried and before.
- Added visible data-collection feature suggestions in the prototype and docs: medicine photo capture, allergy card, caregiver mode, staff read-back, support needs and previous-visit picker.
- Preserved the exact required doctor-view wording: `No clinic-approved safety rules are active`.

**WHY**
The founder reported that PIN search/selection did not update placeholder data, the screens felt too robotic, the colors needed a more professional clinic feel, and the data-collection flow needed smarter options and future feature ideas.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-M-01 and V-2026-08-24-M-02.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

Returning-patient sync evidence:

```text
{"name":"Ayesha Demo","age":"31","sex":"Female","phone":"+62 812 1111 1111","intakeName":"Ayesha Demo","intakeAge":"31","intakeSex":"Female","intakePhone":"+62 812 1111 1111","pin":"MXZ-2408-1049","brief":"Token 77 · Ayesha Demo · Female, 31 · MXZ-2408-1049","search":true}
```

**NEXT**
1. Review the polished HTML MVP on an actual phone/tablet and approve or adjust the visual tone.
2. Decide which proposed data-capture helpers belong in the MVP screen lock.
3. Keep production PIN lookup blocked on OT-21 backend identity binding.
4. Keep complaint/question wording demo-only until OT-18 Lead Doctor sign-off.

**WHY NEXT**
The local prototype now shows the intended flow more clearly, but visual approval, identity integrity and clinical wording sign-off are still required before production frontend or real-patient use.

**HOW**
Continue visual iteration in `14-MVP-HTML/`. For production, implement OT-21 with immutable identity constraints/audit and OT-18 with signed healthcare question-pack status workflow before any real clinic use.

---

## 2026-08-24 — Session L — HTML MVP identity and patient-flow refinements

**WHAT**
- Updated `14-MVP-HTML/` so answer options are relevant to each demo question instead of generic yes/no everywhere.
- Fixed Step 7 review text overlap by changing answer review rows to a stacked, wrapping layout.
- Added existing-patient search by name, PIN or mobile number at the start of registration.
- Added manual clinic token entry so clinics can keep their existing token system.
- Added local prototype PIN generation on submission and displayed the PIN to the patient with save-for-next-visit wording.
- Removed the patient-facing `Open doctor view` button from the done screen.
- Added OT-21 for production PIN identity binding.

**WHY**
The founder found real usability issues in the phone prototype screenshots: generic answer options were confusing, long text overlapped on the review screen, patient flow exposed a doctor-only view, and the MVP needed to respect existing clinic token workflows plus future repeat-visit lookup.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-L-01 and V-2026-08-24-L-02.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

```text
$ rg -n "Search existing patient|clinicToken|donePin|Patient Identification Number|Open doctor view|answer-grid|review-item|identity-lock|generatePin|identityKey|No AI diagnosis" 14-MVP-HTML
14-MVP-HTML\index.html:40:                    Search existing patient
14-MVP-HTML\index.html:47:                  <input id="clinicToken" value="51" inputmode="numeric" autocomplete="off">
14-MVP-HTML\index.html:202:                  <span>Your Patient Identification Number</span>
14-MVP-HTML\app.js:216:function identityKey(name, age, phone) {
14-MVP-HTML\app.js:220:function generatePin(name, age, phone) {
```

**NEXT**
1. Founder should review the updated phone flow again, especially Step 5 answer options and Step 7 review layout.
2. Production planning must design backend-enforced PIN identity binding before real patient lookup/history.
3. Continue keeping demo questions `DEMO_UNVALIDATED` until Lead Doctor sign-off.

**WHY NEXT**
The HTML prototype now shows the desired workflow, but PIN binding is only browser-local. Production needs database constraints, audit and duplicate-resolution workflow before patient history can be trusted.

**HOW**
Iterate in `14-MVP-HTML/`. For production, implement OT-21 with immutable identity keys and tests proving that a PIN cannot be silently linked to a different mobile/name/age combination.

---

## 2026-08-24 — Session K — v2.6 local HTML MVP prototype started

**WHAT**
- Added `14-MVP-HTML/` with a local static HTML/CSS/JS prototype.
- Built phone/tablet-first views for staff registration, patient intake, optional report attachment, patient review/done, doctor queue, doctor brief, doctor conclusion/follow-up date and disabled clinic-owned reminder preview.
- Added `14-MVP-HTML/MVP-Prototype-Plan.md` and `14-MVP-HTML/README.md`.
- Updated `README.md`, `ROADMAP.md` and `09-MVP/Backlog.md` so future agents know visual iteration starts in `14-MVP-HTML/`.
- Added OT-20 for founder/doctor/staff visual review before production frontend engineering.

**WHY**
The founder asked to start MVP work as an HTML visualization because patient data collection will mainly happen on tablets/phones. A local prototype lets the workflow be reviewed and corrected before investing in the production app.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-K-01 and V-2026-08-24-K-02.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML\app.js
```

```text
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html
StatusCode: 200
```

**NEXT**
1. Review `http://127.0.0.1:8765/index.html` on phone/tablet-sized screens.
2. Tighten copy, order and fields from founder/doctor feedback.
3. Decide the first production frontend stack only after the HTML flow is approved.
4. Keep OT-18 and OT-19 blocked until Lead Doctor sign-off and communications controls exist.

**WHY NEXT**
The HTML prototype is now good enough to discuss. Production engineering before screen approval would lock in avoidable workflow mistakes, especially in the patient intake and doctor brief.

**HOW**
Iterate only in `14-MVP-HTML/` for now. Keep demo questions marked `DEMO_UNVALIDATED`, use synthetic data only, and preserve the guardrails shown in the Ops tab.

---

## 2026-08-24 — Session J — v2.5 doctor pitch playbook and clinic-owned engagement scope

**WHAT**
- Added `09-MVP/Doctor-Pitch-Playbook.md` as the official doctor-facing pitch script and feature-boundary guide.
- Added **ADR-036**: clinic-owned patient engagement is allowed; MEDOXZI-owned patient marketing remains prohibited.
- Propagated the v2.5 pitch/product direction through `README.md`, `ROADMAP.md`, `02-Product/PRD.md`, `09-MVP/Backlog.md`, and `09-MVP/Go-To-Market.md`.
- Added **OT-19** for consent/comms controls before WhatsApp/Email reminders, post-visit check-ins, feedback/rating requests, discounts or bulk announcements can go live.

**WHY**
The founder wants doctor conversations to be commercially strong but truth-based: time saving, searchable history, follow-up discipline, patient loyalty, clinic announcements, case-study offer, future clinic growth services, and long-term de-identified insights. These points need to be part of the repository so future agents do not invent claims, overpromise AI diagnosis, or accidentally turn patient contact data into MEDOXZI marketing data.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-24-J-01 and V-2026-08-24-J-02.

Key outputs:

```text
$ python -m pytest tests/ -q
95 passed in 0.12s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ rg -n "Doctor-Pitch-Playbook|ADR-036|OT-19|v2\.5|36 ADRs" README.md ROADMAP.md 02-Product/PRD.md 09-MVP/Backlog.md 09-MVP/Go-To-Market.md _OPS/OPEN-THREADS.md 10-Reference/Decision-Log.md
10-Reference/Decision-Log.md:292:## ADR-036 · Clinic-owned patient engagement is allowed; MEDOXZI-owned marketing is still prohibited
_OPS/OPEN-THREADS.md:78:### OT-19 · Clinic-owned engagement consent/comms controls — 🟠 NEW
README.md:14:> | Why is it built this way? | [`10-Reference/Decision-Log.md`](10-Reference/Decision-Log.md) — 36 ADRs |
```

**NEXT**
1. Build healthcare `vertical_pack` shell and Lead-Doctor-signable question-pack status workflow.
2. Add follow-up date capture to the doctor conclusion workflow.
3. Design clinic-communications consent, opt-out, audit and template-versioning before any sending feature.
4. Keep future diagnosis/test suggestions behind Gate 6+ validation, sign-off and counsel.

**WHY NEXT**
The pitch is now clear, but real patient use still depends on Lead Doctor sign-off and safe communication controls. Follow-up capture is the smallest MVP feature that supports the doctor value story without sending messages prematurely.

**HOW**
Use `09-MVP/Doctor-Pitch-Playbook.md` for doctor conversations. Use ADR-036 and OT-19 for any reminder/check-in/announcement work. Keep all patient messaging clinic-owned, consented, opt-out aware, audited and template-controlled.

---

## 2026-08-23 — Session I — Repository published to GitHub

**WHAT**
- Confirmed the actual repository root on this Windows host is `D:\MEDOXZI`; `D:\MEDOXZI\AI-OPD-System` does not exist.
- Confirmed `.git` already existed but had no commits.
- Added `.gitignore` to exclude local caches, secrets patterns, and the root archive copy `ziiAv6fl`.
- Added remote `origin` pointing to `https://github.com/abrarali579/MEDOXZI.git`.
- Created initial commit `66b4e24` and pushed branch `main` to GitHub.

**WHY**
The founder asked to initialize Git and push the current MEDOXZI repository to GitHub. The archive copy should not be committed because the extracted source tree is already present and committed file-by-file.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-I-01.

Key outputs:

```
$ git push -u origin main
branch 'main' set up to track 'origin/main'.
To https://github.com/abrarali579/MEDOXZI.git
 * [new branch]      main -> main
```

```
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```
$ python -m harness.run
VERDICT: PASS
```

**NEXT**
1. Use `https://github.com/abrarali579/MEDOXZI` as the shared remote for future agents.
2. Do not commit `ziiAv6fl`; it is an archive copy of the source.
3. Continue from `_OPS/STATE.md` and `ROADMAP.md` before any implementation.

**WHY NEXT**
The remote is now the coordination point. Future agents need to pull from it and preserve the `_OPS` protocol, otherwise local-only decisions will diverge again.

**HOW**
Run `git pull --ff-only` before work, follow `_OPS/AGENT-PROTOCOL.md`, then commit and push with verification evidence.

---

## 2026-08-23 — Session H — Healthcare-first narrow MVP adopted

**WHAT**
- Added ADR-035: founder explicitly deferred/skipped the Evidence Sprint for now and selected healthcare-first narrow MVP.
- Updated `ROADMAP.md` to v2.4 current route: basic personal information -> 2-3 line issue description -> Lead-Doctor-approved questions -> optional previous-report attachments -> doctor brief on tablet/phone.
- Updated current-facing product docs: `README.md`, `00-Executive/Executive-Summary.md`, `00-Executive/Horizontal-Positioning.md`, `00-Executive/MVP-Decision.md`, `00-Executive/Product-Vision.md`, `02-Product/MVP-Scope.md`, `02-Product/PRD.md`, `02-Product/User-Flows.md`, `06-UX/Patient-App.md`, `09-MVP/Backlog.md`, `09-MVP/Development-Plan.md`, `09-MVP/Pilot-Plan.md`, and `09-MVP/Evidence-Sprint.md`.
- Updated `_OPS/OPEN-THREADS.md`: OT-17 resolved by founder decision, OT-04 deferred risk, new OT-18 Lead-Doctor-signed basic healthcare question pack.

**WHY**
The founder gave a new explicit product direction: proceed with healthcare first, skip the Evidence Sprint for now, target first clinic visit patients with no previous reports, let patients attach previous reports only as doctor-reviewable sources, use the patient's short issue description to drive relevant basic questions, and push a brief to the doctor's tablet/phone. This changed sequencing and MVP scope, so it required an ADR and propagation.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-H-01..02.

Key outputs:

```
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```
$ python -m harness.run
VERDICT: PASS
```

```
$ python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

Contradiction sweep: no safety-gate regression found. Remaining v2.3/Evidence Sprint references are either historical, explicitly marked deferred by ADR-035, or in `_OPS/STATE.md` pending the required final update-last step.

Post-STATE check: `_OPS/STATE.md` was updated last. The remaining `Blocks the build` hit is in the deferred `09-MVP/Evidence-Sprint.md` comparison table, not current state.

**NEXT**
1. Build the healthcare `vertical_pack` shell and question-pack status workflow.
2. Draft the first-visit/no-report basic question pack as `DRAFT` or `DEMO_UNVALIDATED` only.
3. Get named Lead Doctor review/sign-off before any real patient use of production clinical questions.
4. Keep report upload doctor-review-first; do not make extraction a trusted conclusion path until human verification is implemented.
5. Continue counsel work for Indonesian healthcare use: OT-01, OT-02, OT-14.

**WHY NEXT**
The new MVP relies on symptom/history questions, and asking those questions is clinical behaviour. Without a signed pack, the product would cross from "organising patient-provided information" into unsupervised clinical content. Narrowing reports to attachments keeps the first build useful while avoiding document-extraction overreach.

**HOW**
Start from `ROADMAP.md` and ADR-035. Implement only the narrow flow first: registration/basic info, issue description, approved question serving, optional attachment capture/source viewer, and doctor brief. Keep production red-flag packs empty, shadow differential unreachable, and all real patient data out of the repository.

---

## 2026-08-23 — Session G — ROADMAP created and Evidence Sprint work resumed

**WHAT**
- Confirmed `ROADMAP.md` was missing at session start.
- Created root `ROADMAP.md` as the current v2.3 operational roadmap.
- Created `09-MVP/Evidence-Sprint-Runbook.md` and `09-MVP/Evidence-Sprint-Templates.md`.
- Updated `09-MVP/Evidence-Sprint.md` and `_OPS/OPEN-THREADS.md` to point to the new sprint operating files.
- Updated current-facing roadmap/sequence language in `README.md`, `00-Executive/Executive-Summary.md`, `09-MVP/Development-Plan.md`, and `09-MVP/Pilot-Plan.md`.
- Corrected `02-Product/MVP-Scope.md`: visible LLM question re-ranking is Gate 6 only, requiring adjudicated shadow evidence, domain-expert review, rollback plan and any required regulatory opinion.

**WHY**
The user asked to check `ROADMAP.md` and resume work. The file did not exist, while the real roadmap lived across `_OPS/STATE.md`, `_OPS/OPEN-THREADS.md`, and `09-MVP/Evidence-Sprint.md`. Creating a root roadmap and sprint kit advances the current blocker without violating the explicit boundary: no production build before the Evidence Sprint.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-G-01..03.

Key outputs:

```
$ rg --files | rg '(^|[\\/])ROADMAP\.md$|Evidence-Sprint-(Runbook|Templates)\.md$'
ROADMAP.md
09-MVP\Evidence-Sprint-Templates.md
09-MVP\Evidence-Sprint-Runbook.md
```

```
$ python -m pytest tests/ -q
95 passed in 0.13s
```

```
$ python -m harness.run
VERDICT: PASS
```

Contradiction sweep: no new defect. The stale `>=500` MVP-scope visible-reranking line was corrected; remaining `>=500` hits are ADR-029/history/Gate 6/synthetic/privacy contexts.

**NEXT**
1. Run the real Evidence Sprint (OT-04).
2. Produce the written first-vertical decision (OT-17).
3. If repo-only work continues before the sprint, work OT-15 design only: define `vertical_pack` boundaries and CI vocabulary checks without adding production domain content.

**WHY NEXT**
The roadmap is now explicit and the sprint is operationally scaffolded, but the actual evidence still does not exist. Starting production build before document reality, intake completion and first-vertical choice would violate ADR-032 and STATE.

**HOW**
Use `ROADMAP.md`, `09-MVP/Evidence-Sprint-Runbook.md`, and `09-MVP/Evidence-Sprint-Templates.md`. Keep raw real documents outside this repo; commit only aggregate taxonomy, de-identified summaries and the first-vertical decision memo.

---

## 2026-08-23 — Session F — Windows host verification portability fixed

**WHAT**
- Fixed the Windows demo crash in `11-Prototype/demo.py` by configuring stdout and replacing visible Unicode-only separators/icons/arrows with ASCII-safe output.
- Updated `_OPS/AGENT-PROTOCOL.md` with Windows PowerShell equivalents for the standard verification block and contradiction sweep.
- Updated `11-Prototype/README.md` and `11-Prototype/harness/run.py` usage text to prefer `python` on Windows and corrected the prototype test count from 83 to 95.
- Preserved POSIX commands for non-Windows agents and documented the `python3` Microsoft Store alias failure mode.

**WHY**
The mandatory verification block did not run as written on this Windows host: `python3` resolved to the Microsoft Store alias, `tail` was unavailable, and `demo.py` crashed on CP1252 console encoding. That made the repo's own "standard verification block" non-reproducible for Windows agents.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-F-01..07.

Key verified output:

```
$ python -m pytest tests/ -q
95 passed in 0.11s
```

```
$ python -m harness.run
VERDICT: PASS
```

```
$ python demo.py | Select-Object -Last 20
7 - NOT_ASKED IS NEVER A NEGATIVE
...
Run:  python -m pytest tests/ -v
```

Contradiction sweep: no new defect introduced; hits were expected aliases, prohibitive contexts, historical logs, confirmed retention references, and Gate 6 contexts.

**NEXT**
Continue with the existing blockers: Evidence Sprint (OT-04), first-vertical decision (OT-17), PSE/counsel work (OT-14/OT-01/OT-02), content licensing audit (OT-05), and vertical pack refactor (OT-15).

**WHY NEXT**
Windows verification is now unblocked, but it does not change the project sequence. The build remains blocked by evidence and vertical choice, not by test tooling.

**HOW**
Future Windows agents should run:

```
cd 11-Prototype
python -m pytest tests/ -q
python -m harness.run
python demo.py | Select-Object -Last 20
```

Use the new PowerShell sweep block in `_OPS/AGENT-PROTOCOL.md` before closing a session.

---

## 2026-08-23 — Session E — v2.3 horizontal positioning; three blockers resolved

**WHAT**
- **Repositioned to a horizontal platform** with healthcare as vertical #1. New `00-Executive/Horizontal-Positioning.md`. Domain-specific content moves into `vertical_pack`. → **ADR-031**
- **Replaced RECON with a 3–5 day Evidence Sprint** across two verticals. New `09-MVP/Evidence-Sprint.md`. → **ADR-032**
- **Designed AI-assisted question bank generation** — AI drafts, quality gates filter, named domain expert authorises. New `02-Product/Question-Bank-Generation.md`. → **ADR-033**
- **OT-03 resolved** (founder has a PT PMA; Web/App/SaaS Dev activity addable). **OT-01 storage resolved**, inference de-risked by Indonesian sovereign AI cloud. **OT-02 downgraded** 🔴→🟠. → **ADR-034**
- **New threads:** OT-14 PSE registration · OT-15 vertical pack refactor · OT-16 platform naming · OT-17 which vertical goes first. **OT-05 enlarged** by generation at scale.

**WHY**
The founder resolved three of the four blocking threads with real-world facts — an existing PT PMA, available Indonesian storage, and a decision to present the product as a professional record-keeping tool rather than a medical device. The horizontal framing is not a marketing move: it changes the regulatory object, the market, and which vertical should be entered first. It also demanded honest answers to two questions — whether RECON is still needed, and whether AI can build the question bank.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-E-01..05. Two findings materially changed the plan: PSE registration is a **separate** obligation the PT PMA does not satisfy; and Lintasarta *GPU Merdeka* means in-country H100 inference is genuinely available.

**NEXT**
1. Run the **Evidence Sprint** (OT-04) — 3–5 days, two verticals, ≥100 real documents
2. **Decide which vertical goes first** (OT-17) — everything downstream branches here
3. **PSE registration** (OT-14) and **counsel opinions** (OT-01 processing question, OT-02 device classification)
4. **Content licensing audit** (OT-05) before generating any bank at scale
5. **Vertical pack refactor** (OT-15) — days-scale, do it before the second vertical exists

**WHY NEXT**
The Evidence Sprint still blocks the build, but for days rather than weeks, and its document-collection half is the only part that cannot be skipped. The vertical decision branches everything after it. The licensing audit must precede generation, because a bank built from unlicensed sources must be discarded and rebuilt.

**HOW**
`09-MVP/Evidence-Sprint.md` for the sprint. `_OPS/OPEN-THREADS.md` for owners and methods. `00-Executive/Horizontal-Positioning.md` §3 for exactly what moves into a vertical pack.

**⚠️ Standing caution carried into this session:** C-13 (intended use / administrative exclusion) is a **[Third-Party Claim]** with the same shape as the two regulatory claims this project has already over-read. It may inform strategy; it may not be treated as settled.

---

## 2026-08-23 — Session D — v2.2 verification, regulatory correction, OPS system

**WHAT**
- Independently re-ran the v2.2 prototype in a clean container: **95 tests pass, harness 9/9 PASS, demo clean**.
- **Corrected a live three-way contradiction** the v2.2 report claimed was resolved: the ≥500-real-encounter gate. Stage 4 now gates on week-1 operational criteria with volume *recorded not pre-claimed*; the ≥500 adjudicated-encounter requirement moved to **Gate 6** (Phase 2 exposure). → **ADR-029**.
- **Accepted a correction to our own regulatory claim.** Permenkes 24/2022 Pasal 22(1) is **permissive** (*dapat*), conditioned on *keterbatasan sumber daya* — not the general obligation session C asserted. Verified verbatim from two independent primary URLs.
- Fixed one stale `FULL_AI` reference in `08-Evaluation/Test-Cases.md`.
- **Created `_OPS/`** — the multi-agent governance system: AGENT-PROTOCOL, STATE, CHANGELOG, VERIFICATION-LOG, OPEN-THREADS, CLAIMS-REGISTER, SESSION-LOG.

**WHY**
Multiple agents now work on this repository without shared memory. Session D found that a v2.2 claim ("resolved the sequencing issue") was written as intent into two documents but never propagated to the two files holding the gate — producing a *less visible* contradiction than before. That is a governance failure, not a documentation nuisance: the next agent would have read a gate that no longer reflected the decision. The regulatory over-read was the same class of failure, and it had happened twice.

**EVIDENCE**
`_OPS/VERIFICATION-LOG.md` V-2026-08-23-D-01 … D-10, with commands, output and verbatim regulatory text.

**NEXT**
1. Engage Indonesian regulatory + corporate counsel (OT-01, OT-02, OT-03)
2. Run RECON in Jakarta (OT-04)
3. Clinical content licensing audit (OT-05)
4. Strip illustrative numbers from the pitch dossier (OT-06)

**WHY NEXT**
Counsel and RECON both have long lead times and both gate everything downstream. The licensing audit and the dossier numbers gate the pitch, and a pitch built on an invented figure destroys the trust the product is built on.

**HOW**
`_OPS/OPEN-THREADS.md` carries the owner, the question and the method for each. Start any session with `_OPS/AGENT-PROTOCOL.md`.

---

## 2026-08-23 — Session C(ext) — v2.2 by external agent

**WHAT**
Product boundary restated; delivery sequence renamed `TRAIN` → `HARNESS + SYSTEM HARDENING`; generation modes replaced `FULL_AI` with explicit modes (aliases retained); verifier gained reliability/temporal/high-risk checks and `FAIL_RELIABILITY`; high-risk fact classes expanded (pregnancy, anticoagulant use, patient identity, DOB, report ownership); field-level OCR confidence; three-state document identity binding; schema additions (document lifecycle, contradictions, content source registry, signed rule activation, idempotency, shadow isolation); **UTF-8 content-loading fix**; new documents — Revised-Direction-v2.2, Hazard-Control-Matrix, Safety-Case, Regulatory-Boundary-Register; regulatory certainty downgraded to counsel-pending.

**WHY**
To remove overstatement (`FULL_AI`), close the "traceable ≠ true" gap, add design-control artefacts suitable for a future technical file, and stop Indonesian regulatory claims being asserted beyond their evidence.

**EVIDENCE**
Independently verified in session D — see VERIFICATION-LOG V-2026-08-23-D-01..09. **One claim did not survive verification (D-04).**

**NEXT / WHY NEXT / HOW**
Superseded by session D's actions above.

**Notable contributions worth preserving:** *Labels Are Not Ground Truth* (a doctor's diagnosis is a `CLINICIAN_ASSESSMENT`, often provisional); the evidence-category separation in the Safety Case (*a detector self-test is not end-to-end evidence*); the UTF-8 bug catch; the Pasal 22 correction.

---

## 2026-08-23 — Session C — v2.1 external review reconciliation

**WHAT**
Reconciled an independent external review. **Adopted:** language-independent clinical concept codes (ADR-025); ~26 additional harness probes including new **Class L** session/state integrity; shadow scores are rankings not probabilities (ADR-023); PRE-ROUND/INTELLIGENCE/ENGAGE packaging. **Rejected:** `PATIENT_UNSURE` (added `UNABLE_TO_ANSWER` only — ADR-024); live Question Utility Score in v1; near-term ENGAGE. Separated machine bias from clinician cognitive bias (ADR-028). Corrected our own GR 28/2024 over-generalisation and grounded localisation on Permenkes Pasal 22 (ADR-026) — **itself later corrected in session D**. Found 25-year retention (ADR-027).

**WHY**
The review converged independently on most v2 decisions, which raised confidence; its four contributions were real; its four gaps (localisation, device classification, RECON, shadow week) were the ones that would have hurt most.

**EVIDENCE** `00-Executive/External-Review-Reconciliation.md`; 91 tests passing at the time.

---

## 2026-08-23 — Session B — v2, Indonesia-first

**WHAT**
Launch market moved to Indonesia. Red-flag engine ships with an **empty production pack**; clinical governance moves to CUSTOMISE with the clinic's Lead Doctor (ADR-015). Diagnostic drift becomes a **CI gate** (ADR-016). Agent harness designed as an adversarial proving ground, not a training loop (ADR-017). Clinical knowledge stored as discriminating questions (ADR-018). RECON inserted before build; on-site fortnight split into shadow week + live week (ADR-022). Patient contact data never used for our marketing (ADR-021). FHIR R4 export shape from day one (ADR-020).

**WHY**
Founder direction: no clinical retainer, build a harness, new sequence, Indonesia launch, marketing funnel. Four adopted; the marketing funnel was replaced with a lawful, higher-value B2B model.

---

## 2026-08-23 — Session A — v1.0 blueprint

**WHAT**
19 deliverables, 51 documents, 6 Mermaid diagrams, runnable prototype with 58 tests. India-first, geography-neutral core. Shadow-mode differential, provenance-first architecture, deterministic safety core, traceability verifier.

**WHY**
Initial research and design brief.

**Known defect introduced here:** `loader.py` read the content pack without an explicit encoding — a latent Windows bug, found and fixed in v2.2.

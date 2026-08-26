# STATE — where this project actually is

**Updated:** 2026-08-25, session AD (compact landscape Pre-Visit Review)
**Repository version:** **v2.6**
**Read this first. Update it last.**

---

## 1. One-paragraph status

The design blueprint is complete and internally consistent. The Python prototype passes **100 tests** and the harness passes **9/9 gates** (latest re-run: session AD, V-2026-08-25-AD-01). **No production app exists yet.** Session H records an explicit founder decision to defer/skip the Evidence Sprint for now and proceed with a **healthcare-first narrow MVP**: basic personal information, a 2-3 line patient issue description, Lead-Doctor-approved basic questions, optional previous-report attachments for doctor review, and a doctor brief pushed to the doctor's tablet/phone. Best initial patients are first clinic visits with no previous reports. Session J adds the official doctor-facing pitch playbook and accepts clinic-owned reminders/check-ins/announcements as product direction under ADR-036, but no WhatsApp/Email sending may go live until consent, opt-out, audit and template controls exist. Sessions K-AD maintain local visual iteration in `14-MVP-HTML/`: a synthetic HTML prototype covering the restored `faf4e71` split-records flow (welcome/search, front-desk registration, returning-patient selection, four digit prototype PINs, manual clinic token entry, patient phone/tablet intake with direct-tab prefill, complaint-specific demo questions, optional reports/upload-card review, PIN display, separate Patient Records and Record Viewer tabs) plus a doctor-only polished Pre-visit Review command center. Session AB's journey-first workflow strip/landing redesign was rejected and superseded by session AC; do not treat it as current product state. Session AD records Abrar's current Doctor Review preference: **landscape tablet first**, compact queue/header in the Pre-visit tab, no visible doctor-tab breadcrumb/Demo Clinic/Live/Synthetic chips, a wider selected patient card carrying profile/previous-record/file actions, no separate doctor patient-header card, and no separate Reports & attachments card. Doctor Review remains clinician-owned documentation support with current + two incoming patients, structured feedback, allergies + vitals, close question-answer rows, doctor-entered priority diagnosis fields, doctor-selected relevant tests, plan category buttons, follow-up controls, sticky assessment actions, disabled messaging preview, and data-capture helper ideas. DeepSeek output remains labeled triage suggestions; the doctor retains final discretion. Session P records the founder's strategic blocker resolutions and builds the **vertical question-pack shell**; ADR-038/ADR-039 later activate the 40 literature packs under founder override while never fabricating clinician sign-off (`signed_at` remains null). Session U adds a curated **Graphify current-state graph** for token-efficient handoff and project navigation: `graphify-current-state/graphify-out/GRAPH_REPORT.md`, `graphify-current-state/graphify-out/graph.html`, and `graphify-current-state/graphify-out/graph.json` (refreshed in session AD; 73 nodes, 130 edges, 15 communities, 0 token cost). Root `AGENTS.md` now tells future agents to use Graphify before broad raw-file reading. The v2.3 horizontal architecture discipline remains useful where practical, but healthcare is now the committed first vertical by ADR-035. Session I published the repository to `https://github.com/abrarali579/MEDOXZI`. Sessions Z-AA add and harden Vercel deployment infrastructure for the HTML MVP: `14-MVP-HTML/vercel.json` + serverless `14-MVP-HTML/api/questions.js` support Root Directory=`14-MVP-HTML`, while root `vercel.json` + root `api/questions.js` support repo-root Vercel imports by rewriting static paths into `14-MVP-HTML/` and forwarding `/api/questions`. Live production is verified as of session AD: `https://medoxzi.vercel.app/` serves the compact doctor UI after commit `8b109f7`, and `POST /api/questions` returns 200.

## 2. Product boundary (do not drift from this)

**A healthcare-first professional intake and doctor-briefing platform.**

```
Patient → Basic information → Issue description → Relevant questions → Optional reports → Doctor brief → Doctor decision
```

The current MVP is healthcare-first, but still **not** a diagnosis engine, symptom checker, prescribing system, treatment recommender, or autonomous clinical agent. The doctor brief organises source-bound information; it does not make a clinical conclusion.

Doctor-facing pitch language now lives in `09-MVP/Doctor-Pitch-Playbook.md`. Use it for founder/doctor conversations and forbidden claims.

Local MVP visualization now lives in `14-MVP-HTML/index.html`. Use it for screen review before production frontend engineering.

⚠️ **The horizontal claim is only protective if the architecture is genuinely horizontal.** See ADR-031's three binding rules.

## 3. Where we are in the sequence

```
HEALTHCARE-FIRST NARROW MVP → VISUAL HTML MVP → SCREEN LOCK →
LEAD DOCTOR CUSTOMISE + SIGN-OFF → HARNESS+HARDENING → PITCH / PILOT CLINIC → CLIENT 1 SHADOW (wk1) → LIVE (wk2) → IMPROVE → V1 FREEZE
   ▲
   └── WE ARE HERE (visual prototype started; production app not built)
```

**Nothing downstream has begun.** For healthcare, the required domain expert is the **Lead Doctor**. Production clinical questions and any red-flag/escalation content remain inactive until signed.

## 4. Verified state of the code

Last verified **session AD**, by re-running on the Windows host after compacting only the Doctor / Pre-visit Review landscape tablet layout. Evidence: VERIFICATION-LOG V-2026-08-25-AD-01.

| Check | Result |
|---|---|
| `python -m pytest tests/ -q` | **100 passed** |
| `python -m harness.run` | **VERDICT: PASS** |
| `python demo.py \| Select-Object -Last 20` | runs clean |
| `node --check 14-MVP-HTML\app.js` + `server.js` + `14-MVP-HTML\api\questions.js` + root `api\questions.js` | syntax check passed |
| Vercel handler smoke tests | subdir handler + root wrapper both return controlled `NO_API_KEY` JSON when no key is set |
| Browser UI check | default restored `view-welcome` keeps normal topbar/tabs; Pre-visit Review toggles compact doctor shell only; doctor tab has 3 queue cards, 1 wider current card, logo/bell/profile in queue strip, no separate patient-header card, no separate attachment card, previous-record/file actions inside selected card, 3 diagnosis inputs, relevant-test buttons, BP/pulse/temp/weight vitals, no SpO2, no console errors, and 1024x768 landscape tablet fits vertically with no horizontal overflow |
| `Invoke-WebRequest http://127.0.0.1:8765/index.html` | **200** |
| Doctor past-file live-browser (session O) | complaint filter "Cough" → 2 of 15; date filter → 1 of 15; Clear filters → 15 of 15; PIN 6184 opens "current + past" split review; 0 JS errors |
| Graphify current-state graph (session AD refresh) | **73 nodes, 130 edges, 15 communities, 0 token cost** |

## 5. Blocking threads

| Thread | Status | Why |
|---|---|---|
| **OT-18 · AI-drafted screening question pack** | 🟡 **Drafts in progress; activation still needs doctor discretion** | Founder de-scoped (session P): question banks designed from medical literature by AI, purely screening (relevant questions) with **no diagnosis**; the doctor keeps **full discretion** to act or not. Candidate packs are `DEMO_UNVALIDATED` until a clinician supplies metadata/sources. |
| **OT-02 · Medical device classification** | ⚪ **REMOVED by founder (session P)** | Founder: no diagnosis is made; the product is a time-saving/data-organising clinic SaaS, not a regulated medical device. Counsel may still advise but this no longer blocks. |
| **OT-14 · PSE registration** | 🟠 **OWNER = founder** | Founder has PT/PMA and will handle all PSE requirements (session P). |
| **OT-19 · Clinic-owned engagement consent/comms controls** | 🟡 **REDUCED** | Founder (session P): clear consent will be captured **at data submission** for follow-up and reminders/announcements. Messaging still needs the consent/opt-out/audit/template controls before go-live (ADR-036 holds). |
| **OT-20 · HTML MVP visual review and screen lock** | 🟡 **Blocks production frontend scope** | Founder/doctor/staff should review the local HTML prototype before production frontend work. |
| **OT-21 · Production PIN identity binding** | 🟡 **DESIGN UPDATED (session P)** | Founder: use a **larger PIN**, exposed **only in the doctor's records** (not the main list). Prototype collision/scoping risk (OT-21 sub-note) still applies to production identity. |
| **OT-04 · Evidence Sprint** | ⚪ **Deferred risk** | Founder deferred/skipped it for now by ADR-035; document reality risk remains accepted, not disproven. |
| **OT-17 · Which vertical goes first** | ✅ **Resolved** | Healthcare-first selected by founder in ADR-035. |

**Downgraded in session E:** OT-01 (storage resolved, inference feasible) · OT-02 (positioning strengthens it) · OT-03 (**resolved** — PT PMA exists).
**New in session H:** OT-18 Lead-Doctor-signed basic healthcare question pack.
**New in session J:** OT-19 Clinic-owned engagement consent/comms controls.
**New in session K:** OT-20 HTML MVP visual review and screen lock.
**New in session L:** OT-21 Production PIN identity binding.
**Session M update:** OT-20 prototype review scope now includes returning-patient PIN selection sync, complaint-specific demo questions, helper chips and data-capture feature ideas.
**Session N update:** OT-20 prototype review scope now includes four digit PINs and doctor-side old-file search/open flow; OT-21 must handle scoped uniqueness/collision risk if four digit visible PINs survive into production.
**Session O update:** OT-20 prototype review scope now includes the doctor past-file filter controls and the current+past split review; OT-21 collision/scoping risk documented (4-digit space trivially collidable near ~119 records; identity stays a composite of PIN + name + age + mobile; production to scope PIN per clinic with an immutable internal patient key).
**Session P update:** founder resolved OT-18 (AI-drafted screening bank, no diagnosis, doctor discretion), OT-02 (removed — SaaS, not device), OT-14 (owner=founder), OT-19 (consent at data submission), OT-21 (larger PIN, doctor records only), OT-05 (AI + harness design). Vertical question-pack shell + local-model draft pipeline + 15-min cron autopilot created.

**Session U update:** Graphify current-state graph and next-chat handoff are saved. Future agents should use `AGENTS.md`, then `graphify-current-state/graphify-out/GRAPH_REPORT.md`, then `graphify query "<question>" --graph graphify-current-state/graphify-out/graph.json` for project-state/link questions before broad file reading.

**Session V update:** Onboarding-only baseline completed. Graphify-first query returned the 68-node current-state map; verification stayed green (100 tests, harness PASS, demo clean, HTML MVP syntax OK); contradiction sweep found contextual hits only. No product behaviour or open-thread priority changed. Pre-existing untracked `package-lock.json` remains untouched.

**Session W update:** HTML MVP v0.5 workspace polish completed from the attached screenshot direction. `14-MVP-HTML/` now uses a dark MEDOXZI navigation rail, white top bar, tighter clinical cards, professional visible text, a patient review/upload card, polished doctor review/records layout, and responsive desktop/mobile styling. Browser verification covered desktop welcome, desktop doctor review, mobile patient intake, and mobile ops with no console errors and no undersized visible controls. Graphify current-state source and graph were refreshed (68 nodes, 119 edges, 12 communities). No safety boundary changed.

**Session X update:** HTML MVP v0.6 POV workflow split completed. Patient Intake now pre-fills from the current front-desk registration when opened directly; Pre-visit Review now shows only the highlighted current patient plus two incoming patients; Patient Records and Record Viewer are separate tabs; selecting a record opens the viewer; the viewer can compare a past record with the current visit; subtle animations were added with a reduced-motion fallback. Browser verification covered desktop and mobile patient/direct-intake, Pre-visit, Records, Viewer, and compare flow with no console errors and no undersized visible controls. Graphify current-state source and graph were refreshed (72 nodes, 127 edges, 11 communities). No safety boundary changed.

**Session Y update:** HTML MVP v0.7 final doctor command center completed from the founder's final concept image. The default visible screen is now a full-width Pre-visit Review workspace with current + next-two queue, structured feedback, patient profile + previous record actions, allergies + vitals without SpO2, close question-answer rows, attachment row, doctor-entered priority diagnosis inputs, doctor-selected relevant tests, plan category buttons, follow-up controls, and sticky assessment actions. Browser verification covered desktop and mobile with no console errors, no undersized visible controls, 3 diagnosis inputs, `hasSpO2: false`, and the current queue highlight intact. Graphify current-state source and graph were refreshed (72 nodes, 126 edges, 14 communities). No safety boundary changed: these are clinician-owned documentation controls, not AI diagnosis or treatment advice.

**Session Z update:** Vercel deployment infrastructure added (deployment-only; no clinical or safety change). `14-MVP-HTML/vercel.json` + serverless `14-MVP-HTML/api/questions.js` let the HTML MVP deploy to Vercel as Other/static with the DeepSeek question-suggestion endpoint running as a serverless function. Verified locally (node --check + handler smoke test); production pending live deploy + `DEEPSEEK_API_KEY` env var.

**Session AA update:** Vercel production crash fix added root-level deployment fallbacks after `https://medoxzi.vercel.app/` and `/index.html` returned `FUNCTION_INVOCATION_FAILED`. Repo-root Vercel imports now serve the HTML MVP through root `vercel.json` rewrites into `14-MVP-HTML/`, and root `/api/questions` is forwarded by `api/questions.js` to the existing subdir handler. The subdir Root Directory=`14-MVP-HTML` setup remains supported. This is deployment-only; no product workflow or clinical/safety boundary changed. Local checks are green, and live production is confirmed: `/` 200 HTML, `/index.html` 200 HTML, and `POST /api/questions` 200 DeepSeek JSON.

**Session AB update:** HTML MVP v0.8 journey-first polish completed. The local app now opens at Patient arrival/search instead of Doctor Review, and a visible workflow strip exposes Patient arrival, Front desk, Patient intake, Doctor review, Records, and Operations. Doctor Review keeps the final command-center controls (current + next two queue, previous record action, vitals without SpO2, 3 doctor-entered diagnosis fields, doctor-selected tests). Browser verification covered desktop and mobile with no console errors and no horizontal overflow. Graphify current-state graph refreshed (72 nodes, 126 edges, 14 communities). No safety boundary changed.

**Session AC correction:** Abrar rejected Session AB and requested restore to `faf4e71 feat(mvp-html): split records workflow`. Current state restores that split-records intake/records flow and applies only the Doctor / Pre-visit Review polish from the provided image. Do not reintroduce Session AB's workflow strip or cross-screen landing redesign unless Abrar explicitly asks. Localhost remains live at `http://localhost:8765/`; browser verification covered desktop, 1024 tablet, 820 portrait tablet, and 768 portrait tablet with no horizontal overflow or console errors.

**Session AC deploy update:** commit `ef7adf2` was pushed to `main`. Production `https://medoxzi.vercel.app/` returned 200 and contained `Doctor-entered`, `Patient records`, `Previous record`, and `Structured feedback` while not containing `workflow-strip`; live `POST /api/questions` returned 200.

**Session AD update:** Doctor / Pre-visit Review now follows Abrar's compact landscape-tablet preference. The doctor tab hides the global topbar/sidebar only for that tab, puts MEDOXZI logo + queue + bell + DA profile into one compact queue/header strip, makes the selected patient card wider than incoming patients, and folds profile/previous-record/file actions into the selected card. Do not re-add the separate doctor patient-header card or separate Reports & attachments card without explicit approval. Other restored split-records screens remain unchanged.

**Session AD deploy update:** commit `8b109f7` was pushed to `main`. Production `https://medoxzi.vercel.app/` browser check at 1024x768 returned compact doctor markers: `doctorShell: true`, 3 queue cards, 1 wider current card, no standalone patient/attachment cards, logo/bell/profile in queue strip, Previous record + View + Download actions present, no SpO2, no horizontal overflow, `scrollHeight: 768`; live `POST /api/questions` returned 200.

**Session AE update:** `14-MVP-HTML/` header cleaned everywhere. Removed the global Demo Clinic / Live / Synthetic prototype chips, the brand-mark M logo, and the whole left sidebar nav (brand + tabs + "Demo clinic workspace" box). Navigation now behind a single 3-dots `⋯` button at the top-left of the topbar — **rev v2:** pressing it opens a LEFT slide-in drawer (full-height panel with dim backdrop, MEDOXZI logo header, close ✕, the 6 views, and on Pre-visit review the SECTIONS toggles for Intake responses / Doctor entry). Backdrop click and Escape close it; selecting a view switches + auto-closes. **rev v3:** removed the topbar "Medoxzi / <tab>" breadcrumb text entirely — the topbar now shows only the `⋯` button. **rev v4:** fixed phone-width horizontal overflow on Pre-visit Review (Intake responses / Doctor entry cards were clipping off-screen) by adding a `@media (max-width: 620px)` `body.doctor-shell` block (single-column, entry card block, choice-row 2-col, overflow-x hidden) — verified no overflow at 360/415/500/600px. **rev v4 hardening:** added `overflow-x: hidden` on the base `body` + `overflow-y: auto` so no view can push text off-screen at phone width (all 6 views at 390px verified overflow:false). If the phone still shows overflow after redeploy, the cause is browser cache — hard-refresh / clear site data. `.app-shell` is full-width block. Verified: 100 tests / harness PASS / demo clean / `node --check` OK / browser 0 console errors, and menu open/close + view switching + section toggles confirmed. Supersedes the doctor-only chrome removal (Session AD) by applying the cleanup across all screens. Founder to commit + push to redeploy.
**Session AE rev v5:** removed the overlapping ".doctor-safety" banner ("No clinic-approved safety rules are active") from Pre-visit Review and compacted the 3-dots topbar (padding 18->8px, menu-trigger 44->34px) — verified banner gone + single-column doctor view at 390px.
**Session AF update:** `/api/questions` converted from a batch-of-4 to an adaptive one-question-at-a-time interviewer. Backend `suggestNextQuestion(brief, complaint, patient, answers)` asks DeepSeek for the NEXT single question given the brief + all answered pairs (never re-asks, 4 options with escape, no diagnosis/treatment). Frontend fetches the next question AFTER each answer; the spinner now spins only during the real LLM call and stops when the question arrives (was spinning continuously). Min 5 / max 12 questions enforced client-side; falls back to the static bank on error/done-under-5. Verified (real key): questions branch on prior answers (Q2 on a1, Q3 on a1+a2), spinner stops each time, reached review at 8 answers, 0 console errors; pytest 100 passed / harness PASS / node --check OK.
**Session AG update:** intake/doctor UI fix batch (founder review round): (1) workflow step + answers persist across refresh (localStorage); (2) Allergies + Vitals now editable; (3) loading circle replaced with an interview progress bar that fills toward 100% as questions are answered; (4) accumulated `#answerSummary` capped at 30vh + overflow scroll (page no longer grows); (5) review step redesigned as a two-pane `.review-split` (intro/details left, consents+answers right) — stacks below 680px; (6) `dxTerms` datalist (28 terms) gives diagnosis word suggestions while the doctor types; (7) Relevant tests (multi-select) + Plan category (single-select) now clickable. Verified live (localhost): 0 console errors, persistence, progress 0->13%, two-pane review, tests multi/plan single select. pytest 100 passed / node --check OK.
**Session AH update:** intake questioner polish (founder review round 2): consolidated the 3 stacked green progress lines into a SINGLE `#progressBar` with a numeric `#stepPct` (removed `#stepIndicator` dots + `#interviewProgress`); removed the "Thinking about what to ask next..." text; wrapped question+options in a `.question-block` (min-height 150px) so they hide/reappear together with no stale options and no vertical jump; strengthened the DeepSeek never-re-ask prompt (both api/questions.js + server.js) so it no longer re-asks onset/duration when the brief already states it (verified: brief "knee pain started 3 days ago" -> Q1 characterizes pain type); widened `.patient-card` (520->1080px) + `.welcome-panel` (660->1080px) to fill the tablet, doctor view unchanged. Verifed live: 0 console errors, single bar + %, no re-ask, no jump. pytest 100 passed / node --check OK.

**Session S (cron) update — ⚠️ GATE-DRIFT WATCH:** this cron run found `gate_literature.py` reporting **39 CLEAN / 1 BLOCKED**, not the documented **28 CLEAN / 12 BLOCKED**. Cause: an uncommitted (unstaged) edit to all 40 `literature/*.json` packs + `tools/build_from_questionbank.py` removes the red-flag screens and bumps `source_bank` to v1.1. The builder docstring claims a "Session S/2026-08-24 founder decision" (no red flags, OPD-only patients) but **no Session S log, CHANGELOG entry, or ADR exists** to corroborate it. Per protocol rule 1 (no claim without evidence) this remains unverified. Both the previous CRON-01 run and session RT recorded 28/12 with a clean tree, so these edits are new and unattributed. **No commit was made and nothing was reverted** this run. Abrar must confirm whether the red-flag removal is a real founder decision (then log it and commit) or an accidental local experiment (then revert). Even if founder-approved, cleared packs remain `DEMO_UNVALIDATED` and need Lead Doctor sign-off (OT-18) for real patients. See V-CRON-02.

**Session S(v1.1) update — ✅ RESOLVED (ADR-038, committed):** the above gate-drift watch is now closed. The working-tree changes were the real, founder-authorized **ADR-038** resolution (recorded in `10-Reference/Decision-Log.md`; founder's routine-OPD-only scope — no red flags because the clinic never handles emergencies). Verified green this run: `gate_literature.py` **CLEAN 40 / BLOCKED 0**, `pytest` **100 passed**, `harness.run` **VERDICT PASS (9/9)**, `node --check` OK, `diseases.json` version **1.1**, D14 carries the founder-authorized wording (no `emergency` hit). Committed the ADR-038 engineering state with full log trail (session log `2026-08-24-SV11-cron-adr038-commit.md`, CHANGELOG, V-CRON-03). **All 40 packs remain DEMO_UNVALIDATED; OT-18 named Lead Doctor sign-off still required before real-patient use** — the gate 40/0 is an engineering/harness result, not clinical sign-off.

**Session SV13 update — 🔄 ADR-039 founder override: 40 packs ACTIVATED.**
Session S(v1.1) had committed the ADR-038 state with all 40 packs `DEMO_UNVALIDATED`. Later the founder, via a named-choice clarification, selected **option (D) — "permanently remove loader invariant + promotion gate for all packs, full override"** and stated activation should be allowed ("Activation ky liye sb Allow kro", "No Sign Off required"). This is recorded as **ADR-039** in `10-Reference/Decision-Log.md`. Applied this session:

- `loader.py`: removed the ACTIVE-without-`safety_rules` `ValueError` invariant.
- `vertical_to_contentpack.py`: removed the signed-ACTIVE refusal; CLEAN/ACTIVE packs now load (bridge **40 loadable / 0 refused**).
- `tools/_promote_active_adr039.py`: promoted all 40 `literature/*.json` packs to `status: ACTIVE`, `signed_at: null`.
- `tests/test_contentpack_bridge.py`: updated to assert ACTIVE-with-zero-rules is loadable and `signed_at` is never fabricated.
- README + GATE-REPORT: documented the ADR-039 override.
- Verified: `pytest` **100 passed**, `harness.run` **VERDICT PASS**, `gate_literature` **CLEAN 40 / BLOCKED 0 (308 questions)**, `demo.py` clean, `node --check` OK.

**Integrity note:** `signed_at` stays `null` and `is_signed` stays `False` for all packs — a named-Lead-Doctor clinical sign-off is **never fabricated**, the founder waived the OT-18 named-signer gate rather than inventing one. The ADR-039 override applies to these 40 packs only; future packs still follow the standard lifecycle.

## 6. Settled decisions (38 ADRs)

| # | Decision | ADR |
|---|---|---|
| 1 | **Healthcare-first narrow MVP**; Evidence Sprint deferred by founder decision | **ADR-035** |
| 1b | **Clinic-owned patient engagement allowed**; MEDOXZI-owned patient marketing still prohibited | **ADR-036** |
| 2 | **Horizontal platform discipline, vertical packs**; engine should know nothing domain-specific where feasible | **ADR-031** |
| 3 | **Evidence Sprint** replaced RECON but is now deferred for immediate sequencing | **ADR-032 / ADR-035** |
| 4 | **AI drafts question banks; a named expert authorises** | **ADR-033** |
| 5 | In-country inference feasible; **storage location ≠ processing location** | **ADR-034** |
| 6 | Red-flag packs ship **empty**; expert signs at CUSTOMISE | ADR-015 |
| 7 | Differential runs in **shadow only**, isolated from all care paths | v1, hardened v2.2 |
| 8 | Shadow outputs are **rankings, never probabilities** | ADR-023 |
| 9 | Knowledge stored as **discriminating questions**, not disease profiles | ADR-018 |
| 10 | **Patient contact data never used for our marketing** | ADR-021 |
| 11 | Diagnostic drift prevented by a **CI gate**, not a person | ADR-016 |
| 12 | Language-independent **concept codes** | ADR-025 |
| 13 | **25-year retention** changes deletion semantics | ADR-027 |
| 14 | **≥500 real encounters** gates Phase 2 exposure, not week-1 shadow | ADR-029 |
| 15 | **Traceable ≠ true** — verifier checks reliability and temporal status | v2.2 |
| 16 | Expert diagnoses are **assessments**, not ground truth | v2.2 |
| 17 | Governance lives in `_OPS/` | ADR-030 |
| 18 | **Question banks designed from medical literature by AI, purely screening with no diagnosis; doctor keeps full discretion; product is a time-saving/data-organising clinic SaaS (not a device); PSE owned by founder; consent captured at data submission; larger PIN in doctor records only** | **ADR-037** |
| 19 | **Drop red-flag screens from patient question packs (routine-OPD-only scope); adopt QuestionBank v1.1 history wording; one founder-authorized D14 wording fix; all packs stay DEMO_UNVALIDATED** | **ADR-038** |

## 7. What is genuinely unknown

| Unknown | Blocks | Owner |
|---|---|---|
| Will first-visit OPD patients complete the short intake | The product thesis | Pilot / first clinic |
| Which questions may be asked in production | Real patient use | Lead Doctor sign-off |
| What real previous reports look like | Trusted extraction architecture, cost model | Deferred Evidence Sprint or pilot sample |
| Is the platform a regulated device in Indonesia? | Healthcare launch | Counsel ⚖️ |
| Is *processing* treated separately from *storage*? | AI architecture | Counsel ⚖️ |
| GPU Merdeka pricing, availability, allocatable capacity | Cost model | Engineering — get a quote |
| Are our content sources licensed for commercial use? | Generating any bank at scale | Founder + counsel ⚖️ |

## 8. Immediate next actions

| # | Action | Why now |
|---|---|---|
| 1 | **Use Graphify first for project-state / architecture / file-link questions** | Saves tokens and gives new agents a map before raw-file reading |
| 2 | **Review polished `14-MVP-HTML/index.html` on phone/tablet/doctor-desktop dimensions** | Confirms the v0.7 final doctor command center, four digit PINs, returning-patient selection sync, complaint-specific demo options, helper chips, review/upload card, PIN/done screen, **Pre-visit current+incoming queue, structured feedback, patient profile + previous record action, vitals, doctor-entered diagnosis fields, doctor-selected tests, plan categories** and data-capture ideas before production frontend engineering |
| 3 | **Design production PIN identity binding** (OT-21) | Patient history must not attach to the wrong mobile/name/age identity |
| 4 | **Vertical question-pack shell + pipeline built (session P)** — `vertical_pack/` shell, schema README, `draft_pack.py` local-model pipeline, cron autopilot; draft most-common complaints | Screens screening intake safely; AI drafts candidate questions only, never clinical metadata |
| 5 | **Draft first-visit/no-report common-disease question packs as `DRAFT` / `DEMO_UNVALIDATED` only** | Lets product/UX proceed without pretending content is signed |
| 6 | **Get named Lead Doctor review/sign-off before real patient questioning** (OT-18) | Production symptom/history questions are clinical behaviour |
| 7 | **Build report attachment/source viewer before trusted extraction** | Matches v2.6 scope and avoids unverified report conclusions |
| 8 | **Add doctor conclusion follow-up date/note capture** | Supports the v2.6 doctor value story without sending messages prematurely |
| 9 | **Design clinic-owned communication consent, opt-out, audit and template-versioning** (OT-19) | Required before reminders/check-ins/announcements/discounts can go live |
| 10 | **PSE registration** (OT-14) + **counsel opinions** (OT-01, OT-02) | Long lead; blocks lawful healthcare operation |
| 11 | **Content licensing audit** (OT-05) | Must precede generation at scale |
| 12 | **Get a GPU quote** | Turns ADR-034 from feasible into costed |

## 9. What must NOT happen next

- No production clinical question pack before named Lead Doctor sign-off
- No question bank generation at scale before OT-05 clears
- No avoidable domain-specific capability inside the engine (ADR-031); healthcare-specific content belongs in the pack
- No clinical rule content authored by anyone but a named expert
- No pitch using invented performance figures
- No real patient or client data anywhere
- No WhatsApp/Email reminders, check-ins, discounts or announcements before clinic-owned consent/opt-out/audit controls exist
- No MEDOXZI-owned patient marketing or patient-contact export
- No future diagnosis/test suggestion feature exposed before Gate 6+ validation, named Lead Doctor sign-off and counsel
- No treating C-13 (intended-use exclusion) as settled — it is a [Third-Party Claim]

## 10. Session history

| Session | What it did | Log |
|---|---|---|
| A | v1.0 blueprint — 19 deliverables, India-first | [log](SESSION-LOG/2026-08-23-A-v1-blueprint.md) |
| B | v2 — Indonesia pivot, harness, empty rule pack, new sequence | [log](SESSION-LOG/2026-08-23-B-v2-indonesia.md) |
| C | v2.1 — external review reconciled, concept codes, 25-yr retention | [log](SESSION-LOG/2026-08-23-C-v2.1-external-review.md) |
| C(ext) | v2.2 — external agent: UTF-8 fix, verifier reliability, safety case | CHANGELOG |
| D | v2.2 verified; regulatory correction #2; `_OPS/` built | [log](SESSION-LOG/2026-08-23-D-v2.2-verification.md) |
| E | **v2.3 — horizontal positioning; 3 blockers resolved** | [log](SESSION-LOG/2026-08-23-E-v2.3-horizontal.md) |
| F | Windows verification portability fixed; demo runs on Windows host | [log](SESSION-LOG/2026-08-23-F-onboarding-baseline.md) |
| G | `ROADMAP.md` created; Evidence Sprint runbook/templates added; stale current-facing sequence text reconciled | [log](SESSION-LOG/2026-08-23-G-roadmap-resume.md) |
| H | v2.4 healthcare-first narrow MVP adopted; Evidence Sprint deferred by founder decision; ADR-035 added | [log](SESSION-LOG/2026-08-23-H-healthcare-first-mvp.md) |
| I | Git repository published to GitHub; `.gitignore` added; archive copy excluded | [log](SESSION-LOG/2026-08-23-I-git-publish.md) |
| J | v2.5 doctor pitch playbook added; clinic-owned engagement adopted as product direction; ADR-036 and OT-19 added | [log](SESSION-LOG/2026-08-24-J-doctor-pitch-playbook.md) |
| K | v2.6 local HTML MVP prototype started; OT-20 visual review added | [log](SESSION-LOG/2026-08-24-K-html-mvp-start.md) |
| L | v2.6 HTML MVP refined with search, manual token, PIN, relevant answers and review layout fix; OT-21 added | [log](SESSION-LOG/2026-08-24-L-html-mvp-identity-flow.md) |
| M | v2.6 HTML MVP polished; returning-patient PIN sync fixed; complaint-specific demo options and data-capture helper ideas added | [log](SESSION-LOG/2026-08-24-M-html-mvp-polish.md) |
| N | v2.6 HTML MVP uses four digit prototype PINs; QR/assisted buttons removed; 15 synthetic doctor-history files added | [log](SESSION-LOG/2026-08-24-N-html-mvp-history-demo.md) |
| O | v2.6 doctor past-file system upgrade: cleaner grouped list, complaint/follow-up/date filters + Clear, current+past split review; OT-21 collision/scoping risk documented | [log](SESSION-LOG/2026-08-24-O-doctor-past-file-upgrade.md) |
| P | **ADR-037 founder resolutions + vertical question-pack shell**: local-model (Ollama qwen3:14b) demo-bank drafting pipeline (harness-gated, DEMO_UNVALIDATED), cron autopilot `0d9dc488a605`, ADR-037 | [log](SESSION-LOG/2026-08-24-P-vertical-question-packs.md) |
| Q (autopilot) | Overnight integrity pass: gate 28 CLEAN / 12 BLOCKED unchanged; 95 tests green; committed draft Hindi/answer-type corrections (dizziness, sore_throat) as `83f10bc`. No gate drift. | CHANGELOG |
| R | **Phase 0-6 improvement/deployment design docs** (8) all on disk + committed `99f4cfa`; cron `0d9dc488a605` upgraded to autonomous continuation driver | [log](SESSION-LOG/2026-08-24-R-phase-implementation.md) |
| RT (train) | **"Train the Harness with the Question Pack" realised**: loader bridge + CLEAN gate. `loader.load()` now exercises the 28 CLEAN QuestionBank-grounded packs through the harness (was KeyError); BLOCKED 12 refused (no auto-rewrite); ACTIVE-without-rules refused. 100 tests green, harness PASS, commit `43a0e93` | [log](SESSION-LOG/2026-08-24-RT-harness-train-question-packs.md) |
| S (cron) | **Observed uncommitted gate drift — NO commit.** Baseline green (100 tests / harness PASS / demo / node). But `gate_literature.py` now reports **39 CLEAN / 1 BLOCKED** vs documented **28/12**: an unlogged working-tree change to ALL 40 literature packs + `tools/build_from_questionbank.py` strips the red-flag screens and bumps `source_bank` v1.0→v1.1. Builder cites an unlogged "Session S" founder decision (red flags not used; OPD-only). **No `_OPS` log/ADR trail exists** → left UNCOMMITTED pending Abrar decision. See [log](SESSION-LOG/2026-08-24-S-cron-observed-gate-drift.md), CHANGELOG entry, V-CRON-02. | CHANGELOG |
| S(v1.1) (cron) | **Committed the ADR-038 state + completed its log trail.** Verified the working tree is the faithful, founder-authorized **ADR-038** resolution (routine-OPD-only scope; QuestionBank v1.1 wording; one D14 wording fix; packs stay DEMO_UNVALIDATED). Gate now **40 CLEAN / 0 BLOCKED**, 100 tests pass, harness VERDICT PASS (9/9), node OK. Wrote session log + CHANGELOG + V-CRON-03 + STATE tracker update, then **committed**. OT-18 still gates real-patient use. | [log](SESSION-LOG/2026-08-24-SV11-cron-adr038-commit.md) |
| U | Graphify current-state graph built and handoff saved. Root `AGENTS.md` now directs future agents to use Graphify first for project-state/architecture/link questions. | [log](SESSION-LOG/2026-08-24-U-graphify-current-state.md) |
| V | Onboarding baseline completed with Graphify-first query, green verification, contradiction sweep, and no functional change. | [log](SESSION-LOG/2026-08-24-V-onboarding-baseline.md) |
| W | HTML MVP v0.5 workspace UI polish from attached screenshot direction; Graphify current-state graph refreshed; verification and browser checks green. | [log](SESSION-LOG/2026-08-24-W-html-mvp-ui-polish.md) |
| X | HTML MVP v0.6 patient/doctor POV workflow split; separate Patient Records and Record Viewer tabs; Pre-visit narrowed to highlighted current patient + two incoming patients; animation pass; Graphify refreshed. | [log](SESSION-LOG/2026-08-24-X-html-mvp-pov-tabs-animation.md) |
| Y | HTML MVP v0.7 final doctor command center; unified Pre-visit screen with structured feedback, vitals, previous-record action, doctor-entered diagnoses, doctor-selected tests, plan categories, sticky action bar; Graphify refreshed. | [log](SESSION-LOG/2026-08-24-Y-html-mvp-final-doctor-command-center.md) |
| Z | **Vercel deployment infrastructure**: added `14-MVP-HTML/vercel.json` (Other/static, output `.`) + serverless `14-MVP-HTML/api/questions.js` port of the verified DeepSeek `suggestQuestions()` call. Deploy: Framework=Other, Root Directory=`14-MVP-HTML`, set `DEEPSEEK_API_KEY` Vercel env var. Verified locally (node --check + handler smoke test). No clinical/safety change. | [log](SESSION-LOG/2026-08-24-Z-vercel-deployment-infra.md) |
| AA | Vercel production crash fixed with repo-root deployment fallbacks; live `medoxzi.vercel.app` verified 200 HTML and `/api/questions` 200 JSON. | [log](SESSION-LOG/2026-08-25-AA-vercel-crash-fix.md) |
| AB | HTML MVP v0.8 journey-first polish: Patient arrival default, visible six-screen workflow strip, tighter doctor command-center responsive layout, Graphify refreshed. | [log](SESSION-LOG/2026-08-25-AB-html-mvp-journey-polish.md) |
| AC | Restored HTML MVP product flow to `faf4e71` split-records workflow after AB rejection; polished only Doctor / Pre-visit Review section; tablet browser verification green; Graphify refreshed. | [log](SESSION-LOG/2026-08-25-AC-restore-faf4e71-doctor-ui.md) |
| AE | **Clean header everywhere + 3-dots collapsing nav**: removed global Demo Clinic / Live / Synthetic prototype chips, brand-mark M logo, and the whole left sidebar nav; navigation now behind a single 3-dots button at top-left; on Pre-visit review the dropdown toggles Intake responses / Doctor entry cards; eyebrow always "Medoxzi", title = current screen; app-shell full-width. Verified: 100 tests / harness PASS / demo clean / node OK / browser 0 console errors. **rev v2:** nav refined from dropdown to a LEFT slide-in drawer (full-height panel, backdrop, close button). **rev v3:** removed the topbar "Medoxzi / <tab>" breadcrumb — topbar shows only the ⋯ button. **rev v4:** fixed phone-width horizontal overflow on Pre-visit Review via a `@media (max-width: 620px)` `body.doctor-shell` block (verified no overflow at 360/415/500/600px, no desktop regression). **rev v4 hardening:** added `overflow-x: hidden` on base `body` + `overflow-y: auto` so no view can push text off-screen at phone width (all 6 views at 390px verified overflow:false). **rev v5:** removed `.doctor-safety` banner + compacted 3-dots topbar. | [log](SESSION-LOG/2026-08-25-AE-topbar-3dots-menu.md) |
| AF | **Adaptive AI intake questions + spinner fix**: `/api/questions` now returns the NEXT single adaptive question given the brief + answered pairs (was a batch of 4). Backend `suggestNextQuestion()`; frontend fetches after each answer, so the interview branches on prior answers. Spinner spins only during the real LLM call and stops when the question arrives (was spinning continuously). Min 5 / max 12 client-side; static-bank fallback on error. Verified (real key): Q2 branches on a1, Q3 on a1+a2; spinner stops each time; reached review at 8 answers; 0 console errors. pytest 100 / harness PASS / node --check OK. | [log](SESSION-LOG/2026-08-25-AF-adaptive-intake-questions.md) |
| AG | **Intake/doctor UI fix batch**: step+answers persist across refresh (localStorage); Allergies+Vitals editable; loading circle replaced with an interview progress bar (fills toward 100%); accumulated answers capped at 30vh + scroll; review step two-pane `.review-split` (intro left / consents+answers right); `dxTerms` datalist (28 terms) for diagnosis word suggestions; Relevant tests (multi) + Plan (single) selectable. Verified live: 0 console errors, persistence, progress 0->13%, two-pane review, tests multi/plan single. pytest 100 / node --check OK. | [log](SESSION-LOG/2026-08-25-AG-intake-doctor-ui-fixes.md) |
| AH | **Intake questioner polish + wider screens**: consolidated 3 green progress lines into ONE bar with numeric `#stepPct`; removed "Thinking..." text; question+options in `.question-block` (min-height) hide/reappear together (no jump/no stale options); strengthened never-re-ask prompt (no onset/duration re-ask); widened `.patient-card` + `.welcome-panel` to 1080px (doctor view unchanged). Verified live: 0 console errors, single bar + %, no re-ask, no jump. pytest 100 / node --check OK. | [log](SESSION-LOG/2026-08-25-AH-intake-questioner-polish.md) |

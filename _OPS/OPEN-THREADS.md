# OPEN THREADS

**Live document.** Unresolved items with an owner and a next action. Close threads by moving them to the CHANGELOG with the resolution; do not delete them.

**Priority:** 🔴 blocks the next milestone · 🟠 blocks a later milestone · 🟡 should be resolved · ⚪ watch

---

**Session F note:** Windows verification portability was fixed and logged in CHANGELOG / VERIFICATION-LOG. No new open thread remains from the `python3` / `tail` / demo encoding issue.

**Session H note:** Founder explicitly deferred/skipped the Evidence Sprint for now and selected healthcare-first narrow MVP. See ADR-035. OT-17 is resolved by human decision; OT-04 is deferred risk, not completed evidence.

**Session J note:** Doctor pitch playbook added. Clinic-owned reminders/check-ins/announcements are accepted as product direction under ADR-036, but production sending is blocked until consent, opt-out, audit and template controls exist.

**Session K note:** Local phone/tablet-first HTML MVP prototype started in `14-MVP-HTML/`. It is synthetic/demo-only and excludes diagnosis, visible differential, production red flags and real message sending.

**Session RT2c note (2026-08-27):** Two production UI bugs reported by the founder are **RESOLVED and deployed** (commit `b4a7325`, pushed `main`; live on `medoxzi.vercel.app`): (1) review-your-submissions page had no reachable Submit on a phone — `#submitIntake` is now `position: sticky; bottom: 0` so it pins to the bottom of the mobile viewport and is always visible; (2) interviewer question block jumped up/down after each answer because loading `hidden` the question/options — the JS now toggles an `.is-loading` class and a `.thinking-dots` bouncing-dot animation, and the block keeps its height (delta 0 verified). New founder UI preference added: **the review Submit button must stay pinned/always visible on the phone**. See CHANGELOG / VERIFICATION-LOG / session log `2026-08-27-RT2c…`. Cache-clear/incognito after redeploy.

**Session L note:** HTML MVP refined with existing-patient search, manual clinic token entry, relevant answer options, fixed review text layout, patient PIN generation/display, and removal of the patient-facing doctor-view button.

**Session M note:** HTML MVP polished with professional colors/copy, fixed returning-patient PIN selection field sync, complaint-specific demo answer options, issue-description helper chips, and documented data-collection feature suggestions.

**Session N note:** HTML MVP now uses four digit prototype PINs, removes non-working QR and assisted-intake buttons, and adds a searchable/scrollable doctor-view browser for 15 synthetic past patient files with labelled sample doctor assessments.

**Session O note:** Doctor past-file system upgraded in `14-MVP-HTML/` — cleaner grouped list (PIN, name, age/sex, mobile, date·complaint, follow-up badge, file count), filters by complaint / follow-up-needed / date with a Clear-filters reset, and an "open current visit + previous visits together" split-review panel (Current visit beside the selected Past visit). All data synthetic; four digit visible PINs retained. Production PIN collision/scoping risk documented under OT-21.

**Session S (HTML MVP first screen + patient flow) note:** The first screen is now a dedicated "WELCOME TO MEDOXZI LAB" landing (search by phone number or full name). Matches render below the search box with a **Confirm** button (confirm loads the record, pre-filling basic info on the 2nd screen); no-match shows a **"Register as a new Patient"** button (opens the intake with blank fields). Intake restructured to 5 steps (0-4): Details -> Brief+Submit -> Questions(with processing/loading) -> Check Your Answers + required consents -> Done; the removed report/file-upload step and old step-0 consents are superseded by consents on "Check Your Answers". The 2nd screen does not show today's queue. DeepSeek question prompt now skips anything already stated in the brief (duration/onset) and returns `alreadyKnown` (surfaced as "Already noted:"). DeepSeek output stays labeled triage suggestions; doctor retains final discretion. See CHANGELOG and session log `2026-08-24-S-html-mvp-first-screen-search.md`.

**Session S note:** This cron run observed an **uncommitted gate-drift**: `gate_literature.py` reports **39 CLEAN / 1 BLOCKED** (was documented 28/12). All 40 `literature/*.json` packs + `tools/build_from_questionbank.py` carry unstaged edits that remove red-flag screens and bump `source_bank` to v1.1, claiming an unlogged "Session S founder decision". **No `_OPS` log/ADR corroborates it.** Left uncommitted/reverted-nothing pending Abrar's decision. See V-CRON-02, session log S, CHANGELOG.

**Session RT2f note (2026-08-28) — follow-up + 1-day-before re-confirmation (`fu`):** Server-side scheduler delivered (queue + preview; real send gated per ADR-036, audit-only) — enqueue endpoint, daily `tick` + `vercel.json` cron (09:00 UTC), and the Marketing-view composer/queue/due-preview (the founder's latest "Just 1 pe" directive). **⚠️ THE ONLY PENDING MANUAL STEP (`fu` blocked on it):** `fu` uses **Vercel KV (Upstash Redis)** and requires the founder to link a KV store and set **`KV_REST_API_URL` + `KV_REST_API_TOKEN`** in the Vercel project env (and in `14-MVP-HTML/.env` for local prod-parity). Until then production enqueue/tick return `{ok:false, kind:"KV_UNAVAILABLE"}` (graceful; client still logs a prepared-not-sent audit entry). **Founder action:** in the Vercel dashboard → Storage → *Create Database* → KV → link to project; then Project Settings → Environments → add the two vars (keep names only — the agent never sees the token value). Local full-verified via the server.js in-memory KV shim. Current head `…` — see CHANGELOG / VERIFICATION-LOG / session log `2026-08-28-RT2f-followups-and-reconfirm.md`.

**Session S(v1.1) note (this session):** Resolved the above. The founder **confirmed** the red-flag removal as a real decision (session Q out-of-band directive, restated here): no red flags because the clinic handles routine OPD patients only, never emergencies; update wording where needed and continue. v1.1 (`diseases.json` version 1.1, 308 history questions) is now installed in `10-Reference/OPD-QuestionBank/`; all 40 literature packs rebuilt without red-flag screens; D14 wording adjusted (founder-authorized) to remove the last `emergency` patient-text hit. Gate is now **40 CLEAN / 0 BLOCKED**, bridge 40/0. Decision captured as **ADR-038**. All packs remain `DEMO_UNVALIDATED`; **OT-18 Lead Doctor sign-off still required before real-patient activation** — the 40/0 does NOT mean clinically signed.

**Session U note:** Graphify current-state graph now exists for token-efficient handoff and architecture/project-link questions: `graphify-current-state/graphify-out/GRAPH_REPORT.md`, `graphify-current-state/graphify-out/graph.html`, and `graphify-current-state/graphify-out/graph.json`. Root `AGENTS.md` instructs future agents to use `graphify query "<question>" --graph graphify-current-state/graphify-out/graph.json` before broad raw-file reading. Next-chat prompt saved at `_OPS/NEXT-CHAT-PROMPT.md`. Graph is curated current-state coverage (68 nodes, 119 edges, 12 communities, 0 token cost), not a full-repository graph.

**Session V note:** Onboarding-only baseline completed with Graphify-first query and no functional changes. Verification stayed green (100 tests, harness PASS, demo clean, HTML MVP syntax OK). No open-thread priorities changed; pre-existing untracked `package-lock.json` remains untouched.

**Session W note:** `14-MVP-HTML/` received a screenshot-guided v0.5 workspace UI polish: dark left navigation rail, clean top bar, denser clinical cards, professional visible copy, patient review/upload card, and responsive desktop/mobile verification. Browser check covered desktop welcome, desktop doctor review, mobile patient intake, and mobile ops with no console errors and no undersized visible controls. The prototype remains synthetic/demo-only and still needs founder/doctor/staff screen review before production frontend scope is locked.

**Session X note:** `14-MVP-HTML/` received a patient/doctor POV workflow split. Patient Intake now pre-fills from the current front-desk registration when opened directly; Pre-visit Review now shows only the highlighted current patient plus two incoming patients; Patient Records and Record Viewer are separate tabs; the viewer can compare a selected past record with the current visit; subtle motion was added with reduced-motion fallback. Browser verification covered desktop and mobile patient/direct-intake, Pre-visit, Records, Viewer, and compare flow with no console errors or undersized visible controls. Suggested next review items: "Next patient" transition, record timeline grouping, pinned allergy/medicine cards, medication-photo capture, caregiver mode, and audit-stamped doctor notes.

**Session Z note:** Vercel deploy infra added (vercel.json + serverless /api/questions); see CHANGELOG/SESSION-LOG Z. Deploy step: set Framework=Other, Root Directory=14-MVP-HTML, add DEEPSEEK_API_KEY env var.
**Session RT2 note:** `14-MVP-HTML/harness/live_loop.mjs` added — a live question-answer-loop harness that drives the REAL adaptive DeepSeek `/api/questions` interviewer through 5 synthetic scenarios, gating every question on the ABSOLUTE rules (no onset/duration/timing re-ask, no diagnosis/treatment wording, no presumed named diagnosis, exactly 4 options, max-12 ceiling). Hard gates PASS; quality metrics advisory (deepseek rarely self-terminates — often runs to the 12-cap or ends at 1-2; production client-side fill/cap covers both). Report: `14-MVP-HTML/harness/report_live_loop.json`. Dev tool only; no production code changed. See CHANGELOG/SESSION-LOG RT2.

**Session AE rev v4 hardening note:** Added `overflow-x: hidden` on the base `body` (plus `overflow-y: auto`) so no view can push text off-screen horizontally at phone width. Verified all 6 views at 390px show overflow:false. If the phone still shows overflow after redeploy, the cause is browser cache — hard-refresh / clear site data / open incognito.
**Session AE rev v4 note:** Fixed phone-width horizontal overflow on Pre-visit Review (Intake responses / Doctor entry cards were clipping off the left edge, intake % off the right). Added a `@media (max-width: 620px)` `body.doctor-shell` block collapsing the layout to single column, `.doctor-entry-card` to block, `.choice-row` to 2 columns, and `overflow-x: hidden`. Verified no overflow at 360/415/500/600px with no desktop regression.
**Session AE rev v3 note:** The topbar breadcrumb text "Medoxzi / <tab>" was removed entirely — the topbar now shows only the 3-dots `\u22ef` button. Navigation is the left slide-in drawer (see AE rev v2 note).
**Session AE rev v2 note:** Navigation refined from a down-dropdown to a LEFT slide-in drawer. The 3-dots button (top-left) now opens a full-height panel that slides in from the left edge with a dim backdrop (MEDOXZI logo header, close ✕, 6 nav items, and on Pre-visit review the SECTIONS toggles for Intake responses / Doctor entry). Backdrop click and Escape close it; selecting a view switches + auto-closes. Baseline green (100 tests / harness PASS / demo clean / node OK), browser verified 0 console errors.
**Session AE note:** `14-MVP-HTML/` now has a clean header everywhere — removed the global Demo Clinic / Live / Synthetic prototype chips, the brand-mark M logo, and the whole left sidebar nav. Navigation moved behind a single 3-dots `⋯` button at the top-left of the topbar (dropdown: Front desk, Patient intake, Pre-visit review, Patient records, Record viewer, Clinic operations). On Pre-visit review the same dropdown has a SECTIONS group toggling the Intake responses and Doctor entry cards. The eyebrow always reads “Medoxzi”; the topbar title shows the current screen. Baseline green (100 tests / harness PASS / demo clean / node OK), browser verified with 0 console errors. This supersedes the earlier doctor-only chrome removal (Session AD) by applying the cleanup across all screens. Founder to commit + push to redeploy.
**Session AA note:** Vercel production crash fix added root-level repo deployment fallbacks. If the Vercel project root is repo root, root `vercel.json` rewrites `/`, `/index.html`, `/app.js`, `/styles.css`, and other static paths to `14-MVP-HTML/`, while root `api/questions.js` forwards `/api/questions` to the verified subdir handler. If the project root is already `14-MVP-HTML`, Session Z config still applies. After push/redeploy, verify the production URL and `/api/questions`; without `DEEPSEEK_API_KEY`, the endpoint should return controlled `NO_API_KEY` JSON, not 500.

**Session AB note:** `14-MVP-HTML/` now opens on a polished Patient arrival/search screen rather than directly on Doctor Review. A visible workflow strip exposes Patient arrival, Front desk, Patient intake, Doctor review, Records, and Operations. Doctor Review remains the final command-center concept with current + next two patients, previous record action, vitals without SpO2, 3 doctor-entered diagnosis inputs, and doctor-selected tests. Browser verification covered desktop + mobile with no console errors or horizontal overflow.

**Session AC correction:** Session AB's journey-first polish was rejected by Abrar. The product flow was restored to commit `faf4e71 feat(mvp-html): split records workflow`; only the Doctor / Pre-visit Review section was polished to the provided command-center image. Future agents must not reintroduce the Session AB workflow strip or cross-screen landing redesign unless Abrar explicitly asks for that scope. Keep Staff, Patient Intake, Patient Records, and Record Viewer logic/screens on the restored split-records baseline.

**Session AD note:** Abrar's current Doctor / Pre-visit Review preference is **landscape tablet first**. Keep the doctor tab compact: no visible `Doctor workspace` breadcrumb, Demo Clinic selector, Live chip, or Synthetic prototype chip in that tab; logo, queue, bell, and profile belong in the compact queue/header strip; selected/current patient card should be wider than incoming cards and carry patient profile, previous-record, file label, View/Download, and overflow actions; do not restore a separate doctor patient-header card or separate Reports & attachments card unless Abrar explicitly asks. Other screens should keep the restored split-records flow and normal navigation.

**Session Y note:** `14-MVP-HTML/` now implements the founder's final doctor command-center concept as HTML v0.7. The default visible screen is a full-width Pre-visit Review workspace with a highlighted current patient plus two incoming patients, structured feedback, patient profile + previous record actions, allergies + vitals (BP, pulse, temperature, weight; no SpO2), close question-answer rows, report attachment row, and clinician-owned assessment controls: three priority diagnosis input fields, doctor-selected relevant tests, plan category buttons, follow-up controls, and a sticky action bar. These are prototype documentation controls only: no AI-generated diagnosis/test advice, no treatment recommendation, no clinical performance claim, no real patient data, and no live messaging were added. Browser verification covered desktop and mobile with no console errors, no undersized visible controls, and `hasSpO2: false`.

---

## ✅ Resolved — red-flag removal in question packs confirmed as real founder decision (ADR-038)

- **What happened:** The founder confirmed via out-of-band directive (session Q, 2026-08-24): the clinic handles **routine OPD patients only and never emergencies**, so red flags are not used; wording may be updated to continue. That is the "Session S founder decision" the cron could not corroborate — now documented as **ADR-038**.
- **What changed:** `build_from_questionbank.py` no longer embeds any red-flag/alarm string into patient packs (engine `is_red_flag_screen` capability stays intact for future clinician packs). QuestionBank **v1.1** installed as authoritative history-question source. All 40 packs rebuilt from v1.1. One founder-authorized wording fix on D14 Bronchial Asthma (`emergency treatment or hospitalization` → `hospital treatment or been admitted`) to satisfy the no-urgency-word gate.
- **Gate result now:** **40 CLEAN / 0 BLOCKED** (was 28/12); bridge 40 loadable / 0 refused. Tests 100 green, harness VERDICT PASS.
- **Boundary respected:** All 40 packs remain `DEMO_UNVALIDATED`, nothing signed or activated. **OT-18 named Lead Doctor sign-off is still required** before any real-patient use. The 40/0 CLEAN is a Harness-training/engineering gate result, **not** clinical sign-off.
- **Status:** ✅ resolved · Commit with this session's pack rebuild + logs.

## 🔴 Blocking — cannot proceed to real patient use without these

### OT-01 · Indonesian data storage and inference — 🟠 DOWNGRADED from 🔴 (session E)
- **Storage: ✅ RESOLVED.** Founder confirms Indonesian VPS/cloud capacity is readily available. Design for in-Indonesia storage stands.
- **Inference: 🟠 DE-RISKED, NOT CLOSED.** Session-E research found Indonesian sovereign AI cloud capacity — Lintasarta (Indosat) *GPU Merdeka*, NVIDIA H100 SXM GPU-as-a-Service, plus an announced Surakarta AI data centre. **[Third-Party Claim — press coverage]** Self-hosted in-country inference is a real option. See ADR-034.
- **⚠️ The distinction that must not be lost:** **storage location ≠ processing location.** A Jakarta VPS does not make inference domestic unless the model runs on it. If the LLM call goes to a Singapore or US endpoint, processing happens abroad regardless of where the database sits.
- **Remaining:** (a) obtain a direct quote from Lintasarta or an equivalent — confirm current availability, pricing, terms, and whether GPU capacity is genuinely allocatable at pilot scale; (b) counsel confirmation of whether *processing* is treated separately from *storage* under PDP and Permenkes.
- **Owner:** engineering (quote) + Indonesian data-protection counsel ⚖️ (processing question)

### OT-14 · PSE Lingkup Privat registration — 🟠 OWNER = FOUNDER (handling; session P)
- **What:** B2B SaaS serving Indonesian users must register as a **PSE Lingkup Privat** with Komdigi and obtain a **TDPSE** certificate. This is **separate from** the PT PMA's business licence and KBLI — having the entity does not satisfy it. **[Third-Party Claim — practitioner sources; verify with counsel]**
- **Status (session P):** founder confirms they already have the PT PMA and **will handle all PSE/Komdigi requirements**. Not a build blocker — external registration handled by founder.
- **How:** OSS → NIB and business licence → Komdigi PSE portal → designate a PIC → upload deed, NIB, licence → TDPSE. Owner: founder + Indonesian corporate counsel ⚖️.

### OT-02 · Medical device classification — 🟡 DE-RISKED by founder decision (session P); counsel optional, not blocking
- **Founder decision (session P):** the product makes **no diagnosis** — it is a **time-saving and data-organising tool/SaaS for clinics** (screening questions only; doctors retain full discretion). On this intended-use basis it is positioned as an administrative/documentation tool, not a regulated medical device.
- **Positioning match:** aligns with ADR-031 horizontal repositioning + OT-02's own note that *administrative* purpose software is out of scope.
- **Status:** no longer a blocking 🔴. A written counsel opinion is **still recommended as diligence** (not gating): (a) empty-pack platform, (b) platform + clinical question pack. Verifying the administrative exclusion against a Kemenkes primary document remains advisable.

### OT-03 · Local entity (PT PMA) — ✅ RESOLVED (session E)
- **Resolution:** founder confirms an existing **PT PMA** to which Web Development, App Development and SaaS Development activity can be added. That covers building and selling the software and contracting with Indonesian customers.
- **Carried forward as OT-14:** operating an electronic system holding Indonesian user data additionally requires **PSE Lingkup Privat registration**, which the entity alone does not satisfy.

### OT-04 · Evidence Sprint has not been run — ⚪ DEFERRED BY FOUNDER (session H)
- **Replaces RECON.** 2–3 weeks in waiting rooms → **3–5 days, mostly remote, across two verticals**. See `09-MVP/Evidence-Sprint.md` and ADR-032.
- **Session G repository prep:** root `ROADMAP.md`, `09-MVP/Evidence-Sprint-Runbook.md`, and `09-MVP/Evidence-Sprint-Templates.md` now exist. The sprint itself has still **not** been run.
- **Session H override:** founder explicitly decided to skip/defer this for now and proceed healthcare-first. See ADR-035.
- **The one part that cannot be skipped:** collect **100–200 real documents across ≥2 verticals** with a recorded taxonomy. Building a document extraction pipeline against imagined documents is the most expensive mistake available, and it is vertical-independent — a legal PDF, a thermal lab report, a handwritten prescription and a bank statement are four different engineering problems.
- **Also in scope:** intake completion smoke test with 10–15 real people per vertical; 4–6 buyer conversations centred on *"how many times does the same case get typed into a computer?"*
- **Dropped:** consultation-time baseline (moves into the healthcare pilot), chief-complaint frequency (becomes vertical pack content at CUSTOMISE), P-Care observation (deferred).
- **Current status:** not a build blocker after ADR-035, but the risk remains accepted rather than disproven. If document extraction becomes a primary feature again, revisit before scaling it.
- **Owner:** founder + designer

### OT-15 · Vertical pack refactor — 🟠 NEW (session E)
- **What:** move question bank content, escalation rules, terminology, cohort gates and the prohibited-language list out of "the content pack" into a versioned, expert-signed **`vertical_pack`** scoped to one domain.
- **Why:** ADR-031. The horizontal claim is only protective if the architecture is genuinely horizontal. Also the mechanism by which a second vertical becomes configuration rather than a fork.
- **Effort:** days-scale — content was already data (ADR-008, ADR-015), not code.
- **Owner:** engineering
- **How:** engine loads a `vertical_pack`; the engine must not reference any domain-specific concept. A CI check should fail on domain vocabulary appearing in engine code.

### OT-16 · Platform naming — 🟡 NEW (session E)
- **What:** `MEDOXZI` reads as medical. A horizontal platform should not carry a vertical in its name.
- **Proposed:** neutral platform name; **MEDOXZI Pre-Round** becomes the healthcare vertical pack.
- **Why it matters:** a clinically-named product makes the horizontal argument harder to make in a regulator's or a legal customer's room.
- **Decide before:** the pitch. Not urgent now.

### OT-17 · Which vertical goes first — ✅ RESOLVED (session H)
- **Resolution:** founder selected healthcare-first and deferred/skipped the Evidence Sprint for now. See ADR-035.
- **Scope selected:** first clinic visit OPD patients, preferably with no previous reports; optional previous reports are attached for doctor review; patient gives a 2-3 line issue description; system asks Lead-Doctor-approved basic questions; doctor receives the brief on tablet/phone.
- **Risk accepted:** healthcare remains the hardest vertical and makes OT-02/OT-07 more important, not less.

### OT-18 · Question pack (signing) — 🟢 RESOLVED via ADR-039 founder override (session SV13)
- **Founder decision (session P):** question bank designed from medical literature with AI + Harness. It asks **relevant patient questions only** — **no diagnosis**. Doctors retain **full discretion**. Removed as a drafting blocker.
- **ADR-039 (SV13, supersedes for the 40 packs):** the founder selected option (D) — permanently remove the loader invariant + promotion gate, and allowed activation for all packs ("Activation ky liye sb Allow kro", "No Sign Off required"). All 40 literature packs promoted to `ACTIVE`, `signed_at: null`, `is_signed: False` — a named-Lead-Doctor sign-off is **never fabricated**. The ADR-039 override applies to these 40 packs only.
- **Status:** drafting + activation of the 40 packs complete (ADR-038 clean + ADR-039 activation). Future packs still require Lead Doctor review + sign per the standard lifecycle (ADR-002 / ADR-015 / ADR-033 unchanged).
- **How:** create the healthcare `vertical_pack` shell with statuses (`DRAFT`, `DEMO_UNVALIDATED`, `CLINIC_REVIEW`, `APPROVED_FOR_PILOT`, `ACTIVE`). Banks drafted now are `DEMO_UNVALIDATED` candidates.

### OT-19 · Clinic-owned engagement consent/comms controls — 🟠 REDUCED; consent at data submission (session P)
- **What:** follow-up reminders, post-visit check-ins, feedback/rating requests, clinic announcements and discount offers are now part of the doctor pitch and product direction. They are allowed only as **clinic-owned** communications, not MEDOXZI-owned patient marketing. See ADR-036 and `09-MVP/Doctor-Pitch-Playbook.md`.
- **Founder decision (session P):** **clear consent for follow-up and reminders/announcements will be taken from patients at data-submission time.** This resolves the consent gate for feature design.
- **Remaining:** implement consent capture + **opt-out/revocation, audit, and message-template versioning** controls before any production sending. Blocks production send until those exist. Boundary unchanged (ADR-036 / OT-19): clinic-owned only; no AI diagnosis, no treatment advice, no false urgency, no MEDOXZI marketing; opt-out never affects care.

### OT-20 · HTML MVP visual review and screen lock — 🟡 NEW
- **What:** `14-MVP-HTML/` now contains the first local visual MVP. It needs founder/doctor/staff review before production UI engineering starts.
- **Blocks:** final UI scope, production component design, and the first production frontend build.
- **Boundary:** keep the prototype synthetic/demo-only. Do not turn demo questions into production clinical content. Do not add diagnosis, visible differential, treatment advice, urgency language, production red flags or live patient messaging.
- **Owner:** founder + product/frontend + Lead Doctor for any clinical wording.
- **How:** review on a phone and tablet. Confirm each screen in order: returning-patient search/selection sync, four digit PIN display, manual clinic token, staff registration, tablet handoff, patient consent, basic info, complaint, 2-3 line description with helper chips, complaint-specific demo questions, optional reports, review/done with PIN, doctor queue, doctor brief, searchable past files, open old file detail, conclusion/follow-up, disabled reminder preview, and the proposed data-capture helpers. Record approved changes in `14-MVP-HTML/MVP-Prototype-Plan.md`.

**Session T note (2026-08-24):** `14-MVP-HTML/` refinements now implemented and browser-verified: details step asks for a **full name**; the phone field has an **Indonesian-first country-code dropdown (+62 default)** that **accepts a number without a leading zero** (a single leading `0` is stripped) and shows an expected-format hint; patient **age + sex are sent to DeepSeek** so triage questions are demographics-aware; the brief step is split so the reason screen shows **only "Pick a reason"** — a specific choice (Fever/Cough/…) opens "Please give more information about your '<Reason>'" while **"Something else"** opens "Tell the doctor briefly" with **Started / Where / Tried / Before** tips; Step-3 loading shows only **"Analyzing Your Issue..."** (no "DeepSeek · suggested", "Already noted", or "Processing your response…" system texts in the patient view); and the **doctor brief is reorganized with color-graded demographic chips** (age/sex/contact) and a structured alternating-color answer list. Full API + browser verification lives in `_OPS/VERIFICATION-LOG.md` **V-2026-08-24-T-02**. Demo server running on `http://localhost:8765` (`.env`-gated DeepSeek key).

**Session X note (2026-08-24):** OT-20 review scope now includes the v0.6 tab split and doctor live-queue rule: Pre-visit Review must stay focused on current consultation + two incoming patients, while historical search/detail belongs in Patient Records and Record Viewer. Patient direct-entry prefill and motion polish should also be reviewed before screen lock.

**Session Y note (2026-08-24):** OT-20 review scope now includes the v0.7 final doctor command center. The visible Pre-visit Review screen no longer presents separate Patient Records / Record Viewer tabs; it exposes `Previous record` as a patient-header action inside the command center. Review this reversal from the v0.6 split before screen lock, especially whether the inline action is enough for clinic workflow or whether historical search should return as a secondary route.

### OT-21 · Production PIN identity binding — 🟡 DESIGN UPDATED (founder decision, session P)
- **What:** the HTML MVP now models a Patient Identification Number (PIN) generated at submission and linked to name, age and mobile. Production must enforce that a PIN cannot be silently attached to a different customer number or identity.
- **Founder decision (session P) — smart choice:** the **big PIN (full identifier) is shown only inside a doctor's patient records** — **never on the main list view** (the list shows a short/labelled reference instead). This reduces shoulder-surfing and index-based exposure on the main screen while keeping the full identity link inside a record.
- **Boundary:** this is identity/record-linking, not a clinical claim. Do not use real patient data in tests.
- **How:** add immutable patient identity keys, duplicate review workflow, audit events for any merge/correction, scoped uniqueness for four digit visible PINs, and tests proving an existing PIN cannot be re-bound to a mismatched mobile/name/age without an explicit audited human resolution. Collision/scoping risk below stands.

#### Collision / scoping risk (documented session O — latest work: doctor past-file filters)
- **Known demo limitation:** the prototype deliberately keeps **4-digit visible PINs** and allows the same PIN to appear across synthetic demo files for illustration (e.g. clinic-facing list shows PINs like `1049`, `4729`, `6184`, `2914`, `6805`, `5273`). These are **not** unique patient identities — they are short, collision-prone labels.
- **4-digit space is only 10,000 combinations** — trivially collidable at clinic scale (birthday paradox: ~50% collision likelihood near ~119 records). Production cannot use a bare 4-digit PIN as the sole identity key.
- **Mismatch scoping (adopted here):** identity is a composite of PIN **+ name + age + mobile**, never PIN alone. The doctor past-file list groups and filters records under a PIN, but the chosen record must still match name/age/mobile before an existing file is presented as that patient's history. The split review ("open current visit + previous visits together") therefore only ever shows the **selected** composite record, never two different people under one PIN.
- **Production requirement:** scope the PIN to its creating clinic + use a distinct immutable internal patient key; treat the visible 4-digit PIN as a **per-clinic 4-digit prefix/short-code**, not a global or national identifier. Any remap/correction must be an audited human action (covered by the OT-21 How line).
- **Demo assertion:** no real patient data anywhere in the prototype; all PIN-linked files are synthetic "sample doctor assessments".

### OT-22 · Provision Vercel KV (Upstash Redis) for the follow-up scheduler — 🔴 blocks `fu` activation (RT2f, 2026-08-28)
- **What:** `api/followups/enqueue.js` + `api/followups/tick.js` persist the reminder queue (`fu:queue` Sorted Set) and tick log in **Vercel KV**. Production is graceful-degraded until a KV store is linked.
- **Founder action (the only manual step):** Vercel dashboard → **Storage → Create Database → KV** → link to the `medoxzi` project; then **Project Settings → Environments** → add **`KV_REST_API_URL`** and **`KV_REST_API_TOKEN`** (also add both to `14-MVP-HTML/.env` for local prod-parity). Keep names only — the agent never reads the token value.
- **Owner:** founder (Abrar) 🔧
- **How to confirm done:** after env is set, production `/api/followups/enqueue` returns `{ok:true,…}` instead of `{ok:false, kind:"KV_UNAVAILABLE"}`; `medoxzi.vercel.app`, wait for auto-deploy, then Preview the Marketing view and queue one item. OT-22 closes when the founder confirms KV returns `ok`.
- **Demo fallback (no KV yet):** client still logs a prepared-not-sent audit entry locally; nothing is lost, nothing is sent. Local full-verified via the server.js in-memory KV shim.

## 🟠 Blocking the pitch

### OT-05 · Content source licensing — 🟡 DRAFTING PROCEEDS on permitted sources (session P); activation still gated
- **Question:** are the sources our question banks are drafted from licensed for commercial use?
- **Founder decision (session P):** question bank will be designed with **AI + Harness** (to avoid hallucination) from medical literature about **most common diseases**. Multiple most-common-disease packs are being drafted now.
- **How this is reconciled with the rule:** AI **drafting** into `DEMO_UNVALIDATED` is permitted (ADR-033). The **activation gate** is unchanged: a bank cannot enter an **active** pack unless every question's `source_ref` / `KnowledgeSource.licence_ref` is verified **NOT NULL** (permitted sources: public health-ministry guidance, permissive open-access, universal frameworks, customer's own licensed material, the expert's own written knowledge). **Prohibited:** paywalled journals, textbooks, clinical decision references, scraped competitor content.
- **Hard gate:** a question with an unverified source licence cannot leave `UNVALIDATED_DEMO_CONTENT`. DRAFT banks may be authored now, but must carry their intended source; production activation waits on the licensing audit.
- **Owner:** founder + counsel ⚖️

### OT-06 · Pitch limitations page must contain no invented numbers
- **Question:** the dossier template in `12-Harness/Pitch-Dossier.md` contains **illustrative** figures (98.6% abstention, 96.2% high-confidence accuracy). These are placeholders.
- **Why it matters:** presenting an illustrative number as a measured one to a doctor destroys the trust the whole product is built on.
- **Owner:** whoever prepares the pitch
- **How:** regenerate every figure from a signed harness run and print the `run_id` on the page. If a figure has not been measured, **remove it** — do not round it.

## 🟠 Before real-patient shadow

### OT-07 · Lead Pilot Doctor sign-off
- **What:** question packs, red-flag rules, prohibited-language list, Bahasa Indonesia clinical wording, clinic-specific cohort gates.
- **Why:** this is the entire clinical governance model. Without it, no real patient data may be processed.
- **How:** `09-MVP/Development-Plan.md` §6 (CUSTOMISE).

### OT-08 · Clinic-specific cohort gates
- **What:** exact age boundaries, pregnancy detection, language handling for the pilot clinic.
- **Owner:** Lead Doctor + engineering

## 🟡 Engineering

### OT-09 · Browser and session end-to-end leakage tests
- **What:** harness Class L (tabs, refresh, double submit, late upload, concurrent edits, session takeover) is **specified but not implemented** — it needs a real browser harness, which the prototype does not have.
- **Why:** these are ordinary human behaviours, not exotic attacks, and L11 (document uploaded after the summary was generated) produces a confidently wrong artefact.
- **How:** Playwright against the real app, once one exists.

### OT-10 · In-country model availability
- **What:** verify per provider whether any frontier model is served from an Indonesian region. Availability changes frequently.
- **Why:** decides self-host vs hosted API.

### OT-11 · Cost model has no real prices
- **What:** `07-Engineering/Cost-Model.md` is a parameterised formula with placeholder `P_*` variables, deliberately.
- **How:** fill from vendor quotes after OT-10 and RECON. **Do not invent prices.**

## ⚪ Watch

### OT-12 · PDP implementing regulation
- Draft GR PDP was unpublished as of late 2025 and a PDP amendment sits in the 2026 legislative programme. Re-check before any compliance assertion.

### OT-13 · Three unretrieved papers
- `01-Research/Research-Log.md` R-07..R-09. No effect size from them is quoted anywhere. Retrieve via institutional access when convenient.

## Session AF note:
Adaptive intake questions deployed: `/api/questions` now returns the next single question given the
brief + answers so far; frontend fetches after each answer and the spinner only spins during the
LLM call. Founder to confirm on the deployed site (clear cache / incognito) that the flow branches
on prior answers and the spinner stops after each question.

## Session AG note:
Intake/doctor UI fix batch deployed (persistence across refresh, editable allergies/vitals, progress
bar replaces spinner, capped+scroll answers, two-pane review split, dxTerms datalist, selectable
tests/plan). Founder to confirm on the deployed site (clear cache / incognito), especially the
landscape review two-pane layout.

## Session AH note:
Intake questioner polish deployed: single progress bar with numeric %, "thinking" text removed,
question+options hide/reappear together (no jump), never-re-ask prompt strengthened (no onset/duration
re-ask), patient + welcome screens widened to 1080px (doctor view unchanged). Founder to confirm on the
deployed site (clear cache / incognito).

## Founder UI preferences (authoritative)
Abrar's consolidated HTML-MVP UI preferences now live in `_OPS/NEXT-CHAT-PROMPT.md` (the "FOUNDER UI PREFERENCES" block): left slide-in drawer nav (⋯ button only, no breadcrumb/chips/logo), landscape-tablet doctor view, single progress line with numeric % (no spinner/thinking text), adaptive 5-12 AI questions, no onset/duration re-ask, screens fill tablet width except doctor view, editable allergies+vitals, multi-select tests + single-select plan, dxTerms typing suggestions, no-jump/reserved question block + capped scrolling answers, refresh persistence, cache-clear/incognito after deploy. Read that block before any UI change.

## ⭐ ROLLBACK BASE
git tag `base-v1` (commit 5a05c06; code state 9d9fd9f) is the founder-marked known-good stable point
(adaptive AI intake + AF/AG/AH UI fixes + founder-prefs handoff, all deployed). If a later change
breaks something, restore with `git reset --hard base-v1` / revert to that tag.

## RT2b - Never-re-ask catalogue + prompt-contract guard (2026-08-27)
- `harness/prompt_contract.test.mjs` = deterministic, offline, always-green guard that the ABSOLUTE safety rules are intact verbatim in `server.js` AND `api/questions.js`. Runs in seconds, no key/no server. Run after ANY prompt edit: `cd 14-MVP-HTML && node harness/prompt_contract.test.mjs`.
- `harness/live_loop.mjs --suite reask` = task-2 never-re-ask regression catalogue: 8 briefs that deposit onset/duration/timing where Q1 MUST probe complaint character/location/severity instead. Safety violations (reask/diagnosis/dx_assumption/treatment/shape) now become HARD FAILING gates. LIVE model is stochastic -> occasional reds are honest signal, re-run + read the caught question before shipping a change. Needs local server on :8765 + DeepSeek key.
- `q1_productive` advisory: flags whether Q1 took a useful branch on timing-given briefs. Join-swelling "How many joints are swollen?" reads as not-productive but is a legit extent probe (acceptable noise).
- Reported re-ask classes seen live (all duration/timing backslips): throat→"How long the cough", dizzy→"How long the hearing loss", stomachache→"How long black/tarry stools", ear-pain→"How long cold/cough". These mirror the historical fixes the user requested -> keep the catalogue forever-expanding with every re-ask the user complains about.

## Session MKT note (2026-08-28):
Marketing Management 7th view was audited and rebuilt as a professional, governance-accurate UI (header block, step-grouped panels, clearer CTAs, phone-safe CSS). **Governance fix:** the section previously said "marketing consent"; per ADR-021 MEDOXZI must NOT do patient marketing, so all framing now reads **"clinic communications" / "clinic-owned communication consent"** (ADR-036) with an audit-only no-send path. No JS behaviour or IDs changed. Verify live on prod after deploy (clear cache / incognito). See CHANGELOG / VERIFICATION-LOG V-2026-08-28-MKT-01..03.

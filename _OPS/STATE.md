# STATE — where this project actually is

**Updated:** 2026-08-24, session P (founder resolutions + vertical question-pack pipeline; OPD Java Disease QuestionBank integrated as primary source basis)
**Repository version:** **v2.6**
**Read this first. Update it last.**

---

## 1. One-paragraph status

The design blueprint is complete and internally consistent. The Python prototype passes **100 tests** (95 baseline + 5 content-pack bridge regression tests, added session RT; re-verified this cron run) and the harness passes **9/9 gates** (re-verified this run by re-running, not by report). **No production app exists yet.** Session H records an explicit founder decision to defer/skip the Evidence Sprint for now and proceed with a **healthcare-first narrow MVP**: basic personal information, a 2-3 line patient issue description, Lead-Doctor-approved basic questions, optional previous-report attachments for doctor review, and a doctor brief pushed to the doctor's tablet/phone. Best initial patients are first clinic visits with no previous reports. Session J adds the official doctor-facing pitch playbook and accepts clinic-owned reminders/check-ins/announcements as product direction under ADR-036, but no WhatsApp/Email sending may go live until consent, opt-out, audit and template controls exist. Sessions K-N maintain local visual iteration in `14-MVP-HTML/`: a synthetic HTML prototype covering staff registration, returning-patient search/PIN selection sync, four digit prototype PINs, manual clinic token entry, patient phone/tablet intake, complaint-specific demo questions, optional reports, PIN generation/display, doctor brief, searchable/scrollable synthetic past files, follow-up date capture, disabled messaging preview and data-capture helper ideas. Session O upgrades the doctor-side past-file system: a cleaner clinic grouped list (PIN, name, age/sex, mobile, date·complaint, follow-up badge, file count), filters by complaint / follow-up-needed / date with a Clear-filters reset, and an "open current visit + previous visits together" split-review panel; the production PIN collision/scoping risk is documented under OT-21 while all data remains synthetic. Session P records the founder's strategic blocker resolutions (OT-18 de-scoped to AI-drafted screening question banks from medical literature with no diagnosis and full doctor discretion; OT-02 removed — a time-saving/data-organising clinic SaaS, not a device; OT-14 owned by founder who holds PT/PMA; OT-19 consent captured at data submission; OT-21 larger PIN shown in doctor's records only; OT-05 AI + harness design against hallucinations) and builds the **vertical question-pack shell** with a local-model (Ollama qwen3:14b) drafting pipeline that writes only harness-clean, `DEMO_UNVALIDATED` screening-candidate claims (AI authors questions, never clinical metadata). A 15-min cron autopilot (`0d9dc488a605`) continues drafting the most common complaints overnight. The founder then sent the primary research source — the OPD Java Disease QuestionBank — which was integrated as the primary basis: **40 literature-grounded, source-cited question packs** (466 patient-facing questions, real clinical purpose + ICD-10 + ICD evidence refs) now live at `vertical_pack/literature/`, gate outcome **28 harness-clean / 12 blocked** awaiting lead-clinician wording (GATE-REPORT.md), committed at `139185e`. The v2.3 horizontal architecture discipline remains useful where practical, but healthcare is now the committed first vertical by ADR-035. Session I published the repository to `https://github.com/abrarali579/MEDOXZI`.

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

Last verified **session O**, by re-running on the Windows host. Evidence: VERIFICATION-LOG V-2026-08-24-O-02.

| Check | Result |
|---|---|
| `python -m pytest tests/ -q` | **100 passed** (95 baseline + 5 bridge tests; re-verified this cron run, V-2026-08-24-CRON-01) |
| `python -m harness.run` | **VERDICT: PASS** — 9/9 gates, 0 contamination over 500 concurrent encounters, 100% abstention, 0 fabrication, 0 drift |
| `python demo.py \| Select-Object -Last 20` | runs clean |
| `node --check 14-MVP-HTML\app.js` | syntax check passed |
| `Invoke-WebRequest http://127.0.0.1:8765/index.html` | **200** |
| Doctor past-file live-browser (session O) | complaint filter "Cough" → 2 of 15; date filter → 1 of 15; Clear filters → 15 of 15; PIN 6184 opens "current + past" split review; 0 JS errors |

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

**Session S (cron) update — ⚠️ GATE-DRIFT WATCH:** this cron run found `gate_literature.py` reporting **39 CLEAN / 1 BLOCKED**, not the documented **28 CLEAN / 12 BLOCKED**. Cause: an uncommitted (unstaged) edit to all 40 `literature/*.json` packs + `tools/build_from_questionbank.py` removes the red-flag screens and bumps `source_bank` to v1.1. The builder docstring claims a "Session S/2026-08-24 founder decision" (no red flags, OPD-only patients) but **no Session S log, CHANGELOG entry, or ADR exists** to corroborate it. Per protocol rule 1 (no claim without evidence) this remains unverified. Both the previous CRON-01 run and session RT recorded 28/12 with a clean tree, so these edits are new and unattributed. **No commit was made and nothing was reverted** this run. Abrar must confirm whether the red-flag removal is a real founder decision (then log it and commit) or an accidental local experiment (then revert). Even if founder-approved, cleared packs remain `DEMO_UNVALIDATED` and need Lead Doctor sign-off (OT-18) for real patients. See V-CRON-02.

**Session S(v1.1) update — ✅ RESOLVED (ADR-038, committed):** the above gate-drift watch is now closed. The working-tree changes were the real, founder-authorized **ADR-038** resolution (recorded in `10-Reference/Decision-Log.md`; founder's routine-OPD-only scope — no red flags because the clinic never handles emergencies). Verified green this run: `gate_literature.py` **CLEAN 40 / BLOCKED 0**, `pytest` **100 passed**, `harness.run` **VERDICT PASS (9/9)**, `node --check` OK, `diseases.json` version **1.1**, D14 carries the founder-authorized wording (no `emergency` hit). Committed the ADR-038 engineering state with full log trail (session log `2026-08-24-SV11-cron-adr038-commit.md`, CHANGELOG, V-CRON-03). **All 40 packs remain DEMO_UNVALIDATED; OT-18 named Lead Doctor sign-off still required before real-patient use** — the gate 40/0 is an engineering/harness result, not clinical sign-off.

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
| 1 | **Review polished `14-MVP-HTML/index.html` on phone/tablet/doctor-desktop dimensions** | Confirms visual tone, four digit PINs, returning-patient selection sync, complaint-specific demo options, helper chips, Step 7 layout, PIN/done screen, **doctor past-file filter controls and the current+past split review** and data-capture ideas before production frontend engineering |
| 2 | **Design production PIN identity binding** (OT-21) | Patient history must not attach to the wrong mobile/name/age identity |
| 3 | **Vertical question-pack shell + pipeline built (session P)** — `vertical_pack/` shell, schema README, `draft_pack.py` local-model pipeline, cron autopilot; draft most-common complaints | Screens screening intake safely; AI drafts candidate questions only, never clinical metadata |
| 4 | **Draft first-visit/no-report common-disease question packs as `DRAFT` / `DEMO_UNVALIDATED` only** | Lets product/UX proceed without pretending content is signed |
| 5 | **Get named Lead Doctor review/sign-off before real patient questioning** (OT-18) | Production symptom/history questions are clinical behaviour |
| 6 | **Build report attachment/source viewer before trusted extraction** | Matches v2.6 scope and avoids unverified report conclusions |
| 7 | **Add doctor conclusion follow-up date/note capture** | Supports the v2.6 doctor value story without sending messages prematurely |
| 8 | **Design clinic-owned communication consent, opt-out, audit and template-versioning** (OT-19) | Required before reminders/check-ins/announcements/discounts can go live |
| 9 | **PSE registration** (OT-14) + **counsel opinions** (OT-01, OT-02) | Long lead; blocks lawful healthcare operation |
| 10 | **Content licensing audit** (OT-05) | Must precede generation at scale |
| 11 | **Get a GPU quote** | Turns ADR-034 from feasible into costed |

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

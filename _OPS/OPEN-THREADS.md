# OPEN THREADS

**Live document.** Unresolved items with an owner and a next action. Close threads by moving them to the CHANGELOG with the resolution; do not delete them.

**Priority:** 🔴 blocks the next milestone · 🟠 blocks a later milestone · 🟡 should be resolved · ⚪ watch

---

**Session F note:** Windows verification portability was fixed and logged in CHANGELOG / VERIFICATION-LOG. No new open thread remains from the `python3` / `tail` / demo encoding issue.

**Session H note:** Founder explicitly deferred/skipped the Evidence Sprint for now and selected healthcare-first narrow MVP. See ADR-035. OT-17 is resolved by human decision; OT-04 is deferred risk, not completed evidence.

**Session J note:** Doctor pitch playbook added. Clinic-owned reminders/check-ins/announcements are accepted as product direction under ADR-036, but production sending is blocked until consent, opt-out, audit and template controls exist.

**Session K note:** Local phone/tablet-first HTML MVP prototype started in `14-MVP-HTML/`. It is synthetic/demo-only and excludes diagnosis, visible differential, production red flags and real message sending.

**Session L note:** HTML MVP refined with existing-patient search, manual clinic token entry, relevant answer options, fixed review text layout, patient PIN generation/display, and removal of the patient-facing doctor-view button.

**Session M note:** HTML MVP polished with professional colors/copy, fixed returning-patient PIN selection field sync, complaint-specific demo answer options, issue-description helper chips, and documented data-collection feature suggestions.

**Session N note:** HTML MVP now uses four digit prototype PINs, removes non-working QR and assisted-intake buttons, and adds a searchable/scrollable doctor-view browser for 15 synthetic past patient files with labelled sample doctor assessments.

**Session O note:** Doctor past-file system upgraded in `14-MVP-HTML/` — cleaner grouped list (PIN, name, age/sex, mobile, date·complaint, follow-up badge, file count), filters by complaint / follow-up-needed / date with a Clear-filters reset, and an "open current visit + previous visits together" split-review panel (Current visit beside the selected Past visit). All data synthetic; four digit visible PINs retained. Production PIN collision/scoping risk documented under OT-21.

**Session S note:** This cron run observed an **uncommitted gate-drift**: `gate_literature.py` reports **39 CLEAN / 1 BLOCKED** (was documented 28/12). All 40 `literature/*.json` packs + `tools/build_from_questionbank.py` carry unstaged edits that remove red-flag screens and bump `source_bank` to v1.1, claiming an unlogged "Session S founder decision". **No `_OPS` log/ADR corroborates it.** Left uncommitted/reverted-nothing pending Abrar's decision. See V-CRON-02, session log S, CHANGELOG.

---

## ⚪ Watch / decision needed — uncommitted red-flag removal in question packs (found this run)

- **What:** working-tree edits to all 40 literature packs strip the `is_red_flag_screen` questions and bump source metadata v1.0→v1.1; `tools/build_from_questionbank.py` was likewise edited to stop emitting red-flag screens (docstring cites an unlogged "Session S" founder decision: routine-OPD patients only, no red flags / no emergency handling).
- **Why it matters:** the change shifts the gate from **28 CLEAN / 12 BLOCKED** → **39 CLEAN / 1 BLOCKED**. If real, it honours OT-02/OT-05 (non-diagnostic screening, OP D-only) and would let the founder's Lead Doctor review a friendlier set; if not, it is an unsanctioned alteration of Lead-Clinician-gated wording (ADR-002/037). Either way the current 39/1 must NOT be read as clinically signed.
- **Decision needed from Abrar:** (a) confirm the red-flag removal as a real founder decision → we log it as genuine Session S + ADR, correct the 28-12 documentation, then commit the pack rebuild; OR (b) revert the builder edit + pack regen (accidental local change). After decision, cleared packs still need **OT-18 Lead Doctor sign-off** before real-patient use.
- **Owner:** Abrar (decision) · **Status:** ⚪ awaiting decision · **Blocked on:** nothing build-wise (tests still 100 green, harness PASS).

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

### OT-18 · Question pack (signing) — 🟡 DEFERRED to doctor sign-off (founder decision, session P)
- **Founder decision (session P):** question bank will be designed from medical literature with AI + Harness. It asks **relevant patient questions only** — **no diagnosis**. Doctors retain **full discretion** to act or not act on every answer. This removes it as a blocker to *drafting*, which is now in progress.
- **Status:** drafting is clear. Before any **real-patient** use, the pack still needs **Lead Doctor review + sign** (ADR-002 / ADR-015 unchanged) — a named clinician authorises, AI only drafts.
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

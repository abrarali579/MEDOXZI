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

## 🔴 Blocking — cannot proceed to real patient use without these

### OT-01 · Indonesian data storage and inference — 🟠 DOWNGRADED from 🔴 (session E)
- **Storage: ✅ RESOLVED.** Founder confirms Indonesian VPS/cloud capacity is readily available. Design for in-Indonesia storage stands.
- **Inference: 🟠 DE-RISKED, NOT CLOSED.** Session-E research found Indonesian sovereign AI cloud capacity — Lintasarta (Indosat) *GPU Merdeka*, NVIDIA H100 SXM GPU-as-a-Service, plus an announced Surakarta AI data centre. **[Third-Party Claim — press coverage]** Self-hosted in-country inference is a real option. See ADR-034.
- **⚠️ The distinction that must not be lost:** **storage location ≠ processing location.** A Jakarta VPS does not make inference domestic unless the model runs on it. If the LLM call goes to a Singapore or US endpoint, processing happens abroad regardless of where the database sits.
- **Remaining:** (a) obtain a direct quote from Lintasarta or an equivalent — confirm current availability, pricing, terms, and whether GPU capacity is genuinely allocatable at pilot scale; (b) counsel confirmation of whether *processing* is treated separately from *storage* under PDP and Permenkes.
- **Owner:** engineering (quote) + Indonesian data-protection counsel ⚖️ (processing question)

### OT-14 · PSE Lingkup Privat registration — 🟠 NEW (session E)
- **What:** B2B SaaS serving Indonesian users must register as a **PSE Lingkup Privat** with Komdigi and obtain a **TDPSE** certificate. This is **separate from** the PT PMA's business licence and KBLI — having the entity does not satisfy it. **[Third-Party Claim — practitioner sources; verify with counsel]**
- **Why it matters:** non-registration risks access blocking by Indonesian ISPs. Post-registration obligations include records maintenance, lawful access cooperation, a complaint mechanism, and security incident reporting.
- **How:** OSS → NIB and business licence → Komdigi PSE portal → designate a PIC → upload deed, NIB, licence → TDPSE.
- **Owner:** founder + Indonesian corporate counsel ⚖️
- **Note:** the PT PMA with Web/App/SaaS development activity covers *building and selling software*. Operating an electronic system holding Indonesian user data is a separate registration.

### OT-02 · Medical device classification — 🟠 DOWNGRADED from 🔴 (session E)
- **Question:** is the MVP a regulated medical device in Indonesia?
- **What changed:** the horizontal repositioning (ADR-031) materially strengthens the position. Classification turns on **intended use** — software with a *medical purpose* is in scope, software with an *administrative* purpose is not. **[Third-Party Claim — practitioner sources; NOT yet verified against a Kemenkes primary document]** A platform genuinely serving legal, accounting, insurance, recruitment **and** healthcare is evidently a general-purpose information system.
- **⚠️ But the claim is conditional on the architecture, not the marketing.** If the healthcare vertical ships clinical rules, a medical question bank and clinical urgency language while the legal vertical ships none, healthcare is a different product wearing the same name — and a regulator will look at the healthcare vertical. See ADR-031's binding rules.
- **Still required:** written counsel opinion. Positioning strengthens the argument; it does not settle it.
- **Owner:** Indonesian medical-device regulatory counsel ⚖️
- **How:** two opinions — (a) the platform as scoped with an empty pack, (b) platform plus a visible differential. Include `00-Executive/Horizontal-Positioning.md` and `13-Indonesia/Regulatory-Boundary-Register.md`.
- **Also needed:** verify the administrative-software exclusion against a **Kemenkes primary document**, not a practitioner page. This project has over-read secondary sources twice.

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

### OT-18 · Lead-Doctor-signed basic healthcare question pack — 🔴 NEW
- **What:** the v2.4 MVP asks relevant symptom/history questions after a patient's issue description. That is clinical behaviour and cannot go live on real patients unless a named Lead Doctor reviews and signs the basic question pack and wording.
- **Boundary:** AI may draft or rank candidate questions in demo/shadow contexts only. Production patient questions must come from a signed pack. No red-flag/escalation content is added unless the Lead Doctor signs it separately.
- **Owner:** Lead Doctor + founder + engineering
- **How:** create the healthcare `vertical_pack` shell with statuses (`DRAFT`, `DEMO_UNVALIDATED`, `CLINIC_REVIEW`, `APPROVED_FOR_PILOT`, `ACTIVE`). Keep production rules empty. Record source/licence refs for any drafted content (OT-05).

### OT-19 · Clinic-owned engagement consent/comms controls — 🟠 NEW
- **What:** follow-up reminders, post-visit check-ins, feedback/rating requests, clinic announcements and discount offers are now part of the doctor pitch and product direction. They are allowed only as **clinic-owned** communications, not MEDOXZI-owned patient marketing. See ADR-036 and `09-MVP/Doctor-Pitch-Playbook.md`.
- **Blocks:** production WhatsApp/Email sending, bulk announcements, discount campaigns, and any patient reactivation workflow.
- **Boundary:** no message may contain AI diagnosis, treatment advice, false urgency, or a MEDOXZI marketing purpose. Consent must be separate, revocable and auditable. Opt-out must not affect care.
- **Owner:** founder + engineering + counsel ⚖️
- **How:** add clinic-communications consent, message-template versioning, sender identity, opt-out handling, audit events, delivery logging, and a hard prohibition on exporting patient contact lists for MEDOXZI marketing.

### OT-20 · HTML MVP visual review and screen lock — 🟡 NEW
- **What:** `14-MVP-HTML/` now contains the first local visual MVP. It needs founder/doctor/staff review before production UI engineering starts.
- **Blocks:** final UI scope, production component design, and the first production frontend build.
- **Boundary:** keep the prototype synthetic/demo-only. Do not turn demo questions into production clinical content. Do not add diagnosis, visible differential, treatment advice, urgency language, production red flags or live patient messaging.
- **Owner:** founder + product/frontend + Lead Doctor for any clinical wording.
- **How:** review on a phone and tablet. Confirm each screen in order: returning-patient search/selection sync, four digit PIN display, manual clinic token, staff registration, tablet handoff, patient consent, basic info, complaint, 2-3 line description with helper chips, complaint-specific demo questions, optional reports, review/done with PIN, doctor queue, doctor brief, searchable past files, open old file detail, conclusion/follow-up, disabled reminder preview, and the proposed data-capture helpers. Record approved changes in `14-MVP-HTML/MVP-Prototype-Plan.md`.

### OT-21 · Production PIN identity binding — 🟡 NEW
- **What:** the HTML MVP now models a Patient Identification Number (PIN) generated at submission and linked to name, age and mobile. Production must enforce that a PIN cannot be silently attached to a different customer number or identity.
- **Blocks:** production patient lookup, follow-up history, duplicate prevention and safe longitudinal records.
- **Boundary:** this is identity/record-linking, not a clinical claim. Do not use real patient data in tests.
- **Owner:** engineering + privacy/security reviewer.
- **How:** add immutable patient identity keys, duplicate review workflow, audit events for any merge/correction, scoped uniqueness for four digit visible PINs, and tests proving an existing PIN cannot be re-bound to a mismatched mobile/name/age without an explicit audited human resolution.

#### Collision / scoping risk (documented session O — latest work: doctor past-file filters)
- **Known demo limitation:** the prototype deliberately keeps **4-digit visible PINs** and allows the same PIN to appear across synthetic demo files for illustration (e.g. clinic-facing list shows PINs like `1049`, `4729`, `6184`, `2914`, `6805`, `5273`). These are **not** unique patient identities — they are short, collision-prone labels.
- **4-digit space is only 10,000 combinations** — trivially collidable at clinic scale (birthday paradox: ~50% collision likelihood near ~119 records). Production cannot use a bare 4-digit PIN as the sole identity key.
- **Mismatch scoping (adopted here):** identity is a composite of PIN **+ name + age + mobile**, never PIN alone. The doctor past-file list groups and filters records under a PIN, but the chosen record must still match name/age/mobile before an existing file is presented as that patient's history. The split review ("open current visit + previous visits together") therefore only ever shows the **selected** composite record, never two different people under one PIN.
- **Production requirement:** scope the PIN to its creating clinic + use a distinct immutable internal patient key; treat the visible 4-digit PIN as a **per-clinic 4-digit prefix/short-code**, not a global or national identifier. Any remap/correction must be an audited human action (covered by the OT-21 How line).
- **Demo assertion:** no real patient data anywhere in the prototype; all PIN-linked files are synthetic "sample doctor assessments".

## 🟠 Blocking the pitch

### OT-05 · Content source licensing — 🟠 ENLARGED (session E)
- **Question:** are the sources our question banks are drafted from licensed for commercial use?
- **What changed:** ADR-033 introduces **AI-assisted generation at scale**, which makes this materially bigger — volume makes unlicensed use look deliberate rather than incidental.
- **Permitted sources:** public health-ministry guidance · permissively-licensed open access · universally-taught frameworks · **the customer's own licensed material (best)** · the expert's own written knowledge.
- **Prohibited:** paywalled journals, textbooks, clinical decision references, scraped competitor content.
- **Hard gate:** `KnowledgeSource.licence_ref` is `NOT NULL`; a question with an unverified source licence cannot leave `UNVALIDATED_DEMO_CONTENT`.
- **Do not generate at scale before this clears** — a large bank from unlicensed sources must be thrown away and regenerated.
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

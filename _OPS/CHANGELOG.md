# CHANGELOG

**Append-only.** Newest first. Every entry answers: WHAT · WHY · EVIDENCE · NEXT · WHY NEXT · HOW.

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

# STATE — where this project actually is

**Updated:** 2026-08-23, session I (GitHub publish complete; v2.4 state unchanged)
**Repository version:** **v2.4**
**Read this first. Update it last.**

---

## 1. One-paragraph status

The design blueprint is complete and internally consistent. The prototype passes **95 tests** and the harness passes **9/9 gates** (re-verified in session I by re-running, not by report). **No production code exists yet.** Session H records an explicit founder decision to defer/skip the Evidence Sprint for now and proceed with a **healthcare-first narrow MVP**: basic personal information, a 2-3 line patient issue description, Lead-Doctor-approved basic questions, optional previous-report attachments for doctor review, and a doctor brief pushed to the doctor's tablet/phone. Best initial patients are first clinic visits with no previous reports. The v2.3 horizontal architecture discipline remains useful where practical, but healthcare is now the committed first vertical by ADR-035. Session I published the repository to `https://github.com/abrarali579/MEDOXZI`.

## 2. Product boundary (do not drift from this)

**A healthcare-first professional intake and doctor-briefing platform.**

```
Patient → Basic information → Issue description → Relevant questions → Optional reports → Doctor brief → Doctor decision
```

The current MVP is healthcare-first, but still **not** a diagnosis engine, symptom checker, prescribing system, treatment recommender, or autonomous clinical agent. The doctor brief organises source-bound information; it does not make a clinical conclusion.

⚠️ **The horizontal claim is only protective if the architecture is genuinely horizontal.** See ADR-031's three binding rules.

## 3. Where we are in the sequence

```
HEALTHCARE-FIRST NARROW MVP → HARNESS+HARDENING → PITCH / PILOT CLINIC →
LEAD DOCTOR CUSTOMISE + SIGN-OFF → CLIENT 1 SHADOW (wk1) → LIVE (wk2) → IMPROVE → V1 FREEZE
   ▲
   └── WE ARE HERE (not built)
```

**Nothing downstream has begun.** For healthcare, the required domain expert is the **Lead Doctor**. Production clinical questions and any red-flag/escalation content remain inactive until signed.

## 4. Verified state of the code

Last verified **session I**, by re-running on the Windows host. Evidence: VERIFICATION-LOG V-2026-08-23-I-01.

| Check | Result |
|---|---|
| `python -m pytest tests/ -q` | **95 passed** |
| `python -m harness.run` | **VERDICT: PASS** — 9/9 gates, 0 contamination over 500 concurrent encounters, 100% abstention, 0 fabrication, 0 drift |
| `python demo.py \| Select-Object -Last 20` | runs clean |

## 5. Blocking threads

| Thread | Status | Why |
|---|---|---|
| **OT-18 · Lead-Doctor-signed basic healthcare question pack** | 🔴 **Blocks real patient use** | The MVP asks symptom/history questions; production clinical questions require named Lead Doctor sign-off. |
| **OT-02 · Medical device classification** | 🟠 **Blocks healthcare launch posture** | Healthcare-first makes counsel confirmation more important, not less. |
| **OT-14 · PSE registration** | 🟠 **Blocks lawful operation** | B2B SaaS serving Indonesian users likely requires PSE registration; counsel/primary confirmation still needed. |
| **OT-04 · Evidence Sprint** | ⚪ **Deferred risk** | Founder deferred/skipped it for now by ADR-035; document reality risk remains accepted, not disproven. |
| **OT-17 · Which vertical goes first** | ✅ **Resolved** | Healthcare-first selected by founder in ADR-035. |

**Downgraded in session E:** OT-01 (storage resolved, inference feasible) · OT-02 (positioning strengthens it) · OT-03 (**resolved** — PT PMA exists).
**New in session H:** OT-18 Lead-Doctor-signed basic healthcare question pack.

## 6. Settled decisions (35 ADRs)

| # | Decision | ADR |
|---|---|---|
| 1 | **Healthcare-first narrow MVP**; Evidence Sprint deferred by founder decision | **ADR-035** |
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
| 1 | **Create healthcare `vertical_pack` shell and question-pack status workflow** | Blocks safe implementation of the v2.4 intake |
| 2 | **Draft first-visit/no-report basic question pack as `DRAFT` or `DEMO_UNVALIDATED` only** | Lets product/UX proceed without pretending content is signed |
| 3 | **Get named Lead Doctor review/sign-off before real patient questioning** (OT-18) | Production symptom/history questions are clinical behaviour |
| 4 | **Build report attachment/source viewer before trusted extraction** | Matches v2.4 scope and avoids unverified report conclusions |
| 5 | **PSE registration** (OT-14) + **counsel opinions** (OT-01, OT-02) | Long lead; blocks lawful healthcare operation |
| 6 | **Content licensing audit** (OT-05) | Must precede generation at scale |
| 7 | **Get a GPU quote** | Turns ADR-034 from feasible into costed |

## 9. What must NOT happen next

- No production clinical question pack before named Lead Doctor sign-off
- No question bank generation at scale before OT-05 clears
- No avoidable domain-specific capability inside the engine (ADR-031); healthcare-specific content belongs in the pack
- No clinical rule content authored by anyone but a named expert
- No pitch using invented performance figures
- No real patient or client data anywhere
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

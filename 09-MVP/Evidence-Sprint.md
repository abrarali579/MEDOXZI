# Evidence Sprint — replaces RECON

**Date:** 2026-08-23 · **Supersedes:** `Development-Plan.md` §2 (RECON, 2–3 weeks in clinic waiting rooms)
**Answers the founder's question:** *"Is RECON zaroori hai?"*

> **v2.4 status:** deferred/skipped for now by explicit founder decision in session H. Healthcare-first narrow MVP is the current route; see `ROADMAP.md` and ADR-035. This sprint remains preserved as the documented risk-reduction path if document extraction or horizontal expansion becomes primary again.

---

## 0. Operational Files

Session G added the execution files for this sprint:

- `ROADMAP.md` - root roadmap and current phase map.
- `09-MVP/Evidence-Sprint-Runbook.md` - day-by-day operating plan.
- `09-MVP/Evidence-Sprint-Templates.md` - blank capture templates.

Do not commit real patient/client documents or sensitive raw notes to this repository. Commit only aggregate taxonomy, de-identified summaries and the written first-vertical decision.

## 1. The honest answer

**RECON as originally scoped is no longer the right shape. Two of its five questions have stopped mattering, one has changed owner, and two have become MORE important — not less.**

RECON was designed when MEDOXZI was a healthcare-only product entering one clinic. The horizontal repositioning ([Horizontal-Positioning.md](../00-Executive/Horizontal-Positioning.md)) changes who the user is and what the documents look like, so a fortnight in an OPD waiting room now answers questions about **one vertical** at the cost of delaying **all of them**.

| Original RECON question | Still needed? | Why |
|---|---|---|
| **What do real documents look like?** | ✅ **MORE important** | Now across *several* verticals with wildly different profiles. This is the question that determines the extraction architecture and the entire variable cost model. |
| **Will intake actually get completed?** | ✅ **Still critical, different user** | A law firm's client at a desk is not an elderly BPJS patient in a waiting room. The risk did not disappear — it changed shape and got easier to test. |
| **Chief-complaint frequency (top 10)** | ⚠️ **Moved** | This is *vertical pack content*, and it is now the expert's job at CUSTOMISE, not a pre-build study. |
| **Consultation time baseline** | ❌ **Dropped from the sprint** | Only needed when the healthcare pilot measures time saved. Move it into the pilot itself. |
| **P-Care double-entry observation** | ⚠️ **Deferred** | Valuable for the *healthcare pitch*, not for the build. Do it when healthcare becomes the active vertical. |

**So: not three weeks in a waiting room. But not nothing either — and the reason is specific.**

## 2. The one argument that survives everything

> **Building a document extraction pipeline against imagined documents is the most expensive mistake available in this project, and it is vertical-independent.**

This is not a healthcare concern. A legal PDF, a thermal-printed lab report, a phone photo of a handwritten prescription, a bank statement and a workshop dashboard photo are five completely different engineering problems. Choosing OCR strategy, extraction schemas, confidence thresholds and cost model without seeing real examples means committing months of work to assumptions.

**100–200 real documents costs a few days of asking people. Getting it wrong costs a quarter.**

Everything else in this sprint is optional. This part is not.

## 3. The sprint — 3 to 5 days, mostly remote

**No clinic contract. No fieldwork commitment. No engineering.**

### Day 1–3 · Document reality (the essential part)

Collect **100–200 real documents across two verticals** — healthcare plus one commercial vertical the founder can access quickly.

| Source | How |
|---|---|
| Personal and professional network | Ask directly. Consented, de-identified, redacted by the sender if they prefer |
| Pharmacies, small clinics | Ask for *sample formats*, not patient data |
| Law firm / accountant contacts | Sample engagement documents, invoices, statements — with client details removed |
| Public formats | Indonesian lab report templates, standard forms, insurance claim forms |

**Record for each:** vertical · document type · digital-text or scanned · handwritten or printed · page count · capture quality · language.

**Output:** a document taxonomy and the founding corpus of the harness — which was always the longest-lead engineering input.

### Day 3–4 · Intake completion, tested cheaply

Replace the waiting-room Wizard-of-Oz with something far faster:

- Build (or mock in a form tool) a **10-question intake** for each vertical
- Send the link to **10–15 real people** of the right profile per vertical — actual patients, actual law-firm clients
- Measure: completion rate · time taken · where they stopped · what confused them

**This is not a statistical study.** It is a smoke test. If 12 of 15 literate professional clients complete a legal intake and 4 of 15 patients complete a healthcare intake, that single fact should shape which vertical goes first.

### Day 4–5 · Buyer conversations

Four to six conversations, one hour each, across both verticals. One question dominates:

> **"How many times does the same case get typed into a computer before an expert can act on it?"**

If the answer is two or more, the value proposition is confirmed and the pitch writes itself. Secondary: what they'd pay, who signs, what breaks today.

## 4. What this sprint deliberately does NOT do

| Not doing | Why |
|---|---|
| Sitting in waiting rooms for two weeks | Answers one vertical at the cost of delaying all of them |
| Consultation-time baseline | Belongs in the healthcare pilot, not before the build |
| Chief-complaint frequency study | Vertical pack content — the expert's job at CUSTOMISE |
| P-Care observation | Healthcare pitch input, deferred |
| Signing a clinic | Not required, and premature |

## 5. Exit criteria

| # | Criterion | Why it gates the build |
|---|---|---|
| 1 | **≥100 real documents collected, taxonomy recorded, across ≥2 verticals** | The extraction architecture and cost model depend on it |
| 2 | Intake smoke test run with ≥10 people per vertical, completion recorded | The product thesis |
| 3 | ≥4 buyer conversations, double-entry question answered | The pitch |
| 4 | **A written decision on which vertical goes first** | Everything downstream branches here |

**Criterion 1 is the hard gate.** The others can be thin; that one cannot.

## 6. What happens to the sequence

```
EVIDENCE SPRINT (3–5 days) → MVP → HARNESS + HARDENING → PITCH →
CUSTOMISE WITH DOMAIN EXPERT → CLIENT 1 SHADOW (wk1) → LIVE (wk2) → IMPROVE → V1 FREEZE
```

Everything after the sprint is unchanged except that **"Lead Doctor" generalises to "Domain Expert"** — the named professional who signs the vertical pack. For healthcare that is a doctor; for legal, a partner; for accounting, a senior accountant. **The mechanism, the sign-off requirement and the empty-pack rule are identical.**

## 7. Cost

| | RECON (original) | Evidence Sprint |
|---|---|---|
| Duration | 2–3 weeks | **3–5 days** |
| Location | On-site, one clinic | Mostly remote |
| Verticals covered | 1 | **2** |
| Requires clinic contract | No | No |
| Requires engineering | No | No |
| Blocks the build | Yes | Yes — but for days, not weeks |

**The essential question — what do the documents actually look like — is answered either way. Everything else got faster.**

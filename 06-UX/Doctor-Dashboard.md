# UX Specification — Doctor Dashboard

**The single design constraint that overrides everything else: ≤30 seconds to read, ≤1 click to reach anything, 0 modals.** A doctor with 60 patients and 5 minutes each will abandon any tool that costs them time, and they will do it silently.

---

## 1. Screen: OPD Queue

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Dr. Sharma · General Medicine · 23 Aug, Morning        ⚙  ⓘ   [Search…]     │
├──────────────────────────────────────────────────────────────────────────────┤
│  Waiting 14 · Seen 22 · Avg 4m12s                       [ Next patient ▸ ]   │
├──────┬───────────────────┬──────────┬───────────┬──────────┬─────────────────┤
│ TOK  │ PATIENT           │ WAITING  │ INTAKE    │ DOCS     │ FLAGS           │
├──────┼───────────────────┼──────────┼───────────┼──────────┼─────────────────┤
│  47  │ R. S. · F 48      │  34 min  │ ● Complete│ 3/3 ✓    │ 🔴 1 HIGH       │
│  48  │ M. K. · M 62      │  28 min  │ ◑ Partial │ 1/2 ⧗    │ —               │
│  49  │ A. B. · F 31      │  25 min  │ ○ None    │ 0        │ —               │
│  50  │ P. T. · M 7       │  21 min  │ ● Complete│ 0        │ ⓘ Paediatric —  │
│      │                   │          │           │          │   raw view only │
└──────┴───────────────────┴──────────┴───────────┴──────────┴─────────────────┘
```

**Rules**
- Flags are **indicators, not sorting**. The queue is in token order unless staff re-ordered it. The system never reorders the doctor's list on its own.
- Intake status uses three unambiguous glyphs: ● complete, ◑ partial, ○ none. There is no fourth "probably fine" state.
- Paediatric/pregnancy/elderly cohorts are labelled *in the queue* so the doctor knows before opening that they will see a raw view.
- `Next patient` is a single keystroke (`N`). Everything on this screen is keyboard-reachable.

## 2. Screen: Patient Snapshot (the Pre-Round View)

This is the product. Everything else supports it.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◂ Queue    TOKEN 47 · R. S. · Female, 48                    [Timeline] [Docs]│
├──────────────────────────────────────────────────────────────────────────────┤
│ 🔴 RED FLAG · RF-CHEST-02 · HIGH                                    [Why? ▾] │
│    Chest pain with exertional relationship, age >45 — assess promptly        │
│    Triggered by: "worse on exertion = YES" · age 48        [Acknowledge]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ CHEST PAIN · 3 days                                              〈Patient〉  │
├────────────────────────────────────┬─────────────────────────────────────────┤
│ ⚠ ALLERGIES                        │ CURRENT MEDICATIONS                     │
│   Penicillin — rash     〈Patient〉 │   Metformin 500mg BD    ✓ 〈Record〉    │
│                                    │   Atorvastatin 10mg OD  ⚠ unconfirmed   │
│                                    │                         〈Record 0.61〉  │
├────────────────────────────────────┼─────────────────────────────────────────┤
│ SIGNIFICANT POSITIVES              │ SIGNIFICANT NEGATIVES                   │
│ • Worse on exertion      〈Patient〉│ • No radiation to arm/jaw    〈Patient〉 │
│ • Relieved by rest       〈Patient〉│ • No breathlessness          〈Patient〉 │
├────────────────────────────────────┴─────────────────────────────────────────┤
│ KNOWN CONDITIONS   Type 2 diabetes 〈Record〉 · Hypertension 〈Patient〉       │
├──────────────────────────────────────────────────────────────────────────────┤
│ ABNORMAL PRIOR LABS                                                          │
│   HbA1c  8.4 %  (4.0–5.6)  ▲  02 Jun 2026        〈Record 0.96〉 [view page] │
├──────────────────────────────────────────────────────────────────────────────┤
│ ⚡ CONTRADICTION                                                             │
│   Patient reports no diabetes 〈Patient〉 ⟷ Discharge summary: T2DM 〈Record〉│
│                                                              [Resolve ▸]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ◻ MISSING   Smoking status (not asked) · Family history of CAD (not asked)   │
├──────────────────────────────────────────────────────────────────────────────┤
│ [ Start questions ▸ ]                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Design decisions and the reasoning behind each

| Decision | Why |
|---|---|
| **Allergies always top-left, fixed position, on every patient** | It is the one field where a miss is catastrophic. Fixed position means the eye learns where to look and never has to search. Present even when empty — rendering "Allergies: not asked". |
| **Provenance chips `〈Patient〉 〈Record〉 〈Staff〉 〈AI〉` on every value** | Answers "who said this?" without a click. A single shared component, so omitting it requires deliberate effort. |
| **Confidence shown numerically only for extracted facts** | `〈Record 0.61〉` tells a doctor more than a colour. Confidence is not shown for patient-reported facts because it would be meaningless there. |
| **Unconfirmed items marked ⚠ and visually lighter** | The doctor must be able to see, at a glance, which values are OCR's opinion rather than a confirmed fact. |
| **Two-column layout for positives/negatives** | Significant negatives are as clinically valuable as positives and are usually buried in prose. Side-by-side gives them equal weight. |
| **Contradictions get their own band, unresolved by default** | The system's job is to *notice*, the doctor's job is to *decide*. |
| **"Missing" is an explicit block** | Absence must be visible. A summary that silently omits smoking status implies it was asked and negative. |
| **Red flag shows the rule id, the rule version and the exact triggering values** | Explainability is what stops a flag becoming noise. The doctor can immediately judge whether the rule applied sensibly. |
| **`[Why? ▾]`** expands the plain-English rule text | Written by the clinical safety owner, not generated. |
| **`[Acknowledge]` never blocks** | The doctor may proceed without acknowledging. A blocking alert is an alert that gets clicked through reflexively. |
| **No differential panel in v1** | It exists in the shadow store. It is not on this screen, and no toggle reveals it. |
| **No modal, ever, on this screen** | An interrupted doctor with an open modal loses the encounter. |

### When there is no AI content

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◂ Queue    TOKEN 49 · A. B. · Female, 31                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ○ No intake completed                                                        │
│   This patient did not complete intake. Registration information only.       │
│   [ Start intake with patient ▸ ]                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ⓘ AI summary not generated — patient is under 18.                            │
│   Showing intake exactly as recorded. Red-flag rules are not applied to this │
│   cohort in this version.                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ⓘ AI processing was declined by this patient. Showing intake as recorded.    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Every degraded state names its reason.** The doctor is never left to guess whether the summary is thin because the patient is well or because the system failed.

## 3. Screen: Question panel

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOKEN 47 · R. S.                                        Question 2 of 6      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Does the pain radiate?                                                     │
│                                                                              │
│   [1] Left arm    [2] Right arm   [3] Jaw    [4] Back   [5] None   [6] Other │
│                                                                              │
│   [Space] Not asked     [U] Unknown                                          │
│                                                                              │
│   ⓘ Discriminates cardiac from musculoskeletal causes                        │
│                                                              [+ My question] │
├──────────────────────────────────────────────────────────────────────────────┤
│ ✓ Worse on exertion — Yes                                    [👍] [👎]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Number keys answer.** Space = not asked. `U` = unknown. Enter advances. The mouse is optional throughout.
- **"Not asked" is as prominent as any answer** — it must never be easier to record a false negative than an honest gap.
- **A one-line rationale** per question. Not a justification; a reminder of why it discriminates.
- **`[+ My question]`** lets the doctor add their own and is captured as the "missing question" signal that drives content-bank improvement.
- **Feedback thumbs on answered questions** — one tap, non-blocking, no dialog.

## 4. Screen: Summary and sign

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOKEN 47 · R. S. · Female, 48                                    DRAFT       │
├──────────────────────────────────────────────────────────────────────────────┤
│ ▸ PATIENT REPORTED                                              〈Patient〉   │
│   48F, chest pain 3 days, worse on exertion, relieved by rest. No radiation. │
│   No breathlessness. Reports hypertension. Reports no diabetes.              │
├──────────────────────────────────────────────────────────────────────────────┤
│ ▸ HISTORICAL RECORD                                              〈Record〉   │
│   T2DM (discharge summary, 12 Mar 2026). HbA1c 8.4% (02 Jun 2026).           │
│   Metformin 500mg BD.                                        [3 sources]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ▸ OBSERVED IN CONSULTATION                                       〈Doctor〉   │
│   Radiation: left arm. BP 148/92. Chest clear.                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ │ 🤖 AI-GENERATED — VERIFY BEFORE USE                        [collapse ▾] │   │
│ │ Symptom pattern is exertional with rest relief, duration 3 days.        │   │
│ │ Unresolved: contradiction between reported and recorded diabetes status.│   │
│ │ Not covered by intake: smoking status, family history.                  │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ▸ ASSESSMENT                                                                 │
│   [                                                                     ]    │
│   Diagnosis [_______________] Alternative [_______________]                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Was this summary…  [Accurate] [Partly] [Incorrect] [⚠ Unsafe] [Omitted sth]  │
│                                                       [ APPROVE & SIGN ▸ ]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **The AI section is inside a visible container with a robot marker and a warning label.** It is the only boxed section. It collapses; the others do not. A doctor scanning quickly can see exactly which words the machine wrote.
- **`APPROVE & SIGN` is the only path into the record.** Its prominence is deliberate and its meaning is stated in the button, not in a tooltip.
- **Feedback sits above the sign button** so it is on the natural path — and is skippable by simply signing.

## 5. Interaction budget (the acceptance criterion)

| Action | Target |
|---|---|
| Queue → patient open | 1 click / 1 keystroke |
| Snapshot read | ≤30s, no scroll for the critical band |
| Verify a low-confidence medication | 2 clicks (fact → confirm) |
| Answer a question | 1 keystroke |
| Reach a source document | 1 click, ≤2s to a highlighted region |
| Sign | 1 click |
| Give feedback | 1 tap |
| **Total added interactions vs paper** | **≤12 per encounter** |

## 6. Visual language

| Element | Treatment |
|---|---|
| Red flag | Red band, left border, rule id visible. **Used only for red flags** — never for anything else, so the colour keeps its meaning. |
| AI content | Grey container, robot marker, explicit label. Never inline with human-sourced text. |
| Unconfirmed | ⚠ marker + reduced weight + numeric confidence |
| Provenance chip | Small, monochrome, consistent position after the value |
| Contradiction | Amber band with both values shown |
| Missing | Outline box, low emphasis, but always present |
| Abnormal lab | ▲/▼ arrow + reference range always shown alongside |

**Colour is never the only signal.** Every state carries a glyph and a text label, for accessibility and for printed output.

## 7. What we deliberately did not put on this screen

| Omitted | Why |
|---|---|
| Differential diagnosis panel | v1 shadow mode; see [MVP-Decision.md](../00-Executive/MVP-Decision.md) |
| Probability or risk scores | Unvalidated numbers invite unearned trust |
| "AI confidence" for the summary as a whole | A single confidence number for a paragraph is meaningless and misleading |
| Chat interface | No clinical need in a 5-minute encounter; unbounded output surface |
| Charts and trend graphs beyond ▲/▼ | Reading time is the scarce resource |
| Notifications, badges, gamification | This is a clinical tool |
| A "dismiss all flags" control | Makes ignoring safety output a one-click habit |

## v2.2 Reconciliation

Doctor UI distinguishes patient-reported, caregiver-reported, staff-entered, extracted-unverified, historical, clinician-verified, contradictory, and missing facts using labels/icons/text, not colour alone. It shows provenance, reliability, verification, source preview/crop for high-risk extracted facts, and fast confirm/reject/correct actions. No hidden diagnostic payload, CSS-hidden shadow result, or unsupported probability appears in client data.


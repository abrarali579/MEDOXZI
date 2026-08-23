# UX Specification — Staff Console

**Context:** front-desk and intake staff are the busiest people in the clinic and the reason the product works at all. If assisted intake takes them more than ~5 minutes, they will stop offering it, completion rate collapses, and the product fails. **The staff console's performance target is a business-critical metric, not a nicety.**

---

## 1. Screen: Registration

```
┌──────────────────────────────────────────────────────────────────────┐
│  Registration                          Dr. Sharma · Morning · 23 Aug │
├──────────────────────────────────────────────────────────────────────┤
│  🔍 [ Search: name / phone / ID                                    ] │
│                                                                      │
│  ── or register new ──                                               │
│  Name     [                        ]   Age [   ] ○M ●F ○Other        │
│  Phone    [                        ]   Language [Hindi ▾]            │
│  ABHA/ID  [                        ] (optional)                      │
│                                                                      │
│  Doctor   [Dr. Sharma ▾]   Department [General Medicine ▾]           │
│                                                                      │
│                          [ Register & issue token  (Enter) ]         │
└──────────────────────────────────────────────────────────────────────┘
```

**Six fields. One keystroke to submit.** Registration must add ≤30 seconds to the front desk's existing process — measured, not assumed.

Possible duplicates appear inline as a warning with a comparison, never as a blocking modal, and are always resolved by a human.

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✓ Token 51 issued · R. Kumar · M 54                                 │
│                                                                      │
│  Intake:   [📱 Send SMS link]  [▦ Show QR]  [💻 Start on tablet]     │
│            [👤 I'll help them]                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Four equally-weighted options.** "I'll help them" is not styled as a fallback, because presenting it as the lesser path is how digitally-excluded patients get excluded.

## 2. Screen: Assisted intake

```
┌──────────────────────────────────────────────────────────────────────┐
│  Token 51 · R. Kumar, M 54 · Hindi        ASSISTED INTAKE   ⏱ 2:14   │
├──────────────────────────────────────────────────────────────────────┤
│  Question 4 of 12                          ▓▓▓▓▓▓░░░░░░░░░           │
│                                                                      │
│  ASK (Hindi):  क्या दर्द चलने पर बढ़ता है?                            │
│  ────────────────────────────────────────────────────────────────    │
│  You are reading:  "Does the pain get worse when you walk?"           │
│                                                                      │
│     [1] Yes      [2] No      [3] Not sure                            │
│     [Space] Patient not asked                                        │
│                                                                      │
│  Patient's own words (optional):                                     │
│  [ चलने पर सीने में भारीपन                                          ]│
│                                                                      │
│  ⓘ Record what the patient says. Do not interpret it.                │
│                                          [ ◂ Back ]  [ Next ▸ ]      │
└──────────────────────────────────────────────────────────────────────┘
```

**Design decisions**

| Decision | Why |
|---|---|
| The question is shown **in the patient's language, large**, with the English underneath for the staff member | Staff read the script aloud rather than paraphrasing — paraphrase is where clinical meaning is lost |
| **"Patient's own words" free-text field on every question** | Captures the nuance a structured option cannot, and gives the doctor the patient's actual phrasing |
| **"Record what the patient says. Do not interpret it."** persistent hint | The single biggest data-quality risk in assisted intake is a helpful staff member translating symptoms into clinical language |
| Number-key answering | Speed |
| Visible timer | Staff self-manage pace; also gives us the completion-time metric |
| No clinical guidance shown to staff | Staff are not being asked to triage |

## 3. Screen: Read-back (required, not optional)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Read this back to the patient                     Token 51          │
├──────────────────────────────────────────────────────────────────────┤
│  आपने बताया:                                                          │
│   • सीने में दर्द, 2 दिन से                                           │
│   • चलने पर बढ़ता है                                                  │
│   • कोई दवा नहीं                                                      │
│   • कोई एलर्जी नहीं मालूम                                             │
│                                                                      │
│  Ask: "क्या यह सही है?"                                               │
│                                                                      │
│       [ ✓ Patient confirmed ]     [ ✗ Needs correction ]             │
└──────────────────────────────────────────────────────────────────────┘
```

**This step is mandatory and cannot be skipped.** It is the accuracy control that makes staff-entered data trustworthy enough to sit beside patient-entered data in the same schema. 🩺

## 4. Screen: Document capture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Documents · Token 51                                                │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                         │
│  │  ✓     │ │  ⚠     │ │  ✓     │ │   +    │                         │
│  │ pg 1   │ │ glare  │ │ pg 3   │ │ add    │                         │
│  │        │ │[retake]│ │        │ │        │                         │
│  └────────┘ └────────┘ └────────┘ └────────┘                         │
│                                                                      │
│  ⚠ Page 2: name on document reads "R. Kuma_" — confirm this belongs  │
│    to R. Kumar?          [ Yes, same patient ]  [ No, remove ]       │
│                                                                      │
│  Uploading 2 of 3…                              [ Done ▸ ]           │
└──────────────────────────────────────────────────────────────────────┘
```

Continuous multi-page capture without leaving the camera. Quality check at capture. **Identity mismatch is surfaced to a human and blocks attachment until resolved** — this is one of the two controls against wrong-patient association.

## 5. Screen: Queue management

```
┌──────────────────────────────────────────────────────────────────────┐
│  Queue · Dr. Sharma · Morning                        Waiting 14      │
├──────────────────────────────────────────────────────────────────────┤
│  🔴 Token 47 · R. S. F48 · waiting 34m                               │
│     Clinical alert raised — please assess this patient's priority    │
│     [ Move up ]  [ Assessed, keep position ]  [ Details ]            │
├──────────────────────────────────────────────────────────────────────┤
│  47  R. S.    F48   34m  ● Complete  3/3   🔴                        │
│  48  M. K.    M62   28m  ◑ Partial   1/2 ⧗  —   [Help finish intake] │
│  49  A. B.    F31   25m  ○ None      0     —   [Start intake]        │
└──────────────────────────────────────────────────────────────────────┘
```

- **The system suggests; staff decide.** No automatic reordering, ever.
- **The alert wording to staff is "assess this patient's priority", not a clinical statement.** Staff are not being given a diagnosis to act on.
- The queue surfaces incomplete intakes with a direct action, turning the biggest failure mode into a visible, fixable task.

## 6. Staff console performance requirements

| Action | Target |
|---|---|
| Registration → token issued | ≤30s |
| Full assisted intake | ≤5 min median |
| Document capture, 3 pages | ≤60s |
| Any page transition | <300ms |
| Works on a shared tablet | Device-bound session, auto-lock, fast user switch |

## 7. Training and guardrails for staff

- Staff **read questions as written**; the UI makes this the path of least resistance by showing the script prominently.
- Staff **do not answer on the patient's behalf**; "Patient not asked" is a single keystroke so that skipping honestly is easier than guessing.
- Staff **do not interpret or triage**; the console shows no clinical guidance and no red-flag reasoning.
- Staff **do not confirm medications or allergies** extracted from documents — that requires a clinical role.
- The read-back step is mandatory and is a trained behaviour, not just a screen.

## v2.2 Reconciliation

Staff workflows include read-back for patient-entered and extracted facts, identity ambiguity handling with `VERIFIED_MATCH`, `POSSIBLE_MATCH_REQUIRES_REVIEW`, and `CLEAR_MISMATCH`, upload/document status visibility, and escalation when extraction or identity review is required. LLMs do not make final patient association decisions.


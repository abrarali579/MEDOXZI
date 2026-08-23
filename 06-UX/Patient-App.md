# UX Specification — Patient App

**Context that drives every decision here:** a person who may be unwell, anxious, possibly in pain, on a borrowed or low-end phone, in a noisy waiting room, possibly with limited literacy, in a language that is not English, who has never seen this app before and will use it exactly once.

**The design target is not delight. It is completion.**

---

## 1. Screen flow

```
Language → Consent → Basic information → Chief complaint → 2-3 line issue description → Symptom questions → Medications →
Allergies → Conditions → Surgeries → Family/Social → Documents → Review → Done
```

Progress is always visible. Every screen is skippable. Nothing is ever lost.

**v2.4 focus:** best initial patients are first clinic visits with no previous reports. Reports remain optional attachments for the doctor to inspect; the app must still work perfectly when there are no reports.

## 2. Screens

### 2.1 Language

```
┌─────────────────────────────┐
│                             │
│   Choose your language      │
│   अपनी भाषा चुनें            │
│                             │
│   ┌───────────────────────┐ │
│   │  English              │ │
│   ├───────────────────────┤ │
│   │  हिन्दी                │ │
│   ├───────────────────────┤ │
│   │  தமிழ்                 │ │
│   └───────────────────────┘ │
│                             │
│   🔊 Listen to questions    │
└─────────────────────────────┘
```

Chosen once, applied everywhere including the review screen and the confirmation. Audio playback is offered from the first screen, because a user who cannot read will not find a setting.

### 2.2 Consent — the most important screen in the patient app

```
┌─────────────────────────────────────────┐
│  Before we start                        │
│                                         │
│  Your answers help your doctor prepare   │
│  before you go in.                      │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ☑ Share my answers with my doctor   ││
│  │   Needed to see the doctor           ││
│  ├─────────────────────────────────────┤│
│  │ ☐ Let the computer organise my       ││
│  │   information for my doctor          ││
│  │   You can say no. You will still     ││
│  │   see the doctor normally.           ││
│  ├─────────────────────────────────────┤│
│  │ ☐ Help improve this service using    ││
│  │   anonymous information               ││
│  │   Completely optional.               ││
│  └─────────────────────────────────────┘│
│                                         │
│  🔊  [ What happens to my information? ]│
│                        [ Continue ▸ ]   │
└─────────────────────────────────────────┘
```

- **Three separate consents, plainly worded, in the patient's language.**
- **AI-processing and product-improvement are unticked by default.** A pre-ticked box is not consent.
- **Refusal is functional, and the screen says so.** "You will still see the doctor normally" is the sentence that makes the consent real rather than theatrical.
- Consent text is versioned; the version and the language shown are stored with the record.

### 2.3 Basic information

```
┌─────────────────────────────────────────┐
│  Your details                   Step 1/9│
│                                         │
│  Name                                   │
│  [                                  ]   │
│  Age                                    │
│  [      ]                               │
│  Sex                                    │
│  [ Female ] [ Male ] [ Other ]          │
│                                         │
│                          [ Continue ▸ ] │
└─────────────────────────────────────────┘
```

Staff may pre-fill this during registration. The patient should only be asked to confirm or correct it when possible.

### 2.4 Chief complaint

```
┌─────────────────────────────────────────┐
│  What brings you in today?      Step 2/9│
│                                         │
│  ┌───────────┐ ┌───────────┐            │
│  │  🤒 Fever  │ │ 😷 Cough   │           │
│  ├───────────┤ ├───────────┤            │
│  │ 💔 Chest   │ │ 🤢 Stomach │           │
│  │    pain    │ │    pain    │           │
│  ├───────────┤ ├───────────┤            │
│  │ 🤕 Headache│ │ 🦴 Body/   │           │
│  │            │ │   joint pain│          │
│  └───────────┘ └───────────┘            │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Something else — tell us           ││
│  └─────────────────────────────────────┘│
│                             [ Skip ]    │
└─────────────────────────────────────────┘
```

Icon + text, large targets, the clinic's top complaints only. "Something else" is always available and leads to a general question set.

### 2.5 Issue description

```
┌─────────────────────────────────────────┐
│  Tell the doctor briefly        Step 3/9│
│                                         │
│  In 2 or 3 lines, describe the problem  │
│  in your own words.                     │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │                                     ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│                    [ Skip ] [ Continue ]│
└─────────────────────────────────────────┘
```

This text helps select relevant follow-up questions and is shown to the doctor verbatim. It is not shown back as an interpretation.

### 2.6 Symptom questions

```
┌─────────────────────────────────────────┐
│  ◂            Chest pain        Step 4/9│
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░                 │
│                                         │
│  Does the pain get worse when you        │
│  walk or climb stairs?                  │
│                                    🔊    │
│  ┌───────────┐┌───────────┐┌───────────┐│
│  │    Yes    ││    No     ││ Not sure  ││
│  └───────────┘└───────────┘└───────────┘│
│                                         │
│                    [ Skip this question ]│
└─────────────────────────────────────────┘
```

- **One question per screen.** Multiple questions per screen measurably increase abandonment in low-literacy contexts. **[Inference — validate in discovery]**
- **"Not sure" is a first-class button**, the same size as Yes and No.
- **Skip is always present and never punished.**
- **No clinical language, no severity scales the patient must interpret, no "how bad on a scale of 1–10" without an anchored visual scale.**
- Autosave on every tap.
- Question content must come from a Lead-Doctor-approved pack before real patient use.

### 2.7 Medications

```
┌─────────────────────────────────────────┐
│  Which medicines do you take?   Step 5/9│
│                                         │
│  🔍 [ Type a medicine name…           ] │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 📷  Take a photo of your medicines  ││
│  │     or your prescription            ││
│  └─────────────────────────────────────┘│
│                                         │
│  Added:                                 │
│   • Metformin 500mg           [remove]  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  I don't know my medicines          ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  I don't take any medicines         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**"I don't know" and "I take none" are different buttons, and both are recorded as explicit values.** This is where most intake systems quietly lose the most important distinction in the whole dataset. The photo path exists because most patients can photograph a strip even when they cannot name a drug.

### 2.8 Documents

```
┌─────────────────────────────────────────┐
│  Any previous reports?          Step 8/9│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        📷  Take a photo             ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │        📁  Choose a file            ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐             │
│  │ ✓ pg1│ │ ⚠ pg2│ │  +   │             │
│  │      │ │blurry│ │      │             │
│  │      │ │[redo]│ │      │             │
│  └──────┘ └──────┘ └──────┘             │
│                                         │
│  Uploading in the background…           │
│  You can continue.                      │
│                          [ Skip ▸ ]     │
└─────────────────────────────────────────┘
```

Quality feedback happens **at capture**, not after upload, because a patient will retake a photo while standing over the document and will not walk back to do it later. Uploads never block progress.

For v2.4, report upload is optional and doctor-review-first. The absence of reports is a normal state, not a failure state.

### 2.9 Review

```
┌─────────────────────────────────────────┐
│  Please check your answers      Step 9/9│
│                                         │
│  What brings you in                     │
│    Chest pain, 3 days           [edit]  │
│  In your words                          │
│    "Pain when walking..."       [edit]  │
│  Worse when walking                     │
│    Yes                          [edit]  │
│  Medicines                              │
│    Metformin 500mg              [edit]  │
│  Allergies                              │
│    Penicillin — rash            [edit]  │
│  Reports                                │
│    3 photos                     [edit]  │
│                                         │
│         [ Send to my doctor ▸ ]         │
└─────────────────────────────────────────┘
```

**A mirror, not an opinion.** No summary, no interpretation, no "possible causes", no severity, no reassurance. The patient sees exactly what they said, in their own language.

### 2.10 Done

```
┌─────────────────────────────────────────┐
│              ✓                          │
│      Thank you                          │
│                                         │
│      Your token:  47                    │
│      About 12 people ahead of you        │
│                                         │
│      Your doctor will see your           │
│      answers before you go in.           │
│                                         │
│      Please wait to be called.           │
└─────────────────────────────────────────┘
```

Token and queue position only. **No clinical content of any kind is ever shown to the patient. This screen is where a badly-designed product would put a "possible conditions" section, and where this one deliberately does not.**

## 3. Accessibility requirements

| Requirement | Implementation |
|---|---|
| Minimum touch target | 48×48 dp |
| Base font size | 18sp, scalable to 200% without layout breakage |
| Contrast | WCAG 2.1 AA minimum; AAA for body text |
| Audio | Every question and option playable; recorded human audio preferred over TTS for the fixed question bank 🩺 |
| Screen reader | Full labels, logical order, live-region announcements |
| Colour independence | No information conveyed by colour alone |
| One-handed use | Primary actions in the lower third |
| Low bandwidth | <200KB initial load; images compressed client-side before upload |
| Old devices | Tested on Android 8 / 2GB RAM as the floor |
| Interruption tolerance | Full state persisted to IndexedDB on every interaction |

## 4. Content rules for the patient app 🩺

| Rule | Why |
|---|---|
| No medical jargon; questions written at ~6th-grade reading level in every language | Comprehension is data quality |
| **Translations are clinician-reviewed, not machine-translated** | "Chest heaviness" vs "chest pain" is a clinical distinction that machine translation loses |
| No leading questions | "Do you have crushing chest pain?" invents symptoms |
| Never state or imply what an answer means | The patient must not learn that "yes" is the scary answer, or they will stop saying yes |
| Never reassure | We are not qualified to, and the doctor has not seen them yet |
| Never mention urgency, severity, or possible conditions | Standing constraint #2 |
| Free text is stored in the original language **and** translated, both visible to the doctor | Nuance survives |

## 5. Anti-patterns explicitly avoided

| Anti-pattern | Why it is banned here |
|---|---|
| Progress gamification ("You're 80% healthy!") | Meaningless and potentially harmful |
| Required fields | Force a wrong answer instead of an honest gap |
| A single long scrolling form | Abandonment |
| Showing possible conditions | Standing constraint #2 |
| Urgency messaging to the patient | Causes anxiety and unpredictable behaviour in a waiting room |
| Account creation before intake | The largest avoidable drop-off in the funnel |
| Asking the same thing twice | The clearest signal to a patient that the system is not listening |

## v2.2 Reconciliation

Patient UX supports English and Bahasa Indonesia, consent before model processing, staff-assist takeover, low-literacy wording, large touch targets, minimal typing, progress indication, and low-bandwidth mode. It never displays diagnosis, differential, red-flag interpretation, treatment recommendation, reassurance, or clinical conclusions.


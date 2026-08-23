# Revised Direction — v2

**Date:** 23 August 2026
**Supersedes:** parts of v1.0. Where this document and a v1.0 document disagree, **this document wins**, and the affected v1.0 documents have been updated.

Five founder decisions came in after the v1.0 blueprint. Four are adopted, one is adopted in a materially different form. This document records what changed, what it costs, and what I pushed back on and why.

---

## Change 1 — No clinical safety owner hired before the pitch

**Founder position:** the retainer is expensive, and a doctor on the team early may pull the product toward being a diagnostic tool rather than a pre-round tool.

**Adopted — with one structural trade that makes it safe.**

### The trade

**The red-flag engine comes out of the MVP.**

That is the whole answer. The red-flag engine was the only component in the MVP that required a physician's signature before it could ship, because it is the only component that makes a clinical assertion about urgency. Remove it, and the MVP contains no clinical judgement at all — it becomes an organiser, which is exactly what the product is supposed to be.

| | v1.0 | v2 |
|---|---|---|
| Red-flag rules in MVP | ✅ Deterministic engine, clinician-signed | ❌ **Removed.** Engine is built and tested; ships **inactive**, with an empty rule set |
| Who authors the rules | Contracted clinical safety owner, pre-build | **The lead doctor at the first clinic**, during CUSTOMISE |
| Clinical signature needed before pitch | Yes | **No** |
| Question bank source | Clinician-authored from scratch | Published history-taking frameworks, restructured; **labelled unvalidated** until a doctor signs |
| Cost before pitch | Retainer | **Zero** |

### Why this is not just cost-cutting

Three things make it defensible rather than reckless:

1. **The MVP now asserts nothing clinical.** It collects what the patient said, parses what the documents say, shows both with provenance, and names what is missing. Every one of those is a statement about *the record*, not about *the patient*. No clinical claim, no clinical signature required.
2. **The rule engine still ships, empty.** It is built, tested and wired in with a zero-rule content pack. Turning it on is a data change during CUSTOMISE, not an engineering project. The lead doctor's first act is to fill it — which is a far better onboarding conversation than handing them somebody else's rules.
3. **It is a better pitch.** *"You author the clinical questions and the safety rules; we build the system around them"* beats *"here are our doctor's rules, please adopt them."* Doctors want to own clinical content. This turns a removed cost into a sales advantage.

### On the fear of diagnostic drift — the reasoning is backwards, and the fix is engineering

The concern is that a doctor would push the product toward diagnosis. In practice the opposite is more common: **without a clinician, nobody in the room is qualified to say "that output is a diagnosis, not a question."** Founders and engineers drift diagnostic because diagnostic demos are more impressive, not less.

So the anti-drift mechanism should not be a person at all. It should be a build gate:

> **The harness contains a diagnostic-drift detector that fails CI when any generated output reads as a diagnosis, a recommendation, or reassurance.** Prohibited-phrase list, differential-shaped-output detector, and a hedging-language check, run on every prompt change and nightly.

That directly answers the stated fear with something a doctor could not provide anyway — a physician reviews samples; a CI gate reviews everything. See [12-Harness/Harness-Architecture.md](../12-Harness/Harness-Architecture.md) §6.

### The floor — three lines that cannot be crossed

Skipping the retainer is fine. These are not.

1. **No red flags, no urgency signal, no triage language of any kind ships until a named doctor has authored and signed the rules.** An empty rule set is safe. An engineer-authored rule set is not.
2. **No real patient data is processed until a named doctor has reviewed and signed the question bank and the prohibited-language list.** That happens at CUSTOMISE, before LAUNCH — which fits the sequence exactly.
3. **The pitch demo runs on synthetic patients only**, and every screen carries a visible `UNVALIDATED — DEMO CONTENT` marker until signed. This is not legal caution; it is the thing that makes a doctor trust you. Showing a doctor unvalidated clinical content *without saying so* is how you lose the room.

### Optional, small, and worth it

A **fixed-scope clinical review measured in hours, not a retainer** — one doctor, ~10–15 hours, once, immediately before the pitch — to read the question bank and confirm nothing in the demo is unsafe or embarrassing. This is not the clinical safety owner role. It is proofreading. If budget allows anything, allow this.

---

## Change 2 — Build an agent harness before the pitch

**Founder position:** train the system never to hallucinate or be biased; make it aware of common diseases, symptoms and counter-questions; harden against token mixing, report mixing, medicine mixing, OCR errors, attachment failures, assumptions on unclear handwriting, session mixing. Data improves *questions*, not diagnoses. Shadow comparison against doctor conclusions.

**Adopted enthusiastically — with one important technical correction, and a reframing that makes it far more valuable.**

### The correction: most of that list is not trainable

Training is the wrong instrument for six of the eight items. Sorting the list honestly:

| What you asked for | Actually solved by | Harness's real job |
|---|---|---|
| Never hallucinate | **Architecture** — schema constraint + traceability verifier | **Measure** the residual rate and prove it |
| Never biased | Stratified evaluation + content review | **Detect** disparity across subgroups |
| Never mix tokens / sessions | **Architecture** — binding at capture, encounter-scoped context, per-encounter worker locks | **Attack** it and prove isolation holds |
| Never mix reports | **Architecture** — identity cross-check that blocks | **Attack** it |
| Never mix medicines | Extraction + mandatory human confirmation | **Measure** error rate and calibration |
| OCR mistakes | Cannot be eliminated — confidence + human confirmation | **Measure** calibration; prove low-confidence really is low-accuracy |
| Assumptions on unclear handwriting | Prompt + `ILLEGIBLE` state + verifier | **Abstention testing** — the harness's single most valuable function |
| Attachment failures | **Architecture** — explicit failure states, never silent | **Inject** failures and prove nothing goes silent |
| Common diseases, symptoms, **counter-questions** | **Content** — a curated knowledge graph | **Rank** and improve the questions from evidence |

**You cannot train a model not to mix two patients. You make it structurally impossible and then try to break it.** That is what the harness is for.

### The reframing: the harness is the pitch asset

Its output is not a better model. Its output is a **numbers document you put in front of a doctor**:

> *We ran 12,000 synthetic encounters. Zero cross-patient contamination across 4,000 concurrent-session attacks. On deliberately illegible handwriting the system abstained 98.6% of the time and never invented a dose. Confidence scores above 0.9 were correct 96.2% of the time. Every generated sentence traced to a source or was withheld. Here is the full report.*

No competitor pitching an Indonesian clinic will have that document. It is worth more than the feature list, and it directly answers the only question a doctor actually has: *how do I know it won't lie to me?*

Full design: **[12-Harness/](../12-Harness/)** — five documents.

### The one genuinely learned component

The counter-question ranker. A **symptom → discriminating-question → condition graph** that stores *which question separates which possibilities* — never a diagnosis. Questions are scored by information gain, validated in shadow against the doctor's eventual conclusion, and the only thing that ever ships is **a better question order**. See [12-Harness/Question-Knowledge-Graph.md](../12-Harness/Question-Knowledge-Graph.md).

---

## Change 3 — New delivery sequence

**Founder position:** MVP → TRAIN → PITCH → CUSTOMISE per lead doctor → LAUNCH at clinic 1 → 2 weeks on-site with staff training and data capture → IMPROVE → V1.

**Adopted, with two insertions that cost days and remove the largest risks.**

```
RECON (new)  →  MVP  →  TRAIN  →  PITCH  →  CUSTOMISE  →  LAUNCH
                                                             ├─ Week 1: SHADOW (new)
                                                             └─ Week 2: LIVE
                                                          →  IMPROVE  →  V1
```

**Insertion 1 — RECON, before the MVP. Days, not months, and no signed clinic required.**

v1.0 put discovery first because building an OCR pipeline against imagined documents is the fastest way to waste three months. Your sequence removed it. But discovery does not need a contract — it needs **documents and observation**, both obtainable in Jakarta without signing anything:

- 100–200 real Indonesian prior records (consented individuals, pharmacies, your own network, public lab report formats) → determines the entire OCR strategy and cost
- Sit in 3–4 clinic waiting rooms → complaint mix, consultation duration, device ownership, whether patients would plausibly complete intake
- Look at P-Care and one clinic EMR over someone's shoulder → what the doctor already types twice

**Insertion 2 — the on-site fortnight becomes Week 1 shadow, Week 2 live.** Same two weeks, same cost. In week 1 the system runs on real patients, staff train on it, data is captured, and **the doctor does not rely on it**. Week 2 goes live with a week of real-distribution evidence behind it. Going straight to live at clinic 1 with content that was signed a week earlier is the single riskiest step in your sequence, and this removes it for free.

Full plan: [09-MVP/Development-Plan.md](../09-MVP/Development-Plan.md) and [09-MVP/Pilot-Plan.md](../09-MVP/Pilot-Plan.md).

---

## Change 4 — Marketing funnel from intake data

**Founder position:** once enough patient emails and WhatsApp numbers are collected, run customised marketing; pitch this to doctors as a benefit.

**Not adopted in that form. This one would end the company, and I want to be direct about why before offering the version that works.**

### Why the direct version fails

1. **The data is not yours.** You are a processor acting for the clinic. Patient contact details collected for clinical intake belong to the clinic and to the patient. Using them for your own marketing is not a grey area — it is a breach of your processor role that terminates the clinic relationship the day it is noticed, and it is exactly the kind of thing a competitor mentions to your next prospect.
2. **Indonesian law is specific here.** UU 27/2022 requires a lawful basis tied to a declared purpose. Health-adjacent data collected for treatment and reused for marketing has no such basis without separate explicit consent. Administrative sanctions reach 2% of annual revenue; criminal provisions for unlawful use of personal data reach 5 years and IDR 200 million, and corporate fines can be multiplied. **[Confirmed — Chambers 2026; ⚖️ verify with Indonesian counsel]**
3. **It inverts the pitch.** The moment a doctor understands that patient contacts flow to you for marketing, every safety and provenance argument you have made becomes suspect. You would be trading the product's single strongest asset — trustworthiness — for a mailing list.
4. **The list is bad anyway.** People who filled in a symptom form at a clinic are not a segment. They are a group of people who were unwell once.

### The version that works, and is worth more

**Your funnel is B2B. Your product is the evidence, not the contacts.**

| Asset | What it is | Why it is better |
|---|---|---|
| **Aggregate benchmark data** | *"Clinics like yours: 63 patients per session, 71% intake completion, 4.2 minutes saved per consultation, 38% of prior records unreadable without OCR."* Fully de-identified, aggregated, lawful. | This is the pitch. No competitor has it. It gets you into the next clinic. |
| **The harness dossier** | The safety numbers from Change 2 | Answers the doctor's real question |
| **Compliance relief** | Permenkes 24/2022 makes EMR mandatory for every clinic, with accreditation and permit sanctions **[Confirmed]** | A far stronger wedge than time-saving — see Change 5 |
| **Clinic-owned patient messaging** | Reminders and follow-up, sent **by the clinic, under the clinic's name, with separate patient opt-in**, using an integration you build and *sell to the clinic* | A product line with revenue, not a data grab. Same capability, right owner, lawful. |
| **Referral loop** | Doctors move between clinics and talk to each other | The actual growth channel in this market |

Full strategy, including the consent architecture that makes the messaging feature lawful: [09-MVP/Go-To-Market.md](../09-MVP/Go-To-Market.md).

---

## Change 5 — Launch in Indonesia, English default, accurate Bahasa Indonesia

**Adopted. This is the largest change in v2, and the research turned up one finding that reshapes the architecture.**

### The finding that changes things

**Government Regulation 28/2024 requires health information system organisers to locate their data centres within Indonesian territory**, and transfers between health information system organisers must route through the national health information system. **[Confirmed — Baker McKenzie Global Data and Cyber Handbook]** ⚖️

This is materially stricter than India's DPDP posture. Combined with the observation that frontier hosted LLM services do not currently appear to be offered from Indonesian cloud regions **[Unverified — Azure Foundry region list does not show Indonesia Central; verify per provider]**, it forces a real architectural decision:

| Option | Assessment |
|---|---|
| Cross-border inference on de-identified payloads | **Legally fragile.** GR 28/2024 speaks to the organiser's data centres, not only to identifiers. Requires counsel and probably ministerial approval. ⚖️ |
| **Self-hosted open-weights model in an Indonesian region** (AWS `ap-southeast-3`, GCP `asia-southeast2`, Azure Indonesia Central all exist) | **The likely answer.** Shifts cost from variable to fixed; lowers the quality ceiling; fully compliant. |
| Minimise what needs a model at all | **Already the design.** The deterministic-first architecture was chosen for safety; it now pays for itself twice. |

**The v1.0 decision to keep AI on a narrow leash was a safety choice. In Indonesia it is also the compliance and cost strategy.** Every step that is a lookup table rather than a model call is a step that does not need a GPU in Jakarta.

### The finding that changes the pitch

**Permenkes 24/2022 makes electronic medical records mandatory for every health facility including clinics**, with phased SATUSEHAT integration and escalating sanctions — written warning, accreditation demotion, accreditation revocation, and business permit revocation. **[Confirmed]** Meanwhile BPJS **P-Care** is the gatekeeper system that FKTP doctors already type consultation notes into, with over 80% of facilities connected as of 2023. **[Third-Party Claim]**

So the Indonesian doctor's pain is not only history-taking. **It is entering the same encounter twice** — once clinically, once into P-Care — under a compliance regime with real teeth.

That reframes the wedge:

> **India pitch:** "This saves you time."
> **Indonesia pitch:** "This saves you time *and* produces structured, SATUSEHAT-shaped output for a mandate you are already being sanctioned against."

We still do not build SATUSEHAT integration in the MVP — it is a substantial certification exercise. But the schema must export cleanly to FHIR R4 from day one, and the pitch should say so honestly: *"structured and export-ready today; certified integration is the next thing we build with you."*

### Language

English default; **Bahasa Indonesia as a first-class, clinician-reviewed locale — not a machine translation.** Indonesian clinical practice mixes formal Indonesian, Dutch/Latin-derived medical terms, and colloquial patient vocabulary that differs sharply from textbook language (*"masuk angin"* has no clean English equivalent and appears constantly in real complaints). Machine-translating a clinical question here is a patient-safety defect, not a quality issue.

Full spec: [02-Product/Localisation.md](../02-Product/Localisation.md). Market and regulatory detail: [13-Indonesia/](../13-Indonesia/).

---

## What v2 changes, in one table

| Area | v1.0 | v2 |
|---|---|---|
| Launch market | India-first | **Indonesia-first**, India retained as second market |
| Data residency | In-region preferred | **In-Indonesia mandatory** ⚖️ |
| Inference | Commercial API, in-region | **Likely self-hosted open-weights in Jakarta** |
| Red-flag engine | In MVP, clinician-signed | **Built, ships empty; filled by the lead doctor at CUSTOMISE** |
| Clinical safety owner | Contracted before build | **Lead doctor at clinic 1, from CUSTOMISE onward** |
| Pre-pitch clinical cost | Retainer | **Zero** (optional ~10–15h review) |
| Discovery | Before build, needs signed clinic | **RECON before build, no clinic needed** |
| Harness | Evaluation suite | **Full adversarial proving ground + pitch dossier** |
| Interop | FHIR deferred | **FHIR R4 export shape from day one** (SATUSEHAT mandate) |
| Wedge | Time saved | **Time saved + compliance relief** |
| Patient contact data | — | **Never used for our own marketing** |
| Primary language | English + Hindi + regional | **English default + clinician-reviewed Bahasa Indonesia** |

## What did not change

The differential engine still runs in shadow mode. Provenance is still mandatory on every clinical value. `NOT_ASKED` still never becomes "no". Nothing enters the clinical record without a doctor's approval. The traceability verifier still rejects anything it cannot trace. Patients still never see clinical interpretation.

Those were not India decisions. They are the product.

## v2.2 Reconciliation

This document is retained for backward traceability. The current operational baseline is `00-Executive/Revised-Direction-v2.2.md`. Where v2.0 or v2.1 language uses `TRAIN`, `FULL_AI`, broad safety clearance, or automatic learning implications, read it as superseded by v2.2: HARNESS + SYSTEM HARDENING, source-bound summaries, empty production red-flag packs until Lead Doctor sign-off, and no online self-training.


# Go-To-Market and Data Strategy

**This document exists because of one proposed idea: using patient emails and WhatsApp numbers collected during intake for customised marketing, and pitching that capability to doctors as a benefit.**

That version does not work. This document says plainly why, and then specifies the version that produces more revenue with less risk — because the underlying instinct (the data is an asset; the funnel matters) is right.

---

## 1. Why the direct version fails

### It is not your data

You are a **processor acting for the clinic**. Patient contact details are collected under the clinic's relationship with its patients, for the purpose of clinical care. Repurposing them for your own marketing is not a grey area or an aggressive-but-defensible growth tactic. It is using someone else's customer list without their knowledge, obtained through a position of trust.

**Practical consequence:** the day a clinic notices — and they notice when a patient asks them why a software company is messaging them — the contract ends, and the story travels. In a market where you sell doctor-to-doctor by referral, that is not a setback. It is the end.

### Indonesian law is specific ⚖️

Under **UU 27/2022**, processing requires a lawful basis tied to a declared purpose. Health-adjacent data collected for treatment and reused for marketing has no such basis without separate, explicit, informed consent.

- Administrative sanctions: **up to 2% of annual revenue** **[Confirmed]**
- Criminal: unlawful use of personal data **up to 5 years and/or IDR 200 million**; unlawful disclosure up to 4 years; **corporate fines may be multiplied tenfold** **[Confirmed]**
- Health data additionally sits under **GR 28/2024** localisation and national-system transfer rules

**[Confirmed — Chambers Data Protection & Privacy 2026, Indonesia; ⚖️ verify with Indonesian counsel before any patient-facing communication of any kind.]**

### It destroys the only asset you have

The entire product argument is *this system is careful with your patients' information.* Provenance, verification, abstention, the harness dossier — all of it is an argument about trustworthiness. **A doctor who learns that patient contacts flow to a marketing list will re-evaluate every one of those claims**, correctly.

You would be trading the product's differentiator for a contact list.

### The list is not valuable anyway

People who filled in a symptom form at a clinic once are not a marketable segment. They are a group of people who were unwell on a particular Tuesday. There is no product you can sell them, no shared characteristic to target, and a high probability that a message from an unfamiliar company referencing a clinic visit reads as a data breach rather than an offer.

---

## 2. What to build instead

**The funnel is B2B. The asset is evidence, not contacts.**

### Asset 1 — Aggregate benchmark data ⭐ the real one

Fully de-identified, aggregated operational statistics from the clinics you run in:

> *"Clinics of your size see around 63 patients per doctor per session. Intake completion runs at 71%. Median consultation time drops 4.2 minutes when intake is complete. 38% of the prior records patients bring are unreadable without OCR. Your peers spend 11 minutes per doctor per day re-entering data they already typed once."*

| Why it works | |
|---|---|
| **Lawful** | Aggregated, de-identified, no individual is identifiable, clear basis |
| **Unique** | Nobody else has it. It is a by-product of operating |
| **Compounding** | Every clinic makes it more persuasive for the next |
| **It is the pitch** | Doctors respond to peer data far more than to feature lists |
| **Defensible** | A competitor can copy a feature in a quarter; they cannot copy two years of operational data |

**Governance:** minimum cell sizes before any statistic is published, no clinic identifiable without written permission, generated from the de-identified analytics store only, never from production. 🔐

### Asset 2 — The harness dossier

The safety numbers from [12-Harness/Pitch-Dossier.md](../12-Harness/Pitch-Dossier.md). Four pages, including a page of limitations. This is what gets you the second meeting.

### Asset 3 — Compliance relief

**[Confirmed]** Permenkes 24/2022 makes electronic medical records mandatory for every clinic, with sanctions escalating to business permit revocation, and FKTP doctors already double-enter into BPJS P-Care.

That is a funded, urgent, sanctioned pain — considerably stronger than "save a minute per patient." It is the reason a clinic owner takes the meeting and the reason a purchase gets approved.

### Asset 4 — Clinic-owned patient messaging, sold as a feature

Here is the legitimate version of the original idea, and it makes more money.

| Property | Requirement |
|---|---|
| **Who sends** | **The clinic**, under the clinic's name and identity |
| **Who owns the data** | **The clinic.** It never enters your marketing systems |
| **Consent** | **Separate, explicit, granular, revocable**, captured at intake, defaulted off, in Bahasa Indonesia ⚖️ |
| **Purpose** | Appointment reminders, follow-up, results-ready notification, clinic announcements — **the clinic's purposes, not yours** |
| **Your role** | You build and operate the capability and **charge for it** |
| **Your access** | Delivery metrics only. Never content, never lists, never for your own use |

**This is a product line, not a data grab.** Same capability, correct owner, lawful basis, and it produces recurring revenue rather than a one-time reputational liability. Clinics will pay for reliable WhatsApp reminders — no-shows cost them money every day.

### Asset 5 — The referral loop

Doctors move between clinics and talk to each other constantly. In this market, **the growth channel is a doctor telling another doctor**. Everything above serves that: the dossier makes you credible, the benchmark data makes you useful, and the messaging feature makes the clinic's life better.

Optimise for the doctor at clinic 1 wanting to tell someone. That is the funnel.

---

## 3. Consent architecture that makes Asset 4 lawful ⚖️

Five separate consents, separately recorded, separately revocable, none pre-ticked:

| Consent | Default | Owner | Effect if refused |
|---|---|---|---|
| Treatment / record | Per clinic policy | Clinic | Clinic's existing process |
| **AI-assisted processing** | **Off** | Clinic | Intake captured, shown raw, **zero model calls** |
| **Clinic communications** (reminders, follow-up) | **Off** | **Clinic** | No messages. Care unaffected |
| **De-identified product improvement** | **Off** | Us | Excluded from all datasets |
| Guardian consent (under-18) | Required where applicable | Clinic | Intake requires an authorised guardian |

**Design commitments:**
- Every consent is refusable **without any effect on care**, and the screen says so in plain Bahasa Indonesia
- Withdrawal propagates to derived data and is a tested workflow
- Consent text is versioned; the exact text and language shown is reproducible for any historical consent
- **There is no consent option anywhere that permits us to market to patients.** That option does not exist in the schema, which is the most reliable way to ensure it is never used.

---

## 4. Pricing and packaging (working hypotheses)

| Model | Assessment |
|---|---|
| **Per-doctor per-month subscription** | ⭐ Recommended. Predictable, scales with value, easy to explain, matches how clinics think about staff cost |
| Per-encounter | Punishes the behaviour we want (more intake) and makes cost unpredictable for the clinic |
| Per-clinic flat | Simple; poor scaling with clinic size |
| Free + paid messaging add-on | Worth testing — the mandate pain may carry the core, with messaging as margin |

**Pilot pricing recommendation: free or heavily discounted for clinic 1, with an explicit written agreement that they provide a reference and a case study.** You are buying evidence, not revenue. Just make the exchange explicit rather than hoping for goodwill.

⚠️ **Commercial blocker:** contracting with Indonesian clinics and operating a health information system may require a local entity (PT PMA). Check this early — it has a long lead time and blocks revenue, not just growth. ⚖️

---

## 4b. Packaging — three modules, one product *(adopted v2.1)*

A commercial framing from the external review that maps cleanly onto the three horizons and gives the messaging capability a name and a boundary.

| Module | Promise | Status |
|---|---|---|
| **MEDOXZI PRE-ROUND** | *Save doctor time.* Intake, records, questions, summary | **This is the MVP** |
| **MEDOXZI INTELLIGENCE** | *Improve clinical preparation.* Question engine, shadow reasoning, evaluation | Built, mostly invisible. Surfaces in Phase 2 behind validation gates |
| **MEDOXZI ENGAGE** | *Grow the clinic.* Consent-controlled reminders, recalls, campaigns — **sent by the clinic, under the clinic's name** | **Phase 2 at the earliest** |

⚠️ **Discipline on ENGAGE.** The framing is good and the revenue is real, but building or selling it before PRE-ROUND is proven is precisely the scope creep that kills health-tech startups. It is also the module a founder is most tempted to accelerate, because it sounds like growth. **It stays behind the gate: no ENGAGE work until clinic 1 has produced a time-saving readout.**

## 5. The sequence

| Stage | Goal | Asset used |
|---|---|---|
| **RECON** | Understand the market; collect documents | Curiosity and politeness |
| **PITCH** | Get clinic 1 | Harness dossier + demo + compliance argument |
| **CUSTOMISE** | Lead doctor authors clinical content | Their ownership of the content |
| **LAUNCH + 2 weeks** | Prove it works; capture data | On-site presence |
| **IMPROVE → V1** | Fix what week 1 and 2 revealed | Real evidence |
| **Clinic 2–5** | Grow | **Clinic 1's doctor as a reference**, plus first benchmark data |
| **Clinic 5+** | Scale | Benchmark data becomes the pitch; messaging becomes margin |

**The transition to look for:** the moment the benchmark data becomes more persuasive than the demo. That is when the funnel starts working on its own, and it is roughly clinic five.

---

## 6. Things that will be tempting and should not be done

| Temptation | Why not |
|---|---|
| Using patient contacts for our own marketing | §1 |
| "Anonymised" patient data sold to third parties | Re-identification risk, consent basis absent, reputationally fatal |
| Publishing clinic-identifiable statistics without written permission | Ends that relationship and warns off every other clinic |
| A patient-facing app with health content | Different regulatory posture; violates the standing constraint that patients see no clinical interpretation |
| Claiming certified SATUSEHAT integration before it exists | Overclaiming a government integration is a uniquely bad idea |
| Quoting a time-saving figure before clinic 1 produces one | Say "we think 15% — you will be the first clinic that tells us." Honesty here is more persuasive than a number |
| Publishing shadow concordance as accuracy | It sounds like diagnostic accuracy, it is not, and it will be heard as a diagnostic claim regardless of the caption |

## v2.2 Reconciliation

Preserve B2B clinic strategy. Patient contacts are not MEDOXZI's marketing asset. Legal role certainty is not assumed before counsel review. Benchmarks and pricing are hypotheses to test during RECON/PITCH, not validated data, and pricing decisions must not alter clinical data collection.


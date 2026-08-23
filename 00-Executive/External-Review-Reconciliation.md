# External Review — Reconciliation

**Date:** 23 August 2026
**Subject:** independent review of the MEDOXZI direction by an external agent, reconciled against v2.

**Summary:** a strong review. It converges independently on most of v2's load-bearing decisions, which is a meaningful signal — two analyses arriving separately at "harness not training", "no salaried doctor but mandatory clinical review before live patients", and "clinic owns the patient relationship" is better evidence than either alone.

It also contributes **four genuine improvements we are adopting**, and misses **four things that matter**, one of which is the largest architectural constraint in the Indonesian market.

Most usefully, its citation of a primary source we had only reached second-hand led to a **correction of our own regulatory analysis** — see §4.

---

## 1. Where it converges with v2 (independent agreement)

| Point | v2 position | Review position | Note |
|---|---|---|---|
| "Train the AI" is the wrong frame | Harness is an adversarial proving ground, not a training loop | Same — proposes renaming to "Safety & Clinical Reasoning Harness" | **Independent convergence.** Their name is better; adopted as a subtitle |
| No salaried clinical safety owner pre-MVP | Adopted, enabled by removing red-flag content | Same, with compensation via consulting fee / partnership / discounted deployment | Their compensation options are practical and worth using |
| Hard boundary before live patients | Question bank + red-flag rules signed by a doctor before real patient data | "MVP build without doctor = Yes. Live clinical deployment without clinical review = No." | Same floor, crisper wording |
| AI extracted ≠ clinical fact | Value + source + confidence + verification status | Identical four-field model | Convergent |
| Multi-state answers | `ANSWERED` / `NOT_ASKED` / `UNKNOWN` / `SKIPPED` / `DECLINED` | Same plus two more | See §3.4 |
| Unknown must remain unknown | Abstention design, `ILLEGIBLE`, degrade-not-guess | "Assumption Firewall" | Same principle, good name |
| Output firewall | Schema → traceability verifier → prohibited content → consistency | Same chain | Convergent |
| Shadow differential, hidden, measured against the doctor's conclusion | Yes | Yes | Convergent |
| Never guarantee "no hallucination" | Measure and bound; architecture prevents it becoming fact | Same correction | Convergent |
| Clinic owns the patient relationship; we provide the engine; don't sell lists | Yes | Yes | **Convergent, and independently reached** |
| Fine-tuning only much later, on a governed dataset | Yes | Yes | Convergent |

## 2. What we are adopting from the review

### 2.1 Language-independent clinical concept codes ⭐ the best contribution

The review's point: store `SYMPTOM_DYSPNEA`, not `"shortness_of_breath"`. English UI renders *Shortness of breath*; Bahasa UI renders *Sesak napas*; the database and the reasoning layer only ever see the code.

v2's `Localisation.md` had question *keys* as identity but did not extend the same discipline to **clinical concepts**. That gap matters more than it looks: colloquial Indonesian complaints (*masuk angin*, *nyeri ulu hati*) need to map into stable concepts, and without a concept layer they end up as untyped strings that the rule engine cannot reason over and the FHIR export cannot map.

**Adopted.** See the amendment in [02-Product/Localisation.md](../02-Product/Localisation.md) and [04-Architecture/Data-Model.md](../04-Architecture/Data-Model.md).

### 2.2 Additional torture-test cases

Roughly a dozen of their fifty were not in our ~90-probe catalogue, and several are excellent:

| Case | Why it matters |
|---|---|
| **Report uploaded *after* the summary was generated** | The summary is now stale and wrong, and nothing tells the doctor. A real workflow event we had not modelled |
| **Concurrent staff edits to the same encounter** | Two staff on two tablets. Last-write-wins would silently destroy data |
| **Multiple browser tabs / browser refresh / double submission** | Ordinary human behaviour, and a classic source of duplicate or lost state |
| **Password-protected and corrupted PDFs** | Common in real record sets; must fail visibly |
| **mg → mcg confusion** | A 1000× dosing error. Belongs in the highest-severity class |
| **Decimal error 0.5 → 5** | 10× error, and OCR is prone to it |
| **Language switch halfway through intake** | State must survive; partially-translated records must not result |
| **Lab reference-range mismatch** | Different labs, different ranges; flagging "abnormal" against the wrong range is our own error |
| **Patient contradicts a *previous visit*** | We modelled intake-vs-document contradiction, not cross-visit |
| **Old session reopened / session takeover** | Identity and state integrity |

**Adopted** as a new **Class L — session and state integrity**, plus additions to Classes B and D. See [12-Harness/Failure-Injection-Catalogue.md](../12-Harness/Failure-Injection-Catalogue.md).

### 2.3 Shadow scores are rankings, never probabilities ⭐

Their point: do not display or record "83% chance of X", because LLM-derived scores are not calibrated disease probabilities. Call them internal hypothesis scores or shadow rankings until a calibration dataset exists.

v2 already forbade *showing* the differential in v1 and forbade publishing concordance figures — but it did not state clearly enough that even the **internal representation and the eventual Phase 2 UI must not use probability language**. That is a real gap, because the vocabulary you use internally is the vocabulary that leaks into the interface eighteen months later.

**Adopted** as an explicit rule in [12-Harness/Question-Knowledge-Graph.md](../12-Harness/Question-Knowledge-Graph.md) and recorded as ADR-023.

### 2.4 Product packaging: PRE-ROUND / INTELLIGENCE / ENGAGE

A clean commercial framing that maps onto our three horizons and gives the messaging feature a name and a place. **Adopted** as packaging language in [09-MVP/Go-To-Market.md](../09-MVP/Go-To-Market.md) — with the caution that ENGAGE must not be built or sold until the core is proven, or it becomes the scope creep that kills the product.

---

## 3. Where the review is weaker than v2

### 3.1 It misses the data-localisation constraint entirely 🔴 the most important gap

The review cites UU 27/2022 and Permenkes 24/2022, but **nowhere addresses where health data may physically live**. Its architecture would happily call a cross-border LLM API.

That is not a small omission. In Indonesia it is the constraint that determines the entire AI layer — whether you can use a commercial hosted model at all, or whether you must self-host open weights in a Jakarta region, which changes cost from variable to fixed and lowers the quality ceiling.

**And the primary source they themselves cited contains the answer** — see §4.

### 3.2 No medical-device classification analysis 🔴

The review never asks whether MEDOXZI is a regulated medical device in Indonesia. No mention of Kemenkes device rules, risk classification, IEC 62304, or — critically — that **the differential engine is the feature that would cross that line**.

This is the question that can stop the product shipping, and it has the longest lead time of anything in the plan. Its absence is the review's biggest structural gap after §3.1.

### 3.3 No RECON phase — build starts against imagined documents 🔴

Their Phase 1 is "Build Core MVP". Their Phase 3 is "Internal Red-Team / **Synthetic** Validation". On that plan, the team does not see a real Indonesian prescription until **Phase 6**, by which point the OCR architecture, the cost model and the extraction schema are all committed.

Building a document pipeline against imagined documents is the single largest avoidable waste in this project. v2 inserts RECON — two to three weeks, **no signed clinic required**, because collecting 100–200 consented real records and sitting in four waiting rooms needs politeness, not a contract.

### 3.4 Their pilot goes live without a shadow week 🟠

Phase 6 "Controlled First-Clinic Launch" → Phase 7 "2-Week On-Site". The system is relied upon from day one, on clinical content signed days earlier.

v2 splits the same fortnight into **week 1 shadow, week 2 live**. Identical cost, and it removes the riskiest step in the plan.

### 3.5 Red-flag rules stay in the MVP, unresolved 🟠

Their pitch line — *"detects deterministic safety triggers"* — implies red flags are live at pitch time. But they also say the doctor reviews rules before live deployment. Those two are in tension: **either the demo shows unsigned safety rules, which is a false claim to a clinically literate room, or it shows nothing and the pitch line is wrong.**

v2 resolves this cleanly: the engine ships with an **empty rule set**. The demo says so out loud, and *"you write the rules for your own clinic"* becomes the opening of the relationship rather than an awkwardness in it.

### 3.6 The bias list mixes two different things ⚠️

Their Layer 5 lists: anchoring, confirmation, availability, demographic, premature closure, automation, hallucination, source confusion.

These are not one category:

| Machine behaviour — we can **test** this in CI | Clinician cognition — we can only **design against** it |
|---|---|
| Demographic disparity (name, sex, age, locale, entry mode) | Anchoring bias |
| Source confusion / cross-document attribution | Confirmation bias |
| Hallucination / untraceable statements | Availability bias |
| Subgroup performance gaps | Premature closure |
| | Automation bias |

Putting them in one list makes the section feel rigorous while half of it has no test. **Automation bias in particular is a property of the doctor, not of the software** — you measure it with periodic blinded seeded-error exercises on humans, not with a unit test. v2 separates these and gives the second group a measurement method (metric S11) rather than a checkbox.

### 3.7 Marketing framing is too warm, too early 🟠

The review calls the funnel *"VERY valuable"* and *"clinic growth infrastructure"* before reaching its caveats, and illustrates with *"imagine a clinic has 30,000 patients"*. It does land in the right place — clinic owns the relationship, separate consents, don't sell lists — but the ordering invites over-investment in a module that must not be built until the core is proven.

It also omits what actually disciplines the decision: **UU 27/2022 exposure is 2% of annual revenue administratively, with criminal provisions reaching five years and corporate multipliers.** Naming the number is what makes the boundary hold under commercial pressure.

### 3.8 Question Utility Score is described as if it ships 🟠

Their scoring engine (discrimination × safety × missing information × patient burden × prior answers) is a good formulation — it is essentially our information-gain ranker. But they describe it as the live selection mechanism.

In v2 the score is **computed and logged, and the visible order stays deterministic** until the learned ranker beats the clinician-authored baseline on held-out data. Shipping an unvalidated scoring engine as the live question selector is exactly the kind of unvalidated intelligence that shadow mode exists to prevent.

### 3.9 No cost implication anywhere

Self-hosting inference in Jakarta moves cost from variable to fixed. Twenty-five-year retention (§4) is a material storage commitment. Neither appears.

---

## 4. The correction to *our own* work 🔴 read this one

The review cited **Permenkes 24/2022 from the primary source** (JDIH Kemenkes), where v2 had relied on a secondary summary. Reading the primary document changed three things.

### 4.1 The localisation requirement is in Permenkes 24/2022, and it binds *us* directly

> **Pasal 22(1)** — a health facility may cooperate with an electronic system operator **"yang memiliki fasilitas penyimpanan data di dalam negeri"** — that has data storage facilities **within the country**. **[Confirmed — primary source]**

This is cleaner, more specific and more directly binding than the GR 28/2024 reading v2 relied on. **MEDOXZI is exactly the kind of electronic system operator this provision governs.** A clinic cannot lawfully cooperate with us unless our data storage is in Indonesia.

**Honest accounting of what happened here:**
- v2 asserted a broad GR 28/2024 health-data-centre requirement on the strength of one practitioner source. A second source consulted today confirmed GR 28 localisation explicitly only for **biobanks/biorepositories**, not as a general health-data rule. **Our original framing was over-generalised.**
- The review cited the better source but **under-read it** — extracting only the confidentiality/integrity/availability line and missing both Pasal 22(1) and Pasal 39.
- The architectural conclusion is unchanged and now rests on firmer ground: **data storage in Indonesia, and therefore in-country inference.**

### 4.2 Twenty-five-year retention — a finding neither of us had

> **Pasal 39(1)** — medical record data must be stored for **at least 25 years** from the patient's last visit. **[Confirmed — primary source]**

This closes Open Question D5, which v2 had left unanswered, and it has real consequences: storage cost modelled over decades, deletion workflows that must respect a statutory floor **above** a patient's erasure request, and archive-tier design that is a v1 concern rather than a later one.

### 4.3 Other primary-source specifics now incorporated

- **Pasal 3(2)** — applies to private practices, puskesmas, **clinics**, hospitals, pharmacies, laboratories
- **Pasal 20(3)** — storage permitted on servers or **certified** cloud computing
- **Pasal 21** — must connect to the MoH-managed health data interoperability platform (SATUSEHAT, not named as such in the text)
- **Pasal 24(2)** — record transfer on referral occurs through that same platform
- **Pasal 29(1)** — confidentiality, integrity, availability, defined
- **Pasal 45** — compliance deadline 31 December 2023

All folded into [13-Indonesia/Regulatory-Indonesia.md](../13-Indonesia/Regulatory-Indonesia.md).

**The lesson worth keeping:** the review's habit of citing primary legal sources is better than ours was. Adopted as a standing rule — Indonesian regulatory claims are sourced from JDIH primary documents, not from practitioner summaries, and practitioner summaries are used only as pointers.

---

## 5. What we are not adopting

| Proposal | Decision | Reason |
|---|---|---|
| Six-plus non-answer states (`PATIENT_UNSURE`, `UNABLE_TO_ANSWER`, `DECLINED_TO_ANSWER` on top of existing) | **Partially adopted** — adding `UNABLE_TO_ANSWER` only | See §6 |
| Live Question Utility Score in v1 | **Deferred** | Compute and log it; deterministic order ships until it wins on held-out data |
| ENGAGE module in the near term | **Deferred** | Right idea, wrong time. Building it before the core is proven is the scope creep that kills the product |
| Phase order without RECON | **Rejected** | See §3.3 |
| Red flags live at pitch | **Rejected** | See §3.5 |

## 6. On enum bloat — a considered position

The review proposes `YES / NO / UNKNOWN / NOT_ASKED / PATIENT_UNSURE / UNABLE_TO_ANSWER / DECLINED_TO_ANSWER`.

Every additional state must be rendered distinctly in three UIs, mapped in FHIR export, handled in the rule engine, and covered by tests — and the cost of getting one *wrong* is exactly the `NOT_ASKED`-becomes-`NO` defect class we care most about. More states is not automatically safer; **more states that are never distinguished in practice is less safe**, because it invites collapsing them in code.

Our resolution:

| State | Keep? | Reasoning |
|---|---|---|
| `ANSWERED` | ✅ | |
| `NOT_ASKED` | ✅ | Nobody put the question |
| `UNKNOWN` | ✅ | Asked; patient does not know. **`PATIENT_UNSURE` merges here** — the clinical consequence is identical |
| `DECLINED` | ✅ | Asked; patient refused. Clinically and ethically distinct from not knowing |
| `SKIPPED` | ✅ | Asked; deferred. Distinct because it may be revisited |
| **`UNABLE_TO_ANSWER`** | ✅ **added** | Patient *cannot* answer — confusion, distress, language barrier, hearing, too unwell. **Clinically distinct and important**: it is a signal about the patient's state, not about the question |

`UNABLE_TO_ANSWER` earns its place because it is the only one of the three proposed additions that tells a doctor something about the *patient*. Implemented in the prototype with tests.

---

## 7. Net position

The external review is a genuine second opinion rather than an echo, and the convergence on the hardest calls raises confidence in them. Its four contributions are adopted. Its four gaps — localisation, device classification, RECON, and the shadow week — are the ones that would hurt most if the plan were followed as written.

And its best contribution was accidental: **citing a primary source we had only read second-hand, which corrected our own regulatory analysis and closed an open question.**

## v2.2 Reconciliation

Second reconciliation accepted: production red-flag packs stay empty until signed clinic approval; `TRAIN` is renamed internally to HARNESS + SYSTEM HARDENING; doctor diagnoses are not automatic ground truth; self-training is prohibited; shadow scores are not disease probabilities; and regulatory certainty is downgraded where primary Indonesian counsel is still required.

Rejected: any restoration of a paid pre-build Clinical Safety Doctor retainer, any visible diagnostic differential in V1, any general autonomous clinical agent loop, and any use of patient contacts as MEDOXZI-owned marketing assets.


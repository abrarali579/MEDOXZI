# The Pitch Dossier

**The harness's most valuable output is not a better model. It is a document you hand to a doctor.**

Every clinician you pitch has the same unspoken question, and it is not *"how much time will this save?"* It is:

> *"How do I know it won't make something up about my patient?"*

Nobody pitching an Indonesian clinic answers that with numbers. You can.

---

## 1. What the dossier is

A short, dated, signed document — 4 pages — generated from a real harness run, showing what was attacked, what held, and what did not. It is not marketing collateral. It reads like a test report, because it is one, and that is exactly why it works.

**Rules for it to be worth anything:**
- Every number traces to a signed harness run (`run_id` printed on the page)
- It **states its limitations in the document itself**, not in a footnote
- It reports the numbers that came out badly alongside the ones that came out well
- It never contains a diagnostic accuracy figure
- It is regenerated for each pitch, so it is never stale

**A dossier that only contains good news will be read as marketing and discounted entirely.** The one that says *"handwritten dose extraction reaches 87% precision, so we route 100% of handwritten medications to your confirmation — here is what that looks like on screen"* is the one that gets you a second meeting.

## 2. Structure

### Page 1 — What we tested and why

> *This system reads your patients' old prescriptions and lab reports and organises what they tell us. It does not diagnose. Before showing it to you, we tried to break it 12,480 times. This is what happened.*

A plain-language table of the eight attack classes, one line each. No jargon. The doctor should understand the shape of the testing in thirty seconds.

### Page 2 — The four numbers

| What we tested | Result |
|---|---|
| **Could one patient's information reach another patient's screen?** 4,000 encounters processed simultaneously, each carrying a hidden marker. | **0 occurrences.** |
| **Does it invent values when handwriting is unreadable?** 1,500 deliberately illegible fields, where we knew the true answer was "cannot be read". | **Abstained 98.6%. Invented a value 0 times.** |
| **When it says it is confident, is it?** 8,200 extractions across all document types. | **Above 90% confidence: correct 96.2%. Below 70% confidence: correct 61%** — the score means something. |
| **Can any sentence it writes be traced to a document?** Every generated statement checked against its source. | **100%. Untraceable statements are withheld, not shown.** |

**Four numbers. That is the whole page.** Each one is a direct answer to a fear a doctor actually has.

### Page 3 — What it refuses to do

A short list, because refusals build more trust than features:

- It will not name a diagnosis, and there is an automated check in our build that fails if it ever does
- It will not tell your patient anything clinical — patients see only what they typed and their queue number
- It will not put a medication into the record without you confirming it — that is enforced in the database, not in the interface
- It will not say "no concerns". If no rule matched, it says **"no rule triggered"**
- It will not say a patient denied something when they were simply never asked
- **It has no red-flag rules at all until you write them.** That is your job, not ours.

### Page 4 — Limitations, stated plainly

- These results are from **synthetic and collected documents**, not from your clinic. Your documents will be different, and week 1 is a shadow week for exactly that reason.
- Handwritten prescription extraction is our weakest area — **87% precision**, which is why every handwritten medication requires your confirmation.
- The clinical questions are drafted from published history-taking frameworks and **have not been reviewed by a doctor yet**. Reviewing them is the first thing we do together.
- The system has not been validated for **children, pregnancy, or frail elderly patients**. It detects them and declines to summarise.
- We are not a medical device and do not claim to be. If we add features that change that, we will tell you before we do it. ⚖️

**Page 4 is why the dossier works.** Every vendor has a page 2. Almost none has a page 4.

## 3. The live demo protocol

The dossier gets you the meeting. The demo either confirms or destroys it. Run it in this order:

| # | Step | Why |
|---|---|---|
| 1 | **Show a normal encounter end to end.** Synthetic patient, three documents, the 30-second read. | Establishes what the product is |
| 2 | **Let the doctor click a provenance chip** to the source image with the region highlighted | This is the moment trust is either built or not |
| 3 | **Show a low-confidence handwritten medication** as `UNCONFIRMED`, and let them confirm it | Demonstrates the human-in-the-loop is real, not decorative |
| 4 | **Break it on purpose.** Feed an illegible document and show it saying "illegible" rather than guessing | **The highest-value 20 seconds in the entire pitch** |
| 5 | **Show the empty red-flag panel**, and say plainly: *"there are no rules in here. You write them."* | Turns a missing feature into their ownership |
| 6 | **Show a paediatric patient being gated out** | Demonstrates the system knows its own limits |
| 7 | **Show `NOT_ASKED` rendering** next to `NONE_KNOWN` | Most doctors have been burned by a form that conflated these |
| 8 | Only then, the time-saving argument | It lands after trust, not before |

**Every screen in the demo carries a visible `UNVALIDATED — DEMO CONTENT` marker until a doctor has signed the content pack.** Showing unvalidated clinical content without saying so is the fastest way to lose a clinically literate room.

## 4. What not to bring

| Do not show | Why |
|---|---|
| **Any diagnostic accuracy or concordance number** | It will be heard as "your AI diagnoses at X%", whatever the caption says. It is also our Phase 2 gate, not a claim. |
| The shadow differential | It does not exist as far as the product is concerned |
| Benchmark scores of any underlying model | Irrelevant and invites the wrong conversation |
| A time-saving figure before the pilot | We have not earned it. Say so — *"we think 15%; you'll be the first clinic that tells us."* |
| Competitor comparisons | The doctor's alternative is paper, not a competitor |
| A roadmap slide | It invites feature negotiation before the core is agreed |

## 5. The Indonesia-specific angle

The compliance situation gives the dossier a second job. **[Confirmed]** Permenkes 24/2022 makes electronic medical records mandatory for every health facility including clinics, with sanctions escalating from written warning through accreditation demotion to business permit revocation; SATUSEHAT integration is part of that obligation. Meanwhile FKTP doctors already enter consultation notes into BPJS **P-Care**.

So the pitch has two halves, and the second half is the one that gets a signature:

1. *"It saves you time in the consultation."* — the product thesis, unproven until your clinic proves it
2. *"It produces structured, export-ready clinical data for the record-keeping you are already required to maintain — and you stop typing the same encounter twice."* — a present, funded, sanctioned pain

**Be honest about what half two does and does not do today:** we produce structured FHIR R4-shaped output; we are not a certified SATUSEHAT integration; that is the next thing we build, with you. Overclaiming an integration with a government platform is a uniquely bad idea.

## 6. Dossier generation

```bash
python3 -m harness.run --suite full --profile pitch --locale id
python3 -m harness.dossier --run-id hr_2026_08_23_0140 --out dossier_id.pdf --lang id
```

Generated in **Bahasa Indonesia and English**, from the same signed run. The Indonesian version is reviewed by a native speaker before use — a translation error in a document whose entire purpose is precision would be a self-inflicted wound.

## v2.2 Reconciliation

No invented numbers. The dossier must show limitations, run metadata, dataset versions, attack classes, what passed, what failed, and which evidence category each result belongs to. Pitch evidence may show engineering seriousness, not unvalidated clinical claims.


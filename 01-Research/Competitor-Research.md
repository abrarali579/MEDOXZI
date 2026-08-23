# Deliverable 2 — Current Market Landscape

**Research date:** 23 August 2026
**Method:** vendor documentation and official product pages where reachable; peer-reviewed literature where available; third-party review sites treated as weak evidence and labelled as such.
**Discipline applied:** capabilities are **not** inferred from marketing language. Where a vendor asserts a capability we could not verify against documentation, it is labelled **[Vendor Claim]**. Where only review sites assert it, **[Third-Party Claim]**. Where we could not reach the primary source at all, **[Unverified]**.

> **Important caveat on this section.** Several primary sources (PubMed/PMC article pages, one vendor pricing page) returned access challenges during this research pass and could not be read. Every claim that depended on them is marked **[Unverified]** rather than paraphrased from memory. Competitive intelligence of this kind decays in months; re-verify before any board or investor use.

---

## 1. The map: five categories, and where we sit

```
                        POST-consultation
                              ▲
                              │   Nabla · Suki · Dragon Copilot
                              │   (ambient documentation)
                              │
   patient-facing ◄───────────┼───────────► clinician-facing
                              │
   Ada · Infermedica          │   OpenEvidence (evidence retrieval,
   (symptom checkers)         │   not patient-specific)
                              │
                              │   ◄── ★ MEDOXZI Pre-Round ──►
                              │       (patient-specific,
                              ▼        clinician-facing, PRE-consultation)
                        PRE-consultation
```

**The finding that matters:** the well-funded, well-validated products all cluster in *post*-consultation documentation. The *pre*-consultation slot is occupied only by (a) patient-facing symptom checkers, which carry a fundamentally different risk posture and speak to the wrong person, and (b) digital intake forms, which capture data but do not synthesise it. **[Inference]**

---

## 2. Nabla (Nabla Copilot)

| Area | Finding | Label |
|---|---|---|
| **Primary use case** | Ambient AI assistant for clinicians; generates clinical notes from the patient encounter, combined with dictation | **[Vendor Claim]** — vendor site and press release |
| **What problem it solves** | Documentation burden and after-hours charting | [Vendor Claim] |
| **Target user** | Physicians and health systems; enterprise deployments (e.g. M Health Fairview announced selection of Nabla's combined ambient assistant + dictation solution) | **[Third-Party Claim]** — PR Newswire release |
| **Workflow entry point** | During and immediately after the consultation | [Vendor Claim] |
| **Input** | Ambient audio of the encounter; dictation | [Vendor Claim] |
| **AI functionality** | Speech recognition → note generation → structured output | [Vendor Claim] |
| **Clinical decision support** | Not positioned as CDS in the material reviewed | [Inference] |
| **Integrations** | EHR integrations claimed; specific EHR list not verified in this pass | **[Unverified]** |
| **Evidence / citations** | Not an evidence-retrieval product; no citation model applicable | [Inference] |
| **Privacy / security** | **Publicly documented:** SOC 2 Type II and ISO 27001 frameworks with certifications; AES-256 at rest; TLS in transit; hosted on Google Cloud Platform with **database region selected at organisation creation**; annual third-party penetration testing; quarterly access reviews; encrypted multi-region backups; vulnerability disclosure policy; trust portal at trust.nabla.com | **[Confirmed]** — nabla.com/security, accessed 23 Aug 2026 |
| **Audio retention / training on customer data** | **Not documented on the security page reviewed** | **[Unverified]** — must be obtained from the trust portal / DPA before any comparison claim is made |
| **Pricing** | Not published on the pages reviewed | [Unverified] |
| **Strengths** | Clear, specific, publicly documented security posture including **region selection** — a template worth copying; enterprise traction |
| **Limitations (for our problem)** | Solves the post-consultation half; requires in-room audio capture; multilingual, code-switched, noisy Indian OPD audio is a hard acoustic environment | [Inference] |
| **Lessons for us** | **Adopt:** the published-security-page-plus-trust-portal pattern, and explicit data-region selection as a product feature. **Avoid:** competing on ambient documentation. **Note:** their existence *validates* clinician willingness to adopt AI in the encounter — the market education is already paid for. |

---

## 3. Suki (Suki Assistant / Suki Platform)

| Area | Finding | Label |
|---|---|---|
| **Primary use case** | "Ambient Clinical Intelligence" platform — charting, dictation, patient instructions, orders | **[Confirmed]** — suki.ai, accessed 23 Aug 2026 |
| **Product lines** | *Suki for Clinicians* (assistant app) and *Suki for Partners* (developer toolkit for healthtech integration) | **[Confirmed]** |
| **Claimed capabilities** | Ambient documentation capturing "the entire patient conversation to generate complete, high-quality notes"; assisted revenue-cycle management; clinical reasoning; Q&A | **[Vendor Claim]** — vendor's own wording |
| **Target user** | Clinicians; health systems; and notably **other health-tech vendors** via the partner toolkit | [Confirmed] |
| **Workflow entry point** | During the consultation and at charting time | [Vendor Claim] |
| **Input** | Voice (ambient + dictation) | [Vendor Claim] |
| **Integrations** | Named: **Epic, Oracle Health, athenahealth, MEDITECH** — described as "deep, real-time integrations" | **[Confirmed]** that these are named; **[Vendor Claim]** as to depth |
| **Clinical decision support** | "Clinical Reasoning" and "Q&A" listed as capabilities; **scope, safety framing and evidence not documented on the page reviewed** | **[Vendor Claim]** / [Unverified] |
| **Evidence / citations** | Not verified | [Unverified] |
| **Privacy / security** | Not reviewed in this pass | [Unverified] |
| **Pricing** | **Not published**; site directs to sales | **[Confirmed]** that it is not published. Third-party sites publish figures; these are **[Third-Party Claim]** and should not be cited. |
| **Strengths** | Breadth (documentation + coding + reasoning + Q&A); the **partner/embed motion** is strategically interesting — selling AI capability into other people's clinical software rather than fighting for the clinician's screen |
| **Limitations (for our problem)** | US-EHR-centric integration surface (Epic/Oracle/athena/MEDITECH are largely absent from the Indian OPD market); voice-first |
| **Lessons for us** | **Adopt:** the *partner/embed* strategy — in India the incumbent HIS vendors own distribution, and being an embeddable pre-round layer may beat being a standalone app. **Avoid:** feature sprawl into coding and revenue cycle before the core is proven. |

---

## 4. Microsoft Dragon Copilot (Nuance DAX lineage)

| Area | Finding | Label |
|---|---|---|
| **Primary use case** | Unified voice AI assistant for clinical workflow: ambient documentation, dictation, information surfacing, task automation | **[Confirmed]** — Microsoft Learn, accessed 23 Aug 2026 |
| **Documented capabilities** | (1) Ambient conversation capture; (2) draft document generation **for clinician review**; (3) generation of *recommendations* for **orders, conditions, flowsheet documentation, narrative notes, incident notes**; (4) "information guidance" — summarised, contextualised responses from **internal and external sources** | **[Confirmed]** — explicitly listed in official documentation |
| **Target user** | Clinicians and care teams in health systems | [Confirmed] |
| **Deployment models** | (a) **Standalone apps** (web, desktop, mobile) with manual transfer of the finalised note into the EHR; (b) **embedded** via the Dragon Copilot Developer Kit, with ambient capture inside the EHR and summaries delivered directly to it | **[Confirmed]** |
| **Input** | Voice | [Confirmed] |
| **Clinical decision support** | Generates *recommendations* for orders and conditions and surfaces information from sources — but the documentation reviewed **does not state a medical-device classification or a CDS designation** | **[Confirmed]** that it is not stated; classification itself **[Unverified]** |
| **Consent** | Documentation explicitly instructs: *"Make sure users obtain patient consent before recording the patient encounter"* | **[Confirmed]** |
| **Integrations** | Developer Kit for EHR embedding; specific EHR compatibility not enumerated on the page reviewed | [Unverified] |
| **Evidence / citations** | "Information guidance" from internal and external sources; citation behaviour not documented on the page reviewed | [Unverified] |
| **Privacy / security / responsible AI** | **Not addressed on the overview page reviewed** — likely documented elsewhere in Microsoft's compliance materials | [Unverified] |
| **Pricing** | Not published | [Unverified] |
| **Strengths** | Distribution (Microsoft's healthcare footprint); breadth from documentation into orders and information retrieval; explicit "draft for clinician review" framing |
| **Limitations (for our problem)** | Enterprise sales motion, enterprise price point, voice-first, US/EU-centric |
| **Lessons for us** | **Adopt:** the explicit *draft-for-review* framing, and the in-product consent instruction — put consent in the product, not only in the contract. **Note:** the fact that a company of Microsoft's size ships "recommendations for orders and conditions" while carefully avoiding diagnostic language is a **calibration signal for our own wording**. |

---

## 5. OpenEvidence

| Area | Finding | Label |
|---|---|---|
| **Primary use case** | Point-of-care clinical question answering grounded in medical literature | **[Confirmed]** — peer-reviewed description, PMC12951846 |
| **How it works** | "Retrieval-augmented generation-based Large Language Model that references established medical sources"; users pose clinical questions via browser or mobile app and receive evidence-based answers **with citations** | **[Confirmed]** — peer-reviewed source |
| **Evidence sources** | Described as featuring "partnerships with prominent journals such as NEJM, JAMA and Lancet"; collaboration with Mayo Clinic Platform noted | **[Confirmed]** *that the peer-reviewed article states this*; the commercial terms of those partnerships are **[Unverified]** |
| **Target user** | Practising clinicians, residents, fellows | [Confirmed] |
| **Workflow entry point** | Ad-hoc, clinician-initiated; **not embedded in the patient encounter and not patient-specific** | [Inference from the described interaction model] |
| **AI functionality** | RAG over curated, licensed literature with citation generation | [Confirmed] |
| **Clinical decision support** | Explicitly positioned as **not** offering "medical advice, diagnosis, or treatment" | **[Confirmed]** — stated in the reviewed article |
| **Evidence / citations** | Citations are the core of the product | [Confirmed] |
| **Stated limitations** | Accuracy depends on input clarity; occasional site lag; the generated information is **not itself peer-reviewed**; "proper use requires human intervention, medical expertise, and specialized knowledge" | **[Confirmed]** — stated in the reviewed article |
| **Privacy / security** | Not reviewed | [Unverified] |
| **Pricing / business model** | Widely reported as free-to-clinician with an advertising-supported model; **not verified against a primary source in this pass** | **[Third-Party Claim]** |
| **Strengths** | The single best available reference implementation of **licensed-corpus RAG with citation-first output**; strong clinician adoption; explicitly disclaims diagnosis |
| **Limitations (for our problem)** | Answers *questions about medicine*, not *questions about this patient*. No intake, no records, no workflow position, no structured patient state. |
| **Lessons for us** | **Adopt:** citation-first output; the explicit disclaimer of diagnosis; **and crucially the licensing model — they licensed the corpus rather than scraping it.** This is the template for our institutional-knowledge feature (see [RAG-Architecture.md](../04-Architecture/RAG-Architecture.md)). **Avoid:** building a general literature product; it is a different company. |

---

## 6. Adjacent categories (brief)

### 6.1 Patient-facing symptom checkers (Ada, Infermedica, and successors)
- **Function:** patient enters symptoms, receives possible conditions and a triage recommendation. **[Third-Party Claim / general industry knowledge — not verified in this pass]**
- **Why it matters to us:** this is the closest thing to our intake + differential engine — but pointed at the patient.
- **Why we are deliberately not this:** showing a differential to a patient is a categorically higher-risk act (misplaced reassurance, health anxiety, care avoidance) and a materially heavier regulatory posture. **Our constraint that patients never see differentials is exactly the line that separates us from this category.** [Inference]
- **Lesson:** their symptom-model structures (symptom→finding→condition graphs with evidence weights) are a good *reference design* for how to represent clinical questions — while their user-facing output model is the thing to avoid.

### 6.2 Digital intake / patient-experience platforms
- **Function:** registration, forms, consent capture, payments, sometimes queue management. **[Third-Party Claim]**
- **Gap:** they capture data; they do not parse prior records, do not synthesise a clinical summary, and do not do red-flag logic.
- **Lesson:** intake completion is a *known solvable operations problem* in this category — reminders, kiosks, staff assistance, SMS links. Copy their operational playbook; the technology is not the hard part.

### 6.3 ED-focused AI clinical workflow tools
- **Function:** triage support, acuity scoring, disposition prediction, sepsis alerting. **[Unverified — not researched in depth in this pass]**
- **Relevance:** ED triage is where deterministic red-flag scoring is most mature (validated scores exist for many presentations), and where **alert fatigue** has been most thoroughly documented as a failure mode.
- **Lesson:** the ED literature's alert-fatigue experience is the strongest argument for our design choice that red flags must be **few, high-precision-enough to be respected, and never blocking**. [Inference]
- **⚠️ Flagged for a dedicated research pass** before the red-flag rule set is finalised, so that we adopt validated scoring instruments rather than inventing rules.

### 6.4 Indian HIS / EMR vendors and ABDM-linked applications
- **Function:** registration, OPD queue, billing, pharmacy, basic EMR; increasingly ABDM/ABHA-linked. **[Third-Party Claim]**
- **Relevance:** they own the clinic relationship and the front desk. They are the distribution channel.
- **Lesson and strategic recommendation:** **partner rather than displace.** Design the product so it can be (a) standalone, and (b) an embeddable pre-round module surfaced inside an existing HIS. This is the Suki-for-Partners motion applied to the Indian market. [Inference]

---

## 7. Cross-cutting observations

1. **Nobody in the leading set claims to diagnose.** Microsoft ships "recommendations for orders and conditions"; OpenEvidence explicitly disclaims diagnosis. The market's most sophisticated players are careful with this language, and so should we. **[Confirmed pattern across sources]**
2. **Everyone is voice.** Ambient audio is the assumed input modality of the entire documentation category. This is both an opportunity (the structured-text pre-round slot is empty) and a warning (voice may be where the category converges, so our structured data should be designed to *feed* a scribe later rather than compete with one). [Inference]
3. **Security posture is a published artefact, not a sales conversation.** Nabla's public security page is a competitive feature. We should have one before our first customer conversation. **[Confirmed example]**
4. **Citation-first is the trust mechanism that works.** OpenEvidence's adoption rests on it. Our analogue is *provenance-first* — the same psychological mechanism applied to patient data rather than literature. [Inference]
5. **Licensing, not scraping.** The only evidence-grounded product with real clinical credibility licensed its corpus. Any institutional-knowledge feature we build must assume the same. [Inference, strongly supported]

---

## 8. What we adopt, what we avoid

| Adopt | From | Why |
|---|---|---|
| Published security page + trust portal + explicit data-region selection | Nabla | Turns compliance into a sales asset and forces internal discipline |
| Partner/embed distribution motion | Suki | The Indian HIS incumbents own the front desk |
| "Draft for clinician review" language and in-product consent prompts | Dragon Copilot | Correct regulatory framing, correct ethical framing |
| Citation-first / provenance-first output; explicit non-diagnosis disclaimer; **licensed** corpora only | OpenEvidence | The proven trust mechanism, and the only defensible IP posture |
| Symptom→finding→condition graph structures as an internal representation | Symptom checkers | Good data modelling, without the patient-facing output |
| Operational intake playbook (SMS links, kiosks, staff assist, reminders) | Digital intake vendors | Solves our #1 failure mode with known techniques |
| Alert-fatigue discipline | ED CDS literature | Our red-flag design lives or dies on this |

| Avoid | Why |
|---|---|
| Competing on ambient documentation | Well-funded, well-validated incumbents; wrong half of the problem |
| Patient-facing differentials or triage advice | Categorically higher risk; different regulator posture; not needed |
| US-EHR-first integration strategy | Wrong market for our launch geography |
| Feature sprawl into coding, billing, revenue cycle | Kills focus before the core hypothesis is tested |
| Unlicensed corpora of any kind | Legally and reputationally fatal |
| Marketing language that implies diagnosis | The most sophisticated players avoid it; so must we |

---

## 9. Evidence gaps to close before this section is used externally

| Gap | Why it matters | How to close |
|---|---|---|
| Nabla and Suki data-retention and model-training-on-customer-data terms | Direct competitive and privacy comparison | Request trust-portal access / DPA |
| Suki's actual "clinical reasoning" scope and safety framing | Determines whether anyone is already in our regulatory position | Vendor demo, documentation request |
| Dragon Copilot's device classification posture in any market | Best available read on where the regulatory line sits in practice | Regulatory database search ⚖️ |
| Published pricing for any of the above | Cost-model benchmarking | Direct quote requests; **do not cite review-site figures** |
| ED CDS / triage tool landscape | Directly informs the red-flag engine | Dedicated research pass 🩺 |
| Indian HIS vendor landscape and partnership appetite | Determines the distribution strategy | Market interviews |
| Peer-reviewed evidence on ambient-scribe time savings (RCT and time-motion studies exist but were not retrievable in this pass) | Benchmarks for our own time-saving claims | Retrieve via institutional access — see [Research-Log.md](Research-Log.md) entries R-07, R-08 |

# Indonesia — Regulatory Landscape

**Research date:** 23 August 2026
> ⚖️ **Not legal advice.** An engineering team's reading of publicly available sources, prepared to scope the questions for qualified Indonesian counsel. Every conclusion is provisional. Indonesian regulation in this area is actively moving — the PDP implementing regulation was still unpublished as of late 2025 and a PDP amendment sits in the 2026 legislative programme.

---

## 1. The three regimes that matter

| Regime | Instrument | What it governs | Status |
|---|---|---|---|
| **Data protection** | UU 27/2022 (PDP Law) | Personal data generally | **In full force** — grace period ended October 2024 **[Confirmed]** |
| **Health data & health IT** | GR 28/2024; Permenkes 24/2022 | Health data localisation; electronic medical records; SATUSEHAT | **In force, with enforcement teeth** |
| **Medical device software** | Kemenkes medical device regime | Whether our software is a regulated device | Applies if we cross the device line |

---

## 2. UU 27/2022 — the PDP Law

| Element | Finding | Label |
|---|---|---|
| **Status** | Two-year transition ended **October 2024**; law fully applicable | [Confirmed] |
| **Supervisory authority** | **A dedicated DPA has not yet been appointed by the President.** The Ministry of Communication and Digital Affairs (MOCD) currently handles data protection through its Directorate General of Digital Space Supervision | [Confirmed] |
| **Implementing regulation** | Draft GR PDP completed harmonisation and passed to the State Secretary for presidential approval as of October 2025; **still unpublished** | [Confirmed as of that date] ⚠️ **Re-check — this may have issued** |
| **Lawful bases** | Consent, contractual necessity, legal obligation, vital interests, public interest, legitimate interest | [Confirmed] |
| **Health data** | **No separate processing regime**, but processing specific/sensitive personal data can trigger DPIA and DPO obligations | [Confirmed] |
| **DPIA** | Required for high-risk processing | [Confirmed] |
| **DPO** | Required in defined circumstances | [Confirmed] |
| **Records of processing** | Required | [Confirmed] |
| **Breach notification** | **Within 3×24 hours (72 hours)** to affected data subjects and the authority, in writing, stating the data disclosed, when, and the handling and recovery efforts | [Confirmed] |
| **Children** | Parental/guardian consent for under-18s | [Confirmed] |
| **Cross-border transfer** | Three sequential safeguards: (1) adequacy — recipient country provides equal or higher protection; (2) binding contractual safeguards; (3) data-subject consent. **No official adequacy list exists yet** | [Confirmed] |
| **Administrative sanctions** | Up to **2% of annual revenue** | [Confirmed] |
| **Criminal** | Unlawful collection/use: up to 5 years and/or IDR 200m. Unlawful disclosure: up to 4 years and/or IDR 200m. Forgery: up to 6 years and/or IDR 500m. **Corporate fines may be multiplied tenfold** | [Confirmed] |

**Implication:** the consent architecture designed in v1.0 transfers essentially unchanged — layered, granular, revocable, refusable-without-consequence. What changes is the **breach clock (72h, tighter than assumed)** and the **absence of an adequacy list**, which makes cross-border transfer a contract-and-consent exercise rather than a tick-box one.

---

## 3. Data localisation ⚖️ **the finding that reshapes the architecture — CORRECTED 23 Aug 2026**

> ### ⚠️ Correction to the earlier v2 analysis
> v2 originally attributed a general health-data-centre localisation requirement to **GR 28/2024**, on the strength of a single practitioner source. On re-checking, a second source confirmed GR 28 localisation explicitly only for **biobanks / biorepositories** ("operators of a biobank/biorepository must store specimens and data within Indonesia"). **That framing was over-generalised.**
>
> The operative requirement for a vendor like MEDOXZI is in **Permenkes 24/2022**, read from the primary source — and it is *better* for our purposes: more specific, more clearly binding, and directly about the relationship between a clinic and a software vendor.

### 3.1 The binding provision

> **Permenkes 24/2022, Pasal 22(1)** — a health facility may cooperate with an electronic system operator **"yang memiliki fasilitas penyimpanan data di dalam negeri"** — that has data storage facilities **within the country**.
> **[Confirmed — primary source, JDIH Kemenkes]**

**MEDOXZI is exactly the kind of electronic system operator this provision governs.** A clinic cannot lawfully cooperate with us unless our data storage is in Indonesia. This is not a preference or a risk posture — it is a condition of the customer being allowed to buy.

Supporting provisions from the same regulation:

| Provision | Requirement |
|---|---|
| **Pasal 20(3)** | Storage permitted on a server, on **certified** cloud computing, or on certified digital media |
| **Pasal 29(1)** | Confidentiality (protection from unauthorised internal and external access), integrity (accuracy; changes only by authorised persons), availability (accessible to those with access rights) |
| **Pasal 30** | Access controls |

Additional context from other instruments:

| Instrument | Relevance | Label |
|---|---|---|
| **GR 71/2019 Art. 17, 20, 21** | Public-sector electronic system operators must locate data centres in Indonesia; private-sector operators may store offshore but must guarantee regulatory access and supervision | [Confirmed] |
| **GR 28/2024** | Localisation confirmed for biobanks/biorepositories; a broader health-information-system reading is asserted by one practitioner source but was **not** confirmed by a second | [Vendor/practitioner claim — ⚖️ for counsel] |
| **UU 27/2022** | Cross-border transfer requires adequacy, contractual safeguards, or consent; no adequacy list exists | [Confirmed] |

### 3.2 What it forces

| Question | Answer |
|---|---|
| Can PHI sit in Singapore? | **No** — not while serving Indonesian clinics under Pasal 22(1) |
| Can we run inference on a cross-border endpoint? | **Legally fragile.** The storage requirement is explicit; the inference question needs counsel ⚖️ |
| Does de-identification solve it? | **Not on its own.** Pasal 22(1) is about the operator's storage facilities, not about identifiability |
| Compliant options | Self-hosted inference in an Indonesian region; a provider offering genuine in-country inference; or minimise what needs a model |

### 3.3 Available Indonesian regions

AWS **`ap-southeast-3` (Jakarta)**, Google Cloud **`asia-southeast2` (Jakarta)**, and Azure **Indonesia Central** all exist. **[Confirmed that the regions exist]**

Hosted frontier LLM services do not currently appear to be offered from Indonesia Central — the Azure Foundry regional availability list does not show it. **[Unverified — check each provider directly and re-check; regional availability changes frequently]** 🔴

Note **Pasal 20(3)**'s reference to *certified* cloud computing: whatever region is chosen, the certification status of the platform is itself a compliance question. ⚖️

### 3.4 Architectural decision

| Option | Verdict |
|---|---|
| Commercial hosted LLM, cross-border | ❌ Not without counsel, and storage would breach Pasal 22(1) regardless |
| Commercial hosted LLM, genuinely in-country | ✅ **Cheapest if available — verify per provider first** |
| **Self-hosted open-weights model in a Jakarta region** | ✅ **The likely answer.** Fixed GPU cost instead of variable tokens; lower quality ceiling; unambiguous compliance |
| Minimise model dependence | ✅ **Already the design** — and it now pays for itself twice |

**The v1.0 deterministic-first architecture was chosen for clinical safety. In Indonesia it is also the compliance strategy and the cost strategy.** Every step that is a lookup table rather than a model call is a step that does not need a GPU in Jakarta.

### 3.5 Retention — 25 years 🔴 **new finding, closes Open Question D5**

> **Permenkes 24/2022, Pasal 39(1)** — medical record data must be stored for **at least 25 years** from the date of the patient's last visit. Destruction is permitted after that period if the data is unused (Pasal 39(2)).
> **[Confirmed — primary source]**

This has consequences that reach further than a policy line:

| Area | Consequence |
|---|---|
| **Cost model** | Storage modelled over **decades**, not the 90-day hot / archive split v1.0 assumed. Archive-tier design becomes a v1 concern |
| **Deletion workflow** | A statutory floor sits **above** a patient's erasure request for clinical record data. Erasure applies to what we hold *beyond* the clinical record — AI artefacts, analytics, shadow outputs — not to the record itself ⚖️ |
| **Data model** | Records must remain readable in 25 years: stable formats, documented schema versions, no proprietary blobs |
| **Contracts** | What happens to 25 years of clinic data if we cease trading? An exit and escrow provision is a customer requirement, not a nicety ⚖️ |

**Design rule adopted:** the deletion workflow distinguishes **clinical record data** (statutory retention, cannot be deleted on request) from **derived data** (AI outputs, shadow outputs, cache, analytics — deleted on consent withdrawal). v1.0's blanket "delete derived data with its source" stands; "delete the source" does not, and the UI and the consent text must not promise it. ⚖️

## 4. Permenkes 24/2022 — mandatory electronic medical records

> **Now read from the primary source** (JDIH Kemenkes, `2022permenkes024.pdf`) rather than from a secondary summary. Article references below are verifiable.

| Element | Finding | Label |
|---|---|---|
| **Scope (Pasal 3(2))** | Private medical practices, **puskesmas**, **clinics**, hospitals, pharmacies, laboratories, health centres, and others designated by the Minister | [Confirmed — primary] |
| **EMR deadline (Pasal 45)** | 31 December 2023 | [Confirmed — primary] |
| **Storage location (Pasal 22(1))** | Cooperation only with electronic system operators having **domestic data storage facilities** | [Confirmed — primary] — see §3 |
| **Storage media (Pasal 20(3))** | Server, **certified** cloud computing, or certified digital media | [Confirmed — primary] |
| **Retention (Pasal 39)** | **Minimum 25 years** from last visit | [Confirmed — primary] — see §3.5 |
| **Security (Pasal 29(1))** | Confidentiality, integrity, availability — each defined | [Confirmed — primary] |
| **Interoperability (Pasal 21)** | Must connect to the MoH-managed health data interoperability and integration platform (SATUSEHAT; not named as such in the text) | [Confirmed — primary] |
| **Referral transfer (Pasal 24(2))** | Record transfer on referral occurs through that platform | [Confirmed — primary] |
| **SATUSEHAT integration** | Mandatory, phased through 2024 | [Confirmed] |
| **Sanctions** | Escalating: written warning → recommendation for **accreditation demotion** (partial integration by 31 Mar 2024, or <100% patient data integration by 31 Dec 2024) → recommendation for **accreditation revocation** (non-compliance by 31 Jul 2024) → **business permit revocation** through authorised institutions | [Confirmed] |

**This is the single most commercially important finding in the Indonesian research**, and it inverts the pitch. Indonesian clinics are not evaluating digital record-keeping as an efficiency purchase — they are under a mandate with permit-level consequences.

**What it means for us:**
- The wedge is **compliance relief plus time saved**, not time saved alone
- Structured, FHIR-R4-shaped output is a **selling point from day one**, even before certified integration
- **We still do not become the EMR.** Most target clinics already have one for the mandate. We sit alongside and feed it. Becoming an EMR is an unwinnable scope war and would put us squarely inside the regulated obligation rather than beside it.

---

## 5. SATUSEHAT

Indonesia's national health data platform, built on **HL7 FHIR R4**, with a published implementation guide and a developer ecosystem. **[Confirmed]**

| Decision | Rationale |
|---|---|
| **Build certified SATUSEHAT integration in the MVP?** | **No.** It is a substantial conformance exercise and not on the critical path to proving the product |
| **Make the data model export cleanly to FHIR R4 from day one?** | **Yes — this changes from v1.0.** In India FHIR was deferrable; here the target platform is FHIR R4 and mandated |
| **Claim SATUSEHAT compatibility in the pitch?** | **Only precisely:** "structured and FHIR R4-shaped today; certified integration is the next thing we build with you." Overclaiming an integration with a government platform is a uniquely bad idea |

**ADR-006 stands** — our internal model remains provenance-first, with FHIR as an export projection. The two safety rules on that mapping matter more here than in India, because the export target is a national platform: `NOT_ASKED` must never export as a negative, and unconfirmed extractions must not be exported into a national record. ⚠️🩺

---

## 6. Medical device software

| Element | Finding | Label |
|---|---|---|
| **Authority** | Ministry of Health (Kementerian Kesehatan RI) | [Confirmed] |
| **Classification** | Four-tier **Class A–D**, risk-based; most standalone software falls in **Class A or B** unless intended for high-risk diagnostic or treatment purposes | [Confirmed] |
| **Definition** | Standalone software (not embedded in or dependent on another device) meeting the medical device definition by intended use | [Confirmed] |
| **Software lifecycle standard** | **IEC 62304 compliance is stated as mandatory** for medical device software | [Confirmed] — note this is a substantive engineering obligation, not paperwork |
| **Documentation** | **Indonesian-language instructions for use** | [Confirmed] |
| **Clinical evidence** | Required for **Class C/D** | [Confirmed] |
| **Distribution** | IDAK (distribution licence) and CDAKB (good distribution practice) referenced | [Third-Party Claim] |
| **Explicit exclusions** | Software for designing/manufacturing/operating other devices is excluded. Administrative systems and general wellness apps are **implied** to be out of scope but were **not explicitly enumerated** in the sources reviewed | [Unverified] ⚠️ |

### Our position — and why it is *less* certain than in India

India's CDSCO guidance gave an explicit exclusion list (HIS/CIS, data transfer/storage/format conversion, communications) that we could reason against directly. **The Indonesian sources reviewed do not give an equivalent enumerated exclusion list.** That makes our classification argument weaker here, not stronger, and it is the single most important item for counsel. 🔴⚖️

**Our provisional reading — requires confirmation:**

| Feature | Reading | Confidence |
|---|---|---|
| Registration, token, queue, document storage | Administrative — outside the device definition | Medium [Inference] |
| Reorganising patient-reported information with provenance | Likely outside — it reorders what the clinician would read anyway | Medium [Inference] |
| Flagging abnormal labs **against the reference range printed on the source document** | Reproducing the laboratory's own determination, not making one | **Low ⚖️** |
| Red-flag rules | **Not in the MVP** — the rule set ships empty. When a clinic's own doctor authors rules for their own clinic, the analysis may differ again ⚖️ | **Low — ask counsel** |
| Visible differential | Almost certainly inside the device definition; Class B or above | **High confidence that this is regulated** |

**The v2 removal of red flags from the MVP happens to help here too.** With an empty rule set, the shipped product makes no urgency claim and no clinical assertion of any kind — which is the cleanest possible starting position for a classification opinion.

**IEC 62304 is worth noting now even though it does not yet apply.** If the product ever becomes a regulated device here, a software lifecycle standard applies retroactively to how you built it. Keeping version-pinned models, signed harness runs, traceable requirements and change control from the start is not over-engineering — it is the difference between a six-week and a six-month conformance exercise later.

---

## 7. BPJS and the clinic context

| Element | Finding | Label |
|---|---|---|
| **BPJS Kesehatan** | National health insurance covering over 200 million participants | [Third-Party Claim] |
| **FKTP gatekeeper model** | Patients must start at their assigned first-level facility before referral upward | [Confirmed] |
| **P-Care** | BPJS web application where clinics verify membership and **doctors enter clinical notes, diagnoses and referrals** | [Confirmed] |
| **P-Care coverage** | Over 80% of health facilities connected as of 2023 | [Third-Party Claim] |
| **Klinik Pratama** | Primary-level clinic; a common FKTP type alongside *puskesmas* | [Confirmed] |

**The operational insight:** an FKTP doctor is already typing the encounter into P-Care. Add a clinic EMR for the Permenkes mandate and they may be entering the same encounter **twice**, in two systems, neither of which helped them take the history.

That is a sharper, more specific pain than "history-taking takes too long", and it should be the first question in every RECON conversation: **"how many times do you type the same visit?"**

---

## 8. Actions for counsel ⚖️

| # | Question | Priority |
|---|---|---|
| 1 | Does GR 28/2024 permit **any** cross-border processing of health data, including de-identified inference? What approval route exists? | 🔴 Blocks the AI architecture |
| 2 | Are we a **Controller or Processor** relative to the clinic under PDP, and what changes for our own analytics? | 🔴 |
| 3 | Is the MVP (no red flags, no differential, no urgency signal) **outside the medical device definition**? | 🔴 Blocks launch |
| 4 | Does a **clinic's own doctor authoring red-flag rules inside our software** change our classification? | 🔴 Blocks CUSTOMISE |
| 5 | Has the **PDP implementing regulation** been issued, and what does it change? | 🟠 |
| 6 | What **medical record retention** periods apply to clinics, and to a processor holding derived data? | 🟠 |
| 7 | Do we require a **DPO**, and is a **DPIA** mandatory for this processing? | 🟠 |
| 8 | What are the **SATUSEHAT conformance obligations** for a system that produces data feeding a clinic's integration, without integrating directly? | 🟠 |
| 9 | Is a **local entity (PT PMA)** required to contract with clinics and to be a health information system organiser? | 🔴 Commercial blocker |
| 10 | What consent language satisfies PDP **in Bahasa Indonesia** for AI processing of health data? | 🔴 |

---

## 9. Comparison to India

Both markets are retained; the architecture stays geography-neutral. Where they differ:

| Dimension | Indonesia | India |
|---|---|---|
| Data localisation | **Hard requirement** for health data (GR 28/2024) | In-region strongly preferred, not equivalently mandated |
| Breach clock | 72 hours | Per DPDP Rules |
| EMR mandate | **Yes, with permit-level sanctions** | No equivalent |
| National platform | SATUSEHAT (FHIR R4), mandatory | ABDM, voluntary |
| Device guidance clarity | **Weaker** — no enumerated exclusion list found | Stronger — explicit exclusions in CDSCO guidance |
| Software lifecycle standard | **IEC 62304 stated mandatory** | Not equivalently stated |
| Insurance context | BPJS FKTP gatekeeper, P-Care double entry | Mixed public/private |
| Supervisory authority | **Not yet appointed** | DPB established under DPDP |

**The strategic read:** Indonesia is a *harder* compliance environment and an *easier* sales environment. The mandate creates urgency that India does not have; the localisation rule creates an architectural cost that India does not have. On balance the mandate is worth more than the GPU bill. **[Inference]**

## v2.2 Reconciliation

Primary-source audit status: UU 27/2022 text from JDIH confirms controller/processor concepts, high-risk processing contexts for specific personal data and automated decisions, security duties, retention/deletion interactions, breach notification, DPO-style role triggers, and administrative sanction structure. Permenkes 24/2022 Kemenkes PDF supports electronic medical record obligations, domestic-storage cooperation language in Pasal 22, and 25-year retention in Pasal 39. SATUSEHAT official docs expose FHIR and `fhir-r4` endpoints. PP 28/2024 is applicable, but MEDOXZI-specific data-centre/localisation interpretation is counsel-required and must not be stated as confirmed.


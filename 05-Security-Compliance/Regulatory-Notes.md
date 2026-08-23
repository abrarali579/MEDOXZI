> ### ⚠️ v2 — LAUNCH MARKET CHANGED TO INDONESIA
>
> **Primary regulatory analysis has moved to [13-Indonesia/Regulatory-Indonesia.md](../13-Indonesia/Regulatory-Indonesia.md).** Read that first.
>
> The India analysis below is retained — India remains a documented second market and the CDSCO reasoning still informs the architecture — but it is **no longer the governing analysis**.
>
> **Three Indonesian findings that override assumptions made below:**
> 1. **GR 28/2024 requires health data centres to be located within Indonesian territory.** Materially stricter than DPDP. Forces in-country inference.
> 2. **Permenkes 24/2022 makes electronic medical records mandatory for every clinic**, with sanctions escalating to business permit revocation. Compliance becomes a wedge rather than an obstacle.
> 3. **The device-classification argument is weaker in Indonesia** — no enumerated exclusion list equivalent to CDSCO's was found. This is question #1 for counsel.

# Regulatory Notes

> **⚖️ Not legal or regulatory advice.** This is an engineering team's reading of publicly available guidance, prepared to inform product decisions and to scope the questions that must be put to qualified counsel. Every conclusion here is provisional until confirmed in writing.

---

## 1. The finding that shapes the product

CDSCO's **Guidance Document on Medical Device Software under MDR-2017** (Doc No. CDSCO/MD/GD/MDSW/01/2026) **[Confirmed — R-01]** classifies medical device software on two axes:

| Healthcare situation ↓ / Software's contribution → | Treat or diagnose | Drive clinical management | **Inform clinical management** |
|---|---|---|---|
| **Critical** | Class D | Class C | **Class B** |
| **Serious** | Class C | Class B | **Class A** |
| **Non-serious** | Class B | Class A | **Class A** |

And it **excludes** from MDR-2017 licensing **[Confirmed, quoted in R-01]**:
- Hospital/Clinical Information Systems "intended only for patient admission, for scheduling patient appointments/visits, for insurance and billing/invoicing purposes"
- Laboratory Information Systems managing analytical data
- Image Management Systems for storage and archiving only
- Software performing "transfer, storage, archive data, convert, format, communication, simple search, compression"
- General communications systems
- Software solely for teaching/training/education
- General wellness software with no reference to diseases, disorders or pathological conditions

**With this critical qualifier [Confirmed]:** such a system with *"additional functions that allow its use for any medical purposes (e.g. image analysis/modification as an aid in diagnosis, quantification of physiological parameters for clinical decision-making)"* **automatically becomes regulated as a medical device.**

## 2. How our features map (our reading — requires confirmation ⚖️)

| Feature | Our provisional reading | Confidence |
|---|---|---|
| Registration, token, queue | Excluded — administrative/HIS function | High **[Inference]** |
| Document storage and retrieval | Excluded — "transfer, storage, archive" | High **[Inference]** |
| OCR and text extraction | Excluded — "convert, format" | Medium **[Inference]** — arguably format conversion; but *extraction into clinical fields* edges toward medical purpose |
| Reorganising patient-reported information into a summary | Likely excluded — it reorders information the clinician would otherwise read | Medium **[Inference]** |
| Highlighting abnormal lab values against reference ranges | **Uncertain.** Flagging a value as abnormal is arguably "quantification of physiological parameters for clinical decision-making" | **Low ⚖️** |
| **Deterministic red-flag rules** | Likely "inform clinical management"; on critical situations → **Class B** | **Low ⚖️ — this is Open Question C3, and it is the one that could make even the MVP a device** |
| Suggested questions from a clinician-authored bank | Likely "inform"; arguably not even that, since a clinician wrote the questions | Medium **[Inference]** |
| **Ranked differential diagnosis** | At minimum "inform clinical management"; if it can fire on critical presentations → **Class B**. A reasonable regulator might read it as "drive clinical management" → **Class C** | **Low ⚖️ — the decisive question for Phase 2** |
| Draft clinical note for clinician approval | Likely excluded — documentation | Medium **[Inference]** |
| Institutional knowledge retrieval with citations | Likely "inform"; possibly educational | Low ⚖️ |

## 3. What this means in practice

**Three product decisions follow directly from the table above:**

1. **The differential engine ships dark.** It is the feature most likely to make the product a licensable device, and it is the feature with the least validation. Shadow mode separates the technical work from the regulatory decision and lets each proceed at its own pace.

2. **Red-flag wording is chosen with the classification in mind.** A flag that says *"assess this patient promptly"* informs; a flag that says *"this patient has acute coronary syndrome"* diagnoses. Our copy rules in [PRD.md](../02-Product/PRD.md) §7 are therefore a regulatory control as well as a clinical one.

3. **Abnormal-lab flagging is a live question.** We flag values against the reference range printed *on the source document* — i.e. we are reproducing the laboratory's own determination, not making our own. **[Inference]** that this is closer to "format/convert" than to independent quantification. **⚖️ Must be confirmed.**

**And one thing that does not follow:** none of this is an argument for never becoming a regulated device. It is an argument for choosing the moment deliberately, with budget, counsel and a quality system — rather than discovering it in an audit.

## 4. If the product does become a Class A or Class B MDSW

| Requirement | Implication |
|---|---|
| Manufacturer licence (MD-5 / MD-9 pathway per class) | Application, fees, timeline ⚖️ |
| Quality management system (ISO 13485-aligned) | Design controls, document control, CAPA, change control — a substantial organisational change |
| Technical file / design dossier | Intended use, risk management (ISO 14971), clinical evaluation, software lifecycle (IEC 62304), usability (IEC 62366) |
| Clinical evaluation | Our validation plan is designed to be reusable as clinical evidence — see [Validation-Plan.md](../03-Clinical/Validation-Plan.md) |
| Post-market surveillance | Our safety-event process is designed to be reusable as vigilance |
| Labelling and instructions for use | Intended use statement, limitations, contraindications |
| Change management | Model, prompt and content changes become regulated changes requiring impact assessment |

**Practical note:** the last row is the one teams underestimate. Once regulated, *"we improved the prompt"* becomes a change-control event. **This is a strong additional reason to keep the deterministic/model boundary where we have drawn it** — deterministic rules authored by a clinician are far easier to change-control than a model's behaviour. **[Inference]**

## 5. Other Indian regulatory considerations

| Area | Status | Action |
|---|---|---|
| **DPDP Act 2023 + Rules 2025** | Rules notified 14 Nov 2025, 18-month phased compliance **[Confirmed — R-02]** | Full analysis in [Privacy.md](Privacy.md) §6 ⚖️ |
| **Telemedicine Practice Guidelines** | Applicability to remote intake **[Unverified]** | Our reading: intake is data collection, not a teleconsultation, and no diagnosis or prescription occurs. **Confirm** ⚖️ |
| **Medical records retention** | Statutory and NABH requirements **[Unverified]** | Must be established before setting retention policy ⚖️ |
| **NABH accreditation** | May impose documentation and audit requirements at accredited sites | Confirm with the pilot clinic |
| **Clinical Establishments Act** (state-adopted) | May affect record-keeping obligations | Confirm ⚖️ |
| **Professional liability** | Who is responsible if an AI-organised summary contributes to a miss? | **The clinician remains responsible for diagnosis and treatment** — our design reinforces this, but the contractual allocation must be explicit ⚖️ |
| **Advertising and claims** | Claims about clinical benefit may be regulated | No efficacy claims until the pilot supports them, and none at all that imply diagnosis |

## 6. Comparative note — US and EU

*Included to inform architecture, not because these markets are near-term.*

- **US FDA:** the 21st Century Cures Act excludes certain clinical decision support software from the device definition where the software displays the basis of its recommendation and the clinician can independently review it and does not rely primarily on it. **[Unverified — must be checked against current FDA guidance ⚖️]** Our provenance-first design, which shows the basis of everything, is deliberately aligned with the *spirit* of that carve-out — a helpful coincidence, not a compliance claim.
- **EU MDR:** Rule 11 for software is widely read as stricter, with most patient-management software landing at Class IIa or above. **[Unverified ⚖️]** EU entry would require a materially different regulatory programme.

**Architectural conclusion:** the design choices that keep us conservative in India — deterministic safety logic, visible basis for every statement, clinician approval as a structural requirement — are the same choices that travel best to other regimes. **[Inference]**

## 7. Regulatory actions, in order

| # | Action | When | Blocking |
|---|---|---|---|
| 1 | Engage a medical-device regulatory consultant with Indian software experience | **Now** | Everything downstream |
| 2 | Written classification opinion on **MVP scope** (no visible differential) | Before pilot | **Pilot** |
| 3 | Written classification opinion on **MVP + visible differential** | Before Phase 2 build commitment | Phase 2 |
| 4 | Written opinion on the red-flag engine specifically (Open Question C3) | Before pilot | **Pilot** |
| 5 | Confirm Telemedicine Practice Guidelines applicability | Before pilot | Pilot |
| 6 | Establish medical-records retention requirements | Before pilot | Retention config |
| 7 | If Class A/B is indicated: scope a QMS and technical file, and budget it honestly | Phase 2 planning | Phase 2 |
| 8 | Consider a CDSCO pre-submission engagement | Phase 2 | Phase 2 timeline |
| 9 | Establish the liability allocation with the pilot clinic in writing | Before pilot | **Pilot** |

## v2.2 Reconciliation

Indonesia is the primary regulatory frame. Do not reuse Indian CDSCO classification as though it governs Indonesia. Primary-source starting points: UU 27/2022 covers personal data/controller/processor duties and high-risk processing contexts; Permenkes 24/2022 governs electronic medical records including domestic-storage cooperation language and retention; SATUSEHAT docs use FHIR and `fhir-r4`; PP 28/2024 is applicable but MEDOXZI-specific data-centre/localisation interpretation remains counsel-pending.


# CLAIMS REGISTER

**Append-only.** Every factual claim that drives a decision, with its source, confidence, who checked it, and when.

**Why this file exists:** this project has corrected its own regulatory analysis **twice**, both times because a claim was made from a secondary source and treated as settled. A claim not in this register with a `[Confirmed]` label and a primary citation **may not drive an architecture or regulatory decision**.

---

## Indonesia — regulatory

### C-01 · Electronic medical records are mandatory for clinics
- **Claim:** Permenkes 24/2022 requires electronic medical records at all health service facilities including clinics, with a compliance deadline of 31 December 2023.
- **Source:** Permenkes 24/2022, Pasal 3(2), Pasal 45 — primary PDF, JDIH Kemenkes / keslan.kemkes.go.id
- **Label:** **[Confirmed]** · verified session D, 2026-08-23
- **Drives:** the compliance wedge in the pitch; market sizing

### C-02 · Retention minimum is 25 years
- **Claim:** *"Penyimpanan data Rekam Medis Elektronik di Fasilitas Pelayanan Kesehatan dilakukan paling singkat 25 (dua puluh lima) tahun sejak tanggal kunjungan terakhir Pasien."*
- **Source:** Permenkes 24/2022, **Pasal 39(1)** — verbatim, primary PDF
- **Label:** **[Confirmed]** · verified twice (sessions C and D), two independent fetches
- **Drives:** ADR-027 — deletion semantics, storage cost over decades, exit/escrow contract terms

### C-03 · Domestic data storage for cooperating electronic system operators ⚠️ CORRECTED TWICE
- **Current claim:** Permenkes 24/2022 Pasal 22(1) is **permissive, not mandatory**. Verbatim: *"Dalam hal terdapat **keterbatasan sumber daya** pada Fasilitas Pelayanan Kesehatan, penyimpanan Rekam Medis Elektronik ... **dapat dilakukan melalui kerja sama** dengan Penyelenggara Sistem Elektronik **yang memiliki fasilitas penyimpanan data di dalam negeri**."*
- **Correct reading:** where a facility with resource limitations outsources EMR storage, the **recognised cooperation route requires the operator to have domestic data storage**. It does not, on its face, prohibit all other arrangements.
- **Source:** Permenkes 24/2022 Pasal 22(1) — verbatim, fetched from **two independent primary URLs**, session D
- **Label:** **[Confirmed]** as to the text · **[Unverified / counsel-required]** as to whether any non-domestic route exists for us
- **Correction history:**
  - *Session B:* claimed a broad GR 28/2024 health-data-centre localisation requirement from one practitioner source. **Over-generalised** — a second source confirmed GR 28 localisation explicitly only for biobanks/biorepositories.
  - *Session C:* re-grounded on Permenkes Pasal 22(1) but read it as an **obligation** (*"a clinic cannot lawfully cooperate with us otherwise"*). **Still too strong** — the article uses *dapat* (may), conditioned on *keterbatasan sumber daya*.
  - *Session D:* corrected to the reading above, after an external agent flagged it and the verbatim text was checked against two primary sources. **The external agent was right.**
- **Drives:** AI architecture (in-country inference), cost model. **Design intent unchanged** — design for in-Indonesia storage, because it is the only clearly-sanctioned outsourcing route and the 25-year obligation points the same way. **But the certainty and the reason both changed.**
- **Open:** OT-01 — counsel must settle whether any non-domestic route is available.

### C-04 · SATUSEHAT is FHIR R4
- **Claim:** the Kemenkes SATUSEHAT platform exposes FHIR R4 APIs (`/fhir-r4/v1`) and uses FHIR as its interoperability data model; Permenkes 24/2022 Pasal 21 requires facilities to connect to the MoH-managed interoperability platform.
- **Source:** SATUSEHAT platform documentation (Kemenkes); Permenkes 24/2022 Pasal 21 — primary
- **Label:** **[Confirmed]**
- **Drives:** FHIR R4 export shape from day one. **No integration claim may be made** — architecture-ready only.

### C-05 · UU 27/2022 obligations
- **Claim:** grace period ended October 2024; health data is specific personal data; DPIA and DPO triggers; 72-hour (3×24) breach notification; cross-border requires adequacy / contractual safeguards / consent with no adequacy list published; administrative sanctions up to 2% of annual revenue with criminal provisions and corporate multipliers.
- **Source:** UU 27/2022 (JDIH Kemkomdigi) + Chambers Data Protection & Privacy 2026 Indonesia
- **Label:** **[Confirmed]** for the statute's existence and headline provisions · **[Third-Party Claim]** for enforcement practice and the unpublished implementing regulation status
- **Drives:** consent architecture, breach runbook, ADR-021

### C-06 · Medical device classification
- **Claim:** Kemenkes regulates medical device software in four risk classes; IEC 62304 is stated as mandatory; Indonesian-language IFU required; clinical evidence for Class C/D.
- **Source:** practitioner summaries only
- **Label:** **[Third-Party Claim] / [Unverified]** — **no enumerated exclusion list equivalent to India's CDSCO guidance has been found**
- **Drives:** nothing yet — and that is the point. **This is the highest-value unverified claim in the project.**
- **Open:** OT-02

### C-11 · PSE Lingkup Privat registration is required for B2B SaaS
- **Claim:** any electronic system operator providing services to Indonesian users must register with Komdigi and obtain a TDPSE certificate. B2B SaaS is included. Non-registration risks ISP-level access blocking. Registration is separate from the company's OSS/NIB business licence.
- **Source:** practitioner guides (Global Advisory Experts, LMI, Cekindo, Emerhub) — consistent across several
- **Label:** **[Third-Party Claim]** — consistent but **not verified against a Komdigi primary source**
- **Drives:** OT-14. Does not block the build; blocks lawful operation.
- **Action:** confirm with Indonesian corporate counsel and read the Komdigi requirement directly.

### C-12 · Indonesian sovereign AI cloud with H100 capacity exists
- **Claim:** Lintasarta (Indosat) operates *GPU Merdeka*, a GPU-as-a-Service offering with 8× NVIDIA H100 SXM configurations, positioned as sovereign Indonesian AI infrastructure; Indosat announced a ~USD 200m AI data centre in Surakarta with NVIDIA.
- **Source:** DataCenterDynamics, Lintasarta press materials, trade coverage (launch announced Aug 2024)
- **Label:** **[Third-Party Claim]** — existence well-corroborated; **current availability, pricing, allocatable capacity and contract terms are [Unverified]**
- **Drives:** ADR-034 — in-country inference is feasible. **Do not commit an architecture to it before obtaining a direct quote.**

### C-13 · Medical device classification turns on intended use; administrative software is out of scope
- **Claim:** Indonesian medical device software classification is determined by intended use; software with a diagnostic, therapeutic or monitoring purpose is in scope, while administrative / record-keeping / information-organisation software is not.
- **Source:** practitioner summaries only
- **Label:** **[Third-Party Claim]** ⚠️ **NOT verified against a Kemenkes primary document**
- **Drives:** the horizontal positioning argument (ADR-031) — **directionally, not conclusively**
- **⚠️ Standing caution:** this project has over-read secondary regulatory sources **twice** (C-03). This claim is exactly the shape of those errors — plausible, convenient, and unverified. **It may inform strategy; it may not be relied on as settled.** Verify against a Kemenkes primary document and confirm with counsel (OT-02).

---

## Product / market

### C-07 · BPJS P-Care double entry
- **Claim:** FKTP doctors enter consultation notes into BPJS P-Care; >80% of facilities connected as of 2023.
- **Source:** practitioner/industry article
- **Label:** **[Third-Party Claim]** — **must be confirmed by direct observation in RECON**
- **Drives:** the sharpest version of the pitch. **Do not use in a pitch until observed.**

### C-08 · Ambient scribe time savings
- **Claim:** published RCT and time-motion evidence exists for ambient AI scribes.
- **Label:** **[Unverified]** — three papers could not be retrieved (sessions A–C). **No effect size from them is quoted anywhere in this repository, deliberately.**
- **Drives:** nothing. Retrieval instructions in `01-Research/Research-Log.md` R-07..R-09.

---

## Our own performance claims

### C-09 · Prototype test and harness results
- **Claim:** 95 tests pass; harness passes 9/9 gates; 0 contamination over 500 concurrent encounters.
- **Source:** re-run in a clean container, session D — see VERIFICATION-LOG V-2026-08-23-D-01..03
- **Label:** **[Confirmed]** — *for the prototype, on synthetic data*
- **⚠️ Boundary:** this is **architecture evidence, not clinical performance evidence.** It may appear in a pitch dossier only with that framing. See `12-Harness/Safety-Case.md`.

### C-10 · Any clinical performance number
- **Claim:** none exists.
- **Label:** **N/A**
- **Rule:** **no clinical accuracy, time-saving or concordance figure may be stated externally until clinic 1 produces one.** The honest pitch line is *"we think 15%; you will be the first clinic that tells us."*

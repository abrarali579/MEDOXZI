# Deliverable 18 — Research Log

Every source consulted in the 23 August 2026 research pass, in the format required by the brief. Sources that could **not** be retrieved are logged too, with retrieval instructions — an unretrieved source is a finding, not an omission.

**Labelling:** see [Evidence-Standards.md](Evidence-Standards.md).

---

### R-01

```
Date researched:  2026-08-23
Source:           CDSCO — Guidance Document on Medical Device Software under MDR-2017
                  (Doc No. CDSCO/MD/GD/MDSW/01/2026), Ministry of Health and Family Welfare, Government of India
URL:              https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf
Source type:      Official regulatory guidance (tier 1)
Topic:            Medical device software classification in India
Key findings:     • Two-axis risk matrix: healthcare situation (critical/serious/non-serious) ×
                    software's contribution (treat-or-diagnose / drive clinical management /
                    inform clinical management), yielding Class A–D.
                  • "Inform clinical management" → Class B (critical), Class A (serious), Class A (non-serious).
                  • Explicit exclusions from MDR-2017 licensing: HIS/CIS for admission, scheduling,
                    billing, clinical communication; LIS; image management for storage/archive only;
                    software performing transfer/storage/archive/convert/format/communication/simple
                    search/compression; general communications systems; teaching/training software;
                    general wellness software.
                  • CRITICAL CAVEAT: a HIS/CIS/LIS "with additional functions that allow its use for any
                    medical purposes (e.g. image analysis/modification as an aid in diagnosis,
                    quantification of physiological parameters for clinical decision-making)"
                    automatically becomes a regulated medical device.
                  • Document does not use the terms SaMD/SiMD; uses "standalone MDSW" and
                    "software as part of hardware medical device".
                  • Self-described as for public awareness, "not meant to be used for legal or
                    professional purposes".
Claims supported: The regulatory strategy in Executive-Summary §3.2, MVP-Decision Q1/Q2,
                  Regulatory-Notes.md, and the decision to run the differential engine in shadow mode.
Limitations:      Guidance is not law; the guidance itself disclaims legal use; classification of a
                  specific product is a determination that requires qualified regulatory counsel.
Reliability:      HIGH (primary regulator source) — [Confirmed]
Relevant product decision: The differential engine is the feature that converts the product into a
                  regulated device. MVP ships without a visible differential. ⚖️ Written opinion
                  required before Phase 2.
Access date:      2026-08-23
```

### R-02

```
Date researched:  2026-08-23
Source:           Press Information Bureau, Government of India — "Government notifies DPDP Rules, 2025"
URL:              https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014
Source type:      Official government communication (tier 1)
Topic:            Indian data protection — implementation of the DPDP Act, 2023
Key findings:     • DPDP Rules notified 14 November 2025.
                  • 18-month phased compliance timeline.
                  • Consent Managers must be Indian companies.
                  • Data Fiduciaries must issue standalone, clear and simple consent notices explaining
                    the specific purpose.
                  • Breach notification to affected individuals in plain language covering nature,
                    consequences, remediation and a contact point.
                  • Significant Data Fiduciaries: independent audits, impact assessments, and
                    compliance with government-specified restrictions incl. localisation.
                  • Enhanced protections for children (verifiable consent) and persons with
                    disabilities (lawful guardian consent).
                  • Does NOT set sector-specific health obligations; does NOT specify retention periods
                    in the material reviewed.
Claims supported: Privacy.md, Regulatory-Notes.md, consent architecture, breach runbook,
                  the guardian-consent path for paediatric and disability cases.
Limitations:      Press release, not the Rules themselves. The Rules text must be read before any
                  compliance assertion. Health-sector specifics are NOT addressed here.
Reliability:      HIGH for the fact of notification and headline provisions — [Confirmed]
                  Rule-level detail — [Unverified]
Relevant product decision: Consent is layered and revocable; guardian consent path required for
                  minors; breach runbook required before pilot. ⚖️ Full Rules text must be read by counsel.
Access date:      2026-08-23
```

### R-03

```
Date researched:  2026-08-23
Source:           Nabla — Security page
URL:              https://www.nabla.com/security/
Source type:      Official vendor documentation (tier 4)
Topic:            Competitor security and privacy posture
Key findings:     SOC 2 Type II and ISO 27001; AES-256 at rest; TLS in transit; hosted on Google Cloud
                  Platform with database region chosen at organisation creation; annual third-party
                  penetration testing; quarterly access reviews; GCP intrusion detection; encrypted
                  multi-region backups; redundant servers; vulnerability disclosure policy;
                  trust portal at trust.nabla.com.
                  NOT documented on this page: audio retention policy, model training on customer data,
                  data retention periods, BAA specifics.
Claims supported: Competitor-Research §2; the recommendation to publish our own security page and to
                  offer explicit data-region selection.
Limitations:      Vendor's own page. Certifications not independently verified. Key privacy questions
                  unanswered.
Reliability:      MEDIUM-HIGH for the stated controls — [Confirmed] as to what the page states
Relevant product decision: Publish a comparable security page before the first customer conversation;
                  make data region an explicit, visible configuration.
Access date:      2026-08-23
```

### R-04

```
Date researched:  2026-08-23
Source:           Suki — product site
URL:              https://www.suki.ai/
Source type:      Official vendor site (tier 4, marketing-weighted)
Topic:            Competitor capability and go-to-market
Key findings:     "Ambient Clinical Intelligence" covering charting, dictation, patient instructions,
                  orders; two product lines — Suki for Clinicians and Suki for Partners (developer
                  toolkit for healthtech integration); named integrations Epic, Oracle Health,
                  athenahealth, MEDITECH; capabilities listed include coding, clinical reasoning, Q&A;
                  no published pricing (directs to sales).
Claims supported: Competitor-Research §3; the partner/embed distribution recommendation.
Limitations:      Marketing page. "Clinical reasoning" and "Q&A" scope, safety framing and evidence
                  are undefined. Depth of integrations is a vendor claim.
Reliability:      MEDIUM — [Confirmed] as to what is named; [Vendor Claim] as to capability
Relevant product decision: Consider an embeddable pre-round module for Indian HIS vendors rather than
                  competing for the clinician's screen.
Access date:      2026-08-23
```

### R-05

```
Date researched:  2026-08-23
Source:           Microsoft Learn — "What is Microsoft Dragon Copilot (physicians)?"
URL:              https://learn.microsoft.com/en-us/industry/healthcare/dragon-copilot/about/
Source type:      Official vendor technical documentation (tier 4, high quality)
Topic:            Competitor capability and framing
Key findings:     Ambient conversation capture; draft document generation FOR CLINICIAN REVIEW;
                  generation of recommendations for orders, conditions, flowsheet documentation,
                  narrative notes, incident notes; "information guidance" summarising internal and
                  external sources. Two deployment models: standalone apps (manual transfer to EHR) and
                  embedded via the Dragon Copilot Developer Kit. Explicit instruction: "Make sure users
                  obtain patient consent before recording the patient encounter."
                  NOT addressed: EHR compatibility list, data handling, responsible AI, device
                  classification, CDS designation.
Claims supported: Competitor-Research §4; our "draft for clinician review" language; in-product consent.
Limitations:      Overview page only. Device/regulatory posture not stated anywhere reviewed.
Reliability:      HIGH for stated capabilities — [Confirmed]
Relevant product decision: Adopt the draft-for-review framing and in-product consent prompts. Use their
                  careful avoidance of diagnostic language as a calibration reference for our own copy.
Access date:      2026-08-23
```

### R-06

```
Date researched:  2026-08-23
Source:           PMC (NIH) — article on OpenEvidence, PMC12951846
URL:              https://pmc.ncbi.nlm.nih.gov/articles/PMC12951846/
Source type:      Peer-reviewed literature (tier 2)
Topic:            Evidence-grounded clinical question answering
Key findings:     OpenEvidence described as an RAG-based LLM referencing established medical sources,
                  accessed via browser/mobile, returning evidence-based answers with citations;
                  partnerships described with NEJM, JAMA and Lancet; collaboration with Mayo Clinic
                  Platform. Stated limitations: accuracy depends on input clarity; site lag; generated
                  information is not itself peer-reviewed; proper use requires human intervention and
                  medical expertise. Explicitly "does not offer medical advice, diagnosis, or treatment."
Claims supported: Competitor-Research §5; Literature-Research.md's RAG-with-licensed-corpus design;
                  our citation-first / provenance-first principle; our non-diagnosis disclaimer.
Limitations:      A review article about a commercial product, not an independent accuracy evaluation.
                  Commercial terms of the journal partnerships not disclosed.
Reliability:      HIGH for the description — [Confirmed]
Relevant product decision: Licensed corpora only; citation-first output; explicit disclaimer.
Access date:      2026-08-23
```

### R-07 — ⚠️ NOT RETRIEVED

```
Date researched:  2026-08-23
Source:           "A Randomized-Clinical Trial of Two Ambient Artificial Intelligence Scribes:
                  Measuring Documentation Efficiency and Physician Burnout" (PMC12265753)
URL:              https://pmc.ncbi.nlm.nih.gov/articles/PMC12265753/
Source type:      Peer-reviewed RCT (tier 2)
Topic:            Quantified effect of ambient AI scribes on documentation time and burnout
Key findings:     NONE — page returned a reCAPTCHA challenge; full text not read.
Claims supported: NONE. No effect size from this study is cited anywhere in this repository.
Limitations:      Not retrieved.
Reliability:      N/A — [Unverified]
Relevant product decision: Would provide the benchmark for our own time-saving claims and a template
                  for our pilot's measurement design.
RETRIEVAL ACTION: Obtain via institutional library access or the publisher. Assigned priority 🟠
                  (blocks external benchmarking claims, not the build).
Access date:      2026-08-23 (attempted)
```

### R-08 — ⚠️ NOT RETRIEVED

```
Date researched:  2026-08-23
Source:           JMIR Medical Informatics — "Impact of an Ambient AI Scribe Among Clinicians and
                  Patients: Real-World Prospective Observational Time-Motion Study" (2026;1:e85580)
URL:              https://medinform.jmir.org/2026/1/e85580
Source type:      Peer-reviewed prospective time-motion study (tier 2)
Topic:            Real-world time effects of ambient AI documentation
Key findings:     NONE — content not returned by the fetch.
Claims supported: NONE.
Reliability:      N/A — [Unverified]
RETRIEVAL ACTION: JMIR is open access; retry directly. This study's METHODOLOGY is likely more valuable
                  to us than its results — a time-motion design is exactly what our pilot needs. 🟠
Access date:      2026-08-23 (attempted)
```

### R-09 — ⚠️ NOT RETRIEVED

```
Date researched:  2026-08-23
Source:           Cureus — "The Effect of a Pre-consultation Tablet-Based Questionnaire on Changes in
                  Consultation Time for First-Visit Patients With Diabetes: A Single-Case Design
                  Preliminary Study"
URL:              https://www.cureus.com/articles/101473-...
Source type:      Peer-reviewed preliminary study (tier 2, weak design)
Topic:            THE closest published analogue to our core hypothesis
Key findings:     NONE — 403 on fetch.
Claims supported: NONE.
Reliability:      N/A — [Unverified]. Note: single-case design, small, diabetes-specific — even when
                  retrieved this is weak evidence and must not be over-claimed.
RETRIEVAL ACTION: Cureus is open access; retry. Also run a proper literature search on
                  "pre-visit questionnaire" + "consultation duration". 🔴 — this is the evidence base
                  for our central hypothesis and its thinness is itself an important finding.
Access date:      2026-08-23 (attempted)
```

### R-10 to R-17 — Open-source repositories

All read directly from their GitHub pages on 2026-08-23. Findings recorded in
[Github-Research.md](Github-Research.md); not duplicated here.

| Ref | Repository | Licence | Stars | Latest activity observed | Reliability |
|---|---|---|---|---|---|
| R-10 | docling-project/docling | MIT | 65.4k | active; LF AI & Data hosted | [Confirmed] |
| R-11 | PaddlePaddle/PaddleOCR | Apache-2.0 | ~80k | v3.6.0, 28 May 2026 | [Confirmed] |
| R-12 | pgvector/pgvector | (verify SPDX) | 22.4k | v0.8.5, PG 13–18 | [Confirmed] except licence id |
| R-13 | medspacy/medspacy | MIT | 660 | v1.3.1, 21 Nov 2024 | [Confirmed] |
| R-14 | microsoft/presidio | MIT | 10.6k | active | [Confirmed] |
| R-15 | synthetichealth/synthea | Apache-2.0 | 3.2k | 28 May 2026 | [Confirmed] |
| R-16 | hapifhir/hapi-fhir | Apache-2.0 | 2.3k | v8.10.0, 21 May 2026 | [Confirmed] |
| R-17 | medplum/medplum | Apache-2.0 | 2.4k | v5.1.21, 21 Jun 2026 | [Confirmed] |

### R-18 — Environment note

```
Date researched:  2026-08-23
Source:           GitHub REST API
Finding:          Not reachable from the research environment (403). All repository statistics above
                  were read from rendered repository pages instead.
Implication:      Star counts are accurate to ~1 significant figure. Licence SPDX identifiers read from
                  page text rather than the API; pgvector's identifier could not be read and remains
                  [Unverified].
```

---

## Sources to add in the next research pass

| Priority | Topic | Why |
|---|---|---|
| 🔴 | Pre-visit questionnaire → consultation duration literature | The evidence base for our central hypothesis |
| 🔴 | ED clinical decision support and alert fatigue literature | Directly informs the red-flag engine design and its acceptance thresholds |
| 🔴 | Handwritten prescription OCR — published accuracy on Indic/Indian-English corpora | Largest technical unknown |
| 🟠 | DPDP Rules 2025 full text + any health-sector guidance | Compliance assertions ⚖️ |
| 🟠 | Indian medical records retention requirements (statutory and NABH) | Retention policy |
| 🟠 | ABDM / ABHA integration specifications and HIP onboarding requirements | Phase 2 interoperability |
| 🟠 | Telemedicine Practice Guidelines (India) applicability to remote intake | Regulatory posture ⚖️ |
| 🟠 | SNOMED CT India and ICD-11 licensing terms | Terminology service |
| 🟡 | Indian-language clinical ASR accuracy | Phase 3 voice |
| 🟡 | Automation bias in clinical decision support — measurement methods | Pilot instrumentation |

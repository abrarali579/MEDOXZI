# Indonesia Regulatory Boundary Register

**Version:** v2.2  
**Status:** working register for counsel review, not legal advice

| Feature | V1 | Potential classification impact | Evidence | Legal status |
|---|---:|---|---|---|
| Raw structured intake | Yes | Lower risk when it captures patient/staff input without interpretation | Product design inference | Counsel review required |
| Source-bound pre-round summary | Yes | Review required because AI summarizes health information for clinicians | UU 27/2022 treats health/specific personal data processing as high-risk context for DPIA-style controls; see JDIH source | Counsel review required |
| Red-flag rule engine | Built, inactive production pack until sign-off | Could be clinical decision support depending on wording and reliance | Founder direction plus safety architecture | Lead Doctor and counsel review required |
| Visible differential diagnosis | No | Potentially higher CDSS/medical-device boundary | Product boundary decision | Excluded from V1 |
| Shadow differential | Internal only | Research/evaluation boundary; risk if leaked into care | Architecture decision | Must remain inaccessible to care roles |
| Drug checking or treatment recommendation | No | Higher clinical/regulatory risk | Product boundary decision | Excluded from V1 |
| Patient-facing interpretation | No | Higher risk if advice/reassurance is displayed | Product boundary decision | Excluded from V1 |
| SATUSEHAT/FHIR mapping | Future adapter | Integration obligations and data exchange controls | SATUSEHAT docs expose `fhir-r4` API endpoints and FHIR documentation | Architecture-ready, no integration claim |
| Domestic storage/localisation | Pending | Health data hosting and processor obligations | Permenkes 24/2022 Pasal 22 supports domestic data-storage requirement for cooperating PSE storage; PP 28/2024 broader interpretation remains counsel-pending | Do not overclaim |

## Primary Sources Checked

- UU 27/2022, JDIH Kemkomdigi: defines personal data, controller/processor roles, high-risk processing contexts including specific personal data and automated decision-making, security duties, withdrawal/deletion/retention interactions, breach notice, DPO-style role triggers, and administrative sanctions.
- Permenkes 24/2022, Kemenkes PDF: Pasal 22 allows cooperation with PSE having domestic data storage where facilities have resource constraints; Pasal 39 establishes electronic medical record retention of at least 25 years from the last patient visit.
- SATUSEHAT Platform docs, Kemenkes: official API resources include `/fhir-r4/v1`; SATUSEHAT FHIR docs describe FHIR as the API/data-model standard for interoperability.
- PP 28/2024, Kemenkes page: regulation is applicable as implementing regulation for UU 17/2023, but MEDOXZI-specific data-centre/localisation interpretation remains counsel-required.

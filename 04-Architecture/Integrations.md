> ### ⚠️ v2 AMENDMENT — FHIR is no longer deferrable in the same way
>
> Indonesia's **SATUSEHAT** national platform is **HL7 FHIR R4** and integration is **mandated** for health facilities under Permenkes 24/2022, with sanctions escalating to business permit revocation. **[Confirmed]**
>
> **What changes:** the data model must **export cleanly to FHIR R4 from day one**, and the export mapping is written and tested as a specification during the MVP rather than deferred wholesale.
>
> **What does not change:** we still do not build certified SATUSEHAT integration in the MVP, and **ADR-006 stands** — our internal model remains provenance-first, with FHIR as an export projection.
>
> **What gets stricter:** the two mapping safety rules matter more when the export target is a national platform. `NOT_ASKED` must never export as a negative, and unconfirmed extractions must not reach a national record. ⚠️🩺
>
> **Pitch discipline:** say *"structured and FHIR R4-shaped today; certified integration is next, with you."* Overclaiming a government integration is a uniquely bad idea.

# Interoperability and Integrations

**Deliverable 13 (interoperability portion).** What to implement in the MVP versus later, and why.

---

## 1. Verdict table

| Standard / integration | MVP | Phase 2 | Phase 3 | Reasoning |
|---|---|---|---|---|
| **HL7 FHIR (R4)** — export only | ❌ | ✅ | — | Real integration demand must exist first. Design the internal model so FHIR is a *projection*, not a migration. |
| **FHIR as the internal data model** | ❌ | ❌ | ❌ | **Deliberate rejection.** FHIR has no first-class representation for our provenance/confidence/verification-status model, and `Provenance` resources are an awkward fit for per-field attribution. We would fight the standard on the thing that matters most. Export to FHIR; do not store as FHIR. |
| **SMART on FHIR** (launch inside an EHR) | ❌ | ⚠️ if demanded | ✅ | Only relevant where the clinic runs a SMART-capable EHR. Rare in the target market today. **[Inference]** |
| **ICD-10 / ICD-11** | ⚠️ optional free-text + code field | ✅ mapping | ✅ assisted coding | Doctors will type a diagnosis; capture the code field from day one so data is not lost, but do not build coding assistance |
| **SNOMED CT** | ❌ | ✅ | ✅ | Licensing ⚖️ and mapping effort exceed MVP value. Internal codes + a mapping table now. |
| **LOINC** | ⚠️ internal analyte codes | ✅ map to LOINC | ✅ | Lab analyte normalisation is needed in MVP; *LOINC-coded* is not |
| **RxNorm / Indian equivalent** | ⚠️ curated brand→generic list (~500 drugs) | ✅ | ✅ | No universally available Indian equivalent identified **[Unverified]** — Open Question E6 |
| **ABDM / ABHA** (India) | ❌ capture ABHA as an identifier only | ⚠️ evaluate | ✅ HIP registration | High strategic value for distribution and identity, but a substantial compliance and technical onboarding effort. Capture the identifier now so linkage is possible later. |
| **HIS / EMR read integration** (patient + token) | ❌ | ✅ | ✅ | Would remove double registration — the clearest early integration win once a vendor cooperates |
| **HIS / EMR write-back** | ❌ | ⚠️ | ✅ | Writing into someone's clinical record raises the bar on every safety and liability question ⚖️ |
| **DICOM / PACS** | ❌ | ❌ | ⚠️ | We read radiology *reports*, not images. Image interpretation is a different, regulated product. |
| **Lab system feeds (HL7 v2)** | ❌ | ⚠️ | ✅ | Would remove much OCR work where a feed exists — high value, clinic-specific |

## 2. The internal-model decision (ADR-006)

**Decision:** the internal data model is our own, provenance-first schema. FHIR is an **export projection**.

**Why:** our core differentiator is per-field provenance, confidence and verification status. FHIR's `Provenance` and `Meta.security` can carry some of this, but mapping "this medication came from OCR of page 1 with confidence 0.61 and has not been confirmed by a human" into FHIR faithfully requires extensions that no consumer would understand. Storing FHIR internally would force us to either lose that information or bury it in extensions we then have to query. **Export loses fidelity; storage would lose correctness.** We choose to lose fidelity at the boundary, which is the correct place to lose it.

**Mitigation:** the export mapping is written and tested from the start (as a spec, not as code), so nothing in the schema drifts into being un-exportable.

## 3. FHIR export mapping (Phase 2 specification)

| Our entity | FHIR resource | Provenance handling |
|---|---|---|
| `patient` | `Patient` | — |
| `encounter` | `Encounter` | — |
| `condition` | `Condition` | `Provenance` resource + `verificationStatus` |
| `observation` | `Observation` | `Provenance` + `status` (`preliminary` for unconfirmed) |
| `medication_statement` | `MedicationStatement` | `Provenance`; **unconfirmed items exported with `status = entered-in-error`? No — exported as `unknown` with a `Provenance` note**, and ideally **not exported at all** until confirmed ⚠️ |
| `allergy` | `AllergyIntolerance` | `verificationStatus`; `NOT_ASKED` maps to **omission plus a `DataAbsentReason`**, never to "no known allergies" |
| `document` | `DocumentReference` | Binary reference |
| `doctor_assessment` | `Composition` / `ClinicalImpression` | Only when `SIGNED` |
| `question_response` | `QuestionnaireResponse` | Preserves `NOT_ASKED` via `DataAbsentReason` |

**Two mapping rules that are patient-safety rules, not modelling preferences:**
1. **`NOT_ASKED` must never export as a negative.** "Allergies: not asked" becoming "No known allergies" in a receiving system is a mechanism for killing someone. Use `DataAbsentReason = not-asked`.
2. **Unconfirmed extracted medications should not be exported at all by default.** An unverified OCR reading entering another system's medication list, stripped of our confidence metadata, is the most dangerous thing this integration could do. Export confirmed items only, unless the receiving system can represent the uncertainty. ⚠️🩺

## 4. Terminology service (MVP scope)

The MVP ships a small deterministic terminology service, not an ontology.

| Function | MVP implementation |
|---|---|
| Brand → generic | Curated table, ~500 most-prescribed OPD drugs, clinician-reviewed 🩺 |
| Drug string normalisation | Case/whitespace/strength parsing; fuzzy match with a confidence score and a threshold below which it stays raw |
| Lab analyte normalisation | Curated table of ~150 common analytes with unit variants |
| Unit conversion | Deterministic table (mg/dL ↔ mmol/L etc.) with explicit per-analyte factors |
| Condition normalisation | Curated list of ~200 common comorbidities |
| Code mapping | `internal_code` table with nullable `icd10`, `snomed`, `loinc` columns — **populated later without a migration** |

**Why curated tables rather than an ontology:** they are auditable, they are clinician-editable, they fail visibly, and 500 drugs covers the large majority of OPD prescribing volume. **[Inference — validate the coverage figure in discovery]**

## 5. Integration principles

1. **Read before write.** Every integration starts read-only. Writing into a clinical system is a different liability conversation. ⚖️
2. **Never let an integration weaken provenance.** If a target system cannot represent uncertainty, we send only confirmed data.
3. **Integrations are per-tenant configuration**, not code branches.
4. **Every integration is a trust boundary** with its own authentication, allowlist, audit and rate limit. 🔐
5. **No integration is on the doctor's critical path.** If an EHR is slow or down, the pre-round view still renders.
6. **Capture identifiers early even when unused.** ABHA, MRN and external ids cost nothing to store and are expensive to backfill.

## v2.2 Reconciliation

Use a canonical MEDOXZI model with adapters to FHIR/SATUSEHAT. SATUSEHAT official docs expose `fhir-r4` API resources, so FHIR R4 mapping is a reasonable architecture target. Do not claim completed integration, compliance, or clinic eligibility until credentialing and legal review are complete.


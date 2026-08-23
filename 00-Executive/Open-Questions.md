# Deliverable 19 — Open Questions

Decisions that cannot be made from a desk. Each item names **who must decide**, **why it is blocking**, **what it blocks**, and a **default assumption** we have designed against so that work is not stalled waiting for an answer.

Legend: 🔴 blocks MVP build · 🟠 blocks pilot · 🟡 blocks Phase 2 · ⚖️ legal/regulatory · 🩺 clinical · 🔐 security/privacy

---

## A. Product owner / founder decisions

| # | Question | Priority | Blocks | Default assumption we have designed against |
|---|---|---|---|---|
| A1 | **Which single clinic is the pilot site, and is there a signed data agreement?** | 🔴 | Everything | Multi-specialty private OPD, 3–6 doctors, 40–80 patients/doctor/session, urban India |
| A2 | **What is the business model** — per-doctor SaaS, per-encounter, per-clinic licence, or bundled with an HIS partner? | 🟠 | Cost model targets, tenancy design | Per-doctor monthly SaaS to the clinic |
| A3 | **Is the buyer the clinic owner, the hospital IT department, or the doctor?** | 🟠 | UX priorities, integration requirements, security posture | Clinic owner buys, doctor decides adoption |
| A4 | **Do we integrate with the pilot clinic's existing HIS in v1, or run standalone?** | 🔴 | Registration flow, patient identity, token source | Standalone with CSV/manual patient reconciliation; HIS integration in Phase 2 |
| A5 | **Is offline/poor-connectivity operation a real requirement at the pilot site?** | 🔴 | Client architecture (PWA vs offline-first sync) | Intermittent connectivity; PWA with local draft persistence and resumable upload, but no full offline mode |
| A6 | **Which languages at pilot?** | 🔴 | Content bank cost, OCR configuration, translation review budget | English + Hindi + one regional language |
| A7 | **Who owns the clinical content bank commercially** — us, the clinic, or shared? | 🟠 | IP strategy, multi-clinic rollout | We own the framework; clinic-specific customisations are theirs |
| A8 | **What is the acceptable pilot spend and runway before the time-saving result?** | 🟠 | Team size, build-vs-buy aggressiveness | 6 FTE, ~6 months to pilot readout |

## B. Clinical decisions 🩺

| # | Question | Priority | Blocks | Default |
|---|---|---|---|---|
| B1 | **Who is the named clinical safety owner**, and are they contracted with defined time? | 🔴 | Red-flag rules, question bank, all sign-off, governance credibility | A practising OPD physician, ~1 day/week, paid |
| B2 | **Which 10 chief complaints cover ~70% of pilot volume?** | 🔴 | Question bank scope — the entire v1 clinical content | Fever, cough/URI, chest pain, abdominal pain, headache, back/joint pain, diabetes follow-up, hypertension follow-up, dizziness, dermatological |
| B3 | **What is the agreed red-flag rule set, and what sensitivity/specificity trade-off is acceptable?** | 🔴 | Safety engine, acceptance criteria | High sensitivity, tolerate ~20–30% false-positive rate on flags; every flag is a *prompt*, never an alert fatigue generator |
| B4 | **Are paediatric, pregnant and elderly patients in or out of the pilot?** | 🔴 | Cohort gating, rule variants, validation set design | **Out of scope for v1.** System detects and declines to generate for these cohorts, showing raw intake only |
| B5 | **What defines a "significant negative" per complaint?** | 🟠 | Summary content | Clinician-authored per complaint in the content pack |
| B6 | **What is the escalation pathway when a red flag fires while the patient is still in the waiting room?** | 🔴 | Whether the system alerts staff, and how | Notify the triage nurse/front desk via a queue re-order and an on-screen banner; **no patient-facing message** |
| B7 | **Is queue re-ordering by clinical urgency permitted at the pilot site?** | 🟠 | Queue service behaviour | Suggest re-order to staff; never auto-reorder |
| B8 | **What quality bar must the draft note meet before a doctor will use it?** | 🟠 | Summary design, acceptance criteria | Doctor edits ≤2 fields in ≥70% of encounters |
| B9 | **How is intake information handled when it contradicts the doctor's own findings?** | 🟠 | Contradiction UX, data model | Both retained; clinician assertion supersedes; contradiction surfaced, never silently overwritten |

## C. Regulatory decisions ⚖️

| # | Question | Priority | Blocks | Default |
|---|---|---|---|---|
| C1 | **Does the MVP scope (no visible differential) fall outside MDR-2017 licensing** as an information/HIS-class system? | 🔴 | Whether MVP can ship at all without a licence | **Assumed yes**, based on the CDSCO MDSW guidance exclusions for HIS/CIS and data-handling software — *this assumption must be confirmed in writing* |
| C2 | **Does the MVP + visible differential become Class A or Class B MDSW**, given it can fire on critical presentations? | 🟠 | Whether Phase 2 requires a licence, QMS (ISO 13485) and a technical file | Assumed **Class B** if it can fire on critical situations; **Class A** if restricted to non-critical/serious "inform" only |
| C3 | **Does the deterministic red-flag engine itself constitute "driving clinical management"?** | 🔴 | Whether even the MVP is a device | Assumed "inform" because it prompts a human assessment and issues no recommendation — **confirm** |
| C4 | **Is a notified-body / CDSCO pre-submission meeting advisable before Phase 2?** | 🟡 | Phase 2 timeline and budget | Yes; budget 3–6 months lead time |
| C5 | **Are there state-level or NABH accreditation requirements** affecting a clinical documentation tool at the pilot site? | 🟠 | Documentation, retention, and audit requirements | NABH-aligned documentation practices assumed |
| C6 | **Telemedicine Practice Guidelines applicability** if any part of intake occurs off-premises | 🟡 | Whether remote intake changes the regulatory posture | Assumed not applicable: intake is data collection, not a teleconsultation |

## D. Privacy, security and data-governance decisions 🔐

| # | Question | Priority | Blocks | Default |
|---|---|---|---|---|
| D1 | **Are we a Data Fiduciary or a Data Processor** under DPDP, relative to the clinic? | 🔴 | Consent architecture, breach duties, contract terms | **Processor** for clinic-directed processing, **Fiduciary** for our own product analytics — dual posture, distinct legal bases |
| D2 | **Where must data reside, and is any cross-border LLM inference permissible?** | 🔴 | LLM vendor selection, entire AI architecture, cost | All PHI at rest **in India**; LLM inference via an in-region endpoint under a DPA with no-training and zero-retention terms; **no direct identifiers ever leave the trust boundary** |
| D3 | **What is the consent model** — clinic-level treatment consent, per-patient app consent, or ABDM consent manager? | 🔴 | Onboarding flow, legal basis for processing | Layered: clinic treatment consent + explicit in-app consent for AI processing + separate, revocable opt-in for de-identified product improvement |
| D4 | **Can de-identified data be used for product improvement, and under what consent?** | 🟠 | The entire learning loop | Only with separate, granular, revocable opt-in; de-identification via Presidio + expert review; never by default |
| D5 | **What are retention periods** for documents, intake data, AI outputs and audit logs? | 🟠 | Storage cost, deletion tooling | Clinical record per clinic policy/statutory minimum; raw uploads 90 days then archive; AI intermediate artefacts 30 days; audit 7 years — **confirm against Indian medical records retention requirements** |
| D6 | **Does DPDP Rules 2025 Significant Data Fiduciary designation apply** at any realistic scale? | 🟡 | Whether audits, DPIAs and localisation duties are triggered | Assumed not at pilot scale; re-assess at multi-clinic |
| D7 | **What is the breach notification runbook**, and who signs it? | 🟠 | Incident response readiness | Documented runbook; clinic notified within 24h, patients and the Board per DPDP Rules timelines |
| D8 | **Do we require a BAA-equivalent** if any US customer or US-hosted subprocessor appears? | 🟡 | Vendor contracts | Assume yes for any US expansion; keep the architecture HIPAA-mappable |

## E. Technical decisions

| # | Question | Priority | Blocks | Default |
|---|---|---|---|---|
| E1 | **Which LLM provider meets the residency + no-training + latency + cost constraints simultaneously?** | 🔴 | AI layer, cost model | Provider-abstracted; select after a bake-off with a synthetic corpus; assume a commercial in-region API |
| E2 | **Is an open-weights model self-hosted in-region required** for the data-residency posture? | 🟠 | Infrastructure cost (GPU), MLOps burden, quality | No for MVP; keep the abstraction so it is a config change |
| E3 | **What is the real document mix** (handwritten vs printed vs photographed) at the pilot site? | 🔴 | OCR strategy, accuracy expectations, per-page cost | ~40% handwritten prescriptions, ~40% printed labs, ~20% multi-page discharge summaries — **must be measured in discovery** |
| E4 | **Do patients own smartphones and will they use them in the waiting room?** | 🔴 | Ratio of self-service to staff-assisted, hardware budget | 50/50 at pilot; design so 100% staff-assisted still works |
| E5 | **Which terminology sets are licensable and affordable** (SNOMED CT India, ICD-10/11, RxNorm-equivalent for Indian brands)? | 🟠 | Terminology service design | Internal codes with a mapping table in v1; external terminologies in Phase 2 |
| E6 | **Is there an Indian drug/brand reference database** we can license for medication normalisation? | 🟠 | Medication extraction quality | Curated internal brand→generic list for the top ~500 OPD drugs in v1 |
| E7 | **What latency does the doctor's dashboard actually need**, measured on clinic hardware and network? | 🟠 | Caching strategy, materialised views | <1.5s to first meaningful paint on clinic hardware; all AI pre-computed |

## F. Questions we are deliberately deferring

| Question | Why deferred |
|---|---|
| Ambient voice capture | Solves a different problem; revisit only after pre-round is proven |
| Longitudinal cross-visit patient record | Requires identity resolution and a much longer retention conversation |
| ABDM/ABHA integration | High value for distribution, but only once there is a product worth linking |
| Specialty-specific packs (cardiology, obstetrics) | Requires per-specialty clinical authorship; not until the framework is proven on general OPD |
| Model fine-tuning | Requires a governed dataset that does not yet exist |
| International expansion | Different regulator, different terminology, different everything |

---

## The four questions that must be answered before any production code

1. **A1** — is there a pilot clinic with a signed agreement?
2. **B1** — is there a contracted, named clinical safety owner?
3. **C1/C3** — does the MVP scope sit outside device licensing, in writing? ⚖️
4. **D2** — where can data live and where can inference happen? 🔐

If any of these four is unanswered, the correct action is discovery, not development.

## v2.2 Reconciliation

Rebuild this list as a gated decision register rather than a single backlog.

### Before MVP freeze

- Finalise generation-mode names in every API and UI copy. Owner: product/engineering.
- Define deterministic question utility weights for demo packs. Owner: product/clinical.

### Before pitch

- Confirm which published content sources are reusable, paraphrasable, or only referenceable. Owner: founder/legal.
- Decide hosted, self-hosted, or hybrid model evaluation candidates without locking production hosting. Owner: engineering.

### Before real-patient shadow

- Obtain Lead Pilot Doctor review of question packs, red-flag rules, prohibited language, Bahasa wording, ordering logic, and cohort gates. Owner: clinic lead.
- Complete Indonesian counsel review of PDP, processor/controller roles, medical record obligations, cross-border processing, retention, SATUSEHAT, and CDSS boundary. Owner: founder/legal.

### Before supervised live pilot

- Pass Week 1 operational shadow gates, including no shadow leakage, no cross-session contamination, and incident-response readiness. Owner: operations/security.

### Before V1 freeze

- Decide whether any shadow-derived evidence is strong enough to propose clinically material changes. Owner: clinical governance.


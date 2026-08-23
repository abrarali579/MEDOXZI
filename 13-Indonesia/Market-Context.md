# Indonesia — Market Context

**Research date:** 23 August 2026. Everything here is preliminary and must be replaced by direct observation during RECON. **Sitting in four waiting rooms will teach you more than this document.**

---

## 1. Where the product fits

| Facility type | Description | Fit |
|---|---|---|
| **Klinik Pratama** | Primary-level clinic, common FKTP under BPJS | ⭐ **Primary target.** High volume, doctor-led, small enough to decide quickly, feeling the EMR mandate |
| **Klinik Utama** | Specialist-level clinic | Good secondary target |
| **Puskesmas** | Government community health centre | Very high volume and real need, but government procurement — slow, and not a first customer |
| **Private hospital OPD** | Outpatient departments | High volume; long sales cycles; existing HIS entrenched |
| **Solo practice (praktik mandiri)** | Individual doctor | Fast decision, low volume, low willingness to pay |

**Recommendation: a private *Klinik Pratama* in a dense urban area (Jakarta, Surabaya, Bandung, Medan), 3–6 doctors, mixed BPJS and cash patients.** Fast decision-making, genuine volume pressure, and representative of the market you would scale into. **[Inference]**

**What to avoid as clinic #1:** a premium expat-facing clinic. Literate, English-speaking, smartphone-owning patients with clean printed records will make every metric look wonderful and teach you nothing about the market. **[Inference]**

## 2. The doctor's day — what to verify in RECON

Working hypotheses, all requiring confirmation:

| Hypothesis | How to check |
|---|---|
| High patient volume per session creates real time pressure | Count and time consultations from the waiting room |
| Doctors enter clinical data into **P-Care**, and possibly a separate clinic EMR | Watch over a shoulder; ask "how many times do you type the same visit?" |
| Prior records arrive as loose paper, phone photos, and pharmacy labels | Ask to see what patients actually bring |
| Handwritten prescriptions are common | Collect samples |
| Patients wait substantially longer than they consult | Time it |
| Most patients have a smartphone; a meaningful minority cannot use one for a form | Observe; count |
| WhatsApp is the default communication channel | Ask staff |

**The single highest-value RECON question:** *"How many times do you enter the same patient encounter into a computer?"* If the answer is two or more, the product's value proposition changes and strengthens.

## 3. Language

| Consideration | Implication |
|---|---|
| **Bahasa Indonesia** is the national language and the working language of healthcare | Primary locale — must be excellent, not adequate |
| **Regional languages** (Javanese, Sundanese and others) are common at home, especially for older patients | Staff-assisted intake is the bridge; do not attempt to localise into them in v1 |
| Medical terminology mixes **Indonesian, Dutch-derived and Latin** forms | Clinical vocabulary needs a doctor's eye, not a translator's |
| Patient vocabulary diverges sharply from clinical vocabulary | e.g. ***masuk angin*** — a culturally specific cluster of complaints with no clean English equivalent, extremely common in real presentations |
| English is understood by many clinicians but not by most patients | **English default for the clinical UI, Bahasa Indonesia for everything patient-facing** |

***Masuk angin* deserves specific design attention.** It is not a translation problem to be solved; it is a real, frequently-presented complaint category that a foreign-designed intake form will simply fail to capture. Handle it as a first-class chief complaint with its own question set, authored by the lead doctor. Getting this one right signals local competence more than any feature. 🩺

## 4. Practical operating notes

| Area | Note |
|---|---|
| **Entity** | Contracting with clinics and operating a health information system may require a local entity (PT PMA). ⚖️ Blocking for revenue — check early |
| **Payments** | Local rails and invoicing conventions differ; not an MVP concern but affects the commercial pilot |
| **Connectivity** | Generally good in urban clinics; assume intermittent rather than absent. Local draft persistence and resumable upload cover the realistic case |
| **Devices** | Android-dominant. **Test on low-end Android as the floor, not as an afterthought** |
| **WhatsApp** | The default channel for everything. Intake links will be shared through it. Design for that, and note that any patient messaging feature must be clinic-owned and separately consented — see [Go-To-Market.md](../09-MVP/Go-To-Market.md) |
| **Time zones** | WIB / WITA / WIT — three zones. Handle explicitly; a date error on a lab result is a clinical error |
| **Names** | Many Indonesians use a single name (mononym). **A schema requiring a surname is a bug**, and a common one in imported software |
| **Dates** | DD/MM/YYYY convention — the ambiguity trap in E7 of the harness catalogue is a real, everyday risk here |

**The mononym point is worth emphasising.** It is the kind of detail that instantly marks software as foreign, and it will appear in the first ten minutes of any demo.

## 5. What to bring back from RECON

| Artefact | Target |
|---|---|
| Real prior records, consented and de-identified | **100–200** — the single most important input to the build |
| Document taxonomy | Proportions: handwritten / printed / thermal / photographed / multi-page |
| Chief complaint frequency | The top 10 that cover ~70% of volume |
| Consultation time baseline | By complaint, from direct observation |
| Double-entry count | How many systems the encounter is typed into |
| Device and literacy observation | Share of patients who could plausibly self-serve |
| Intake feasibility | Wizard-of-Oz with a human and a tablet, 30–50 patients |
| Vocabulary list | The words patients actually use for their complaints |
| Screenshots/observation of P-Care and the clinic EMR | What the doctor's existing burden actually looks like |

**None of this requires a signed clinic.** It requires a few weeks, some politeness, and a willingness to sit in waiting rooms.

## v2.2 Reconciliation

Separate observed facts, sourced claims, and hypotheses. Do not state double-entry or workflow pain as universal across Indonesian clinics. Treat willingness-to-pay, subscription model, per-doctor pricing, per-location pricing, and volume-tier assumptions as RECON/PITCH hypotheses until tested.


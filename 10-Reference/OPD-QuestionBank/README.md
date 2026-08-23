# OPD Question Bank — Common Diseases in Java, Indonesia

A structured database of 40 diseases most frequently seen in General/Internal
Medicine outpatient (OPD) settings in Java, Indonesia, built for pre-round /
patient history-taking.

## Files

| File | Contents |
|---|---|
| `diseases.json` | Full nested database — one object per disease with symptoms, red flags, and history questions. Best for building an app. |
| `diseases.csv` | One row per disease — name, ICD-10, category, epidemiological context, counts. |
| `symptoms.csv` | Long format: disease → symptom (one row per symptom). |
| `red_flags.csv` | Long format: disease → red flag / alarm feature requiring urgent attention. |
| `history_questions.csv` | **The core question bank** — disease → question → clinical purpose (one row per question). 308 questions total. |

## Coverage

- **40 diseases**, General/Internal Medicine OPD scope
- **247 symptoms**, **158 red flags**, **308 history-taking questions**
- Categories: Infectious, Respiratory, Cardiovascular, Gastrointestinal,
  Endocrine/Metabolic, Musculoskeletal, Neurological, Dermatological,
  Genitourinary, ENT, Ophthalmological, Renal, Hematological, Dental/Oral

Disease selection combines two sources:
1. **Chronic/NCD burden** — top outpatient diagnoses reported by DKI Jakarta
   Provincial Government puskesmas data (2024): ISPA, hypertension, dental
   pulp disease, dyspepsia, type 2 diabetes, hypertensive heart disease,
   dyslipidemia, soft tissue disorders, diarrhea, HIV.
2. **Infectious/tropical disease burden** typical of Java puskesmas (rural and
   urban), from regional puskesmas reports (e.g. Puskesmas Sagaranten,
   Puskesmas Gabus II) and known national epidemiology: TB, dengue, typhoid,
   malaria (endemic in southern coastal Java), chikungunya, leptospirosis
   (flood-associated), hepatitis A, scabies, tinea, and common ENT/eye/skin
   conditions.

Each disease entry also has an `id`, ICD-10 code, and `context_note`
explaining why it's relevant to OPD practice in Java specifically.

## Each disease record contains

- `symptoms`: list of presenting complaints a patient may report
- `red_flags`: alarm features that should prompt urgent referral/escalation
- `questions`: each with a `q` (question text, ready to ask the patient)
  and `purpose` (what it's meant to establish/confirm/rule out)

## Suggested use for pre-round / history taking

1. Match the patient's chief complaint to relevant disease(s) via `symptoms.csv`.
2. Pull the associated `questions` for those diseases to build a targeted
   history-taking checklist.
3. Always screen the `red_flags` list for each candidate diagnosis before
   closing the encounter — these indicate when to escalate beyond routine OPD care.

## Important notes

- This is a clinical **reference/education aid**, not a diagnostic algorithm —
  it does not replace clinical judgment, physical exam, or local treatment
  guidelines (e.g. Indonesian Ministry of Health / IDI clinical pathways).
- Content reflects general/typical presentations; always adapt questions to
  patient age, sex, comorbidities, and context.
- Built with English content as requested; disease names include the
  Indonesian term (`name_id`) since that's what patients and records will use.

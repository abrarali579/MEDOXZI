# Localisation

**Requirement:** English by default; a language switch offering an **accurate** Bahasa Indonesia version.

**The position this document takes:** in a clinical intake product, translation is not a content task. A mistranslated question changes what the patient answers, which changes what the doctor reads, which changes what they do. **Translation quality is a patient-safety property**, and it is treated here with the same governance as a red-flag rule.

---

## 1. Locale strategy

| Surface | Default | Notes |
|---|---|---|
| **Doctor dashboard** | **English** | Clinicians read English clinical vocabulary comfortably; ambiguity here is lower and consistency with medical literature is higher. Switchable to Bahasa Indonesia. |
| **Staff console** | **Bahasa Indonesia** default, English switchable | Staff are local; the script they read aloud must be in the patient's language anyway |
| **Patient app** | **Bahasa Indonesia** default, English switchable | Patient-facing text is where mistranslation causes clinical harm |
| **Documents / exports** | Follows the clinic's configured locale | |
| **Audit and logs** | English | Machine-facing |

**Language is chosen once per user and applies everywhere**, including the review screen, confirmations and error messages. A form that switches back to English on the confirmation screen is a form that loses the patient at the last step.

## 2. Clinical concept codes — the layer beneath language

**Adopted from the external review (§2.1 of [External-Review-Reconciliation](../00-Executive/External-Review-Reconciliation.md)).**

A clinical concept is identified by a **stable, language-independent code**. Text is a rendering of it, never its identity.

```
CONCEPT            SYMPTOM_DYSPNEA
  render(en)       "Shortness of breath"
  render(id)       "Sesak napas"
  patient_variants(id)  ["sesak", "napas berat", "susah bernapas", "sesek"]
  internal_code    (nullable → SNOMED / ICD later)
```

**Why this matters more than it looks:**

| Without concept codes | With them |
|---|---|
| The rule engine matches on translated strings and silently fails in the other locale | Rules read codes; locale is irrelevant to safety logic |
| Colloquial complaints become untyped free text the system cannot reason over | *masuk angin* maps to a concept with its own question set |
| Adding a locale means re-verifying every rule | Adding a locale is a rendering exercise |
| FHIR export has nothing stable to map | The concept is the mapping anchor |

**Rules:**
1. **Every clinical concept has a code. No exceptions.** A concept identified by its English string is a defect.
2. **`patient_variants` are many-to-one.** Several colloquial expressions map into one concept; the mapping is clinician-reviewed 🩺 and versioned with the content pack.
3. **A variant that cannot be confidently mapped stays as free text** and is shown to the doctor verbatim — never force-fitted into a concept.
4. **Codes are internal and stable.** External terminology (SNOMED, ICD, LOINC) attaches as nullable columns, populated later without migration.
5. **The rule engine and the question graph read codes only.** They never see rendered text.

**Direct benefit for the founder's roadmap:** adding Urdu, Hindi or Arabic later becomes a rendering and review exercise, not an architecture change.

## 3. Architecture

```
content/
├── questions/
│   ├── chest_pain.yaml            # question_key + structure, locale-independent
│   └── …
├── locales/
│   ├── en/  clinical.yaml · ui.yaml · consent.yaml
│   └── id/  clinical.yaml · ui.yaml · consent.yaml
└── review/
    └── id/  translation_review_log.yaml   # who reviewed what, when
```

**Design rules:**
1. **The question key is the identity; text is a locale attribute.** A question is never identified by its English text. The same rule applies to clinical concepts — see §2.
2. **Clinical strings and UI strings are separate files with different governance.** "Cancel" needs a translator. "Does the pain get worse when you walk?" needs a doctor.
3. **`clinical.yaml` in any locale cannot be edited without a review entry.** Enforced in CI: a changed clinical string without a corresponding review log entry fails the build.
4. **Free text is stored in the original language *and* a translation**, both visible to the doctor with the original marked. The doctor sees the patient's actual words.
5. **No runtime machine translation of clinical content, ever.** Machine translation is permitted only for UI chrome, and even then it is reviewed.
6. **Locale is part of every harness case.** Every attack class runs in both locales, and subgroup parity by locale is a gate (H21).

## 4. Clinical translation governance 🩺

```
Author (en) → Professional translation (id) → CLINICIAN REVIEW (id)
  → Back-translation (id→en) → Compare with original intent
  → Cognitive testing with 5+ real patients → Sign → Activate
```

| Step | Why it is not optional |
|---|---|
| **Professional translation** | Machine translation of clinical language produces fluent, confident, wrong output — the worst failure mode |
| **Clinician review in Indonesian** | A translator gets the words right and the clinical meaning subtly wrong. Only a clinician catches "chest heaviness" becoming "chest pain" |
| **Back-translation** | Catches meaning drift the forward reviewer normalised away |
| **Cognitive testing with patients** | The only way to learn that a technically correct question is not the question people answer |
| **Sign and activate** | Same two-person content control as every other clinical artefact |

**Cognitive testing is the step teams skip and the one that pays.** Five patients, asked to say aloud what they think each question means, will find more real defects than a week of review.

## 5. Indonesian-specific clinical language 🩺

| Issue | Handling |
|---|---|
| **Colloquial complaints with no clinical equivalent** — ***masuk angin*** being the canonical example | Treat as a **first-class chief complaint with its own question set**, authored by the lead doctor. Do not attempt to map it onto a Western category. Getting this right signals local competence more than any feature. |
| **Mixed terminology registers** — Indonesian, Dutch-derived, Latin | Question text uses patient-facing Indonesian; the structured code uses the internal terminology; the doctor's view may show the clinical term |
| **Formal vs colloquial register** | Patient-facing text uses accessible Indonesian, not textbook formality. Test with real patients, not with staff |
| **Regional languages** (Javanese, Sundanese, others) | **Not localised in v1.** Staff-assisted intake is the bridge, and staff translate verbally as they already do |
| **Mononyms** | Single-name patients are normal. **A required surname field is a bug** — and one that instantly marks software as foreign |
| **Date format** | DD/MM/YYYY. Ambiguous dates on documents are flagged, never assumed (harness E7) |
| **Time zones** | WIB / WITA / WIT handled explicitly — a date error on a lab result is a clinical error |
| **Number formatting** | Decimal comma vs point — a real hazard in dose and lab values. Parse defensively; render per locale; **never silently reinterpret a separator** |

**The number-separator issue deserves a test of its own.** `1,5 mg` and `1.5 mg` mean the same thing in different conventions, and `1,500` does not. This belongs in the harness corruption class.

## 6. What "accurate" means, operationally

A locale is release-ready when:

- [ ] Every clinical string has a clinician review entry with a name and date 🩺
- [ ] Back-translation review completed with differences resolved
- [ ] Cognitive testing with ≥5 patients per major question set, defects fixed
- [ ] Consent text separately reviewed by counsel in that language ⚖️
- [ ] Harness subgroup parity by locale within threshold (≤1.2×)
- [ ] Injection resistance verified in that language (harness C6)
- [ ] Free-text handling verified — original preserved, translation marked
- [ ] Every UI string reviewed, including error and empty states
- [ ] Number, date and name conventions verified
- [ ] No untranslated string reachable in any flow (CI check)

**The last item is a common embarrassment.** An English error message appearing in an Indonesian patient flow, at the moment something has already gone wrong, is a small failure that reads as a large one.

## 7. Adding a locale later

Fixed cost per locale: professional translation, clinician review, back-translation, cognitive testing, counsel review of consent, and a full harness pass. **Budget it as a clinical content release, not a string dump.** If a locale cannot be given that treatment, it should not ship — a half-translated clinical product is worse than a monolingual one, because it invites people to use it in a language it does not properly support.

## v2.2 Reconciliation

Clinical meaning is stored as canonical language-independent concepts. English remains the default authoring/control language; Bahasa Indonesia is first-class and requires clinician review before real patient use. Translation records carry status, reviewer, locale, source concept, and version. Code-switching is expected in Indonesia and must preserve the canonical concept rather than infer new clinical meaning from mixed-language text.


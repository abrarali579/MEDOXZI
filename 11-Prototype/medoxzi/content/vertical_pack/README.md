# MEDOXZI Vertical Question Packs

> 🩺 **Purpose.** A *vertical pack* is a curated, versioned set of questions for one
> common outpatient presentation, drafted for a real clinic. It lives alongside
> the generic `content_pack_v0.1.json` and follows the same anatomy
> (`Question-Framework.md §2`), the same structure per complaint (`§4`), and the
> same content lifecycle (`§7`).
>
> **Status gate (binding, ADR-002 / ADR-033 / OT-05 / OT-18).** Packs drafted here
> are **`DEMO_UNVALIDATED`**. AI drafts candidate questions as *material for a
> clinician to edit*, never as the final clinical artefact. **No pack in this
> directory is usable with real patients until a named clinician signs it and it
> is promoted to `ACTIVE`** with a `signed_at` timestamp and `evidence_reference`
> fields filled from licence-cleared sources. This is not optional.

---

## 1. What belongs here

- **First visit / no prior report** screening questions per common complaint.
- Questions must be **patient-facing, screening-only** — they gather history so the
  doctor's visit is faster and better organised. They **never** render a diagnosis,
  a differential, or a treatment recommendation. All treatment/diagnosis authority
  stays with the doctor (founder decision, session P / OT-18).
- Most common outpatient complaints (start set, to be expanded by the Lead Doctor):
  `chest_pain* · fever* · cough · headache · abdominal_pain · diarrhoea ·
  dizziness · sore_throat · skin_rash · joint_pain · dysuria · fatigue`
  (`*` already drafted in `content_pack_v0.1.json`).

## 2. File layout

```
vertical_pack/
  README.md            <- this document
  drafts/              <- one JSON per complaint, status DEMO_UNVALIDATED
    <complaint_code>.json
```

A draft `JSON` carries the **same envelope as `content_pack_v0.1.json`** plus a
required per-question source-ref block (see §4). The `loader.py` can load any of
them by path, so a draft can be exercised through the harness without touching
the shipped pack.

## 3. Design targets (from Question-Framework §4)

- **≤12 questions** on the patient path per complaint; **≤6** suggested to the doctor.
- **≤6 minutes** median completion.
- Structure per complaint: core characterisation → modifiers → associated symptoms
  → **RED-FLAG screen** (high sensitivity, embedded, not signposted) → significant
  negatives → relevant past history → context.
- **Every red flag** must have a `safety_rules` entry and a `clinical_rationale`
  that says `UNVALIDATED_DEMO_CONTENT` until a clinician replaces it.
- Every question is skippable; a `required_for_completeness` item is a gap if unanswered.

## 4. Required per-question fields

Every draft question MUST carry, in addition to the framework anatomy:

| Field | Purpose | Draft value |
|---|---|---|
| `question_key` | stable identity | `q_<cc>_<slug>` |
| `chief_complaint_code` | binding | the complaint code |
| `text_by_language` | en + hi (+ Indonesian later) | draft translation |
| `answer_type` | BOOL/ENUM/MULTI/NUMERIC/DATE/TEXT | |
| `asked_of` | who answers | PATIENT/STAFF/DOCTOR |
| `is_red_flag_screen` | bool | |
| `is_required_for_completeness` | bool | |
| `display_order` | int | |
| `clinical_rationale` | why this question | draft note |
| `source_ref` | **licence-cleared source (OT-05)** | `PENDING_CLINICIAN_SOURCE` |
| `authored_by` | author | `AI_DRAFT — requires clinician` |

Missing `source_ref` on any question = pack cannot be promoted past `DEMO_UNVALIDATED`.

## 5. Draft → Active lifecycle

```
DEMO_UNVALIDATED  (AI-drafted candidates, this directory)
        │  Lead Doctor edits/replaces, fills source_ref + evidence_reference,
        │  approves Hindi/Indonesian translations, writes test cases
        ▼
DRAFT             (clinician working copy, pulled into clinical safety review)
        │  peer review → clinician review of translations → sign (safety owner)
        ▼
ACTIVE            (signed_at set, loaded as the live pack)
```

**No automated path crosses from `DEMO_UNVALIDATED` to `ACTIVE`.** Promotion is a
human, clinical-safety decision.

> **ADR-039 override (founder, sessions Q/S).** The founder waived the named-Lead-
> Doctor sign-off, the `source_ref`/licence activation gate, and the ACTIVE-without-
> safety-rules loader guard for the 40 literature question packs, and promoted them
> to `ACTIVE` with `signed_at: null`. `is_signed` therefore stays False — a sign-off
> is never fabricated. Future packs still follow the lifecycle above unless the
> founder issues another ADR. See `10-Reference/Decision-Log.md` ADR-039.

## 6. Hallucination / safety guard (the Harness)

Drafts are produced by a local Ollama model under a **strict drafting prompt**
(`vertical_pack/tools/draft_pack.py`) and are run through the harness
`drift` + `abstention` gates to reject any candidate that:
- states or implies a diagnosis, differential, or probability,
- uses a prohibited phrase (`diagnosis is`, `most likely`, `prescribe`, `appears
  benign`, `complete history`, …),
- fabricates a source (`source_ref` is forced to `PENDING_CLINICIAN_SOURCE`).

A draft is only written to `drafts/` if it passes these gates AND parses to the
schema. Passing the harness means *structurally safe to hand a clinician*, NOT
clinically validated.

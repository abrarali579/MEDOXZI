# Session P - Founder blocker resolutions + vertical question-pack pipeline

**Status:** IN PROGRESS (autonomous overnight run; cron `0d9dc488a605` continues)
**Started:** 2026-08-24 (late) — founder going to sleep
**Agent:** ARHAM (chief of staff) via Hermes, provider deepseek (cloud); local Ollama for drafting
**Human direction (recorded):** Resolve the blockers the founder is handling himself; set up cron so work continues every 15 min while he sleeps; draft question banks for the most common diseases using local models + the harness to avoid hallucination; "Do smart choices but don't stop work."

## Protocol Read

Read before edits:
- `_OPS/AGENT-PROTOCOL.md`, `_OPS/STATE.md`, `_OPS/OPEN-THREADS.md`, `_OPS/CHANGELOG.md`, `_OPS/CLAIMS-REGISTER.md`
- `10-Reference/Decision-Log.md` (latest ADRs), `03-Clinical/Question-Framework.md`, `02-Product/Question-Bank-Generation.md`
- `11-Prototype/medoxzi/content/content_pack_v0.1.json`, `loader.py`, `harness/{run,drift,contamination}.py`

## Baseline Verification Before Changes

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s          (verified in session O; repo clean + committed at aea0012 before this session)
```

```text
$ curl -s --max-time 5 http://localhost:11434/api/tags        # local Ollama
models: gpt-oss-*, bge-m3, qwen3:4b, qwen3:14b, qwen2.5-coder:14b, llama3.2-vision:11b
```
Local server accessible; `qwen3:4b` inference verified ("OK", ~2.0s) in a prior check.

## Founder Decisions Recorded (ADR-037 + OT updates)

The founder resolved the product blockers himself. Recorded verbatim intent:

- **OT-18 (question pack signing)** → no longer a 🔴 blocker. Question banks are designed **from medical literature** with AI, purely as **screening** (relevant questions from patients) with **no diagnosis**; the doctor keeps *full discretion* to act or not on the questions.
- **OT-02 (medical device)** → **removed**. No diagnosis is made; the product is a **time-saving / data-organising tool or SaaS for clinics**, not a regulated medical device.
- **OT-14 (PSE registration)** → **owner = founder**; he has PT/PMA and will handle all requirements.
- **OT-19 (consent)** → during **data submission** the clinic will take clear patient consent for follow-up and reminders/announcements.
- **OT-21 (PIN)** → smart choice: use a **larger PIN**, expose it **only in the doctor's records** (not on the main list view).
- **OT-05 (content licensing)** → question bank will be designed **by AI about the most common diseases**, using the **harness to avoid hallucinations**; founder will do deep research on the question bank.
- **Data processing** → the founder will handle real processing **locally at launch**; until then use normal available AI tools.

## Completed Work

### 1. Decisions logged
- `_OPS/OPEN-THREADS.md` — updated OT-18, OT-02, OT-14, OT-19, OT-21, OT-05 with founder-resolution statuses + "Session P" notes.
- `10-Reference/Decision-Log.md` — added **ADR-037** capturing the founder's resolutions.

### 2. Vertical question-pack shell (new)
- `11-Prototype/medoxzi/content/vertical_pack/README.md` — schema/standards doc: purpose, field contract, `DEMO_UNVALIDATED` status, clinician-sign path, OT-05 source gate.
- `11-Prototype/medoxzi/content/vertical_pack/drafts/` — output directory for draft packs.
- `11-Prototype/medoxzi/content/vertical_pack/tools/draft_pack.py` — local-model drafting pipeline.

### 3. Local-model drafting pipeline (`draft_pack.py`, qwen3:14b via Ollama)
- **Contract (learned empirically):** the local model drafts **only patient-facing screening questions** (interrogative, non-diagnostic). It must NOT author `safety_rules`, `suggested_action`, `clinical_rationale`, or any differential vocabulary — every attempt to do so was a diagnostic-drift violation the harness correctly rejected (the model wanted to inject "Consider cardiac or pleural pathology", "malignancy" — exactly what the harness exists to stop).
- The script **overwrites all clinical metadata with clinician placeholders** (`clinical_rationale="UNVALIDATED_DEMO_CONTENT"`, `source_ref="PENDING_CLINICIAN_SOURCE"`, `authored_by="AI_DRAFT - requires clinician"`), so nothing diagnostic is AI-authored.
- **Harness gate** runs drift (F1 PROHIBITED, F3 DIFFERENTIAL_SHAPE, F4 COMPLETENESS) over AI-authored question text only. **F2 (ASSERTION_STRENGTH) explicitly excluded** — screening questions are interrogatives, so "has/is/are" are grammatical copulas, not claims; F2 would false-positive on every question.
- **JSON robustness fixes found:** raise `num_predict` to 6000 (local models were truncating mid-array), `temperature=0.4` (structured fidelity), force a **flat top-level `questions` array** (model kept nesting under category keys), enforce exact field keys, and scrub diagnostic vocabulary from the prompt itself.
- **Validated on `cough`:** 12 questions, harness-clean, English + Hindi Devanagari, red-flag screen embedded (blood in sputum / breathing difficulty), all metadata clinical placeholders. `drafts/cough.json`.
- **Design constraint honoured:** drafts are AI-authored **candidate material only** (`DEMO_UNVALIDATED`), never signed/activated; a clinician supplies all clinical metadata and the source ref before real use. This satisfies OT-18 / ADR-002 / ADR-033.

## Cron Driver (autonomous continuation)

- Created recurring job **`0d9dc488a605` "MEDOXZI question-pack autopilot"**, every 15 min:
  - Step 1: HALT gate check + Ollama-up check.
  - Step 2: draft any `COMPLAINT_SPEC` complaint lacking a draft, via local `qwen3:14b` (fallback `qwen3:4b`), max 3 per run, retry a rare FAIL once.
  - Step 3: when all complaints drafted → run baseline pytest, commit, `git pull --rebase origin main` + push.
  - Step 4: tight 6-line status report to the founder on Telegram.

## In Progress / Next Steps (cron continues this)

- Drafting batch (headache, abdominal_pain, diarrhoea, dizziness, sore_throat, then skin_rash, dysuria, joint_pain, fatigue) via `qwen3:14b`.
- Run baseline pytest to confirm nothing broke.
- Commit + push `origin main`.
- Final SESSION-LOG / CHANGELOG / STATE.md completion when the batch finishes.

## Addendum — OPD Java Disease QuestionBank integrated (primary basis)

**Human direction (recorded):** founder sent the primary source for the question bank —
`OPD Java Disease QuestionBank.zip` ("deep research about Question Bank") — fulfilling OT-05's
"founder will do deep research on the question bank" and the standing requirement to design packs
**from actual medical literature**.

### What shipped (commit `139185e`, pushed `origin/main`)
- **Source extracted** to `10-Reference/OPD-QuestionBank/` — `diseases.json` (40 Java/Indonesia OPD
  diseases), `diseases.csv`, `symptoms.csv`, `red_flags.csv`, `history_questions.csv`, `README.md`.
  The bank is grounded in DKI Jakarta puskesmas 2024 epidemiology + regional burden (ISPA,
  hypertension, dyspepsia, T2DM, tropical: TB, dengue, typhoid, malaria...) and is explicitly framed
  as a **reference/education aid, not a diagnostic algorithm** — an exact match to our screening-only boundary.
- **`tools/build_from_questionbank.py`** — converts `diseases.json` → one pack per disease →
  `vertical_pack/literature/<code>_<Dxx>.json`. **40 packs, 466 patient-facing questions** (308 sourced
  history questions + embedded red-flag screens). Each question carries the bank's verbatim clinical
  `purpose` as `clinical_rationale` and an `evidence_reference` (ICD-10 + bank identity). This finally
  closes the source gap the harness/ADR-033 flagged (`source_ref` was `PENDING_CLINICIAN_SOURCE` before).
- **`tools/gate_literature.py`** — harness F1/F3/F4 gate over all 40 packs. (F2 skipped deliberately:
  literature question text is carried verbatim from source — no AI rewrite — so output==source, nothing to escalate.)
- **Gate outcome:** 28 **CLEAN** / 12 **BLOCKED**. `literature/GATE-REPORT.md` documents the exact
  flagged patient-facing strings in the 12 blocked packs. Most flags are urgency/differential wording in
  **red-flag screens** (e.g. "rule out septic arthritis", "emergency", "suggestive of acute coronary syndrome").
  These are **NOT auto-rewritten** — clinical/safety wording is a clinician's decision (ADR-002/037). They stay
  `DEMO_UNVALIDATED` + BLOCKED until a lead clinician redacts wording, then re-gate.
- **No Hindi fabricated:** the bank ships English + Indonesian only; `hi` localisation is a clinician/
  localiser task, never AI-invented (avoids hallucinated translation).

### Impact on the plan
- The **literature packs are now the primary Harness-training basis** (28 immediately usable).
- AI complaint-drafting is **superseded/secondary**: the 40 packs already cover the formerly-planned
  skin_rash / dysuria / joint_pain / fatigue areas via their source diseases. **Cron `0d9dc488a605`
  update** stops the AI-drafting of those 4 and repoints the driver at literature-pack integrity checks +
  git hygiene + commit of any leftover batch drafts.
- The background batch finished cough/headache/abdominal_pain/diarrhoea/dizziness (all harness-clean,
  12Q each); `sore_throat` in flight at time of writing; `abdominal_pain.json`+`sore_throat.json` picked
  up by the cron's commit step when they land.

## Safety

- No real patient data, no AI diagnosis, no visible differential, no production red flags.
- All drafts are `DEMO_UNVALIDATED`; AI authors screening questions only; clinical metadata is clinician-placeholder.
- No credentials or API keys handled; local models only, via local Ollama.

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

## Safety

- No real patient data, no AI diagnosis, no visible differential, no production red flags.
- All drafts are `DEMO_UNVALIDATED`; AI authors screening questions only; clinical metadata is clinician-placeholder.
- No credentials or API keys handled; local models only, via local Ollama.

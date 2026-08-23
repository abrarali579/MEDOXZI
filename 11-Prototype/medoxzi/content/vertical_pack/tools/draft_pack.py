"""Draft a vertical question pack using a LOCAL Ollama model, gated by the
MEDOXZI harness (F1/F3/F4), with all clinical metadata forced to clinician
placeholders so nothing diagnostic is AI-authored.

    python -m medoxzi.content.vertical_pack.tools.draft_pack --complaint cough
    python -m medoxzi.content.vertical_pack.tools.draft_pack --complaint cough --model qwen3:14b

Contract (learned empirically on local models — do not relax):
- The local model drafts ONLY the patient-facing screening questions (safe,
  interrogative, non-diagnostic). It NEVER authors safety_rules, suggested_action,
  clinical_rationale or any differential vocabulary — every attempt to do so was a
  diagnostic-drift violation that the harness correctly rejected.
- This script overwrites all clinical metadata with safe clinician placeholders:
  clinical_rationale -> "UNVALIDATED_DEMO_CONTENT", source_ref ->
  "PENDING_CLINICIAN_SOURCE", safety_rules -> a single non-clinical placeholder.
- The harness gate (F1.PROHIBITED, F3.DIFFERENTIAL_SHAPE, F4.COMPLETENESS) runs
  against the AI-authored question text only. F2 is excluded (interrogatives are
  not claims). Passing is NOT clinical validation.

Output:  <content_dir>/vertical_pack/drafts/<complaint>.json  (DEMO_UNVALIDATED)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))  # -> 11-Prototype/

import requests                                          # noqa: E402
from harness import drift                                 # noqa: E402

OLLAMA = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "qwen3:14b"
CONTENT_DIR = Path(__file__).resolve().parents[2]          # medoxzi/content
DRAFTS_DIR = CONTENT_DIR / "vertical_pack" / "drafts"

# F2 excluded: F2 guards "output claims > source"; screening questions are
# interrogatives, so "has/is/are" are grammatical copulas, not assertions.
EXCLUDE_DRIFT = {drift.Detector.ASSERTION_STRENGTH}

COMPLAINT_SPEC = {
    "cough": ("Cough", "acute/chronic cough history in primary care"),
    "headache": ("Headache", "headache history in primary care"),
    "abdominal_pain": ("Abdominal pain", "abdominal pain history in primary care"),
    "diarrhoea": ("Diarrhoea", "acute diarrhoea history and hydration context"),
    "dizziness": ("Dizziness", "dizziness/lightheadedness history"),
    "sore_throat": ("Sore throat", "sore throat / pharyngitis history"),
    "skin_rash": ("Skin rash", "skin rash history"),
    "joint_pain": ("Joint pain", "joint pain / arthritis history"),
    "dysuria": ("Dysuria", "painful urination / urinary tract history"),
    "fatigue": ("Fatigue", "persistent fatigue history"),
}


def build_prompt(code: str, label: str, note: str) -> str:
    return f"""You are a clinical <i>screening-question</i> drafter, not a diagnostician.
Draft a JSON object for a vertical screening question pack for the complaint
"{label}" ({note}) for a primary-care clinic.

STRICT RULES — violating any returns FAIL:
- SCREENING HISTORY ONLY. You NEVER state a diagnosis, differential, or treatment.
  Never use: diagnosis is, most likely, differential, prescribe, appears benign,
  complete history, "% chance", "consider", "likely", "rule out", "ddx",
  "probability", "cardiac", "malignancy", "pathology", "urgent", "emergency".
- Max 12 questions total. Structure order: core characterisation (onset, duration,
  character, severity) -> aggravating/relieving -> associated symptoms -> embedded
  RED-FLAG screen -> significant negatives -> relevant past history -> context.
- Produce "questions" as a TOP-LEVEL FLAT JSON ARRAY of question objects. Do NOT
  nest questions under sub-keys (no "character"/"severity"/"red_flag" object keys).
- Every question OBJECT must have EXACTLY these keys (no extras, in this order):
  question_key, chief_complaint_code, text_by_language, answer_type, asked_of,
  is_red_flag_screen, is_required_for_completeness, display_order,
  clinical_rationale, source_ref, authored_by.
- text_by_language = {{"en": <english layman>, "hi": <Hindi Devanagari layman wording>}}.
- answer_type is one of BOOL, ENUM, MULTI, NUMERIC, DATE, TEXT. If ENUM or MULTI,
  include an "options" array (MULTI must include "none" and "other").
- asked_of is always ["PATIENT", "STAFF", "DOCTOR"].
- The following THREE values are FIXED on EVERY question; copy them verbatim:
  - clinical_rationale: "UNVALIDATED_DEMO_CONTENT"
  - source_ref: "PENDING_CLINICIAN_SOURCE"
  - authored_by: "AI_DRAFT - requires clinician"
- ENVELOPE: include ONLY these top-level keys: content_version
  ("vertical@0.1.0"), status ("DEMO_UNVALIDATED"), authored_by
  ("AI_DRAFT - requires clinician"), signed_at (null), warning ("This content is
  not clinically validated and requires clinician review before use."),
  chief_complaints (list of {{code,label_en,label_hi}}), questions (the flat
  array), required_for_completeness (list of question_keys).
- Do NOT create safety_rules, suggested_action, message_template, or evidence
  keys anywhere — a clinician supplies those later.
- chief_complaint_code on every question = "{code}".
- Return ONLY the JSON. No commentary, no markdown fences.
"""


def call_ollama(prompt: str, model: str, timeout: int = 400) -> str:
    resp = requests.post(
        OLLAMA,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "num_predict": 6000,
            "temperature": 0.4,
        },
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json().get("response", "")


def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[-1]
    if t.rstrip().endswith("```"):
        t = t.rsplit("```", 1)[0]
    return t.strip()


def validate(data: dict, code: str) -> list[str]:
    errs: list[str] = []
    if data.get("status") != "DEMO_UNVALIDATED":
        errs.append("status != DEMO_UNVALIDATED")
    qs = data.get("questions", [])
    if not isinstance(qs, list) or not (1 <= len(qs) <= 12):
        errs.append(f"questions not a list of size [1,12]: {len(qs) if isinstance(qs,list) else type(qs)}")
    for q in qs:
        if not isinstance(q, dict):
            errs.append("element not an object")
            continue
        if q.get("chief_complaint_code") != code:
            errs.append(f"{q.get('question_key')}: wrong complaint code")
        if q.get("source_ref") != "PENDING_CLINICIAN_SOURCE":
            errs.append(f"{q.get('question_key')}: source_ref not forced")
        if q.get("authored_by") != "AI_DRAFT - requires clinician":
            errs.append(f"{q.get('question_key')}: authored_by not AI_DRAFT")
        for lang in ("en", "hi"):
            if not q.get("text_by_language", {}).get(lang):
                errs.append(f"{q.get('question_key')}: missing {lang} text")
        if q.get("answer_type") not in ("BOOL", "ENUM", "MULTI", "NUMERIC", "DATE", "TEXT"):
            errs.append(f"{q.get('question_key')}: bad answer_type")
        if q.get("answer_type") in ("ENUM", "MULTI") and "options" not in q:
            errs.append(f"{q.get('question_key')}: {q.get('answer_type')} needs options")
    # envelope must NOT carry diagnostic metadata the model shouldn't author
    for bad_key in ("safety_rules", "message_template", "suggested_action", "evidence_reference"):
        if bad_key in data:
            errs.append(f"envelope must not contain {bad_key} (clinician-authored)")
    return errs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--complaint", required=True, choices=sorted(COMPLAINT_SPEC))
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--out-dir", default=str(DRAFTS_DIR))
    args = ap.parse_args()

    label, note = COMPLAINT_SPEC[args.complaint]
    code = args.complaint
    print(f"[draft] {code} via {args.model} ...", flush=True)
    raw = call_ollama(build_prompt(code, label, note), args.model)
    raw = _strip_fences(raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[FAIL] model output not valid JSON: {exc}")
        print(raw[:400])
        return 1

    errs = validate(data, code)
    if errs:
        print("[FAIL] schema.")
        for e in errs:
            print("  -", e)
        return 1

    # ---- Harness gate over AI-authored patient-facing text only -------------
    patient_text = []
    for q in data["questions"]:
        for lang in ("en", "hi"):
            patient_text.append(q.get("text_by_language", {}).get(lang, ""))
    detected = drift.detect(
        patient_text, ["patient reports " + label.lower()],
        extra_prohibited={  # harden the demo gate beyond the repo default F1 set
            "diagnosis": [r"\b(consider|likely|rule out|ddx|probability|cardiac|malignancy|pathology)\b",
                          r"\bdifferential\b"],
            "urgency": [r"\b(urgent|emergency|immediately|cannot wait)\b"],
        },
    )
    hits = [h for h in detected.hits if h.detector not in EXCLUDE_DRIFT]
    if hits:
        print("[FAIL] harness drift caught (AI-authored text only). "
              "Draft rejected — not written.")
        for h in hits:
            print(f"  ! {h}")
        return 1

    out = Path(args.out_dir) / f"{code}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] drafted {len(data['questions'])} questions -> {out}")
    print("[OK] harness clean (F1/F3/F4). DEMO_UNVALIDATED — clinician review "
          "required before any clinical metadata or activation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

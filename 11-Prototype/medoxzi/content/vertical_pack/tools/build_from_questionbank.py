"""Build literature-grounded question packs from the OPD Java Disease QuestionBank.

Source:  10-Reference/OPD-QuestionBank/diseases.json (v1.0, 40 diseases, 308
         history questions, each with a clinical purpose)
Purpose: Fulfil the founder's requirement (session P / OT-05 / OT-18) that question
         packs are designed from *actual medical literature*, not free AI
         generation. Each disease in the bank becomes one pack here, so the
         Harness can be trained against real, sourced, clinician-purposed
         screening questions.

Safeguards baked in (binding, ADR-002 / ADR-033 / ADR-037):
  * Every pack is `DEMO_UNVALIDATED` and `authored_by` names the literature
    source, NOT a clinician. No pack activates for real patients without a
    named clinician sign + licensing gate (`signed_at` + `evidence_reference`).
  * `clinical_rationale` is taken verbatim from the bank's `purpose` field —
    never AI-rewritten.
  * `source_ref` / `evidence_reference` point at the exact bank rows / ICD-10.
  * Patient-facing text is carried over verbatim; NO Hindi is fabricated (the
    bank ships English + Indonesian; `hi` text stays absent until a
    clinician/localiser supplies it) — we must not invent translations.
  * Red-flag items become `is_red_flag_screen: true` questions, embedded and
    not signposted, per Question-Framework §4.

Usage:
  python -m medoxzi.content.vertical_pack.tools.build_from_questionbank [--out DIR]

Writes <out>/<disease_code>.json for every disease. Library-free; one pass.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]          # 11-Prototype
DEFAULT_SOURCE = ROOT.parent / "10-Reference" / "OPD-QuestionBank"
STD_DEFAULT_SOURCE = Path(r"D:\MEDOXZI\10-Reference\OPD-QuestionBank")

CONTENT_VERSION = "vertical@0.1.0"
STATUS = "DEMO_UNVALIDATED"
WARNING = (
    "This content is drawn from a clinical reference/education aid and is not "
    "clinically validated. It requires named clinician review + sign-off before "
    "any real-patient use."
)


def slugify(name: str) -> str:
    """disease name -> stable lowercase snake file stem."""
    s = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return s or "disease"


def build_pack(disease: dict) -> dict:
    """Turn one diseases.json record into a vertical_pack draft."""
    dcode = token = None
    for k in ("id", "icd10"):
        if disease.get(k):
            token = disease[k]
            break
    safe = slugify(disease.get("name_en", "disease"))
    if token:
        safe = f"{safe}_{re.sub(r'[^A-Za-z0-9]', '', token)}"

    questions = []
    disp = 1
    # History questions: verbatim text + purpose as the ONLY clinical rationale.
    ordered = list(disease.get("questions", []))

    # Red-flag screen: embed the bank's red flags as screening questions.
    # Kept neutral (no "seek emergency now" wording — urgency stays with doctor).
    redflag_start = disp
    for rf in disease.get("red_flags", []):
        redflag_start += 1  # reserve space; red flags come AFTER history by default

    # Order: history questions first (structured), red-flag screen embedded near
    # the end but not signposted as "these are the emergencies".
    for q in ordered:
        text = (q.get("q") or "").strip()
        purpose = (q.get("purpose") or "").strip()
        key = "q_%02d" % disp
        questions.append({
            "question_key": key,
            "chief_complaint_code": dcode or safe,
            "text_by_language": {"en": text},
            "answer_type": "TEXT",          # open history — no invented options
            "asked_of": ["PATIENT"],
            "is_red_flag_screen": False,
            "is_required_for_completeness": True,
            "display_order": disp,
            "clinical_rationale": purpose,   # verbatim source purpose
            "source_ref": f"OPD QuestionBank v1.0 :: {disease.get('name_en','')} :: history_questions.csv",
            "evidence_reference": repr({
                "database": "OPD Java Disease QuestionBank",
                "version": "1.0",
                "disease_id": disease.get("id"),
                "name_en": disease.get("name_en"),
                "name_id": disease.get("name_id"),
                "icd10": disease.get("icd10"),
                "category": disease.get("category"),
            }),
            "authored_by": f"LITERATURE_SOURCE - {disease.get('name_en','(unnamed)')} (requires clinician sign)",
        })
        disp += 1

    # Red-flag screen block
    for rf in disease.get("red_flags", []):
        text = (rf or "").strip()
        if not text:
            continue
        questions.append({
            "question_key": "rf_%02d" % disp,
            "chief_complaint_code": dcode or safe,
            "text_by_language": {"en": text, "screen": True},
            "answer_type": "BOOL",           # presence/absence; minimal invented structure
            "asked_of": ["PATIENT"],
            "is_red_flag_screen": True,
            "is_required_for_completeness": True,
            "display_order": disp,
            "clinical_rationale": "Red-flag / alarm feature from source bank — flags need doctor attention.",
            "source_ref": f"OPD QuestionBank v1.0 :: {disease.get('name_en','')} :: red_flags.csv",
            "evidence_reference": repr({"database": "OPD Java Disease QuestionBank", "disease_id": disease.get("id")}),
            "authored_by": f"LITERATURE_SOURCE - {disease.get('name_en','(unnamed)')} (requires clinician sign)",
        })
        disp += 1

    return {
        "content_version": CONTENT_VERSION,
        "status": STATUS,
        "authored_by": f"LITERATURE_SOURCE - {disease.get('name_en','(unnamed)')} (requires clinician sign)",
        "signed_at": None,
        "warning": WARNING,
        "chief_complaints": [
            {
                "code": dcode or safe,
                "label_en": disease.get("name_en", disease.get("id", "")),
                "label_id": disease.get("name_id"),
            }
        ],
        "source_bank": "OPD Java Disease QuestionBank v1.0",
        "icd10": disease.get("icd10"),
        "category": disease.get("category"),
        "context_note": disease.get("context_note"),
        "questions": questions,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=str(STD_DEFAULT_SOURCE),
                    help="path to the OPD QuestionBank dir (default D:/MEDOXZI/10-Reference/OPD-QuestionBank)")
    ap.add_argument("--out", default=str(ROOT / "medoxzi" / "content" / "vertical_pack" / "literature"),
                    help="output directory for the packs")
    args = ap.parse_args()

    src = Path(args.source)
    db_path = src / "diseases.json"
    if not db_path.exists():
        print(f"[ERR] source not found: {db_path}", file=sys.stderr)
        return 1

    with open(db_path, encoding="utf-8") as fh:
        db = json.load(fh)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    diseases = db.get("diseases", [])
    written, skipped = [], []
    for disease in diseases:
        name = disease.get("name_en") or disease.get("id")
        if not name:
            continue
        pack = build_pack(disease)
        fname = slugify(name)
        if disease.get("id"):
            fname = f"{fname}_{disease['id']}"
        target = out / f"{fname}.json"
        with open(target, "w", encoding="utf-8") as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=2)
        written.append(target.name)

    n_q = sum(len(x.get("questions", [])) for x in diseases)
    print(f"[OK] {db.get('database_name', 'QuestionBank')} v{db.get('version')}")
    print(f"[OK] wrote {len(written)} packs -> {out}")
    print(f"[OK] total questions carried: {n_q} (+embedded red-flags)")
    print(f"[OK] all DEMO_UNVALIDATED; clinician sign required before activation.")
    if skipped:
        print(f"[warn] skipped: {skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

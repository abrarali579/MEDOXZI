#!/usr/bin/env python3
"""End-to-end walkthrough of the deterministic pre-round pipeline.

No LLM, no database, no network. Everything printed below is produced by the
deterministic components described in the blueprint, using a synthetic
patient. NOT FOR CLINICAL USE.

    python demo.py
"""
from __future__ import annotations

import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))

from medoxzi.ai.orchestrator import GenerationMode, Orchestrator
from medoxzi.ai.verifier import SourceSpan, Statement
from medoxzi.clinical.answers import (
    AllergyStatus, Answer, AnswerStatus, EncounterState, Provenance,
)
from medoxzi.clinical.facts import ExtractedFact, FactType
from medoxzi.content import loader

W = 78


def rule(title: str = "") -> None:
    if title:
        print(f"\n{'-' * W}\n  {title}\n{'-' * W}")
    else:
        print("-" * W)


def synthesiser(state: EncounterState):
    """Stands in for the LLM synthesis step.

    Returns statements each bound to a source span, exactly as the real
    synthesiser must. The verifier will reject anything that is not.
    """
    spans = {
        "sp_intake_1": SourceSpan("sp_intake_1", None, None,
                                  "chest pain for 3 days, worse on exertion, relieved by rest"),
        "sp_intake_2": SourceSpan("sp_intake_2", None, None,
                                  "no radiation to arm or jaw"),
        "sp_doc_1": SourceSpan("sp_doc_1", "doc_lab_01", 1,
                               "HbA1c 8.4 % (ref 4.0-5.6)  02 Jun 2026"),
    }
    statements = [
        Statement("Patient reports chest pain for 3 days, worse on exertion.",
                  "sp_intake_1", quoted="chest pain for 3 days, worse on exertion"),
        Statement("Patient reports no radiation to arm or jaw.",
                  "sp_intake_2", quoted="no radiation to arm or jaw"),
        Statement("Prior HbA1c 8.4 % (reference 4.0-5.6), 02 Jun 2026.",
                  "sp_doc_1", quoted="HbA1c 8.4 %"),
    ]
    return statements, spans, 1


def build_state(**overrides) -> EncounterState:
    st = EncounterState(
        encounter_id="enc_demo_001", tenant_id="ten_demo",
        age=48, sex="female", chief_complaint="chest_pain", ai_consent=True,
    )
    st.record(Answer("q_cp_duration_days", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=3, unit="days"))
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=True,
                     original_language_text="चलने पर सीने में भारीपन"))
    st.record(Answer("q_cp_radiation", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=["none"]))
    st.record(Answer("q_cp_breathless", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=False))
    # q_smoking is deliberately never asked; it must surface as a named gap.
    st.allergy_status = AllergyStatus.ACTIVE
    st.allergies = [{"substance": "Penicillin", "reaction": "rash",
                     "provenance": "PATIENT"}]
    st.labs = [{"analyte": "HbA1c", "value": 8.4, "unit": "%",
                "reference_range": "4.0-5.6", "date": "2026-06-02",
                "abnormal": "HIGH", "confidence": 0.96}]
    for k, v in overrides.items():
        setattr(st, k, v)
    return st


def main() -> None:
    pack = loader.load()

    print("=" * W)
    print("  MEDOXZI PRE-ROUND - DETERMINISTIC PIPELINE DEMONSTRATION")
    print("  NOT FOR CLINICAL USE - synthetic patient - no LLM - no network")
    print("=" * W)
    print(f"\n  Content pack: {pack.version}   status: {pack.status}   "
          f"signed: {pack.is_signed}")
    print(f"  {len(pack.questions)} questions - {len(pack.rules)} safety rules")

    # ------------------------------------------------------------------ 1
    rule("1 - SAFETY RULES, RENDERED FOR CLINICIAN REVIEW")
    print("  A rule a physician cannot read is a rule a physician cannot sign.\n")
    for r in pack.rules:
        print(f"  [{r.rule_key}]")
        for line in _wrap(r.to_english(), W - 6):
            print(f"      {line}")
        print()

    # ------------------------------------------------------------------ 2
    rule("2 - EXTRACTED FACT - HIGH-RISK VERIFICATION GATE")
    fact = ExtractedFact(
        fact_id="fact_001", tenant_id="ten_demo", encounter_id="enc_demo_001",
        fact_type=FactType.MEDICATION, raw_text="Atorvastatin 10mg OD",
        normalised_value={"generic": "atorvastatin", "dose": 10, "unit": "mg"},
        confidence=0.61, source_span_id="sp_rx_1", document_id="doc_rx_01",
        is_handwritten=True,
    )
    print(f"  Extracted:        {fact.raw_text}")
    print(f"  Confidence:       {fact.confidence}")
    print(f"  Handwritten:      {fact.is_handwritten}  -> high-risk: {fact.is_high_risk}")
    print(f"  Status:           {fact.verification_status.value}")
    print(f"  Enters record?    {fact.enters_clinical_record()}")
    print(f"  Rendered as:      {fact.provenance_label()}")
    print()
    for role in ("CLINIC_ADMIN", "INTAKE_STAFF"):
        try:
            fact.confirm("usr_x", role)
            print(f"  FAIL {role} confirmed it - THIS WOULD BE A DEFECT")
        except Exception as exc:
            print(f"  OK   {role:<14} blocked: {exc}")
    fact.confirm("usr_doctor_01", "DOCTOR")
    print(f"  OK   DOCTOR         confirmed -> {fact.verification_status.value}, "
          f"enters record: {fact.enters_clinical_record()}")

    # ------------------------------------------------------------------ 3
    rule("3 - FULL PIPELINE - CONSENTED ADULT")
    orch = Orchestrator(pack.rules, pack.required_for_completeness, synthesiser)
    view = orch.run(build_state())
    _print_view(view)

    # ------------------------------------------------------------------ 4
    rule("4 - GATE - PATIENT DECLINED AI PROCESSING")
    view_nc = orch.run(build_state(ai_consent=False))
    print(f"  Mode:          {view_nc.generation_mode.value}")
    print(f"  Reason:        {view_nc.gate_reason}")
    print(f"  MODEL CALLS:   {view_nc.model_calls}   <- refusal is functional, "
          f"not decorative")
    print(f"  Red flags:     {view_nc.red_flag_wording()}")

    # ------------------------------------------------------------------ 5
    rule("5 - GATE - COHORT NOT VALIDATED IN v1")
    view_ped = orch.run(build_state(age=12, cohort_flags={"paediatric"}))
    print(f"  Mode:          {view_ped.generation_mode.value}")
    print(f"  Reason:        {view_ped.gate_reason}")
    print(f"  MODEL CALLS:   {view_ped.model_calls}")
    print(f"  Red flags:     {view_ped.red_flag_wording()}")

    # ------------------------------------------------------------------ 6
    rule("6 - VERIFIER - HALLUCINATED STATEMENT IS REJECTED")

    def bad_synthesiser(state):
        spans = {"sp1": SourceSpan("sp1", None, None, "chest pain for 3 days")}
        return [
            Statement("Patient reports chest pain for 3 days.", "sp1",
                      quoted="chest pain for 3 days"),
            # Plausible. Well-formed. Completely invented.
            Statement("Patient has no known drug allergies.", None),
        ], spans, 1

    bad_view = Orchestrator(pack.rules, pack.required_for_completeness,
                            bad_synthesiser).run(build_state())
    print(f"  Mode:          {bad_view.generation_mode.value}")
    print(f"  Reason:        {bad_view.gate_reason}")
    print("  Rejected:")
    for r in bad_view.verification.rejected:
        print(f"      - {r['reason']}: \"{r['statement']}\"")
    print(f"  Statements shown to the doctor: {len(bad_view.statements)}")
    print(f"  Red flags STILL evaluated:      {bad_view.rules_evaluated} "
          f"({len(bad_view.red_flags)} fired)")
    print("\n  Note: the invented sentence would have been the dangerous one -")
    print("  the patient is in fact allergic to penicillin.")

    # ------------------------------------------------------------------ 7
    rule("7 - NOT_ASKED IS NEVER A NEGATIVE")
    for status in (AnswerStatus.NOT_ASKED, AnswerStatus.UNKNOWN):
        a = Answer("q_cp_breathless", status, Provenance.PATIENT)
        print(f"  {status.value:<12} renders as: \"{a.display()}\"")
    a = Answer("q_cp_breathless", AnswerStatus.ANSWERED, Provenance.PATIENT,
               value=False)
    print(f"  {'ANSWERED(no)':<12} renders as: \"{a.display()}\"")
    print(f"\n  Allergies never asked -> \"{AllergyStatus.NOT_ASKED.display()}\"")
    print(f"  Allergies asked, none -> \"{AllergyStatus.NONE_KNOWN.display()}\"")
    print("\n  Three distinct clinical facts. Three distinct renderings.")

    rule()
    print("  Every behaviour above is deterministic and unit-tested.")
    print("  Run:  python -m pytest tests/ -v")
    rule()


def _print_view(view) -> None:
    print(f"  Mode:          {view.generation_mode.value}")
    print(f"  Model calls:   {view.model_calls}")
    print(f"  Verification:  {view.verification.result.value} "
          f"({view.verification.checked} statements checked)")
    print()
    if view.red_flags:
        for f in view.red_flags:
            print(f"  RED FLAG - {f.rule_key} - {f.severity.value}")
            print(f"     {f.message}")
            print(f"     Action: {f.suggested_action}")
            print("     Triggered by:")
            for path, val in f.input_snapshot.items():
                shown = val.get("value", val) if isinstance(val, dict) else val
                print(f"        - {path} = {shown}")
            print()
    else:
        print(f"  {view.red_flag_wording()}\n")

    print("  SUMMARY (every statement traced to a source):")
    for s in view.statements:
        print(f"     • {s.text}")
        print(f"       source: {s.source_span_id}")
    print()
    print("  MISSING INFORMATION (named, not implied by absence):")
    for m in view.missing_information:
        print(f"     [ ] {m['question_key']} - {m['reason']}")


def _wrap(text: str, width: int) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


if __name__ == "__main__":
    main()

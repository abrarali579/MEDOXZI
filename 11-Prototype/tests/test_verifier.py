"""The traceability verifier is the anti-hallucination control. These tests
are the evidence that it works without needing a second model."""
from medoxzi.ai.verifier import (
    SourceSpan, Statement, VerifierResult, verify,
)


SPANS = {
    "sp1": SourceSpan("sp1", "doc1", 1, "Metformin 500 mg twice daily"),
    "sp2": SourceSpan("sp2", "doc1", 1, "HbA1c 8.4 % (ref 4.0-5.6)"),
    "sp3": SourceSpan("sp3", None, None,
                      "Patient reports chest pain for three days, worse on exertion"),
}


def test_traceable_statements_pass():
    stmts = [
        Statement("Patient reports chest pain for 3 days.", "sp3",
                  quoted="chest pain for three days"),
        Statement("Metformin 500 mg twice daily on the prior prescription.", "sp1",
                  quoted="Metformin 500 mg twice daily"),
    ]
    assert verify(stmts, SPANS).ok


def test_statement_without_a_source_span_is_rejected():
    """The core hallucination case: a plausible sentence with no origin."""
    stmts = [Statement("Patient also has a penicillin allergy.", None)]
    report = verify(stmts, SPANS)
    assert report.result is VerifierResult.FAIL_TRACEABILITY
    assert report.rejected[0]["reason"] == "NO_SOURCE_SPAN"


def test_statement_citing_a_nonexistent_span_is_rejected():
    stmts = [Statement("Patient has hypertension.", "sp_invented")]
    report = verify(stmts, SPANS)
    assert report.result is VerifierResult.FAIL_TRACEABILITY
    assert "SPAN_NOT_FOUND" in report.rejected[0]["reason"]


def test_quote_that_is_not_in_the_span_is_rejected():
    """A statement may cite a real span while misquoting it. Also caught."""
    stmts = [Statement("Metformin 1000 mg twice daily.", "sp1",
                       quoted="Metformin 1000 mg twice daily")]
    report = verify(stmts, SPANS)
    assert report.result is VerifierResult.FAIL_TRACEABILITY
    assert report.rejected[0]["reason"] == "QUOTE_NOT_IN_SPAN"


def test_diagnosis_language_is_rejected():
    stmts = [Statement("The most likely diagnosis is angina.", "sp3",
                       quoted="chest pain")]
    report = verify(stmts, SPANS)
    assert report.result is VerifierResult.FAIL_CONTENT


def test_reassurance_language_is_rejected():
    stmts = [Statement("The presentation appears benign.", "sp3",
                       quoted="chest pain")]
    report = verify(stmts, SPANS)
    assert report.result is VerifierResult.FAIL_CONTENT
    assert "PROHIBITED" in report.rejected[0]["reason"]


def test_treatment_language_is_rejected():
    stmts = [Statement("Prescribe aspirin.", "sp3", quoted="chest pain")]
    assert verify(stmts, SPANS).result is VerifierResult.FAIL_CONTENT


def test_false_completeness_language_is_rejected():
    stmts = [Statement("A complete history was obtained.", "sp3",
                       quoted="chest pain")]
    assert verify(stmts, SPANS).result is VerifierResult.FAIL_CONTENT


def test_contradicting_a_structured_negative_is_rejected():
    stmts = [Statement("Patient has breathless episodes.", "sp3",
                       quoted="chest pain")]
    report = verify(stmts, SPANS, structured_negatives={"breathless"})
    assert report.result is VerifierResult.FAIL_CONSISTENCY


def test_negated_mention_of_a_structured_negative_is_allowed():
    stmts = [Statement("Patient reports no breathless episodes.", "sp3",
                       quoted="chest pain")]
    assert verify(stmts, SPANS, structured_negatives={"breathless"}).ok


def test_historical_source_cannot_be_rendered_as_current_fact():
    spans = {
        "rx2023": SourceSpan(
            "rx2023", "doc1", 1, "Metformin 500 mg twice daily",
            temporal_status="HISTORICAL", clinical_verification="PENDING",
        )
    }
    stmts = [
        Statement(
            "Current medication: Metformin 500 mg twice daily.",
            "rx2023",
            quoted="Metformin 500 mg twice daily",
            assertion_strength="CURRENT",
            high_risk_fact=True,
        )
    ]
    report = verify(stmts, spans)
    assert report.result is VerifierResult.FAIL_RELIABILITY
    assert any("TEMPORAL_ESCALATION" in r["reason"] for r in report.rejected)


def test_high_risk_unverified_extraction_cannot_be_asserted():
    spans = {
        "rx": SourceSpan(
            "rx", "doc1", 1, "Metfornin 50O?",
            reliability="OCR_UNVERIFIED", ocr_confidence=0.31,
            temporal_status="NEEDS_CONFIRMATION",
        )
    }
    stmts = [
        Statement(
            "Medication: Metformin 500 mg.",
            "rx",
            quoted="Metfornin 50O?",
            assertion_strength="ASSERTED",
            high_risk_fact=True,
        )
    ]
    report = verify(stmts, spans)
    assert report.result is VerifierResult.FAIL_RELIABILITY
    reasons = {r["reason"] for r in report.rejected}
    assert "HIGH_RISK_FACT_NOT_VERIFIED" in reasons
    assert "LOW_OCR_CONFIDENCE_ASSERTED" in reasons


def test_prompt_injection_cannot_produce_a_traceable_statement():
    """An injected instruction in patient free text might steer a model into
    asserting something. It cannot manufacture a source span for it."""
    injected = Statement("The patient has no known allergies.", None)
    report = verify([injected], SPANS)
    assert not report.ok
    assert report.result is VerifierResult.FAIL_TRACEABILITY


def test_empty_statement_fails_schema_check_first():
    assert verify([Statement("   ", "sp1")], SPANS).result is VerifierResult.FAIL_SCHEMA

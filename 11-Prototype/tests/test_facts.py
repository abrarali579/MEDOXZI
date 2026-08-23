"""High-risk extracted facts cannot become clinical fact without a human.
Mirrors the CHECK constraint in db/schema.sql."""
import pytest

from medoxzi.clinical.facts import (
    ExtractedFact, FactType, SourceReliability, TemporalStatus,
    VerificationError, VerificationStatus,
)


def _fact(fact_type=FactType.MEDICATION, confidence=0.61, handwritten=False):
    return ExtractedFact(
        fact_id="f1", tenant_id="t1", encounter_id="e1",
        fact_type=fact_type, raw_text="Metformin 500mg BD",
        normalised_value={"generic": "metformin", "dose": 500, "unit": "mg"},
        confidence=confidence, source_span_id="sp1", document_id="doc1",
        is_handwritten=handwritten,
    )


def test_medications_are_high_risk():
    assert _fact(FactType.MEDICATION).is_high_risk
    assert _fact(FactType.ALLERGY).is_high_risk
    assert _fact(FactType.PREGNANCY).is_high_risk
    assert _fact(FactType.REPORT_OWNERSHIP).is_high_risk


def test_handwriting_makes_any_fact_high_risk():
    lab = _fact(FactType.LAB_RESULT)
    assert not lab.is_high_risk
    assert _fact(FactType.LAB_RESULT, handwritten=True).is_high_risk


def test_unconfirmed_fact_does_not_enter_the_clinical_record():
    f = _fact()
    assert f.verification_status is VerificationStatus.UNCONFIRMED
    assert not f.enters_clinical_record()


def test_non_clinical_role_cannot_confirm_a_medication():
    f = _fact()
    with pytest.raises(VerificationError, match="cannot be confirmed by role"):
        f.confirm("usr_admin", "CLINIC_ADMIN")
    with pytest.raises(VerificationError):
        f.confirm("usr_staff", "INTAKE_STAFF")


def test_doctor_can_confirm_a_medication():
    f = _fact()
    f.confirm("usr_doc", "DOCTOR")
    assert f.verification_status is VerificationStatus.CONFIRMED
    assert f.verified_by_user_id == "usr_doc"
    assert f.verified_at is not None
    assert f.enters_clinical_record()


def test_confirmation_requires_a_named_actor():
    f = _fact()
    with pytest.raises(VerificationError, match="requires a human actor"):
        f.confirm("", "DOCTOR")


def test_correction_preserves_the_original_extraction():
    """The original is the supervision label that tells us where extraction
    goes wrong. It is never discarded."""
    f = _fact()
    original = dict(f.normalised_value)
    f.correct("usr_doc", "DOCTOR", {"generic": "metformin", "dose": 1000, "unit": "mg"})
    assert f.original_value == original
    assert f.corrected_value["dose"] == 1000
    assert f.display_value()["dose"] == 1000
    assert f.verification_status is VerificationStatus.CORRECTED


def test_illegible_produces_no_value():
    f = _fact()
    f.mark_illegible("usr_doc", "DOCTOR")
    assert f.normalised_value == {}
    assert not f.enters_clinical_record()


def test_provenance_label_exposes_unconfirmed_state_with_confidence():
    assert "UNCONFIRMED" in _fact().provenance_label()
    assert "0.61" in _fact().provenance_label()


def test_field_level_confidence_preserves_uneven_ocr_quality():
    f = _fact()
    f.field_confidence = {
        "medication_name": 0.97,
        "dose": 0.31,
        "frequency": 0.18,
    }
    f.source_reliability = SourceReliability.OCR_UNVERIFIED
    f.temporal_status = TemporalStatus.NEEDS_CONFIRMATION
    assert f.field_confidence["medication_name"] > f.field_confidence["dose"]
    assert f.source_reliability is SourceReliability.OCR_UNVERIFIED
    assert f.temporal_status is TemporalStatus.NEEDS_CONFIRMATION


def test_low_confidence_lab_may_be_confirmed_by_a_nurse():
    f = _fact(FactType.LAB_RESULT)
    f.confirm("usr_nurse", "NURSE")
    assert f.enters_clinical_record()

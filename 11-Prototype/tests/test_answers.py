"""NOT_ASKED must never become 'no'. This is the defect class the blueprint
calls P1, and these are the tests that make it impossible to reintroduce."""
import pytest

from medoxzi.clinical.answers import (
    AllergyStatus, Answer, AnswerStatus, EncounterState, Provenance,
)


def test_not_asked_never_displays_as_a_negative():
    a = Answer("q_cp_exertion", AnswerStatus.NOT_ASKED, Provenance.PATIENT)
    assert a.display() == "not asked"
    assert "no" != a.display()


def test_unknown_is_distinct_from_not_asked_and_from_no():
    not_asked = Answer("q", AnswerStatus.NOT_ASKED, Provenance.PATIENT)
    unknown = Answer("q", AnswerStatus.UNKNOWN, Provenance.PATIENT)
    negative = Answer("q", AnswerStatus.ANSWERED, Provenance.PATIENT, value=False)

    assert len({not_asked.display(), unknown.display(), negative.display()}) == 3
    assert negative.display() == "no"


def test_answered_requires_a_value():
    with pytest.raises(ValueError, match="requires a value"):
        Answer("q", AnswerStatus.ANSWERED, Provenance.PATIENT)


def test_non_answer_may_not_carry_a_value():
    with pytest.raises(ValueError, match="must not carry a value"):
        Answer("q", AnswerStatus.NOT_ASKED, Provenance.PATIENT, value=False)


def test_allergy_none_known_is_not_not_asked():
    assert AllergyStatus.NONE_KNOWN.display() == "none known"
    assert AllergyStatus.NOT_ASKED.display() == "not asked"
    assert AllergyStatus.NONE_KNOWN is not AllergyStatus.NOT_ASKED


def test_allergy_defaults_to_not_asked_not_to_none():
    """An encounter that has never asked about allergies must not present as
    an encounter with no allergies."""
    state = EncounterState(encounter_id="e1", tenant_id="t1")
    assert state.allergy_status is AllergyStatus.NOT_ASKED


def test_missing_required_names_the_gaps():
    state = EncounterState(encounter_id="e1", tenant_id="t1")
    state.record(Answer("q_a", AnswerStatus.ANSWERED, Provenance.PATIENT, value=True))
    state.record(Answer("q_b", AnswerStatus.UNKNOWN, Provenance.PATIENT))

    gaps = state.missing_required(["q_a", "q_b", "q_c"])
    by_key = {g["question_key"]: g["reason"] for g in gaps}

    assert "q_a" not in by_key
    assert by_key["q_b"] == "UNKNOWN"
    assert by_key["q_c"] == "NOT_ASKED"


# ---------------------------------------------------------------- v2.1 additions

def test_unable_to_answer_is_distinct_from_unknown_and_not_asked():
    """UNABLE_TO_ANSWER says something about the patient, not the question."""
    from medoxzi.clinical.answers import PATIENT_STATE_SIGNALS

    states = [AnswerStatus.NOT_ASKED, AnswerStatus.UNKNOWN,
              AnswerStatus.DECLINED, AnswerStatus.UNABLE_TO_ANSWER]
    displays = {Answer("q", s, Provenance.STAFF).display() for s in states}
    assert len(displays) == 4, displays

    assert AnswerStatus.UNABLE_TO_ANSWER in PATIENT_STATE_SIGNALS
    assert AnswerStatus.UNKNOWN not in PATIENT_STATE_SIGNALS


def test_unable_to_answer_never_renders_as_a_negative():
    a = Answer("q_cp_exertion", AnswerStatus.UNABLE_TO_ANSWER, Provenance.STAFF)
    assert a.display() == "unable to answer"
    assert not a.is_answered
    assert a.display() != "no"


def test_unable_to_answer_may_carry_a_reason_but_not_a_value():
    Answer("q", AnswerStatus.UNABLE_TO_ANSWER, Provenance.STAFF,
           reason="patient distressed")
    with pytest.raises(ValueError, match="must not carry a value"):
        Answer("q", AnswerStatus.UNABLE_TO_ANSWER, Provenance.STAFF, value=False)


def test_patient_state_signals_are_surfaced_as_a_pattern():
    """Six unanswerable questions is a clinical signal, not six gaps."""
    state = EncounterState(encounter_id="e1", tenant_id="t1")
    for i in range(6):
        state.record(Answer(f"q_{i}", AnswerStatus.UNABLE_TO_ANSWER,
                            Provenance.STAFF, reason="patient confused"))
    state.record(Answer("q_ok", AnswerStatus.ANSWERED, Provenance.STAFF, value=True))

    signals = state.patient_state_signals()
    assert len(signals) == 6
    assert all(s.reason == "patient confused" for s in signals)


def test_unable_to_answer_counts_as_a_gap_in_completeness():
    state = EncounterState(encounter_id="e1", tenant_id="t1")
    state.record(Answer("q_a", AnswerStatus.UNABLE_TO_ANSWER, Provenance.STAFF))
    gaps = {g["question_key"]: g["reason"] for g in state.missing_required(["q_a"])}
    assert gaps["q_a"] == "UNABLE_TO_ANSWER"


def test_patient_unsure_was_deliberately_not_added():
    """Guards the ADR-024 decision against a well-meaning future PR."""
    assert not hasattr(AnswerStatus, "PATIENT_UNSURE")


def test_answer_can_carry_a_concept_code_and_locale():
    a = Answer("q_dyspnea", AnswerStatus.ANSWERED, Provenance.PATIENT, value=True,
               concept_code="SYMPTOM_DYSPNEA", original_locale="id",
               original_language_text="sesak napas")
    assert a.concept_code == "SYMPTOM_DYSPNEA"
    assert a.original_locale == "id"


def test_unmapped_free_text_keeps_a_null_concept_code():
    """Force-fitting a colloquial complaint into a concept is worse than
    leaving it unmapped and showing the doctor the patient's own words."""
    a = Answer("q_other", AnswerStatus.ANSWERED, Provenance.PATIENT,
               value="masuk angin", original_locale="id")
    assert a.concept_code is None
    assert a.value == "masuk angin"

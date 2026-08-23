"""The rule engine must be deterministic, explainable, and incapable of
treating an absent answer as a negative one."""
import pytest

from medoxzi.clinical.answers import (
    Answer, AnswerStatus, EncounterState, Provenance,
)
from medoxzi.clinical.rules import Rule, RuleError, Severity, evaluate, evaluate_all
from medoxzi.content import loader


@pytest.fixture
def pack():
    return loader.load()


def _state(**kw):
    base = dict(encounter_id="e1", tenant_id="t1", age=48,
                chief_complaint="chest_pain", ai_consent=True)
    base.update(kw)
    return EncounterState(**base)


def _rule_by_key(pack, key):
    return next(r for r in pack.rules if r.rule_key == key)


# ------------------------------------------------------------------ firing

def test_rule_fires_when_all_conditions_met(pack):
    st = _state()
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), st)
    assert res.fired
    assert res.severity is Severity.HIGH
    assert "48" in res.message


def test_rule_does_not_fire_below_threshold(pack):
    st = _state(age=30)
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    assert not evaluate(_rule_by_key(pack, "RF-CHEST-02"), st).fired


def test_boundary_value_fires(pack):
    """gte 45 means 45 fires. Boundaries are where rules go wrong."""
    st = _state(age=45)
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    assert evaluate(_rule_by_key(pack, "RF-CHEST-02"), st).fired


# ------------------------------------------------- non-answers are not "no"

def test_not_asked_does_not_satisfy_a_condition(pack):
    st = _state()
    st.record(Answer("q_cp_exertion", AnswerStatus.NOT_ASKED, Provenance.PATIENT))
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), st)
    assert not res.fired
    assert res.input_snapshot["response.q_cp_exertion"]["status"] == "NOT_ASKED"


def test_unknown_does_not_satisfy_a_condition(pack):
    st = _state()
    st.record(Answer("q_cp_exertion", AnswerStatus.UNKNOWN, Provenance.PATIENT))
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), st)
    assert not res.fired
    assert res.input_snapshot["response.q_cp_exertion"]["status"] == "UNKNOWN"


def test_absent_answer_is_recorded_as_not_asked_in_the_snapshot(pack):
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), _state())
    assert res.input_snapshot["response.q_cp_exertion"]["status"] == "NOT_ASKED"


# ---------------------------------------------------------------- scoping

def test_rule_is_skipped_outside_its_complaint_scope(pack):
    st = _state(chief_complaint="fever")
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), st)
    assert not res.fired
    assert res.skipped_reason == "OUT_OF_COMPLAINT_SCOPE"


def test_rule_is_skipped_for_excluded_cohorts(pack):
    st = _state(age=48, cohort_flags={"pregnancy"})
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    res = evaluate(_rule_by_key(pack, "RF-CHEST-02"), st)
    assert not res.fired
    assert "COHORT_EXCLUDED" in res.skipped_reason


def test_wildcard_scope_applies_to_every_complaint(pack):
    st = _state(chief_complaint="fever",
                medications=[{"generic": "warfarin",
                              "verification_status": "CONFIRMED"}])
    assert evaluate(_rule_by_key(pack, "RF-MED-01"), st).fired


# --------------------------------------------- rules read confirmed facts only

def test_unconfirmed_medication_does_not_trigger_a_rule(pack):
    """A rule must not fire on an OCR reading nobody has verified."""
    st = _state(chief_complaint="fever",
                medications=[{"generic": "warfarin",
                              "verification_status": "UNCONFIRMED"}])
    assert not evaluate(_rule_by_key(pack, "RF-MED-01"), st).fired


# --------------------------------------------------------------- integrity

def test_determinism(pack):
    st = _state()
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    rule = _rule_by_key(pack, "RF-CHEST-02")
    first = evaluate(rule, st)
    for _ in range(50):
        again = evaluate(rule, st)
        assert (again.fired, again.message) == (first.fired, first.message)


def test_every_rule_renders_to_english(pack):
    for rule in pack.rules:
        text = rule.to_english()
        assert text.startswith("IF ")
        assert "raise a" in text


def test_malformed_expression_fails_at_load_time_not_at_evaluation():
    with pytest.raises(RuleError, match="unknown operator"):
        Rule(rule_key="BAD", version="v", severity=Severity.HIGH,
             expression={"field": "patient.age", "op": "approximately", "value": 5},
             message_template="", suggested_action="", clinical_rationale="",
             chief_complaint_scope=["*"])


def test_rule_without_scope_is_rejected():
    with pytest.raises(RuleError, match="no chief_complaint_scope"):
        Rule(rule_key="BAD", version="v", severity=Severity.HIGH,
             expression={"field": "patient.age", "op": "gte", "value": 5},
             message_template="", suggested_action="", clinical_rationale="",
             chief_complaint_scope=[])


def test_type_mismatch_does_not_fire(pack):
    """Comparing a string to a number is a content defect, not a finding."""
    st = _state(age="forty-eight")
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    assert not evaluate(_rule_by_key(pack, "RF-CHEST-02"), st).fired


def test_fired_rules_are_ordered_by_severity(pack):
    st = _state(age=60)
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    st.record(Answer("q_cp_breathless", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    st.record(Answer("q_cp_duration_days", AnswerStatus.ANSWERED,
                     Provenance.PATIENT, value=2))
    results = evaluate_all(pack.rules, st)
    fired = [r for r in results if r.fired]
    assert len(fired) >= 2
    assert all(r.severity is Severity.HIGH for r in fired)

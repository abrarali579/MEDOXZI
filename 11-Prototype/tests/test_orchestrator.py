"""The gates. Consent refusal and cohort gating must produce ZERO model calls
— not 'the UI hides it', not 'we filter it later'. Zero."""
import pytest

from medoxzi.ai.orchestrator import GenerationMode, Orchestrator
from medoxzi.ai.verifier import SourceSpan, Statement
from medoxzi.clinical.answers import (
    Answer, AnswerStatus, EncounterState, Provenance,
)
from medoxzi.content import loader


@pytest.fixture
def pack():
    return loader.load()


class SpySynthesiser:
    """Stands in for the model. Counts every call so the tests can assert
    that gated paths never reach it."""

    def __init__(self, statements=None, spans=None):
        self.calls = 0
        self._statements = statements
        self._spans = spans

    def __call__(self, state):
        self.calls += 1
        spans = self._spans or {
            "sp1": SourceSpan("sp1", None, None,
                              "Patient reports chest pain, worse on exertion")
        }
        statements = self._statements or [
            Statement("Patient reports chest pain, worse on exertion.", "sp1",
                      quoted="chest pain, worse on exertion")
        ]
        return statements, spans, self.calls


def _state(**kw):
    base = dict(encounter_id="e1", tenant_id="t1", age=48,
                chief_complaint="chest_pain", ai_consent=True)
    base.update(kw)
    st = EncounterState(**base)
    st.record(Answer("q_cp_exertion", AnswerStatus.ANSWERED, Provenance.PATIENT,
                     value=True))
    return st


# ------------------------------------------------------------ consent gate

def test_consent_refusal_makes_zero_model_calls(pack):
    spy = SpySynthesiser()
    orch = Orchestrator(pack.rules, pack.required_for_completeness, spy)
    view = orch.run(_state(ai_consent=False))

    assert view.generation_mode is GenerationMode.AI_DISABLED_BY_CONSENT
    assert spy.calls == 0            # the assertion that matters
    assert view.model_calls == 0
    assert not view.statements


def test_consent_refusal_still_returns_a_usable_view(pack):
    """Refusal must be functional. The encounter proceeds normally."""
    orch = Orchestrator(pack.rules, pack.required_for_completeness,
                        SpySynthesiser())
    view = orch.run(_state(ai_consent=False))
    assert view.gate_reason is not None
    assert view.missing_information is not None


# ------------------------------------------------------------- cohort gate

@pytest.mark.parametrize("cohort", ["paediatric", "pregnancy", "elderly"])
def test_gated_cohorts_make_zero_model_calls(pack, cohort):
    spy = SpySynthesiser()
    orch = Orchestrator(pack.rules, pack.required_for_completeness, spy)
    view = orch.run(_state(cohort_flags={cohort}))

    assert view.generation_mode is GenerationMode.AI_DISABLED_BY_COHORT
    assert spy.calls == 0
    assert cohort in view.gate_reason


def test_gated_cohorts_do_not_have_rules_applied(pack):
    orch = Orchestrator(pack.rules, pack.required_for_completeness,
                        SpySynthesiser())
    view = orch.run(_state(cohort_flags={"paediatric"}))
    assert view.rules_evaluated is False
    assert view.red_flags == []


# --------------------------------------------------------------- happy path

def test_full_ai_path_fires_rules_and_verifies(pack):
    spy = SpySynthesiser()
    orch = Orchestrator(pack.rules, pack.required_for_completeness, spy)
    view = orch.run(_state())

    assert view.generation_mode is GenerationMode.SOURCE_BOUND_SUMMARY
    assert spy.calls == 1
    assert view.red_flags and view.red_flags[0].rule_key == "RF-CHEST-02"
    assert view.no_rule_triggered is False
    assert view.verification.ok


# --------------------------------------------------------------- degrading

def test_unverifiable_synthesis_degrades_instead_of_displaying(pack):
    """A summary we cannot verify is not shown at all."""
    spy = SpySynthesiser(
        statements=[Statement("Patient has no known allergies.", None)]
    )
    orch = Orchestrator(pack.rules, pack.required_for_completeness, spy)
    view = orch.run(_state())

    assert view.generation_mode is GenerationMode.AI_FAILED_SAFE
    assert view.statements == []
    assert "Verification failed" in view.gate_reason


def test_rules_still_run_when_synthesis_degrades(pack):
    """The deterministic safety layer must survive a model failure."""
    spy = SpySynthesiser(statements=[Statement("Invented.", None)])
    orch = Orchestrator(pack.rules, pack.required_for_completeness, spy)
    view = orch.run(_state())

    assert view.generation_mode is GenerationMode.AI_FAILED_SAFE
    assert view.red_flags                      # rules fired regardless
    assert view.rules_evaluated is True


def test_missing_synthesiser_degrades_gracefully(pack):
    orch = Orchestrator(pack.rules, pack.required_for_completeness, None)
    view = orch.run(_state())
    assert view.generation_mode is GenerationMode.AI_FAILED_SAFE
    assert view.red_flags


# ------------------------------------------------------------- the wording

def test_absence_of_a_flag_is_never_phrased_as_reassurance(pack):
    st = EncounterState(encounter_id="e2", tenant_id="t1", age=30,
                        chief_complaint="chest_pain", ai_consent=True)
    st.record(Answer("q_cp_exertion", AnswerStatus.NOT_ASKED, Provenance.PATIENT))

    orch = Orchestrator(pack.rules, pack.required_for_completeness,
                        SpySynthesiser())
    view = orch.run(st)

    wording = view.red_flag_wording()
    assert wording == "No rule triggered."
    for forbidden in ("no concern", "normal", "reassuring", "benign", "safe"):
        assert forbidden not in wording.lower()


def test_gated_cohort_wording_says_rules_were_not_applied(pack):
    orch = Orchestrator(pack.rules, pack.required_for_completeness,
                        SpySynthesiser())
    view = orch.run(_state(cohort_flags={"paediatric"}))
    assert view.red_flag_wording() == "Red-flag rules were not applied to this patient."


def test_empty_rule_pack_uses_clinic_approved_wording(pack):
    orch = Orchestrator([], pack.required_for_completeness, SpySynthesiser())
    view = orch.run(_state())
    assert view.red_flag_wording() == "No clinic-approved safety rules are active."


# ------------------------------------------------------------ missing info

def test_missing_information_is_always_named(pack):
    orch = Orchestrator(pack.rules, pack.required_for_completeness,
                        SpySynthesiser())
    view = orch.run(_state())
    keys = {m["question_key"] for m in view.missing_information}
    assert "q_smoking" in keys
    assert all(m["reason"] in {"NOT_ASKED", "UNKNOWN", "SKIPPED", "DECLINED", "UNABLE_TO_ANSWER"}
               for m in view.missing_information)

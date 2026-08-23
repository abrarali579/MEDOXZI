"""Pre-round orchestration.

The pipeline is a fixed DAG, not an agent. Control flow is deterministic;
only specific steps are permitted to call a model, and the gates that decide
whether a model may be called at all are evaluated *before* any model client
is constructed.

The counter that matters here is ``model_calls``. Two of the system's hardest
promises — "consent refusal means zero model calls" and "gated cohorts are
never processed by a model" — are only meaningful if they are observable.
This class makes them observable, and the tests assert on them.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from ..clinical.answers import EncounterState
from ..clinical.rules import Rule, RuleResult, evaluate_all
from .verifier import (
    SourceSpan, Statement, VerificationReport, VerifierResult, verify,
)


class GenerationMode(str, Enum):
    RAW_ONLY = "RAW_ONLY"
    STRUCTURED_ONLY = "STRUCTURED_ONLY"
    SOURCE_BOUND_SUMMARY = "SOURCE_BOUND_SUMMARY"
    PARTIAL_DOCUMENT_MODE = "PARTIAL_DOCUMENT_MODE"
    AI_DISABLED_BY_CONSENT = "AI_DISABLED_BY_CONSENT"
    AI_DISABLED_BY_COHORT = "AI_DISABLED_BY_COHORT"
    AI_FAILED_SAFE = "AI_FAILED_SAFE"

    # Backward-compatible aliases for v2.1 tests and callers. New code should
    # use the v2.2 names above because FULL_AI overstates product capability.
    FULL_AI = "SOURCE_BOUND_SUMMARY"
    RAW_DEGRADED = "AI_FAILED_SAFE"
    RAW_NO_CONSENT = "AI_DISABLED_BY_CONSENT"
    RAW_COHORT_GATED = "AI_DISABLED_BY_COHORT"


#: Cohorts for which AI generation and rule evaluation are suppressed in v1.
GATED_COHORTS = frozenset({"paediatric", "pregnancy", "elderly"})


@dataclass
class PreRoundView:
    encounter_id: str
    generation_mode: GenerationMode
    gate_reason: str | None = None
    red_flags: list[RuleResult] = field(default_factory=list)
    no_rule_triggered: bool = True
    rules_evaluated: bool = True
    approved_rules_active: bool = True
    statements: list[Statement] = field(default_factory=list)
    missing_information: list[dict] = field(default_factory=list)
    verification: VerificationReport | None = None
    model_calls: int = 0

    def red_flag_wording(self) -> str:
        """The single most important string in the product.

        The absence of a fired rule means no rule matched. It does not mean
        the patient is well, and the UI must never say that it does.
        """
        if not self.approved_rules_active:
            return "No clinic-approved safety rules are active."
        if not self.rules_evaluated:
            return "Red-flag rules were not applied to this patient."
        if self.no_rule_triggered:
            return "No rule triggered."
        return f"{len(self.red_flags)} rule(s) triggered."


class Orchestrator:
    """Runs the deterministic pipeline. The model client is injected so that
    tests can assert on whether it was called at all."""

    def __init__(self, rules: list[Rule], required_keys: list[str],
                 synthesiser=None):
        self.rules = rules
        self.required_keys = required_keys
        self.synthesiser = synthesiser  # callable(state) -> (statements, spans)

    def run(self, state: EncounterState) -> PreRoundView:
        # ---- Gate 1: consent. Evaluated before anything else, and before any
        # model client exists. Refusal must be functional, not decorative.
        if not state.ai_consent:
            return PreRoundView(
                encounter_id=state.encounter_id,
                generation_mode=GenerationMode.AI_DISABLED_BY_CONSENT,
                gate_reason="Patient declined AI processing.",
                rules_evaluated=False,
                missing_information=state.missing_required(self.required_keys),
                model_calls=0,
            )

        # ---- Gate 2: cohort. v1 is not validated for these populations, so
        # it declines to generate rather than generating something unvalidated.
        gated = GATED_COHORTS & state.cohort_flags
        if gated:
            return PreRoundView(
                encounter_id=state.encounter_id,
                generation_mode=GenerationMode.AI_DISABLED_BY_COHORT,
                gate_reason=(
                    f"Not validated for this cohort ({', '.join(sorted(gated))}). "
                    "Showing intake exactly as recorded."
                ),
                rules_evaluated=False,
                missing_information=state.missing_required(self.required_keys),
                model_calls=0,
            )

        # ---- Deterministic safety evaluation. Runs regardless of whether
        # synthesis succeeds, because rules are the part we trust most.
        results = evaluate_all(self.rules, state)
        fired = [r for r in results if r.fired]
        missing = state.missing_required(self.required_keys)
        approved_rules_active = bool(self.rules)

        if self.synthesiser is None:
            return PreRoundView(
                encounter_id=state.encounter_id,
                generation_mode=GenerationMode.AI_FAILED_SAFE,
                gate_reason="Synthesis unavailable.",
                red_flags=fired,
                no_rule_triggered=not fired,
                approved_rules_active=approved_rules_active,
                missing_information=missing,
                model_calls=0,
            )

        # ---- Synthesis (the only step here that may call a model)
        statements, spans, calls = self.synthesiser(state)

        report = verify(
            statements,
            spans,
            structured_negatives=_structured_negatives(state),
        )
        if not report.ok:
            # Degrade rather than display. A summary we cannot verify is not
            # shown at all — and the degradation is visible, never silent.
            return PreRoundView(
                encounter_id=state.encounter_id,
                generation_mode=GenerationMode.AI_FAILED_SAFE,
                gate_reason=f"Verification failed: {report.result.value}",
                red_flags=fired,
                no_rule_triggered=not fired,
                approved_rules_active=approved_rules_active,
                missing_information=missing,
                verification=report,
                model_calls=calls,
            )

        return PreRoundView(
            encounter_id=state.encounter_id,
            generation_mode=GenerationMode.SOURCE_BOUND_SUMMARY,
            red_flags=fired,
            no_rule_triggered=not fired,
            approved_rules_active=approved_rules_active,
            statements=statements,
            missing_information=missing,
            verification=report,
            model_calls=calls,
        )


def _structured_negatives(state: EncounterState) -> set[str]:
    """Terms the structured record says are absent, so that a generated
    statement asserting them positively is caught as a contradiction."""
    negatives = set()
    for key, ans in state.answers.items():
        if ans.is_answered and ans.value is False:
            negatives.add(key.replace("q_", "").replace("_", " "))
    return negatives

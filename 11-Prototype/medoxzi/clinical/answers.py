"""Answer semantics.

The single most important distinction in this system: an unanswered question,
an unknown answer, and a negative answer are three different clinical facts.
Conflating them is how an intake system tells a doctor that a patient has no
allergies when nobody ever asked.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AnswerStatus(str, Enum):
    ANSWERED = "ANSWERED"
    NOT_ASKED = "NOT_ASKED"          # nobody put the question
    UNKNOWN = "UNKNOWN"              # asked; patient does not know
    SKIPPED = "SKIPPED"              # asked; deferred, may be revisited
    DECLINED = "DECLINED"            # asked; patient refused to answer
    UNABLE_TO_ANSWER = "UNABLE_TO_ANSWER"
    """Asked; the patient *could not* answer — confusion, distress, language
    barrier, hearing difficulty, too unwell.

    The only non-answer state that is a signal about the PATIENT rather than
    about the question. A cluster of these in one encounter is itself worth
    showing to a doctor.

    Note what is deliberately absent: PATIENT_UNSURE. Its clinical
    consequence is identical to UNKNOWN, and every additional state is a
    state someone can collapse incorrectly.
    """


class Provenance(str, Enum):
    PATIENT = "PATIENT"
    CAREGIVER = "CAREGIVER"
    STAFF = "STAFF"
    DOCTOR = "DOCTOR"
    NURSE = "NURSE"
    RECORD_IMPORTED = "RECORD_IMPORTED"
    AI_EXTRACTED = "AI_EXTRACTED"
    AI_EXTRACTED_CONFIRMED = "AI_EXTRACTED_CONFIRMED"
    AI_INFERRED = "AI_INFERRED"


#: Statuses that mean "we do not have an answer". A rule or a summary must
#: never treat any of these as a negative.
NON_ANSWERS = frozenset({
    AnswerStatus.NOT_ASKED,
    AnswerStatus.UNKNOWN,
    AnswerStatus.SKIPPED,
    AnswerStatus.DECLINED,
    AnswerStatus.UNABLE_TO_ANSWER,
})

#: Non-answers that say something about the patient's condition rather than
#: about the question. Surfaced to the doctor as a pattern, not as absence.
PATIENT_STATE_SIGNALS = frozenset({AnswerStatus.UNABLE_TO_ANSWER})


@dataclass(frozen=True)
class Answer:
    """One response to one clinical question, with its provenance."""

    question_key: str
    status: AnswerStatus
    provenance: Provenance
    value: Any = None
    unit: str | None = None
    original_language_text: str | None = None
    original_locale: str | None = None      # locale at time of answering
    concept_code: str | None = None         # e.g. SYMPTOM_DYSPNEA; None if unmapped
    actor_id: str | None = None
    reason: str | None = None               # e.g. why UNABLE_TO_ANSWER

    def __post_init__(self) -> None:
        if self.status is AnswerStatus.ANSWERED and self.value is None:
            raise ValueError(
                f"{self.question_key}: status ANSWERED requires a value"
            )
        if self.status in NON_ANSWERS and self.value is not None:
            raise ValueError(
                f"{self.question_key}: status {self.status.value} must not carry a value"
            )

    @property
    def is_answered(self) -> bool:
        return self.status is AnswerStatus.ANSWERED

    def display(self) -> str:
        """Human-readable rendering. Never renders a non-answer as a negative."""
        if self.status is AnswerStatus.NOT_ASKED:
            return "not asked"
        if self.status is AnswerStatus.UNKNOWN:
            return "patient does not know"
        if self.status is AnswerStatus.SKIPPED:
            return "skipped"
        if self.status is AnswerStatus.DECLINED:
            return "declined to answer"
        if self.status is AnswerStatus.UNABLE_TO_ANSWER:
            return "unable to answer"
        if isinstance(self.value, bool):
            return "yes" if self.value else "no"
        if self.unit:
            return f"{self.value} {self.unit}"
        return str(self.value)


class AllergyStatus(str, Enum):
    """Allergy status is its own enum precisely so that NOT_ASKED cannot be
    represented as an empty list of allergies."""

    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    NONE_KNOWN = "NONE_KNOWN"   # asked; patient knows of none
    NOT_ASKED = "NOT_ASKED"     # never asked — NOT the same thing

    def display(self) -> str:
        return {
            AllergyStatus.ACTIVE: "allergies recorded",
            AllergyStatus.RESOLVED: "resolved",
            AllergyStatus.NONE_KNOWN: "none known",
            AllergyStatus.NOT_ASKED: "not asked",
        }[self]


@dataclass
class EncounterState:
    """The structured state a rule engine and a summariser read from.

    Deliberately contains only human-sourced structured values plus
    human-confirmed extracted facts. AI-inferred content never enters here —
    that separation is what keeps the safety layer deterministic.
    """

    encounter_id: str
    tenant_id: str
    age: int | None = None
    sex: str | None = None
    chief_complaint: str | None = None
    cohort_flags: set[str] = field(default_factory=set)
    answers: dict[str, Answer] = field(default_factory=dict)
    allergy_status: AllergyStatus = AllergyStatus.NOT_ASKED
    allergies: list[dict] = field(default_factory=list)
    medications: list[dict] = field(default_factory=list)
    conditions: list[dict] = field(default_factory=list)
    labs: list[dict] = field(default_factory=list)
    ai_consent: bool = False

    def answer(self, question_key: str) -> Answer | None:
        return self.answers.get(question_key)

    def record(self, ans: Answer) -> None:
        self.answers[ans.question_key] = ans

    def patient_state_signals(self) -> list[Answer]:
        """Answers that say something about the patient rather than the record.

        Rendered to the doctor as a pattern ("patient was unable to answer 6
        of 12 questions"), never silently counted as missing information.
        """
        return [a for a in self.answers.values()
                if a.status in PATIENT_STATE_SIGNALS]

    def missing_required(self, required_keys: list[str]) -> list[dict]:
        """Named gaps, so that absence is visible rather than implied."""
        gaps = []
        for key in required_keys:
            a = self.answers.get(key)
            if a is None:
                gaps.append({"question_key": key, "reason": "NOT_ASKED"})
            elif not a.is_answered:
                gaps.append({"question_key": key, "reason": a.status.value})
        return gaps

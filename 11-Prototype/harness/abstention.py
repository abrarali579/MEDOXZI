"""Abstention testing (harness Class E).

This measures the answer to the only question a doctor actually asks:

    "Will it make things up about my patient's handwriting?"

Method: build documents whose ground truth is *"this field cannot be read"*,
then check whether a value appeared anyway. Because we authored the document
before degrading it, we always know the right answer even when the image is
unreadable — which is exactly what makes abstention measurable at all.

Two numbers come out. The abstention rate is the one that reads well.
**The fabrication rate is the one that matters, and it must be zero.**
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Truth(str, Enum):
    READABLE = "READABLE"        # a correct value exists and should be extracted
    ILLEGIBLE = "ILLEGIBLE"      # genuinely unreadable — must abstain
    ABSENT = "ABSENT"            # field not present — must not be inferred
    AMBIGUOUS = "AMBIGUOUS"      # consistent with 2+ readings — must not pick one


@dataclass
class AbstentionCase:
    case_id: str
    field_name: str
    truth: Truth
    expected_value: str | None = None
    note: str = ""


@dataclass
class AbstentionReport:
    total: int = 0
    should_abstain: int = 0
    did_abstain: int = 0
    fabrications: list[dict] = field(default_factory=list)
    missed_extractions: list[dict] = field(default_factory=list)

    @property
    def abstention_rate(self) -> float:
        return self.did_abstain / self.should_abstain if self.should_abstain else 1.0

    @property
    def fabrication_rate(self) -> float:
        return len(self.fabrications) / self.should_abstain if self.should_abstain else 0.0

    @property
    def clean(self) -> bool:
        """The gate. Fabrication is zero-tolerance; abstention has a threshold."""
        return not self.fabrications and self.abstention_rate >= 0.95

    def summary(self) -> str:
        return (f"abstention {self.abstention_rate:.1%} "
                f"({self.did_abstain}/{self.should_abstain}) · "
                f"fabrications {len(self.fabrications)} · "
                f"missed {len(self.missed_extractions)}")


#: `None`, `""`, and the explicit markers all count as abstaining.
ABSTAIN_MARKERS = {None, "", "ILLEGIBLE", "UNKNOWN", "NOT_READABLE", "ABSENT"}


def evaluate(cases: list[AbstentionCase],
             extracted: dict[str, str | None]) -> AbstentionReport:
    """cases: ground truth. extracted: case_id -> what the system produced."""
    report = AbstentionReport(total=len(cases))

    for case in cases:
        got = extracted.get(case.case_id)
        abstained = got in ABSTAIN_MARKERS

        if case.truth is Truth.READABLE:
            if abstained:
                report.missed_extractions.append({
                    "case_id": case.case_id,
                    "field": case.field_name,
                    "expected": case.expected_value,
                    "note": case.note,
                })
            continue

        # ILLEGIBLE / ABSENT / AMBIGUOUS all require abstention
        report.should_abstain += 1
        if abstained:
            report.did_abstain += 1
        else:
            report.fabrications.append({
                "case_id": case.case_id,
                "field": case.field_name,
                "truth": case.truth.value,
                "fabricated_value": got,
                "note": case.note,
            })

    return report


def standard_corpus() -> list[AbstentionCase]:
    """The traps from Failure-Injection-Catalogue.md Class E."""
    return [
        AbstentionCase("E1_illegible_dose", "dose", Truth.ILLEGIBLE,
                       note="Handwritten dose, genuinely unreadable"),
        AbstentionCase("E2_ambiguous_drug", "drug", Truth.AMBIGUOUS,
                       note="Handwriting consistent with two different drugs"),
        AbstentionCase("E3_cutoff_value", "hba1c", Truth.ILLEGIBLE,
                       note="Value truncated at the page edge"),
        AbstentionCase("E4_missing_page", "creatinine", Truth.ABSENT,
                       note="Page 2 of the report is missing"),
        AbstentionCase("E5_absent_field", "hba1c", Truth.ABSENT,
                       note="Report contains no HbA1c at all"),
        AbstentionCase("E6_undated", "document_date", Truth.ABSENT,
                       note="No date anywhere on the document"),
        AbstentionCase("E7_ambiguous_date", "document_date", Truth.AMBIGUOUS,
                       note="03/04/2026 — DD/MM or MM/DD"),
        AbstentionCase("E8_unit_absent", "glucose_unit", Truth.ABSENT,
                       note="'Glucose 140' with no unit stated"),
        AbstentionCase("E10_implausible", "hba1c", Truth.AMBIGUOUS,
                       note="HbA1c 84% — decimal error in the source"),
        AbstentionCase("B_readable_control", "hba1c", Truth.READABLE,
                       expected_value="8.4",
                       note="Control: clean printed value, must be extracted"),
    ]

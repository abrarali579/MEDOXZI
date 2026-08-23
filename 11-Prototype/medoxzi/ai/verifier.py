"""Traceability verifier — the deterministic anti-hallucination control.

The claim this implements: you do not need a model to check a model. Every
clinical statement a summariser produces must point at a span of text that
actually exists in its input. A statement that cannot be traced is rejected,
and the system degrades to the raw structured view rather than showing it.

This is a safety control precisely *because* it is deterministic. Asking a
second model "is this faithful?" produces an opinion; checking whether the
quoted text exists produces a fact.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum


class VerifierResult(str, Enum):
    PASS = "PASS"
    FAIL_SCHEMA = "FAIL_SCHEMA"
    FAIL_TRACEABILITY = "FAIL_TRACEABILITY"
    FAIL_CONTENT = "FAIL_CONTENT"
    FAIL_CONSISTENCY = "FAIL_CONSISTENCY"
    FAIL_RELIABILITY = "FAIL_RELIABILITY"


@dataclass
class SourceSpan:
    span_id: str
    document_id: str | None
    page: int | None
    text: str
    reliability: str = "UNSPECIFIED"
    ocr_confidence: float | None = None
    temporal_status: str = "DATE_UNKNOWN"
    clinical_verification: str = "PENDING"


@dataclass
class Statement:
    """One clinical statement produced by a summariser."""
    text: str
    source_span_id: str | None = None
    quoted: str | None = None
    assertion_strength: str = "REPORTED"
    high_risk_fact: bool = False


@dataclass
class VerificationReport:
    result: VerifierResult
    rejected: list[dict] = field(default_factory=list)
    checked: int = 0

    @property
    def ok(self) -> bool:
        return self.result is VerifierResult.PASS


#: Phrases that must never appear in clinician-facing generated text.
#: In production this list is authored by the clinical safety owner and
#: versioned with the content pack — it is clinical content, not code.
DEFAULT_PROHIBITED = [
    # diagnosis
    r"\bdiagnosis is\b", r"\bthe patient has\b", r"\bconfirmed case of\b",
    r"\bmost likely diagnosis\b",
    # treatment direction
    r"\bshould be treated with\b", r"\bprescribe\b", r"\brecommend starting\b",
    r"\byou should\b",
    # reassurance
    r"\bnothing to worry\b", r"\bappears benign\b", r"\bunlikely to be serious\b",
    r"\breassuring\b", r"\bno cause for concern\b",
    # false completeness
    r"\bcomplete history\b", r"\ball relevant information\b",
]


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def verify(
    statements: list[Statement],
    spans: dict[str, SourceSpan],
    prohibited: list[str] | None = None,
    structured_negatives: set[str] | None = None,
) -> VerificationReport:
    """Run all four guardrails in order. Any failure rejects the whole output.

    ``structured_negatives`` holds terms the structured record says are
    negated or absent; a generated statement asserting one of them positively
    is a consistency failure.
    """
    patterns = [re.compile(p, re.I) for p in (prohibited or DEFAULT_PROHIBITED)]
    negatives = structured_negatives or set()
    rejected: list[dict] = []

    # G1 · schema
    for st in statements:
        if not isinstance(st.text, str) or not st.text.strip():
            rejected.append({"statement": repr(st.text), "reason": "EMPTY_STATEMENT"})
    if rejected:
        return VerificationReport(VerifierResult.FAIL_SCHEMA, rejected, len(statements))

    # G2 · traceability — every statement must point at a span that exists,
    # and the text it claims to quote must actually be in that span.
    for st in statements:
        if st.source_span_id is None:
            rejected.append({"statement": st.text, "reason": "NO_SOURCE_SPAN"})
            continue
        span = spans.get(st.source_span_id)
        if span is None:
            rejected.append({"statement": st.text,
                             "reason": f"SPAN_NOT_FOUND:{st.source_span_id}"})
            continue
        if st.quoted and _normalise(st.quoted) not in _normalise(span.text):
            rejected.append({"statement": st.text,
                             "reason": "QUOTE_NOT_IN_SPAN",
                             "quoted": st.quoted})
    if rejected:
        return VerificationReport(VerifierResult.FAIL_TRACEABILITY, rejected,
                                  len(statements))

    # G3 · prohibited content
    for st in statements:
        for pat in patterns:
            if pat.search(st.text):
                rejected.append({"statement": st.text,
                                 "reason": f"PROHIBITED:{pat.pattern}"})
    if rejected:
        return VerificationReport(VerifierResult.FAIL_CONTENT, rejected,
                                  len(statements))

    # G4 · reliability and temporal discipline. Traceable does not mean true.
    for st in statements:
        span = spans.get(st.source_span_id or "")
        if span is None:
            continue
        high_risk_needs_review = (
            st.high_risk_fact
            and span.clinical_verification not in {"CONFIRMED", "CLINICIAN_VERIFIED"}
        )
        if high_risk_needs_review and st.assertion_strength in {"ASSERTED", "CURRENT"}:
            rejected.append({"statement": st.text,
                             "reason": "HIGH_RISK_FACT_NOT_VERIFIED"})
        if (
            span.temporal_status in {"HISTORICAL", "DATE_UNKNOWN", "NEEDS_CONFIRMATION"}
            and st.assertion_strength == "CURRENT"
        ):
            rejected.append({"statement": st.text,
                             "reason": f"TEMPORAL_ESCALATION:{span.temporal_status}"})
        if span.ocr_confidence is not None and span.ocr_confidence < 0.70:
            if st.assertion_strength in {"ASSERTED", "CURRENT"}:
                rejected.append({"statement": st.text,
                                 "reason": "LOW_OCR_CONFIDENCE_ASSERTED"})
    if rejected:
        return VerificationReport(VerifierResult.FAIL_RELIABILITY, rejected,
                                  len(statements))

    # G5 · consistency with the structured record
    for st in statements:
        low = _normalise(st.text)
        for term in negatives:
            t = _normalise(term)
            if t in low and not re.search(rf"\b(no|denies|without|absent)\b[^.]*{re.escape(t)}", low):
                rejected.append({"statement": st.text,
                                 "reason": f"CONTRADICTS_STRUCTURED_NEGATIVE:{term}"})
    if rejected:
        return VerificationReport(VerifierResult.FAIL_CONSISTENCY, rejected,
                                  len(statements))

    return VerificationReport(VerifierResult.PASS, [], len(statements))

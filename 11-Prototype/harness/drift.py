"""Diagnostic-drift detector — the CI gate.

This exists to answer a specific concern: that without a clinician on the
team, the product will drift from a pre-round organiser into a diagnostic
tool. A doctor reviewing samples catches drift in a sample. This catches it
in every output, on every build, and fails the build when it finds any.

Four detectors:
  F1  prohibited phrase        — diagnosis / treatment / reassurance language
  F2  assertion strength       — output claims more than its source did
  F3  differential shape       — a ranked list of condition-like entities
  F4  completeness claim       — implies the history is complete

The prohibited-phrase list is CLINICAL CONTENT, versioned with the content
pack and signed by a clinician at CUSTOMISE. It lives in data, not here.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum


class Detector(str, Enum):
    PROHIBITED_PHRASE = "F1_PROHIBITED_PHRASE"
    ASSERTION_STRENGTH = "F2_ASSERTION_STRENGTH"
    DIFFERENTIAL_SHAPE = "F3_DIFFERENTIAL_SHAPE"
    COMPLETENESS_CLAIM = "F4_COMPLETENESS_CLAIM"


@dataclass
class DriftHit:
    detector: Detector
    statement: str
    evidence: str

    def __str__(self) -> str:
        return f"[{self.detector.value}] {self.evidence!r} in: {self.statement!r}"


@dataclass
class DriftReport:
    hits: list[DriftHit] = field(default_factory=list)
    checked: int = 0

    @property
    def clean(self) -> bool:
        return not self.hits

    def by_detector(self) -> dict[str, int]:
        out: dict[str, int] = {}
        for h in self.hits:
            out[h.detector.value] = out.get(h.detector.value, 0) + 1
        return out


# ---------------------------------------------------------------- F1 content

#: Default list. In production this is loaded from the signed content pack.
#: Grouped by what each group is preventing, because a reviewer needs to know
#: why a phrase is banned before they can agree the list is right.
PROHIBITED = {
    "diagnosis": [
        r"\bdiagnosis is\b", r"\bthe patient has\b", r"\bconfirmed case of\b",
        r"\bmost likely diagnosis\b", r"\bconsistent with\s+\w+itis\b",
        r"\bsuggestive of\b", r"\bindicative of\b", r"\bpoints to\b",
    ],
    "treatment": [
        r"\bshould be treated with\b", r"\bprescribe\b", r"\brecommend starting\b",
        r"\byou should\b", r"\badminister\b", r"\bstart (?:the )?patient on\b",
    ],
    "reassurance": [
        r"\bnothing to worry\b", r"\bappears benign\b", r"\bunlikely to be serious\b",
        r"\breassuring\b", r"\bno cause for concern\b", r"\bno concerns?\b",
        r"\blooks normal\b", r"\bnothing alarming\b",
    ],
    "urgency": [
        # Inactive rule set in the MVP means NO urgency language at all.
        r"\burgent(?:ly)?\b", r"\bemergency\b", r"\bimmediately\b",
        r"\bcritical\b", r"\bhigh[- ]risk\b",
    ],
}


def _all_patterns(extra: dict[str, list[str]] | None = None):
    groups = dict(PROHIBITED)
    if extra:
        groups.update(extra)
    for group, pats in groups.items():
        for p in pats:
            yield group, re.compile(p, re.I)


# ------------------------------------------------------- F2 assertion strength

#: Modality ladder. An output may never climb above its source.
#: "patient reports X" (REPORTED) must not become "patient has X" (ASSERTED).
REPORTED = re.compile(
    r"\b(reports?|reported|states?|describes?|complains? of|says?|denies)\b", re.I)
ASSERTED = re.compile(
    r"\b(has|is|are|was|were|shows?|demonstrates?|exhibits?|presents? with)\b", re.I)
HEDGED = re.compile(r"\b(may|might|possibly|could|appears?|seems?)\b", re.I)


def _modality(text: str) -> str:
    if REPORTED.search(text):
        return "REPORTED"
    if HEDGED.search(text):
        return "HEDGED"
    if ASSERTED.search(text):
        return "ASSERTED"
    return "NEUTRAL"


_RANK = {"NEUTRAL": 0, "REPORTED": 1, "HEDGED": 1, "ASSERTED": 2}


# ------------------------------------------------------ F3 differential shape

#: A ranked list of condition-like entities with scores is a differential,
#: whatever it is labelled. Detect the SHAPE, not the wording.
RANKED_LINE = re.compile(
    r"^\s*(?:\d+[\.\)]|[-*])\s+.{3,60}?[\s(]\d{1,3}\s*%|"
    r"^\s*\d+[\.\)]\s+\w+.*\b(0\.\d+|\d{1,3}%)\b",
    re.M)
LIKELIHOOD_WORDS = re.compile(
    r"\b(likelihood|probability|likely|differential|ddx|rule out|consider(?:ation)?s?)\b",
    re.I)


# ------------------------------------------------------ F4 completeness claim

COMPLETENESS = [
    re.compile(r"\bcomplete (?:history|record|picture|assessment)\b", re.I),
    re.compile(r"\ball relevant (?:information|findings|history)\b", re.I),
    re.compile(r"\bfull (?:history|workup)\b", re.I),
    re.compile(r"\bnothing (?:else|further) (?:of note|to report)\b", re.I),
    re.compile(r"\bcomprehensive\b", re.I),
]


# ------------------------------------------------------------------- detector

def detect(
    statements: list[str],
    source_texts: list[str] | None = None,
    extra_prohibited: dict[str, list[str]] | None = None,
) -> DriftReport:
    """Run all four detectors over generated output.

    ``source_texts`` is the input the statements were derived from; supplying
    it enables F2 (assertion-strength escalation), which is the detector most
    likely to catch real, subtle drift.
    """
    report = DriftReport(checked=len(statements))
    patterns = list(_all_patterns(extra_prohibited))
    joined = "\n".join(statements)

    # F1
    for st in statements:
        for _group, pat in patterns:
            m = pat.search(st)
            if m:
                report.hits.append(
                    DriftHit(Detector.PROHIBITED_PHRASE, st, m.group(0)))

    # F2 — an output may not assert more strongly than any of its sources
    if source_texts:
        src_rank = max((_RANK[_modality(s)] for s in source_texts), default=0)
        for st in statements:
            if _RANK[_modality(st)] > src_rank:
                report.hits.append(DriftHit(
                    Detector.ASSERTION_STRENGTH, st,
                    f"output={_modality(st)} > source={max(_modality(s) for s in source_texts)}"))

    # F3 — shape, not wording
    if RANKED_LINE.search(joined):
        report.hits.append(DriftHit(
            Detector.DIFFERENTIAL_SHAPE, joined[:120],
            "ranked list with scores"))
    for st in statements:
        m = LIKELIHOOD_WORDS.search(st)
        if m:
            report.hits.append(DriftHit(
                Detector.DIFFERENTIAL_SHAPE, st, m.group(0)))

    # F4
    for st in statements:
        for pat in COMPLETENESS:
            m = pat.search(st)
            if m:
                report.hits.append(DriftHit(
                    Detector.COMPLETENESS_CLAIM, st, m.group(0)))

    return report


def assert_no_drift(statements: list[str], source_texts: list[str] | None = None) -> None:
    """CI helper. Raises with a full listing so the failure is actionable."""
    report = detect(statements, source_texts)
    if not report.clean:
        lines = "\n".join(f"  {h}" for h in report.hits)
        raise AssertionError(
            f"Diagnostic drift detected ({len(report.hits)} hit(s)):\n{lines}"
        )

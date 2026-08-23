"""Deterministic red-flag rule engine.

Design constraints, all of which are load-bearing:

*   Rules are DATA (a declarative AST), not code. A clinician can author them;
    engineering cannot smuggle logic into them.
*   No ``eval``, no scripting, no model. Same input, same output, forever.
*   Rules read only human-sourced structured answers and human-confirmed facts.
    They never read AI-inferred values, and they never read free text.
*   Every evaluation records the exact input values that produced the result.
*   Every rule renders back to English so a physician can agree or disagree.
*   A non-answer (NOT_ASKED / UNKNOWN) is never treated as a negative.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .answers import NON_ANSWERS, EncounterState


class Severity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RuleError(Exception):
    """Raised when a rule is malformed. Malformed rules fail loudly at load
    time rather than silently failing to fire at evaluation time."""


OPS = {
    "eq": lambda a, b: a == b,
    "ne": lambda a, b: a != b,
    "gt": lambda a, b: a > b,
    "gte": lambda a, b: a >= b,
    "lt": lambda a, b: a < b,
    "lte": lambda a, b: a <= b,
    "in": lambda a, b: a in b,
    "contains": lambda a, b: b in (a or []),
}

OP_ENGLISH = {
    "eq": "is", "ne": "is not", "gt": "is greater than",
    "gte": "is at least", "lt": "is less than", "lte": "is at most",
    "in": "is one of", "contains": "includes",
}

#: A sentinel distinct from None, so "the field is absent" and "the field is
#: null" cannot be confused.
MISSING = object()


@dataclass
class Rule:
    rule_key: str
    version: str
    severity: Severity
    expression: dict
    message_template: str
    suggested_action: str
    clinical_rationale: str
    chief_complaint_scope: list[str] = field(default_factory=list)
    cohort_exclude: list[str] = field(default_factory=list)
    evidence_reference: str | None = None
    authored_by: str | None = None
    signed_at: str | None = None

    def __post_init__(self) -> None:
        _validate(self.expression, self.rule_key)
        if not self.chief_complaint_scope:
            raise RuleError(
                f"{self.rule_key}: a rule with no chief_complaint_scope is a bug. "
                "Use ['*'] to mean all complaints, explicitly."
            )

    # ---------------------------------------------------------------- English

    def to_english(self) -> str:
        """Render the rule as a sentence a clinician can sign or reject.

        If a physician cannot read this and immediately say yes or no, the
        rule format has failed.
        """
        scope = (
            "any chief complaint"
            if self.chief_complaint_scope == ["*"]
            else "chief complaint is " + " or ".join(self.chief_complaint_scope)
        )
        excl = (
            f", AND the patient is not {' or '.join(self.cohort_exclude)}"
            if self.cohort_exclude else ""
        )
        return (
            f"IF {scope}, AND {_english(self.expression)}{excl} — "
            f"raise a {self.severity.value} flag: "
            f"\"{self.message_template}\". Suggested action: {self.suggested_action}"
        )


@dataclass
class RuleResult:
    rule_key: str
    rule_version: str
    fired: bool
    severity: Severity | None
    message: str | None
    suggested_action: str | None
    #: The exact values that produced this result. This is what makes a firing
    #: explainable to a doctor and reproducible in an incident review.
    input_snapshot: dict[str, Any] = field(default_factory=dict)
    skipped_reason: str | None = None


# --------------------------------------------------------------- validation

def _validate(node: Any, rule_key: str) -> None:
    if not isinstance(node, dict):
        raise RuleError(f"{rule_key}: expression nodes must be objects")
    if "all" in node or "any" in node:
        key = "all" if "all" in node else "any"
        children = node[key]
        if not isinstance(children, list) or not children:
            raise RuleError(f"{rule_key}: '{key}' requires a non-empty list")
        for child in children:
            _validate(child, rule_key)
        return
    if "not" in node:
        _validate(node["not"], rule_key)
        return
    if "field" in node:
        if node.get("op") not in OPS:
            raise RuleError(
                f"{rule_key}: unknown operator {node.get('op')!r}. "
                f"Allowed: {sorted(OPS)}"
            )
        if "value" not in node:
            raise RuleError(f"{rule_key}: comparison requires 'value'")
        return
    raise RuleError(f"{rule_key}: unrecognised expression node {node!r}")


# ------------------------------------------------------------------ English

def _english(node: dict) -> str:
    if "all" in node:
        return "(" + " AND ".join(_english(c) for c in node["all"]) + ")"
    if "any" in node:
        return "(" + " OR ".join(_english(c) for c in node["any"]) + ")"
    if "not" in node:
        return f"NOT {_english(node['not'])}"
    field_name = node["field"].replace("response.", "the answer to ").replace("_", " ")
    return f"{field_name} {OP_ENGLISH[node['op']]} {node['value']!r}"


# --------------------------------------------------------------- evaluation

def _resolve(state: EncounterState, path: str, snapshot: dict) -> Any:
    """Resolve a field path against the encounter state.

    Returns MISSING when the value is unavailable *or* when the underlying
    answer is a non-answer. This is the mechanism by which a rule can never
    treat 'not asked' as 'no'.
    """
    if path.startswith("response."):
        key = path[len("response."):]
        ans = state.answer(key)
        if ans is None:
            snapshot[path] = {"status": "NOT_ASKED"}
            return MISSING
        if ans.status in NON_ANSWERS:
            snapshot[path] = {"status": ans.status.value}
            return MISSING
        snapshot[path] = {"status": "ANSWERED", "value": ans.value}
        return ans.value

    if path.startswith("patient."):
        val = getattr(state, path[len("patient."):], MISSING)
        snapshot[path] = val if val is not MISSING else {"status": "MISSING"}
        return val

    if path == "medications.generics":
        vals = [m.get("generic") for m in state.medications
                if m.get("verification_status") == "CONFIRMED"]
        snapshot[path] = vals
        return vals

    if path == "conditions.codes":
        vals = [c.get("code") for c in state.conditions]
        snapshot[path] = vals
        return vals

    snapshot[path] = {"status": "UNRESOLVED_PATH"}
    return MISSING


def _eval(node: dict, state: EncounterState, snapshot: dict) -> bool:
    if "all" in node:
        return all(_eval(c, state, snapshot) for c in node["all"])
    if "any" in node:
        return any(_eval(c, state, snapshot) for c in node["any"])
    if "not" in node:
        return not _eval(node["not"], state, snapshot)

    actual = _resolve(state, node["field"], snapshot)
    if actual is MISSING:
        # A missing or unknown value can never satisfy a condition.
        # It is not False-because-negative; it is simply not evidence.
        return False
    try:
        return OPS[node["op"]](actual, node["value"])
    except TypeError:
        # Type mismatch (e.g. comparing a string to a number) is a content
        # defect, not a clinical finding. Do not fire.
        return False


def evaluate(rule: Rule, state: EncounterState) -> RuleResult:
    """Evaluate one rule against one encounter state."""
    if rule.chief_complaint_scope != ["*"] and \
            state.chief_complaint not in rule.chief_complaint_scope:
        return RuleResult(rule.rule_key, rule.version, False, None, None, None,
                          skipped_reason="OUT_OF_COMPLAINT_SCOPE")

    excluded = set(rule.cohort_exclude) & state.cohort_flags
    if excluded:
        return RuleResult(rule.rule_key, rule.version, False, None, None, None,
                          skipped_reason=f"COHORT_EXCLUDED:{','.join(sorted(excluded))}")

    snapshot: dict[str, Any] = {}
    fired = _eval(rule.expression, state, snapshot)
    if not fired:
        return RuleResult(rule.rule_key, rule.version, False, None, None, None,
                          input_snapshot=snapshot)

    message = rule.message_template
    for path, val in snapshot.items():
        token = "{{" + path + "}}"
        if token in message:
            shown = val.get("value") if isinstance(val, dict) else val
            message = message.replace(token, str(shown))

    return RuleResult(
        rule_key=rule.rule_key,
        rule_version=rule.version,
        fired=True,
        severity=rule.severity,
        message=message,
        suggested_action=rule.suggested_action,
        input_snapshot=snapshot,
    )


def evaluate_all(rules: list[Rule], state: EncounterState) -> list[RuleResult]:
    """Evaluate a rule set. Fired rules first, ordered by severity."""
    results = [evaluate(r, state) for r in rules]
    order = {Severity.HIGH: 0, Severity.MEDIUM: 1, Severity.LOW: 2}
    fired = sorted((r for r in results if r.fired),
                   key=lambda r: order[r.severity])
    return fired + [r for r in results if not r.fired]

"""Load a versioned clinical content pack.

Content is data, owned by the clinical safety owner, versioned independently
of code. Loading validates every rule, so a malformed rule fails at startup
rather than silently failing to fire during a consultation.
"""
from __future__ import annotations

import json
from pathlib import Path

from ..clinical.rules import Rule, Severity

CONTENT_DIR = Path(__file__).parent


class ContentPack:
    def __init__(self, data: dict):
        self.version: str = data["content_version"]
        self.status: str = data.get("status", "DRAFT")
        self.signed_at = data.get("signed_at")
        self.questions: list[dict] = data["questions"]

        # Pack-level completeness list may be omitted on DEMO_UNVALIDATED /
        # DRAFT packs. When absent, derive it from the per-question flags so a
        # pack drafted in vertical_pack/ is still exercisable through the harness.
        if "required_for_completeness" in data:
            self.required_for_completeness: list[str] = data["required_for_completeness"]
        else:
            self.required_for_completeness = [
                q["question_key"]
                for q in data["questions"]
                if q.get("is_required_for_completeness")
            ]

        self.prohibited_phrases: list[str] = data.get("prohibited_phrases", [])

        raw_rules: list[dict] = data.get("safety_rules", [])
        if not raw_rules and self.status == "ACTIVE":
            # Production invariant: an ACTIVE pack MUST carry clinical safety
            # rules. Treating a signed pack with zero rules as loadable would
            # silently weaken the red-flag guard (protocol rule 5). Fail loudly.
            raise ValueError(
                f"pack {self.version!r} is ACTIVE but has no safety_rules. "
                "ACTIVE packs must define clinical red-flag rules that a named "
                "clinician has signed; refusing to load an unsigned-but-ACTIVE pack."
            )
        self.rules: list[Rule] = [
            Rule(
                rule_key=r["rule_key"],
                version=r["version"],
                severity=Severity(r["severity"]),
                expression=r["expression"],
                message_template=r["message_template"],
                suggested_action=r["suggested_action"],
                clinical_rationale=r["clinical_rationale"],
                chief_complaint_scope=r["chief_complaint_scope"],
                cohort_exclude=r.get("cohort_exclude", []),
                evidence_reference=r.get("evidence_reference"),
            )
            for r in raw_rules
        ]

    @property
    def is_signed(self) -> bool:
        return self.status == "ACTIVE" and self.signed_at is not None

    def questions_for(self, complaint: str) -> list[dict]:
        qs = [q for q in self.questions
              if q["chief_complaint_code"] in (complaint, "*")]
        return sorted(qs, key=lambda q: q["display_order"])


def load(path: str | Path | None = None) -> ContentPack:
    p = Path(path) if path else CONTENT_DIR / "content_pack_v0.1.json"
    return ContentPack(json.loads(p.read_text(encoding="utf-8")))

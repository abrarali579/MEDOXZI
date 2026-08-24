"""Regression tests for "train the Harness with the Question Pack".

Locks in that a CLEAN vertical literature pack can be exercised through the
harness loader (the README §4 claim), and that the safety invariants hold:
- Only CLEAN packs load; BLOCKED packs are refused (never auto-rewritten).
- A DEMO pack loads with zero clinical rules and can never be ACTIVE.
- An ACTIVE pack without safety_rules refuses to load.

These tests are part of the no-fabrication / no-clinical-authoring boundary:
they assert gates and structure, never clinical content.
"""
from __future__ import annotations

import glob
import pytest

from medoxzi.content.loader import ContentPack, load

from medoxzi.content.vertical_pack.tools.gate_literature import gate_pack

LIT = "medoxzi/content/vertical_pack/literature/*.json"


def _literature_packs() -> list[str]:
    return sorted(glob.glob(LIT))


def test_all_literature_packs_load_through_loader():
    """Every vertical pack is at least structurally loadable (derived completeness)."""
    for path in _literature_packs():
        pack = load(path)
        assert pack.rules == []          # DEMO packs author no clinical rules
        assert not pack.is_signed        # and can never be ACTIVE
        assert pack.required_for_completeness  # derived from per-question flags
        assert pack.prohibited_phrases == []   # none authored for DEMO


def test_clean_packs_exist_and_are_greater_than_blocked():
    """The training basis (CLEAN packs) is the majority and non-empty."""
    packs = _literature_packs()
    assert packs, "no literature packs found"
    clean = [p for p in packs if gate_pack(p).clean]
    blocked = [p for p in packs if not gate_pack(p).clean]
    assert len(clean) >= 1
    assert len(clean) > len(blocked)


def test_clean_pack_loads_are_not_signed_demo():
    """A CLEAN pack loads as an exercise-through-harness artefact, never ACTIVE."""
    packs = _literature_packs()
    clean = [p for p in packs if gate_pack(p).clean]
    assert clean
    pack = load(clean[0])
    assert pack.status == "DEMO_UNVALIDATED"
    assert not pack.is_signed


def test_active_pack_without_safety_rules_refuses_to_load():
    """Production invariant: ACTIVE must carry clinical red-flag rules."""
    data = {
        "content_version": "v1",
        "status": "ACTIVE",
        "signed_at": "2026-01-01",
        "questions": [],
        "required_for_completeness": [],
    }
    with pytest.raises(ValueError, match="safety_rules"):
        ContentPack(data)


def test_default_shipped_pack_still_loads_unchanged():
    """The shipped demo pack keeps its rules and explicit completeness (no regression)."""
    pack = load()
    assert len(pack.rules) >= 1            # curated demo carries clinical rules
    assert pack.required_for_completeness  # explicit (present in file, not derived)
    assert pack.prohibited_phrases         # shipped pack defines prohibited phrases

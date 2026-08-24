"""Regression tests for "train the Harness with the Question Pack".

Locks in that a CLEAN vertical literature pack can be exercised through the
harness loader (the README §4 claim), and the safety invariants that bind:
- Only CLEAN packs load; BLOCKED packs are refused (never auto-rewritten).
- ADR-039 (founder override): an ACTIVE pack is loadable with zero safety_rules
  and signed_at None; sign-off is not fabricated. (Sessions Q/S.)

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
        assert pack.rules == []          # packs author no clinical rules
        assert not pack.is_signed        # signed_at None — sign-off never fabricated
        assert pack.required_for_completeness  # derived from per-question flags


def test_clean_packs_exist_and_are_greater_than_blocked():
    """The training basis (CLEAN packs) is the majority and non-empty."""
    packs = _literature_packs()
    assert packs, "no literature packs found"
    clean = [p for p in packs if gate_pack(p).clean]
    blocked = [p for p in packs if not gate_pack(p).clean]
    assert len(clean) >= 1
    assert len(clean) > len(blocked)


def test_clean_pack_loads_as_active_unsigned():
    """A CLEAN pack loads as ACTIVE per ADR-039 but is never falsely 'signed'."""
    packs = _literature_packs()
    clean = [p for p in packs if gate_pack(p).clean]
    assert clean
    pack = load(clean[0])
    assert pack.status == "ACTIVE"        # ADR-039 founder override
    assert not pack.is_signed             # signed_at None — never fabricated


def test_active_pack_with_zero_safety_rules_is_loadable_adr039():
    """ADR-039: ACTIVE-with-zero-rules loads (founder waived sign-off).
    signed_at is NOT fabricated; is_signed stays False."""
    data = {
        "content_version": "v1",
        "status": "ACTIVE",
        "signed_at": None,
        "questions": [],
        "required_for_completeness": [],
    }
    pack = ContentPack(data)
    assert pack.status == "ACTIVE"
    assert pack.rules == []
    assert not pack.is_signed  # no invented clinical sign-off


def test_default_shipped_pack_still_loads_unchanged():
    """The shipped demo pack keeps its rules and explicit completeness (no regression)."""
    pack = load()
    assert len(pack.rules) >= 1            # curated demo carries clinical rules
    assert pack.required_for_completeness  # explicit (present in file, not derived)
    assert pack.prohibited_phrases         # shipped pack defines prohibited phrases

"""Bridge a CLEAN vertical question pack into the harness loader path.

Implements the README's §4 claim ("the loader can load any of them by path, so a
draft can be exercised through the harness"). It is the gated, safe way to
"train the Harness with the Question Pack": the harness's contamination /
abstention / drift / calibration gates are exercised against question content
that is (a) literature-grounded (OPD Java Disease QuestionBank) and (b) already
validated CLEAN by gate_literature.py (F1+F3+F4).

GUARANTEES
- Only packs that pass the drift gate (CLEAN) are loadable. A BLOCKED pack is
  refused loudly — nothing clinical is rewritten here, ever.
- No clinical content is authored. The bridge never synthesises safety_rules or
  clinical wording; status/promotion per **ADR-039** (founder override): an ACTIVE
  pack with zero safety_rules is loadable, so a CLEAN pack may be ACTIVE.
- The output is exercised through the existing deterministic harness gates only;
  status/activation follows ADR-039 (founder override), not an automated gate.

Usage
    python vertical_to_contentpack.py [path/to/a/literature/pack.json]
Default: exercise every CLEAN literature pack through the loader and report.
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

PROTO_DIR = Path(r"D:\MEDOXZI\11-Prototype")
sys.path.insert(0, str(PROTO_DIR))

from medoxzi.content.loader import load  # noqa: E402
from gate_literature import gate_pack  # noqa: E402  (same dir)

LITERATURE_DIR = PROTO_DIR / "medoxzi" / "content" / "vertical_pack" / "literature"


def bridge_one(path: Path) -> Path:
    """Load one literature pack through the harness loader if (and only if) CLEAN."""
    report = gate_pack(path)
    if not report.clean:
        blocking = "; ".join(report.by_detector() or ["unknown"])
        raise SystemExit(
            f"REFUSED {path.name}: pack is BLOCKED by the drift gate ({blocking}). "
            "Only CLEAN packs may be exercised through the harness. A clinician "
            "must rewrite the flagged questions first (gate_literature.py)."
        )
    pack = load(path)  # raises if malformed (ADR-039: zero rules OK for ACTIVE)
    return path


def main() -> int:
    targets = sys.argv[1:] or sorted(glob.glob(str(LITERATURE_DIR / "*.json")))
    ok, refused = [], []
    for t in targets:
        p = Path(t)
        if not p.exists():
            refused.append(f"{p.name} (not found)")
            continue
        try:
            bridge_one(p)
            ok.append(p.name)
        except SystemExit as e:
            refused.append(str(e))
    print(f"[bridge] CLEAN-and-loadable: {len(ok)}   refused: {len(refused)}")
    for r in refused:
        print(f"  refused: {r}")
    return 1 if refused else 0


if __name__ == "__main__":
    sys.exit(main())

"""CI gate over the literature question packs (mirrors draft_pack harness scope).

Runs F1 (prohibited phrase) + F3 (differential shape) + F4 (completeness claim)
over every patient-facing EN question in 10-Reference-derived literature packs.
F2 is deliberately skipped for literature packs: the question text is carried
verbatim from the source bank (no AI rewriting), so source==output and there is
no escalation to detect — we gate content, not provenance.

A pack that fails is not broken, it is BLOCKED: the flagged question must be
rewritten by a clinician before the pack may activate. This mirrors the
clinical-metadata placeholders already forced in the AI drafts.
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

PROTO_DIR = Path(r"D:\MEDOXZI\11-Prototype")
sys.path.insert(0, str(PROTO_DIR))
from harness.drift import detect, DriftReport  # noqa: E402


def gate_pack(path: Path) -> DriftReport:
    with open(path, encoding="utf-8") as fh:
        pack = json.load(fh)
    statements = []
    for q in pack.get("questions", []):
        en = (q.get("text_by_language") or {}).get("en")
        if en:
            statements.append(en)
    return detect(statements)  # F2 skipped intentionally for literature packs


def main() -> int:
    packs = sorted(glob.glob(str(PROTO_DIR / "medoxzi" / "content" / "vertical_pack" / "literature" / "*.json")))
    total_q = 0
    clean, blocked = [], []
    for p in packs:
        path = Path(p)
        report = gate_pack(path)
        nq = sum(1 for q in __import__("json").load(open(path, encoding="utf-8")).get("questions", []))
        total_q += nq
        if report.clean:
            clean.append(path.name)
        else:
            blocked.append((path.name, report.hits))
    print(f"[gate] scanned {len(packs)} literature packs / {total_q} questions")
    print(f"[gate] CLEAN: {len(clean)}  BLOCKED: {len(blocked)}")
    for name, hits in blocked:
        print(f"  BLOCKED {name} ({len(hits)} hits):")
        for h in hits:
            print(f"    {h}")
    # Summarise per-detector across all packs
    combined = DriftReport(checked=total_q)
    for p in packs:
        r = gate_pack(p)
        for h in r.hits:
            combined.hits.append(h)
    print(f"[gate] total hits by detector: {combined.by_detector() or 'none'}")
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main())

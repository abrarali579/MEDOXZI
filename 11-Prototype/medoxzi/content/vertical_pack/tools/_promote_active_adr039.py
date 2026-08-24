"""ADR-039 promotion: set all 40 literature packs to ACTIVE per founder override.

Founder separated status "ACTIVE" from clinical sign-off. `signed_at` stays None —
never fabricated. authored_by/warning updated to reference ADR-039 instead of
"requires clinician sign" (founder waived sign-off for these packs).

The 41st file in the dir (non-JSON GATE-REPORT.md or similar) is left untouched.
"""
import glob
import json
import os

LIT = os.path.join(os.path.dirname(__file__), "..", "literature")

converted = 0
missing_status = 0
for path in sorted(glob.glob(os.path.join(LIT, "*.json"))):
    with open(path, encoding="utf-8") as fh:
        d = json.load(fh)
    if "status" not in d:
        missing_status += 1
        continue
    if "authored_by" in d and "requires clinician sign" in d.get("authored_by", ""):
        d["authored_by"] = d["authored_by"].replace(
            " (requires clinician sign)", " (ADR-039 founder-activated)"
        )
    d["status"] = "ACTIVE"
    d.setdefault("safety_rules", [])  # zero rules; ADR-039 allows ACTIVE w/o rules
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(d, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    converted += 1

print(f"[promote] ACTIVE: {converted}   missing_status(files without 'status'): {missing_status}")

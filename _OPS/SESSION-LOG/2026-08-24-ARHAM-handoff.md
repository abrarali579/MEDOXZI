# Session ARHAM — MEDOXZI handoff + phase-wise setup

**Status:** COMPLETE
**Started:** 2026-08-24
**Agent:** ARHAM (Abrar's AI chief of staff, Hermes runtime)
**Human direction:** Read the whole project once so we can work phase-wise in future sessions. Maintain logs so a new session can fetch context.

## WHAT

This session did not change product scope. It onboarded ARHAM to the MEDOXZI repository, verified the baseline, closed the open session-N log, and produced this handoff so any future session can resume phase-wise without re-reading the whole repo.

Verifiable facts (Rule 1 — command + output):

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s

$ python -m harness.run
VERDICT: PASS  (9/9 gates)

$ python demo.py | tail -20
runs clean, 7 sections  (NOT_ASKED never renders as a negative)

$ node --check 14-MVP-HTML/app.js
syntax OK

$ grep -c "name:" 14-MVP-HTML/app.js
18  (synthetic demo patient records)

4-digit prototype PINs present (1049, 4729, 6184). QR surface removed.
Demo history persists in localStorage for the doctor's searchable past files.
```

Session N (HTML MVP history demo + 4-digit PINs) is now marked COMPLETE with the above evidence. Its planned work — random 4-digit PINs, QR removal, assisted-intake button removal, ~15+ synthetic demo patients, doctor past-file search — is verified implemented.

## WHY

Abrar wants to work on MEDOXZI phase-wise across future sessions. Without a standing handoff, each new session would re-read `_OPS/AGENT-PROTOCOL.md`, `STATE.md`, `ROADMAP.md`, `OPEN-THREADS.md`, the CHANGELOG, and the HTML prototype from scratch and risk inventing context. This log is the resume point.

## ENVIRONMENT NOTES (important — save yourself a failure)

- **Hermes runtime default `python` is 3.11 (hermes venv) with NO pytest and NO pip.** Do not use it for tests.
- **The project's tests run under Python 3.10 with pytest:**
  `C:/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe`
  Full command: `C:/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q` from `11-Prototype/`.
- `python -m harness.run` and `python demo.py` DO work under the runtime python too, but use the Python310 path for consistency with the repo's Windows logs.
- `node` is available for `node --check` on `14-MVP-HTML/app.js`.
- The HTML prototype is opened by pointing a browser at `14-MVP-HTML/index.html` (SVG-less, localStorage-based). A quick serve: `python -m http.server 8765 --directory 14-MVP-HTML`.

## PROJECT POSITION (current)

- **Repository:** v2.6 healthcare-first narrow MVP. GitHub: https://github.com/abrarali579/MEDOXZI
- **Sequence position:** `HEALTHCARE-FIRST MVP → VISUAL HTML MVP → SCREEN LOCK → LEAD DOCTOR CUSTOMISE + SIGN-OFF → HARNESS+HARDENING → PITCH/PILOT → CLIENT1 SHADOW → LIVE → IMPROVE → V1 FREEZE`. We are between the **visual HTML MVP** and **screen lock** — production app NOT built.
- **Bounded by ADR-035** (healthcare-first, Evidence Sprint deferred) and **ADR-036** (clinic-owned engagement allowed, MEDOXZI-owned patient marketing still banned).
- **95 tests pass, harness 9/9 gates PASS** — prototype is a safe non-clinical reference implementation.

## PHASE-WISE WORK PLAN (proposed path for future sessions)

Focused on the current position. Pick these up in order.

| # | Phase | What | Blocks when |
|---|---|---|---|
| P1 | **HTML MVP visual review + screen lock** | Founder/doctor/staff review `14-MVP-HTML/index.html` on phone/tablet dimensions; decide: one-screen-per-question vs grouped, existing-patient search placement, 4-digit PIN sufficiency, 30-second doctor brief layout, follow-up date capture placement | 🟡 OT-20 — blocks production frontend scope |
| P2 | **Production PIN identity binding design** | Backend identity constraints + audited duplicate handling for patient history lookup | 🟡 OT-21 — blocks production patient history lookup |
| P3 | **Healthcare `vertical_pack` shell + question-pack status workflow** | Empty production rules; question pack lifecycle (DRAFT → DEMO_UNVALIDATED → Lead-Doctor SIGNED) | Blocks safe v2.6 intake implementation |
| P4 | **Draft first-visit/no-report basic question pack** as DRAFT/DEMO only | Lets product/UX proceed without pretending content is signed | Must NOT become production until Lead Doctor signs |
| P5 | **Get named Lead Doctor sign-off** | OT-18 — production clinical questions are clinical behaviour | 🔴 Blocks real patient use |
| P6 | **Report attachment/source viewer** | Build before trusted extraction; unconfirmed extraction doctor-review-only | v2.6 scope |
| P7 | **Doctor conclusion: follow-up date/note capture** | Doctor value story without sending messages prematurely | Supports v2.6 |
| P8 | **Clinic-owned comms consent/opt-out/audit/template-versioning** | OT-19 — required before WhatsApp/Email reminders/check-ins go live | 🟠 Blocks production messaging |
| P9 | **PSE registration + counsel opinions** | OT-14, OT-01, OT-02 — long lead, blocks lawful healthcare operation in Indonesia | 🟠 Blocks lawful operation |

Not now: Evidence Sprint (deferred ADR-035), content licensing audit (OT-05, before scale generation), GPU quote (ADR-034 costing).

## ESSENTIAL PROTOCOL RULES (from _OPS/AGENT-PROTOCOL.md)

1. **No claim without evidence** — paste real command output; if not in VERIFICATION-LOG it did not happen.
2. **Change → propagate → verify** — grep for every value you touch; zero unexplained hits.
3. **Logs are append-only** — never rewrite a past entry; add a correction.
4. **Label claims**: [Confirmed]/[Vendor Claim]/[Third-Party Claim]/[Inference]/[Unverified]. Indonesia regulation cited from JDIH/Kemenkes primary text, quoting the article.
5. **Never silently weaken a safety gate** (zero thresholds, empty red-flag pack, shadow isolation, NOT_ASKED≠negative, high-risk human verifier, doctor signing, consent gates, no patient marketing).
6. **Session workflow:** READ (STATE → OPEN-THREADS → CHANGELOG tail) → CLAIM session in SESSION-LOG → VERIFY baseline → WORK → SWEEP → VERIFY → LOG → UPDATE STATE last.
7. **Hard boundaries:** no clinical rule content without named Lead Doctor; shadow differential unreachable; no real patient data anywhere; no marketing consent; no settled Indonesia position; no clinical performance claim from synthetic/harness.

## SESSION WORKFLOW — how a future session resumes

```bash
cd D:/MEDOXZI
# 1. READ (in this order)
#    _OPS/STATE.md → _OPS/OPEN-THREADS.md → _OPS/CHANGELOG.md (tail) → this handoff
# 2. CLAIM: add your session to _OPS/SESSION-LOG/ (status IN PROGRESS)
# 3. VERIFY baseline:
cd 11-Prototype
C:/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q   # expect 95 passed
python -m harness.run                                                                        # expect VERDICT: PASS
python demo.py | tail -20                                                                     # runs clean
# 4. WORK → 5. SWEEP (Protocol §4 greps) → 6. VERIFY → 7. LOG (CHANGELOG+OPEN-THREADS+ADRs)
# 8. UPDATE STATE.md LAST
```

## NEXT

The immediate candidate is **P1 (OT-20 screen lock)** — get founder/doctor/staff eyes on the HTML prototype and lock the screens before production frontend engineering. It is the top of STATE.md's immediate next actions and the least-blocked next step. Ask Abrar which phase to start, or begin the HTML MVP review walkthrough.

## WHY NEXT

Screen lock is the current position's gate to production frontend scope. Everything downstream (Lead Doctor customise, harness, pitch) assumes the visual flow is locked. Skipping it sends engineers into building screens that the founder/doctor have not approved. Resuming via this handoff avoids re-deriving the whole project.

## HOW

1. Re-read this handoff + STATE.md/OPEN-THREADS.md.
2. Confirm with Abrar which phase (#P1–P9) to start.
3. Follow the session workflow above. Use Python310 for tests. Keep HTML edits to `14-MVP-HTML/`.

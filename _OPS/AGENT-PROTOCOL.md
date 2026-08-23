# AGENT PROTOCOL — read this before touching anything

**This repository is worked on by multiple AI agents and by humans, at different times, without shared memory.**

That is the central engineering constraint of this project. An agent that changes a gate in one file and not in the three files that reference it does not create a small documentation problem — it creates a **clinical governance defect**, because someone later will read the wrong gate and believe it.

This protocol exists so that any agent, arriving cold, can answer five questions in under ten minutes:

| Question | Answer lives in |
|---|---|
| **What happened?** | [CHANGELOG.md](CHANGELOG.md) |
| **Why did it happen?** | [../10-Reference/Decision-Log.md](../10-Reference/Decision-Log.md) (ADRs) + session logs |
| **Where are we now?** | [STATE.md](STATE.md) |
| **What do I do next, and why?** | [OPEN-THREADS.md](OPEN-THREADS.md) |
| **How do I do it safely?** | This document |

---

## 1. The five rules

### Rule 1 — No claim without evidence

**Never write that something works. Show the command and the output.**

A summary that says *"95 tests pass"* is worth nothing to the next agent. A log entry that says:

```
$ python3 -m pytest tests/ -q
95 passed in 0.24s
```

is verifiable, dated, and reproducible.

On Windows hosts, use `python` or `py -3` instead of `python3` when the `python3`
command resolves to the Microsoft Store alias, and use PowerShell's
`Select-Object -Last 20` instead of `tail -20`. Log the exact command that
actually ran.

This applies to test results, harness runs, regulatory readings, and claims that a contradiction was fixed. **If it is not in [VERIFICATION-LOG.md](VERIFICATION-LOG.md) with evidence, it did not happen.**

> **This rule exists because it has already been broken.** The v2.2 session reported *"Resolved the 500-real-encounter sequencing issue"*. The intent was written into two documents; the two files that actually held the gate were never changed. The contradiction survived, now spread across three documents instead of two. See VERIFICATION-LOG entry V-2026-08-23-D-04.

### Rule 2 — Change, then propagate, then verify

A number, a rule, a gate, or an enum value almost never lives in one file.

**Before you consider a change done:**

```bash
grep -rn "<the old value>" --include=*.md --include=*.py .
```

Every hit is either updated or explicitly justified in your log entry. **Zero hits, or every hit accounted for.** No exceptions.

Values most likely to be duplicated: gate thresholds, retention periods, enum names, generation modes, regulatory article references, metric IDs, phase names.

### Rule 3 — Logs are append-only

Never rewrite or delete a past log entry, even one that turned out to be wrong. **Add a correction entry that references it.**

The record of a mistake and its correction is more valuable than a clean history, because the next agent needs to know which claims have already been tested and found wrong. This project has already corrected its own regulatory analysis twice — that trail is an asset, not an embarrassment.

Documents in `00-`…`13-` are living and may be rewritten. Everything in `_OPS/` except `STATE.md` and `OPEN-THREADS.md` is append-only.

### Rule 4 — Separate what you verified from what you assumed

Every factual claim carries a label. This is not decoration; it determines whether a claim may drive a decision.

| Label | Meaning | May it drive an architecture or regulatory decision alone? |
|---|---|---|
| **[Confirmed]** | Read from a primary source, with a link and a date | Yes |
| **[Vendor Claim]** | Stated by a vendor, not independently verified | No |
| **[Third-Party Claim]** | Review site, analyst, law-firm blog, journalist | No |
| **[Inference]** | Our reasoned judgement, reasoning shown | Yes, if labelled as judgement |
| **[Unverified]** | Not checked in this pass | **No.** Escalate to OPEN-THREADS |

**Regulatory claims have a stricter rule:** Indonesian regulation is cited from **JDIH / Kemenkes primary documents**, quoting the article. Law-firm summaries and practitioner blogs are pointers to the primary text, never the citation itself.

> **This rule also exists because it was broken — twice, by the same agent.** First a GR 28/2024 localisation requirement was over-generalised from one practitioner source. Then Permenkes 24/2022 Pasal 22 was read as an obligation when the verbatim text is permissive (*"dapat"*, conditioned on *keterbatasan sumber daya*). Both corrections are in [CLAIMS-REGISTER.md](CLAIMS-REGISTER.md).

### Rule 5 — Never weaken a safety gate silently

These may not be changed without an ADR and an explicit note in the changelog:

- Any gate metric whose threshold is **zero** (contamination, fabrication, drift, gate bypass, patient-surface leakage)
- The empty red-flag production pack and its signed-activation requirement
- Shadow isolation from doctor-facing paths
- `NOT_ASKED` never rendering or exporting as a negative
- High-risk facts requiring a human verifier
- Doctor-only encounter signing
- Consent and cohort gates running before any model client is constructed
- The prohibition on using patient contact data for our own marketing

**If a change makes any of these easier to bypass, stop and log it as an open thread instead of shipping it.**

---

## 2. Session workflow

```
1. READ      _OPS/STATE.md            ← where we are
             _OPS/OPEN-THREADS.md     ← what is unresolved
             _OPS/CHANGELOG.md (tail) ← what just happened
2. CLAIM     Add your session to SESSION-LOG/ with status IN PROGRESS
3. VERIFY    Re-run the checks in §3 BEFORE changing anything.
             A broken baseline you did not cause is itself a finding.
4. WORK      Make changes. Apply Rule 2 on every value you touch.
5. SWEEP     Run the contradiction sweep in §4
6. VERIFY    Re-run §3. Paste real output into VERIFICATION-LOG.md
7. LOG       CHANGELOG entry · ADRs for decisions · update OPEN-THREADS
8. UPDATE    STATE.md — this is the last thing you do
```

**Step 3 is not optional.** If you inherit a failing test suite and do not notice, your session's results are meaningless and the next agent will inherit the confusion.

## 3. The standard verification block

Run this at the start and end of every session. Paste the **real** output into VERIFICATION-LOG.md.

```bash
cd 11-Prototype

# 1. Unit and safety tests
python3 -m pytest tests/ -q

# 2. Adversarial harness (contamination, abstention, drift, calibration)
python3 -m harness.run

# 3. End-to-end deterministic walkthrough
python3 demo.py | tail -20
```

Windows PowerShell equivalent:

```powershell
Set-Location 11-Prototype

# 1. Unit and safety tests
python -m pytest tests/ -q

# 2. Adversarial harness (contamination, abstention, drift, calibration)
python -m harness.run

# 3. End-to-end deterministic walkthrough
python demo.py | Select-Object -Last 20
```

If both `python` and `py -3` exist, prefer `python` for consistency with this
repository's Windows logs. If `python` is absent but `py -3` works, use `py -3`
and record that substitution in VERIFICATION-LOG.

**Expected as of the last verified session** (update this block when it legitimately changes):

| Check | Expected |
|---|---|
| pytest | `95 passed` |
| harness | `VERDICT: PASS`, all 9 gates PASS |
| demo | runs to completion, 7 sections |

**A drop in test count is a regression until proven otherwise.** An *increase* with no new test file is also suspicious.

## 4. Contradiction sweep

Before declaring a session complete:

```bash
# Values that must be consistent everywhere
grep -rn "FULL_AI" --include=*.md --include=*.py .          # v2.2 name is SOURCE_BOUND_SUMMARY
grep -rn "No red flags\|No concerns" --include=*.md .        # must be "No clinic-approved safety rules are active"
grep -rn "25 year\|25 (dua puluh lima)" --include=*.md .     # retention consistent
grep -rn "PATIENT_UNSURE" --include=*.md --include=*.py .    # rejected by ADR-024, must not reappear
grep -rn "probability" --include=*.py 11-Prototype/          # ADR-023: shadow uses hypothesis_score
grep -rn "≥500\|500 real" --include=*.md .                   # ADR-029: gate lives at Gate 6 only
```

Windows PowerShell equivalent:

```powershell
rg -n "FULL_AI" -g "*.md" -g "*.py" .
rg -n "No red flags|No concerns" -g "*.md" .
rg -n "25 year|25 \\(dua puluh lima\\)" -g "*.md" .
rg -n "PATIENT_UNSURE" -g "*.md" -g "*.py" .
rg -n "probability" -g "*.py" 11-Prototype/
rg -n "≥500|500 real" -g "*.md" .
```

Any hit is either correct in context or a defect. **Record which, in your log entry.**

## 5. Writing a log entry

Every CHANGELOG and SESSION-LOG entry answers five things, in this order. This structure is the point of the whole system.

| Field | Question it answers |
|---|---|
| **WHAT** | What changed? Files, values, behaviour. Concrete. |
| **WHY** | What problem did it solve? Link the ADR or the open thread. |
| **EVIDENCE** | Command + output, or a primary-source quote. Not a summary. |
| **NEXT** | What must happen because of this change? |
| **WHY NEXT** | Why does that matter — what breaks if it is skipped? |
| **HOW** | Concretely how the next agent should do it. Commands, files, contacts. |

An entry without EVIDENCE is a note, not a log. An entry without NEXT/HOW leaves the next agent to re-derive your reasoning.

## 6. Things agents keep getting wrong here

Recorded so they stop recurring.

| Mistake | Why it happens | What to do instead |
|---|---|---|
| Claiming a fix that was written as intent, not implemented | Writing the *decision* in a direction document feels like doing it | Rule 2 — grep and change every occurrence |
| Over-reading a regulation from a summary | Law-firm blogs paraphrase confidently | Rule 4 — quote the article verbatim from JDIH/Kemenkes |
| Reading a permissive article as an obligation | *"dapat"* vs *"wajib"* is easy to miss in translation | Quote the Indonesian text; check for *dapat* / *wajib* / *harus* |
| Adding enum states for completeness | More states feel safer | Every state must be *rendered differently* somewhere, or it will be collapsed in code (ADR-024) |
| Renaming things across the repo without aliases | Cleanliness | Keep backward-compatible aliases and update tests — the v2.2 `GenerationMode` aliasing is the pattern to copy |
| Mixing evidence categories | A passing detector self-test feels like proof | A detector self-test is not end-to-end evidence, and synthetic is not real (see 12-Harness/Safety-Case.md) |
| Treating the doctor's diagnosis as ground truth | It is the only label available | It is a `CLINICIAN_ASSESSMENT`, often provisional (v2.2 Labels Are Not Ground Truth) |

## 7. Hard boundaries — no agent may cross these without a human decision

1. **Do not put clinical rule content into a production pack.** Packs stay empty until a named Lead Doctor signs them. An LLM-, engineer-, founder- or agent-authored rule may never become production content.
2. **Do not make the shadow differential reachable** by any doctor-, staff- or patient-facing route.
3. **Do not use real patient data** anywhere — development, tests, fixtures, demos.
4. **Do not add a consent option that permits marketing to patients.** It does not exist in the schema by design (ADR-021).
5. **Do not assert a regulatory position** as settled. Everything Indonesian is counsel-pending until counsel says otherwise.
6. **Do not claim clinical performance** from synthetic or harness results.

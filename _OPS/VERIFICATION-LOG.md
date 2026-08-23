# VERIFICATION LOG

**Append-only.** Every claim that was checked, the evidence, and the verdict.

**Format:** `V-<date>-<session>-<n>` · CLAIM · METHOD · EVIDENCE · VERDICT

**Rule:** a claim that is not here with evidence has not been verified, regardless of what any summary says.

---

## Session D — 2026-08-23 — verification of the v2.2 changes

### V-2026-08-23-D-01 · Unit tests pass
- **Claim (from v2.2 report):** "95 passed in 0.15s"
- **Method:** copied the repository out of the working folder into a clean Linux container and re-ran. Not read from a report.
- **Evidence:**
  ```
  $ cd 11-Prototype && python3 -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.24s
  ```
- **Verdict:** ✅ **CONFIRMED**

### V-2026-08-23-D-02 · Harness passes
- **Claim:** "VERDICT: PASS with 500 contamination encounters, 0 contamination, 100% abstention, 0 fabrication, 0 diagnostic drift, calibration self-test caught overconfidence"
- **Method:** re-ran `python3 -m harness.run` in the clean container.
- **Evidence:**
  ```
  PASS  H1_contamination          PASS  H16_ece_below_0.05
  PASS  H3_fabrication            PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H15_abstention            PASS  H18_low_conf_accuracy_below_0.70
  PASS  H5_drift                  PASS  calibration_detector_self_test
  PASS  drift_detector_self_test
  VERDICT: PASS
  ```
  Calibration self-test correctly flagged the deliberately overconfident sample (`ECE=0.2900`, `acc(>0.9)=0.6`).
- **Verdict:** ✅ **CONFIRMED**

### V-2026-08-23-D-03 · Demo runs
- **Method:** `python3 demo.py`
- **Evidence:** completed all 7 sections including the verifier rejecting a fabricated allergy statement while the red-flag rule still fired.
- **Verdict:** ✅ **CONFIRMED**

### V-2026-08-23-D-04 · "Resolved the 500-real-encounter sequencing issue" ⚠️
- **Claim (from v2.2 report):** the contradiction was resolved by making the requirement post-deployment evidence rather than pre-pilot proof.
- **Method:** grepped every occurrence of the gate across the repository.
- **Evidence:**
  ```
  03-Clinical/Validation-Plan.md:109  | Duration | ≥4 weeks or ≥500 encounters, whichever is later |
  08-Evaluation/Acceptance-Criteria.md:57  - [ ] Stage 4 shadow criteria met on ≥500 real encounters
  00-Executive/Revised-Direction-v2.2.md   (no mention of Stage 4 or 500)
  09-MVP/Pilot-Plan.md:39  | P1 · Operational Shadow | Week 1 onsite; real encounter count recorded, not pre-claimed |
  ```
- **Verdict:** ❌ **NOT SUBSTANTIATED.** The new intent was written into `Pilot-Plan.md` and the v2.2 direction document, but the two files that actually **hold the gate** were unchanged. The result was a **three-way inconsistency** — arguably worse than the original two-way one, because the contradiction was now less visible.
- **Action taken (session D):** fixed. Stage 4 duration is now the week-1 operational shadow with volume recorded rather than pre-claimed; the ≥500-adjudicated-encounter requirement moved to **Gate 6** (Phase 2 exposure), where a corpus of that size is genuinely needed. Recorded as **ADR-029**.
- **Why this matters beyond the fix:** this is the failure mode the whole `_OPS/` system exists to prevent — a decision written down in a summary and a direction document, believed to be done, never propagated to the files that govern behaviour. It produced **AGENT-PROTOCOL Rule 1 and Rule 2**.

### V-2026-08-23-D-05 · Regulatory downgrade of the localisation claim ⚠️ WE WERE WRONG
- **Claim (from v2.2 report):** "Downgraded broad PP 28/2024 data-localisation certainty to counsel-pending."
- **Method:** fetched the verbatim text of Permenkes 24/2022 Pasal 20–22 from **two independent primary URLs** (jdih.kemkes.go.id and keslan.kemkes.go.id) and compared to our session-C claim.
- **Evidence:** both sources returned the same verbatim text:
  > *"Dalam hal terdapat **keterbatasan sumber daya** pada Fasilitas Pelayanan Kesehatan, penyimpanan Rekam Medis Elektronik sebagaimana dimaksud dalam Pasal 20 **dapat dilakukan melalui kerja sama** dengan Penyelenggara Sistem Elektronik yang memiliki fasilitas penyimpanan data di dalam negeri."*

  The article uses **`dapat`** (may), not `wajib`/`harus` (must), and is conditioned on **`keterbatasan sumber daya`** (resource limitations).
- **Verdict:** ✅ **THE v2.2 CORRECTION IS RIGHT. Our session-C claim was too strong.**

  Session C asserted *"a clinic cannot lawfully cooperate with us unless our storage is in Indonesia."* The verbatim text does not support that as a general prohibition. The defensible reading is: **the recognised route for outsourced EMR storage requires the operator to have domestic storage.**
- **Impact:** design intent unchanged (still design for in-Indonesia storage), but the **certainty and the reason both change**. Recorded in CLAIMS-REGISTER C-03 with the full correction history. This is the **second** time this project has over-read a regulation from a non-verbatim source, which is why AGENT-PROTOCOL Rule 4 now requires quoting the article.

### V-2026-08-23-D-06 · UTF-8 content loading fix
- **Claim:** a Windows encoding bug caused 30 test errors, fixed by explicit UTF-8.
- **Method:** inspected `medoxzi/content/loader.py`.
- **Evidence:** `return ContentPack(json.loads(p.read_text(encoding="utf-8")))`
- **Verdict:** ✅ **CONFIRMED, and it was a real bug introduced in session A.** The original `p.read_text()` had no encoding argument; on Windows this defaults to the system codepage and fails on the Devanagari text in the content pack. **Genuine catch by the v2.2 agent.**

### V-2026-08-23-D-07 · Generation-mode rename is non-breaking
- **Claim:** `FULL_AI` replaced with `SOURCE_BOUND_SUMMARY` and other explicit modes.
- **Method:** inspected the enum; ran the full suite.
- **Evidence:** backward-compatible aliases retained (`FULL_AI = "SOURCE_BOUND_SUMMARY"` etc.), 95 tests pass.
- **Verdict:** ✅ **CONFIRMED, and well executed.** The rename is justified — `FULL_AI` overstated capability — and the aliasing kept older callers working. **This is the pattern to copy for future renames.**
- **Residual:** one stale doc reference in `08-Evaluation/Test-Cases.md`, fixed in session D.

### V-2026-08-23-D-08 · Verifier reliability / temporal checks
- **Claim:** verifier gained reliability, temporal and high-risk checks.
- **Method:** read the G4 block in `medoxzi/ai/verifier.py`.
- **Evidence:** rejects when (a) a high-risk fact is asserted without clinical verification, (b) a `HISTORICAL`/`DATE_UNKNOWN`/`NEEDS_CONFIRMATION` source is asserted as `CURRENT`, (c) OCR confidence <0.70 is asserted. New `FAIL_RELIABILITY` result.
- **Verdict:** ✅ **CONFIRMED, and it closes a real gap.** The session-A verifier checked *traceability* only. **"Traceable does not mean true"** is a correct and important refinement.

### V-2026-08-23-D-09 · New governance documents exist and have substance
- **Method:** read all four in full.
- **Evidence:** `Revised-Direction-v2.2.md` (906 w), `Hazard-Control-Matrix.md` (337 w, proper Hazard→Cause→Control→Verification→Residual structure), `Safety-Case.md` (258 w, claim/evidence/argument structure), `Regulatory-Boundary-Register.md` (396 w).
- **Verdict:** ✅ **CONFIRMED.** Notable additions of real substance: *Labels Are Not Ground Truth*; the evidence-category separation in the Safety Case; three-state document identity binding; explicit model/tool boundary.

### V-2026-08-23-D-10 · Session-D contradiction sweep
- **Method:** ran the sweep in AGENT-PROTOCOL §4.
- **Evidence / result:**
  | Check | Before | After |
  |---|---|---|
  | Stale `FULL_AI` in docs | 3 files (2 legitimate historical references, 1 stale) | 1 stale fixed |
  | `No red flags` / `No concerns` | 4 hits, all in correct prohibitive context | ✅ clean |
  | `PATIENT_UNSURE` reappearance | 0 in code (guarded by a test) | ✅ clean |
  | `probability` in prototype | 0 in shadow paths | ✅ clean |
  | `≥500` gate | 2 conflicting gate locations | ✅ single location (Gate 6) |
- **Verdict:** ✅ repository internally consistent as of session D.

---

## Session E — 2026-08-23 — founder constraints resolved, horizontal positioning

### V-2026-08-23-E-01 · PSE registration requirement
- **Claim to test:** does the founder's existing PT PMA (with Web/App/SaaS Dev activity) fully close the entity question?
- **Method:** researched PSE Lingkup Privat obligations across several Indonesian practitioner sources.
- **Evidence:** consistent across sources — B2B SaaS serving Indonesian users must register with Komdigi via the PSE portal (after OSS/NIB) and obtain a **TDPSE**; obligations include records maintenance, lawful access cooperation, complaint handling and incident reporting; enforcement includes **ISP-level access blocking**.
- **Verdict:** ⚠️ **PARTIALLY.** The PT PMA covers building and selling software and contracting with customers. **PSE registration is a separate obligation the entity does not satisfy.** OT-03 resolved; **OT-14 opened.**
- **Label:** [Third-Party Claim] — consistent but not primary-sourced.

### V-2026-08-23-E-02 · In-country GPU inference availability
- **Claim to test:** OT-01 assumed in-country inference might be infeasible.
- **Method:** searched Indonesian sovereign AI cloud and GPU availability; fetched trade coverage.
- **Evidence:** Lintasarta (Indosat) *GPU Merdeka* — GPUaaS with 8× NVIDIA H100 SXM, 3.35TBps bandwidth, racks to 20kW, positioned as sovereign Indonesian AI infrastructure; Indosat announced ~USD 200m AI data centre in Surakarta with NVIDIA. Launch announced Aug 2024.
- **Verdict:** ✅ **In-country inference is FEASIBLE.** Largest architectural unknown substantially de-risked. ADR-034.
- **⚠️ Not closed:** current availability, pricing and allocatable capacity are unverified. **Obtain a direct quote before committing.**
- **⚠️ Distinction preserved:** storage location ≠ processing location. A Jakarta VPS does not make inference domestic unless the model runs on it.

### V-2026-08-23-E-03 · Intended-use basis for the horizontal positioning
- **Claim to test:** does positioning as a record-keeping / information-organisation tool materially change medical device classification?
- **Method:** researched Indonesian medical device software classification criteria.
- **Evidence:** practitioner sources state classification turns on **intended use**; software qualifies when it has a **medical purpose** (diagnostic, therapeutic, monitoring) rather than administrative use; the regulatory focus is on active diagnostic/therapeutic/monitoring functions rather than support or administrative systems.
- **Verdict:** ⚠️ **DIRECTIONALLY SUPPORTED, NOT SETTLED.** The positioning argument is well-founded and materially stronger than a healthcare-only product arguing it happens not to diagnose. **But the source is a practitioner page, not a Kemenkes primary document** — and this project has over-read secondary regulatory sources twice already (C-03). Recorded as C-13 with that caution attached. OT-02 downgraded 🔴→🟠, **not closed**.
- **Critical condition added:** the argument holds only if the architecture is genuinely horizontal (ADR-031 binding rules). Marketing does not create intended use; product behaviour does.

### V-2026-08-23-E-04 · Is RECON still necessary?
- **Question from founder.**
- **Method:** re-examined each RECON question against the repositioning.
- **Evidence / analysis:** 2 of 5 questions dropped (consultation-time baseline → moves to pilot; chief-complaint frequency → becomes vertical pack content at CUSTOMISE), 1 deferred (P-Care observation), **2 became more important** (document reality — now across multiple verticals with different profiles; intake completion — same risk, different user).
- **Verdict:** **RECON as scoped: NO. A compressed Evidence Sprint: YES.** 3–5 days, mostly remote, two verticals. The one argument that survives everything: building a document extraction pipeline against imagined documents is the most expensive available mistake and it is vertical-independent. ADR-032.

### V-2026-08-23-E-05 · Can AI generate the question bank from literature?
- **Question from founder.**
- **Verdict:** **Yes for drafting, no for authorising.** The binding constraint is **licensing, not capability** — most medical literature is copyrighted and scale makes unlicensed use look deliberate. Permitted: public ministry guidance, permissively-licensed open access, universally-taught frameworks, **the customer's own licensed material**, the expert's own writing. AI drafts → automated quality gates filter → **named domain expert reviews, edits, signs**. Improvement via the existing governed offline loop only. ADR-033.
- **Additional finding:** this pipeline is not internal tooling — it **productises CUSTOMISE** and is what makes the horizontal thesis executable.

---

## Session A–C verifications (retrospective index)

Recorded for completeness; full detail in `01-Research/Research-Log.md`.

| Ref | Claim | Verdict |
|---|---|---|
| A | CDSCO MDSW risk matrix and exclusions (India) | ✅ Confirmed, primary |
| A | DPDP Rules 2025 notified 14 Nov 2025 | ✅ Confirmed, PIB |
| A | Open-source repo licences/activity (Docling, PaddleOCR, pgvector, medspaCy, Presidio, Synthea, HAPI, Medplum) | ✅ Confirmed, repo pages |
| A | Ambient scribe RCT effect sizes | ❌ Not retrieved — no figure quoted anywhere |
| C | Permenkes 24/2022 Pasal 39 — 25-year retention | ✅ Confirmed, primary |
| C | Permenkes 24/2022 Pasal 22 — read as obligation | ❌ **Superseded by V-2026-08-23-D-05** |

---

## Session F — 2026-08-23 — onboarding baseline before task assignment

### V-2026-08-23-F-01 · Literal standard verification block fails in Windows shell
- **Claim tested:** AGENT-PROTOCOL §3 standard block can be run as written.
- **Method:** ran the exact commands requested from `11-Prototype`.
- **Evidence:**
  ```
  $ python3 -m pytest tests/ -q
  Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.
  ```
  ```
  $ python3 -m harness.run
  Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.
  ```
  ```
  $ python3 demo.py | tail -20
  tail:
  Line |
     2 |  python3 demo.py | tail -20
       |                    ~~~~
       | The term 'tail' is not recognized as a name of a cmdlet, function, script file, or executable program.
  Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
  ```
- **Verdict:** ⚠️ **BROKEN BASELINE FOR THE LITERAL BLOCK ON THIS WINDOWS HOST.** `python3` and `tail` are unavailable here. Use `python` and `Select-Object -Last 20`, or update the protocol with a Windows equivalent.

### V-2026-08-23-F-02 · Windows-equivalent unit test baseline passes
- **Method:** ran `python -m pytest tests/ -q` from `11-Prototype`.
- **Evidence:**
  ```
  $ python -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.18s
  ```
- **Verdict:** ✅ **CONFIRMED** for the prototype test suite on this host.

### V-2026-08-23-F-03 · Windows-equivalent harness baseline passes
- **Method:** ran `python -m harness.run` from `11-Prototype`.
- **Evidence:**
  ```
  ==========================================================================
    MEDOXZI HARNESS
    NOT FOR CLINICAL USE - synthetic cases only
  ==========================================================================
    harness 0.1.0 - content content@0.1.0 - rules 3

  [A] Contamination - 500 concurrent encounters ...
      PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

  [E] Abstention - illegible / absent / ambiguous expected values ...
      abstention 100.0% (9/9) · fabrications 0 · missed 0

  [F] Diagnostic drift - every generated statement ...
      50 statements checked · 0 hit(s)

  [F] Drift detector self-test - known-bad statements ...
      10 hit(s) across 4 detector(s): ['F1_PROHIBITED_PHRASE', 'F2_ASSERTION_STRENGTH', 'F3_DIFFERENTIAL_SHAPE', 'F4_COMPLETENESS_CLAIM']

  [I] Calibration - well-calibrated reference sample ...
      PASS  H16_ece_below_0.05  ECE=0.0000
      PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
      PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

  [I] Calibration self-test - deliberately OVERCONFIDENT sample ...
      CAUGHT  H16_ece_below_0.05  ECE=0.2900
      CAUGHT  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.6
      pass  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.0857
      -> overconfidence detected

  ==========================================================================
    PASS  H1_contamination
    PASS  H3_fabrication
    PASS  H15_abstention
    PASS  H5_drift
    PASS  drift_detector_self_test
    PASS  H16_ece_below_0.05
    PASS  H17_high_conf_accuracy_ge_0.95
    PASS  H18_low_conf_accuracy_below_0.70
    PASS  calibration_detector_self_test

    VERDICT: PASS
  ==========================================================================
  ```
- **Verdict:** ✅ **CONFIRMED** for the synthetic harness on this host. This is architecture evidence only, not clinical performance evidence.

### V-2026-08-23-F-04 · Windows-equivalent demo baseline fails on console encoding
- **Method:** ran `python demo.py | Select-Object -Last 20` from `11-Prototype`.
- **Evidence:**
  ```
  $ python demo.py | Select-Object -Last 20
  Traceback (most recent call last):
    File "D:\MEDOXZI\AI-OPD-System\11-Prototype\demo.py", line 241, in <module>
      main()
    File "D:\MEDOXZI\AI-OPD-System\11-Prototype\demo.py", line 98, in main
      rule("1 � SAFETY RULES, RENDERED FOR CLINICIAN REVIEW")
    File "D:\MEDOXZI\AI-OPD-System\11-Prototype\demo.py", line 30, in rule
      print(f"\n{'\u2500' * W}\n  {title}\n{'\u2500' * W}")
    File "C:\Users\Abrar Ali\AppData\Local\Programs\Python\Python310\lib\encodings\cp1252.py", line 19, in encode
      return codecs.charmap_encode(input,self.errors,encoding_table)[0]
  UnicodeEncodeError: 'charmap' codec can't encode characters in position 2-79: character maps to <undefined>
  ==============================================================================
    MEDOXZI PRE-ROUND � DETERMINISTIC PIPELINE DEMONSTRATION
    NOT FOR CLINICAL USE � synthetic patient � no LLM � no network
  ==============================================================================

    Content pack: content@0.1.0   status: DRAFT   signed: False
    5 questions � 3 safety rules
  ```
- **Verdict:** ❌ **BROKEN BASELINE.** The demo does not run cleanly on this Windows console because `demo.py` prints Unicode box-drawing/bullet characters without configuring stdout or ASCII-safe output. This was not caused by this session.

### V-2026-08-23-F-05 · Windows host portability fix verified
- **Change tested:** `11-Prototype/demo.py` now configures stdout and uses ASCII-safe visible output; `_OPS/AGENT-PROTOCOL.md` now includes Windows PowerShell verification and sweep commands.
- **Method:** ran the Windows-equivalent standard verification block from `11-Prototype`.
- **Evidence:**
  ```
  $ python -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.11s
  ```
  ```
  $ python -m harness.run
  ==========================================================================
    MEDOXZI HARNESS
    NOT FOR CLINICAL USE - synthetic cases only
  ==========================================================================
    harness 0.1.0 - content content@0.1.0 - rules 3

  [A] Contamination - 500 concurrent encounters ...
      PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

  [E] Abstention - illegible / absent / ambiguous expected values ...
      abstention 100.0% (9/9) · fabrications 0 · missed 0

  [F] Diagnostic drift - every generated statement ...
      50 statements checked · 0 hit(s)

  [F] Drift detector self-test - known-bad statements ...
      10 hit(s) across 4 detector(s): ['F1_PROHIBITED_PHRASE', 'F2_ASSERTION_STRENGTH', 'F3_DIFFERENTIAL_SHAPE', 'F4_COMPLETENESS_CLAIM']

  [I] Calibration - well-calibrated reference sample ...
      PASS  H16_ece_below_0.05  ECE=0.0000
      PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
      PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

  [I] Calibration self-test - deliberately OVERCONFIDENT sample ...
      CAUGHT  H16_ece_below_0.05  ECE=0.2900
      CAUGHT  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.6
      pass  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.0857
      -> overconfidence detected

  ==========================================================================
    PASS  H1_contamination
    PASS  H3_fabrication
    PASS  H15_abstention
    PASS  H5_drift
    PASS  drift_detector_self_test
    PASS  H16_ece_below_0.05
    PASS  H17_high_conf_accuracy_ge_0.95
    PASS  H18_low_conf_accuracy_below_0.70
    PASS  calibration_detector_self_test

    VERDICT: PASS
  ==========================================================================
  ```
  ```
  $ python demo.py | Select-Object -Last 20
    Red flags STILL evaluated:      True (1 fired)

    Note: the invented sentence would have been the dangerous one -
    the patient is in fact allergic to penicillin.

  ------------------------------------------------------------------------------
    7 - NOT_ASKED IS NEVER A NEGATIVE
  ------------------------------------------------------------------------------
    NOT_ASKED    renders as: "not asked"
    UNKNOWN      renders as: "patient does not know"
    ANSWERED(no) renders as: "no"

    Allergies never asked -> "not asked"
    Allergies asked, none -> "none known"

    Three distinct clinical facts. Three distinct renderings.
  ------------------------------------------------------------------------------
    Every behaviour above is deterministic and unit-tested.
    Run:  python -m pytest tests/ -v
  ------------------------------------------------------------------------------
  ```
- **Verdict:** ✅ **CONFIRMED.** The Windows-equivalent standard block now runs cleanly, including the demo.

### V-2026-08-23-F-06 · Session-F contradiction sweep
- **Method:** ran the Windows PowerShell equivalent sweep from AGENT-PROTOCOL §4.
- **Evidence / result:**
  | Check | Result |
  |---|---|
  | `rg -n "FULL_AI" -g "*.md" -g "*.py" .` | Hits are expected: backward-compatible enum alias, protocol/search text, historical logs, and explicit "avoid FULL_AI" direction. |
  | `rg -n "No red flags|No concerns" -g "*.md" .` | Hits are expected prohibitive/historical contexts only; no doctor-facing approval wording introduced. |
  | `rg -n "25 year|25 \\(dua puluh lima\\)" -g "*.md" .` | Hits are consistent with the confirmed 25-year retention claim. |
  | `rg -n "PATIENT_UNSURE" -g "*.md" -g "*.py" .` | Hits are expected rejection/history/test contexts; no enum reintroduced. |
  | `rg -n "probability" -g "*.py" 11-Prototype/` | Single hit in drift detector prohibited-term regex. |
  | `rg -n "≥500|500 real" -g "*.md" .` | Hits are expected ADR-029/history/Gate 6 contexts; no Stage 4 reintroduction found. |
- **Verdict:** ✅ **No contradiction introduced by the Windows portability fix.**

### V-2026-08-23-F-07 · Post-propagation verification after README/run comment updates
- **Change tested:** propagated Windows-safe commands and current test count into `11-Prototype/README.md` and `11-Prototype/harness/run.py`.
- **Evidence:**
  ```
  $ python -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.12s
  ```
  ```
  $ python -m harness.run
  VERDICT: PASS
  ```
  ```
  $ python demo.py | Select-Object -Last 20
    7 - NOT_ASKED IS NEVER A NEGATIVE
  ------------------------------------------------------------------------------
    NOT_ASKED    renders as: "not asked"
    UNKNOWN      renders as: "patient does not know"
    ANSWERED(no) renders as: "no"

    Allergies never asked -> "not asked"
    Allergies asked, none -> "none known"

    Three distinct clinical facts. Three distinct renderings.
  ------------------------------------------------------------------------------
    Every behaviour above is deterministic and unit-tested.
    Run:  python -m pytest tests/ -v
  ------------------------------------------------------------------------------
  ```
- **Sweep:** reran the AGENT-PROTOCOL Windows contradiction sweep. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift detector regex; `≥500` only in ADR-029/history/Gate 6/synthetic contexts.
- **Verdict:** ✅ **Final session-F state verified.**

---

## Session G — 2026-08-23 — roadmap resume baseline

### V-2026-08-23-G-01 · Baseline verification before roadmap work
- **Method:** ran the Windows-equivalent standard verification block from `11-Prototype`.
- **Evidence:**
  ```
  $ python -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.12s
  ```
  ```
  $ python -m harness.run
  ==========================================================================
    MEDOXZI HARNESS
    NOT FOR CLINICAL USE - synthetic cases only
  ==========================================================================
    harness 0.1.0 - content content@0.1.0 - rules 3

  [A] Contamination - 500 concurrent encounters ...
      PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

  [E] Abstention - illegible / absent / ambiguous expected values ...
      abstention 100.0% (9/9) · fabrications 0 · missed 0

  [F] Diagnostic drift - every generated statement ...
      50 statements checked · 0 hit(s)

  [F] Drift detector self-test - known-bad statements ...
      10 hit(s) across 4 detector(s): ['F1_PROHIBITED_PHRASE', 'F2_ASSERTION_STRENGTH', 'F3_DIFFERENTIAL_SHAPE', 'F4_COMPLETENESS_CLAIM']

  [I] Calibration - well-calibrated reference sample ...
      PASS  H16_ece_below_0.05  ECE=0.0000
      PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
      PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

  [I] Calibration self-test - deliberately OVERCONFIDENT sample ...
      CAUGHT  H16_ece_below_0.05  ECE=0.2900
      CAUGHT  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.6
      pass  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.0857
      -> overconfidence detected

  ==========================================================================
    PASS  H1_contamination
    PASS  H3_fabrication
    PASS  H15_abstention
    PASS  H5_drift
    PASS  drift_detector_self_test
    PASS  H16_ece_below_0.05
    PASS  H17_high_conf_accuracy_ge_0.95
    PASS  H18_low_conf_accuracy_below_0.70
    PASS  calibration_detector_self_test

    VERDICT: PASS
  ==========================================================================
  ```
  ```
  $ python demo.py | Select-Object -Last 20
    Red flags STILL evaluated:      True (1 fired)

    Note: the invented sentence would have been the dangerous one -
    the patient is in fact allergic to penicillin.

  ------------------------------------------------------------------------------
    7 - NOT_ASKED IS NEVER A NEGATIVE
  ------------------------------------------------------------------------------
    NOT_ASKED    renders as: "not asked"
    UNKNOWN      renders as: "patient does not know"
    ANSWERED(no) renders as: "no"

    Allergies never asked -> "not asked"
    Allergies asked, none -> "none known"

    Three distinct clinical facts. Three distinct renderings.
  ------------------------------------------------------------------------------
    Every behaviour above is deterministic and unit-tested.
    Run:  python -m pytest tests/ -v
  ------------------------------------------------------------------------------
  ```
- **Verdict:** ✅ **Baseline clean.**

### V-2026-08-23-G-02 · ROADMAP.md lookup
- **Method:** searched for `ROADMAP.md`.
- **Evidence:**
  ```
  $ rg --files | rg '(^|[\\/])ROADMAP\.md$|ROADMAP'
  # no output
  ```
- **Verdict:** ⚠️ **ROADMAP.md was missing at session start.** Current roadmap state had to be reconstructed from `_OPS/STATE.md`, `_OPS/OPEN-THREADS.md`, and `09-MVP/Evidence-Sprint.md`.

### V-2026-08-23-G-03 · Roadmap resume work verified
- **Change tested:** created root `ROADMAP.md`, Evidence Sprint runbook/templates, propagated references, corrected stale v2.3 entry-point/sequence wording, and removed one stale MVP-scope `>=500` visible re-ranking gate.
- **File discovery evidence:**
  ```
  $ rg --files | rg '(^|[\\/])ROADMAP\.md$|Evidence-Sprint-(Runbook|Templates)\.md$'
  ROADMAP.md
  09-MVP\Evidence-Sprint-Templates.md
  09-MVP\Evidence-Sprint-Runbook.md
  ```
- **Reference propagation evidence:**
  ```
  $ rg -n "ROADMAP|Evidence-Sprint-Runbook|Evidence-Sprint-Templates" ROADMAP.md 09-MVP _OPS
  ROADMAP.md:1:# ROADMAP - MEDOXZI / AI-OPD-System v2.3
  09-MVP\Evidence-Sprint.md:12:- `ROADMAP.md` - root roadmap and current phase map.
  09-MVP\Evidence-Sprint.md:13:- `09-MVP/Evidence-Sprint-Runbook.md` - day-by-day operating plan.
  09-MVP\Evidence-Sprint.md:14:- `09-MVP/Evidence-Sprint-Templates.md` - blank capture templates.
  _OPS\OPEN-THREADS.md:42:- **Session G repository prep:** root `ROADMAP.md`, `09-MVP/Evidence-Sprint-Runbook.md`, and `09-MVP/Evidence-Sprint-Templates.md` now exist. The sprint itself has still **not** been run.
  README.md:45:**[ROADMAP.md](ROADMAP.md)** is the current operational roadmap. It was added in session G because no root roadmap file existed.
  ```
- **Stale sequence propagation evidence:**
  ```
  $ rg -n "RECON -> MVP -> HARNESS|CUSTOMISE WITH LEAD DOCTOR -> CLINIC 1|Development sequence is RECON|delivery path is RECON" README.md 00-Executive 09-MVP ROADMAP.md
  00-Executive\Revised-Direction-v2.2.md:17:RECON -> MVP -> HARNESS + SYSTEM HARDENING -> PITCH -> CUSTOMISE WITH LEAD DOCTOR -> CLINIC 1 SHADOW -> CLINIC 1 LIVE -> 2-WEEK ONSITE ASSISTANCE -> IMPROVE -> V1 FREEZE
  ```
  The remaining hit is in the intentionally historical v2.2 direction document.
- **Standard verification evidence:**
  ```
  $ python -m pytest tests/ -q
  ........................................................................ [ 75%]
  .......................                                                  [100%]
  95 passed in 0.13s
  ```
  ```
  $ python -m harness.run
  VERDICT: PASS
  ```
  ```
  $ python demo.py | Select-Object -Last 20
    7 - NOT_ASKED IS NEVER A NEGATIVE
  ------------------------------------------------------------------------------
    NOT_ASKED    renders as: "not asked"
    UNKNOWN      renders as: "patient does not know"
    ANSWERED(no) renders as: "no"

    Allergies never asked -> "not asked"
    Allergies asked, none -> "none known"

    Three distinct clinical facts. Three distinct renderings.
  ------------------------------------------------------------------------------
    Every behaviour above is deterministic and unit-tested.
    Run:  python -m pytest tests/ -v
  ------------------------------------------------------------------------------
  ```
- **Contradiction sweep:** full AGENT-PROTOCOL Windows sweep rerun. Results are contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.
- **Verdict:** ✅ **Roadmap resumed safely.** No production build started; OT-04 remains blocking until the real Evidence Sprint is run.
### V-2026-08-23-H-01 · Baseline verification before healthcare-first roadmap change

**Date:** 2026-08-23  
**Scope:** Mandatory baseline before changing roadmap/MVP direction per founder instruction to defer Evidence Sprint and proceed healthcare-first.  
**Host:** Windows PowerShell; used repository Windows equivalents (`python`, `Select-Object -Last 20`).

```
$ cd 11-Prototype
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.13s
```

```
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

[F] Drift detector self-test - known-bad statements ...
    10 hit(s) across 4 detector(s): ['F1_PROHIBITED_PHRASE', 'F2_ASSERTION_STRENGTH', 'F3_DIFFERENTIAL_SHAPE', 'F4_COMPLETENESS_CLAIM']

[I] Calibration - well-calibrated reference sample ...
    PASS  H16_ece_below_0.05  ECE=0.0000
    PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
    PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

[I] Calibration self-test - deliberately OVERCONFIDENT sample ...
    CAUGHT  H16_ece_below_0.05  ECE=0.2900
    CAUGHT  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.6
    pass  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.0857
    -> overconfidence detected

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

**Verdict:** Baseline green before changes.

### V-2026-08-23-H-02 · Healthcare-first roadmap/MVP reconciliation verified

**Date:** 2026-08-23  
**Scope:** Verified Session H documentation changes after founder decision to defer Evidence Sprint and proceed healthcare-first narrow MVP.  
**Host:** Windows PowerShell.

**Change tested:** ADR-035 added; current roadmap, MVP scope, PRD, patient UX, user flows, backlog, pilot/development docs, open threads, and README updated to reflect healthcare-first narrow MVP while preserving safety boundaries.

```
$ cd 11-Prototype
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

[F] Drift detector self-test - known-bad statements ...
    10 hit(s) across 4 detector(s): ['F1_PROHIBITED_PHRASE', 'F2_ASSERTION_STRENGTH', 'F3_DIFFERENTIAL_SHAPE', 'F4_COMPLETENESS_CLAIM']

[I] Calibration - well-calibrated reference sample ...
    PASS  H16_ece_below_0.05  ECE=0.0000
    PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
    PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

[I] Calibration self-test - deliberately OVERCONFIDENT sample ...
    CAUGHT  H16_ece_below_0.05  ECE=0.2900
    CAUGHT  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.6
    pass  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.0857
    -> overconfidence detected

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

**Propagation checks:**

```
$ rg -n "No production code before the Evidence Sprint|Cannot start MVP|Cannot start production|Run the Evidence Sprint|Decide the first vertical|red-flag indicator|No rule triggered|top-10 complaints only|EVIDENCE SPRINT -> MVP" -g "*.md" .
_OPS/STATE.md:93:| 1 | **Run the Evidence Sprint** ...
_OPS/STATE.md:94:| 2 | **Decide the first vertical in writing** ...
_OPS/STATE.md:102:- No production code before the Evidence Sprint
09-MVP/Development-Plan.md:280:As of v2.3 ...
_OPS/SESSION-LOG/2026-08-23-G-roadmap-resume.md:106:The repository now has the roadmap ...
ROADMAP.md:135:| OT-17 first vertical choice | Resolved ...
```

The `_OPS/STATE.md` hits were fixed after this check because STATE is updated last. The Development-Plan and Session-G hits are historical/contextual.

**AGENT-PROTOCOL sweep:** full Windows contradiction sweep rerun. Results are contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive or signed-rule contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** Healthcare-first narrow MVP direction is reconciled in current-facing docs without adding production clinical rule content, exposing shadow differential, using real patient data, adding marketing consent, asserting Indonesian regulatory certainty, or claiming clinical performance.

### V-2026-08-23-I-01 · Git publish verification

**Date:** 2026-08-23  
**Scope:** Verification before and after initializing/publishing the repository to GitHub.  
**Host:** Windows PowerShell.

```
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```
$ python demo.py | Select-Object -Last 20
  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```
$ git push -u origin main
branch 'main' set up to track 'origin/main'.
To https://github.com/abrarali579/MEDOXZI.git
 * [new branch]      main -> main
```

**Contradiction sweep:** Windows AGENT-PROTOCOL sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** Repository published to GitHub. Root archive copy `ziiAv6fl` was ignored because the source tree is committed separately.

---

### V-2026-08-24-J-01 · Doctor pitch playbook baseline

**Date:** 2026-08-24
**Scope:** Baseline verification before adding doctor-facing pitch points, ADR-036 and clinic-owned engagement scope.
**Host:** Windows PowerShell. `python3` was normalized to `python`; `tail -20` was normalized to `Select-Object -Last 20`.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

**Baseline verdict:** clean. No broken baseline found.

### V-2026-08-24-J-02 · Doctor pitch playbook final verification

**Date:** 2026-08-24
**Scope:** Final verification after adding `09-MVP/Doctor-Pitch-Playbook.md`, ADR-036, roadmap/backlog/PRD/GTm propagation, and OT-19.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.12s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

[I] Calibration - well-calibrated reference sample ...
    PASS  H16_ece_below_0.05  ECE=0.0000
    PASS  H17_high_conf_accuracy_ge_0.95  acc(>0.9)=0.95
    PASS  H18_low_conf_accuracy_below_0.70  acc(<0.7)=0.35

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

**Propagation checks**

```text
$ rg -n "Doctor-Pitch-Playbook|ADR-036|OT-19|v2\.5|36 ADRs" README.md ROADMAP.md 02-Product/PRD.md 09-MVP/Backlog.md 09-MVP/Go-To-Market.md _OPS/OPEN-THREADS.md 10-Reference/Decision-Log.md
10-Reference/Decision-Log.md:292:## ADR-036 · Clinic-owned patient engagement is allowed; MEDOXZI-owned marketing is still prohibited
_OPS/OPEN-THREADS.md:78:### OT-19 · Clinic-owned engagement consent/comms controls — 🟠 NEW
09-MVP/Go-To-Market.md:3:> **v2.5 update:** doctor-facing pitch language now lives in `Doctor-Pitch-Playbook.md`.
02-Product/PRD.md:10:> **v2.5 pitch/engagement direction:** doctor-facing pitch points live in `09-MVP/Doctor-Pitch-Playbook.md`.
09-MVP/Backlog.md:9:> **v2.5 amendment:** doctor pitch points live in `Doctor-Pitch-Playbook.md`.
ROADMAP.md:103:- Use `09-MVP/Doctor-Pitch-Playbook.md` for doctor-facing talking points and forbidden claims.
README.md:14:> | Why is it built this way? | [`10-Reference/Decision-Log.md`](10-Reference/Decision-Log.md) — 36 ADRs |
```

```text
$ rg -n "MEDOXZI-owned patient marketing|MEDOXZI's marketing|patient contact data|clinic-owned|clinic communications|Clinic communications" README.md ROADMAP.md 02-Product/PRD.md 09-MVP/Doctor-Pitch-Playbook.md 09-MVP/Go-To-Market.md 09-MVP/Backlog.md _OPS/OPEN-THREADS.md 10-Reference/Decision-Log.md
Hits confirm the boundary is propagated: clinic-owned communications only; patient contact data is not a MEDOXZI marketing asset; opt-out/consent/audit controls required.
```

```text
$ rg -n "possible diagnos|diagnosis suggestions|Required tests|tests suggestions|Future AI|Future differential|Gate 6" 09-MVP/Doctor-Pitch-Playbook.md 02-Product/PRD.md ROADMAP.md 10-Reference/Decision-Log.md _OPS/OPEN-THREADS.md
09-MVP/Doctor-Pitch-Playbook.md:92:### Future AI, Carefully
09-MVP/Doctor-Pitch-Playbook.md:127:| Future differential | "Future gated feature after validation." | Not MVP, not visible now. |
09-MVP/Doctor-Pitch-Playbook.md:237:| Possible diagnosis suggestions | Not visible | Gate 6+ only, after validation and counsel |
09-MVP/Doctor-Pitch-Playbook.md:238:| Required tests suggestions | Not visible | Doctor-facing support only after sign-off/validation |
```

**AGENT-PROTOCOL sweep**

```text
$ rg -n "FULL_AI" -g "*.md" -g "*.py" .
$ rg -n "No red flags|No concerns" -g "*.md" .
$ rg -n "25 year|25 \(dua puluh lima\)" -g "*.md" .
$ rg -n "PATIENT_UNSURE" -g "*.md" -g "*.py" .
$ rg -n "probability" -g "*.py" 11-Prototype/
$ rg -n "≥500|500 real" -g "*.md" .
```

Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts including the new playbook's "Things Not To Say"; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in the drift-detector prohibited-term regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** v2.5 doctor pitch scope is documented without adding production clinical rule content, exposing shadow differential, using real patient data, adding MEDOXZI-owned patient marketing, asserting Indonesian regulatory certainty, or claiming clinical performance.

### V-2026-08-24-J-03 · Post-STATE final check

**Date:** 2026-08-24
**Scope:** Final check after updating `_OPS/STATE.md` last and correcting stale current-facing v2.4 labels.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.12s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ rg -n "v2\.4" README.md ROADMAP.md _OPS/STATE.md 02-Product/PRD.md 09-MVP/Backlog.md 09-MVP/Go-To-Market.md
09-MVP/Backlog.md:7:> **v2.4 amendment:** current build is healthcare-first narrow MVP per ADR-035.
02-Product/PRD.md:8:> **v2.4 founder direction:** proceed healthcare-first and defer the Evidence Sprint.
02-Product/PRD.md:302:## v2.4 Reconciliation
README.md:115:| Changed in v2.4 | |
_OPS/STATE.md:137:| H | v2.4 healthcare-first narrow MVP adopted; Evidence Sprint deferred by founder decision; ADR-035 added |
```

**Verdict:** remaining v2.4 hits are historical/version-history references only. Current-facing status is v2.5.

---

### V-2026-08-24-K-01 · HTML MVP baseline

**Date:** 2026-08-24
**Scope:** Baseline verification before creating local phone/tablet-first HTML MVP prototype.
**Host:** Windows PowerShell. `python` and `Select-Object -Last 20` used as the Windows equivalents.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

**Baseline verdict:** clean. No broken baseline found.

### V-2026-08-24-K-02 · HTML MVP final verification

**Date:** 2026-08-24
**Scope:** Final verification after adding `14-MVP-HTML/` and propagating v2.6 references.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
```

No output; JavaScript syntax check passed.

```text
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html).StatusCode
200
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/styles.css).StatusCode
200
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/app.js).StatusCode
200
```

```text
$ rg -n "diagnosis|differential|red flag|No red flags|WhatsApp|Email|real patient|DEMO_UNVALIDATED|DEMO" 14-MVP-HTML
14-MVP-HTML\index.html:16:        <div class="status-pill">DEMO_UNVALIDATED · synthetic data only</div>
14-MVP-HTML\index.html:251:                  <textarea id="doctorNote" rows="4" placeholder="Doctor writes their own assessment here. System does not generate diagnosis."></textarea>
14-MVP-HTML\index.html:295:                <li>No AI diagnosis or differential.</li>
14-MVP-HTML\index.html:298:                <li>No real patient data.</li>
14-MVP-HTML\index.html:299:                <li>No WhatsApp/Email sending.</li>
14-MVP-HTML\MVP-Prototype-Plan.md:26:| Doctor queue and brief | Built in HTML v0.1 | Source-bound facts, no diagnosis |
14-MVP-HTML\MVP-Prototype-Plan.md:32:- No real patient data.
14-MVP-HTML\MVP-Prototype-Plan.md:36:- No WhatsApp/Email sending.
14-MVP-HTML\README.md:24:- No diagnosis.
14-MVP-HTML\README.md:26:- No visible differential.
14-MVP-HTML\README.md:27:- No production red flags.
14-MVP-HTML\README.md:28:- No real WhatsApp/Email sending.
14-MVP-HTML\README.md:29:- Demo questions are `DEMO_UNVALIDATED` and must not be used with real patients until a named Lead Doctor signs the pack.
```

**AGENT-PROTOCOL sweep:** Windows sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in the drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** local HTML MVP prototype runs without backend and does not add production clinical content, diagnosis/differential UI, live messaging, real patient data, regulatory claims or clinical performance claims.

### V-2026-08-24-K-03 · Post-STATE final check

**Date:** 2026-08-24
**Scope:** Final post-STATE verification after removing duplicate next-action row.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.15s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html).StatusCode
200
$ git diff --check
```

`node --check` and `git diff --check` produced no errors. Line-ending warnings are Git's normal Windows CRLF warning.

**Verdict:** final tree remains verified after STATE update.

---

## V-2026-08-24-M-01 - Baseline before HTML MVP polish

**Date:** 2026-08-24
**Scope:** Required pre-change verification before polishing `14-MVP-HTML/`.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

**Verdict:** baseline was green before edits.

---

## V-2026-08-24-M-02 - HTML MVP polish verification

**Date:** 2026-08-24
**Scope:** Verify returning-patient/PIN selection sync, JavaScript syntax, local static assets, and standard prototype safety boundaries after HTML MVP polish.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS - 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) - fabrications 0 - missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked - 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
```

`node --check` produced no output, which is a pass.

```text
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/app.js
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/styles.css
200
```

Returning-patient/PIN selection sync was checked with a lightweight DOM harness against `14-MVP-HTML/app.js`:

```text
{"name":"Ayesha Demo","age":"31","sex":"Female","phone":"+62 812 1111 1111","intakeName":"Ayesha Demo","intakeAge":"31","intakeSex":"Female","intakePhone":"+62 812 1111 1111","pin":"MXZ-2408-1049","brief":"Token 77 · Ayesha Demo · Female, 31 · MXZ-2408-1049","search":true}
```

Feature/boundary grep:

```text
$ rg -n "Find returning patient|Helpful details|No clinic-approved safety rules are active|Prototype · sample data|DEMO_UNVALIDATED|robot|Open doctor view|Ayesha Demo|Budi Demo|questionBanks|loadExistingPatient|clearIntakeDraft" 14-MVP-HTML
```

The grep found the new returning-patient UI, helper chips, exact mandatory safety phrase, demo boundary docs, demo patient fixtures, and new flow functions. It found no `robot` and no patient-facing `Open doctor view`.

**AGENT-PROTOCOL sweep:** full Windows sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive or historical contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in the drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** HTML MVP polish is verified. The prototype remains local/synthetic and does not add production clinical content, diagnosis/differential UI, live messaging, real patient data, regulatory claims, or clinical performance claims.

---

## V-2026-08-24-M-03 - Post-STATE final check

**Date:** 2026-08-24
**Scope:** Final verification after updating CHANGELOG, OPEN-THREADS, session log and STATE.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

```text
$ node --check 14-MVP-HTML\app.js
```

`node --check` produced no output, which is a pass.

```text
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/app.js
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/styles.css
200
```

Returning-patient/PIN selection DOM check:

```text
{"name":"Ayesha Demo","age":"31","sex":"Female","phone":"+62 812 1111 1111","intakeName":"Ayesha Demo","intakeAge":"31","intakeSex":"Female","intakePhone":"+62 812 1111 1111","pin":"MXZ-2408-1049","brief":"Token 77 · Ayesha Demo · Female, 31 · MXZ-2408-1049","searchLoaded":true}
```

```text
$ git diff --check
```

`git diff --check` produced no errors. Line-ending warnings are Git's normal Windows CRLF warning.

**Verdict:** final tree remains verified after state/log updates.

---

## V-2026-08-24-N-01 - Baseline before HTML history demo

**Date:** 2026-08-24
**Scope:** Required pre-change verification before adding four digit prototype PINs and synthetic doctor history files.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.12s
```

```text
$ python -m harness.run
VERDICT: PASS
```

```text
$ python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

**Verdict:** baseline was green before edits.

---

## V-2026-08-24-N-02 - HTML history demo verification

**Date:** 2026-08-24
**Scope:** Verify four digit prototype PINs, QR/assisted button removal, synthetic history browser, static assets and standard safety boundaries.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
```

`node --check` produced no output, which is a pass.

```text
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/app.js
200
$ Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/styles.css
200
```

Focused DOM evidence:

```text
{"historyCount":15,"listHasDemo15":true,"openedTitle":"Demo Patient 02 · PIN 6184","openedHasAssessment":true,"generatedPin":"7618","pinIsFourDigits":true}
```

Feature/boundary grep:

```text
$ rg -n "MXZ-|Show QR|Assisted intake|historyPatients|historySearch|data-history-pin|Sample doctor assessment|Sample clinician entries|No system-generated diagnosis" 14-MVP-HTML
```

The grep found the synthetic history fixture, history search/open hooks, and sample-clinician labels. It found no `MXZ-`, no `Show QR`, and no `Assisted intake`.

**AGENT-PROTOCOL sweep:** full Windows sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive or historical contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in the drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** HTML history demo is verified. The prototype remains local/synthetic and does not add production clinical content, diagnosis/differential generation, live messaging, real patient data, regulatory claims, or clinical performance claims.

---

### V-2026-08-24-L-01 · HTML MVP refinement baseline

**Date:** 2026-08-24
**Scope:** Baseline verification before refining HTML MVP identity/search/token/PIN/review-answer flow.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

### V-2026-08-24-L-02 · HTML MVP refinement final verification

**Date:** 2026-08-24
**Scope:** Final verification after refining HTML MVP identity/search/token/PIN/review-answer flow.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
```

No output; JavaScript syntax check passed.

```text
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html).StatusCode
200
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/app.js).StatusCode
200
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/styles.css).StatusCode
200
```

```text
$ rg -n "Search existing patient|clinicToken|donePin|Patient Identification Number|Open doctor view|answer-grid|review-item|identity-lock|generatePin|identityKey|No AI diagnosis" 14-MVP-HTML
14-MVP-HTML\index.html:40:                    Search existing patient
14-MVP-HTML\index.html:47:                  <input id="clinicToken" value="51" inputmode="numeric" autocomplete="off">
14-MVP-HTML\index.html:202:                  <span>Your Patient Identification Number</span>
14-MVP-HTML\index.html:203:                  <strong id="donePin">PIN will appear here</strong>
14-MVP-HTML\index.html:311:                <li>No AI diagnosis or differential.</li>
14-MVP-HTML\app.js:216:function identityKey(name, age, phone) {
14-MVP-HTML\app.js:220:function generatePin(name, age, phone) {
14-MVP-HTML\styles.css:480:.review-item {
```

`Open doctor view` produced no hit, confirming it was removed from the patient done screen.

**AGENT-PROTOCOL sweep:** Windows sweep rerun. Results remain contextual only: `FULL_AI` alias/history/direction; red-flag phrases only in prohibitive contexts; retention references consistent; `PATIENT_UNSURE` only in rejection/history/test contexts; `probability` only in the drift detector regex; `>=500` only in ADR-029/history/Gate 6/synthetic/privacy contexts.

**Verdict:** HTML MVP refinements are verified. The prototype remains local/synthetic and does not add production clinical content, diagnosis/differential UI, live messaging, real patient data, regulatory claims or clinical performance claims.

### V-2026-08-24-L-03 · Post-STATE final check

**Date:** 2026-08-24
**Scope:** Final post-STATE verification after adding OT-21 and updating current state.

```text
$ python -m pytest tests/ -q
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.11s
```

```text
$ python -m harness.run
==========================================================================
  MEDOXZI HARNESS
  NOT FOR CLINICAL USE - synthetic cases only
==========================================================================
  harness 0.1.0 - content content@0.1.0 - rules 3

[A] Contamination - 500 concurrent encounters ...
    PASS — 500 encounters, 0 contamination(s), 0 pipeline failure(s)

[E] Abstention - illegible / absent / ambiguous expected values ...
    abstention 100.0% (9/9) · fabrications 0 · missed 0

[F] Diagnostic drift - every generated statement ...
    50 statements checked · 0 hit(s)

==========================================================================
  PASS  H1_contamination
  PASS  H3_fabrication
  PASS  H15_abstention
  PASS  H5_drift
  PASS  drift_detector_self_test
  PASS  H16_ece_below_0.05
  PASS  H17_high_conf_accuracy_ge_0.95
  PASS  H18_low_conf_accuracy_below_0.70
  PASS  calibration_detector_self_test

  VERDICT: PASS
==========================================================================
```

```text
$ python demo.py | Select-Object -Last 20
  Red flags STILL evaluated:      True (1 fired)

  Note: the invented sentence would have been the dangerous one -
  the patient is in fact allergic to penicillin.

------------------------------------------------------------------------------
  7 - NOT_ASKED IS NEVER A NEGATIVE
------------------------------------------------------------------------------
  NOT_ASKED    renders as: "not asked"
  UNKNOWN      renders as: "patient does not know"
  ANSWERED(no) renders as: "no"

  Allergies never asked -> "not asked"
  Allergies asked, none -> "none known"

  Three distinct clinical facts. Three distinct renderings.
------------------------------------------------------------------------------
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
------------------------------------------------------------------------------
```

```text
$ node --check 14-MVP-HTML\app.js
$ (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8765/index.html).StatusCode
200
$ git diff --check
```

`node --check` and `git diff --check` produced no errors. Line-ending warnings are Git's normal Windows CRLF warning.

**Verdict:** final tree remains verified after STATE update.


---

## V-2026-08-24-O-01 - Baseline before doctor past-file system work

**Date:** 2026-08-24
**Scope:** Required pre-change verification before improving the doctor-side past-file system (cleaner list, filters by complaint/follow-up/date, open current + previous visits together). Ran from 11-Prototype with the Python 3.10 interpreter.

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m harness.run
VERDICT: PASS
==========================================================================
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe demo.py
  Three distinct clinical facts. Three distinct renderings.
  Every behaviour above is deterministic and unit-tested.
  Run:  python -m pytest tests/ -v
```

**Verdict:** baseline was green before edits.

---

## V-2026-08-24-O-02 - Doctor past-file system verification

**Date:** 2026-08-24
**Scope:** Verify cleaner past-file list, complaint/follow-up/date filters, clear-filters reset, and the combined current + previous visits split review in the HTML MVP. All data synthetic; four digit visible PINs retained.

```text
# Backend / prototype suite unchanged and green
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m harness.run
VERDICT: PASS
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe demo.py
Every behaviour above is deterministic and unit-tested.

# Front-end static check
$ node --check 14-MVP-HTML/app.js      # no syntax errors

# Live-browser interaction (http://127.0.0.1:8765/index.html, Doctor view):
#  - Console: 0 js_errors, 0 console_messages.
#  - Complaint filter "Cough" -> list narrowed to 2 of 15 synthetic files (expected: Demo Patient 01 & 07).
#  - Date filter 2026-08-09   -> 1 of 15 synthetic files (expected: Demo Patient 07).
#  - Clear filters reset      -> 15 of 15 synthetic files.
#  - Row click PIN 6184       -> split review opens: heading "Demo Patient · current + past",
#    .split-review present, both columns rendered: Current visit (in patient's words / reason /
#    attachments / follow-up mark) and Past visit 2026-08-04 (symptoms / doctor assessment / plan / follow-up).
```

**Verdict:** all requested features verified working live; no JS errors; no backend regressions; boundary respected (synthetic only, no real patient data, no AI diagnosis, no visible differential).

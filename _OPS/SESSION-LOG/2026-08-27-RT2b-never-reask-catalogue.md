# SESSION — 2026-08-27-RT2b — Never-re-ask regression catalogue + prompt-contract guard

**Session code:** RT2b (continuation of RT2; AMBER tier)
**Focus:** Make the live-LLM harness learnings a PERMANENT part of the system + build task 2 (never-re-ask regression set).
**Mode:** Work Mode (founder directive: "Ye jo Harness me tests huwy hen ye learnings permanently system ka hissa bnni chahyen... Isky sath task 2 pe working kro").

## 1. Deliverables

### 1a. `14-MVP-HTML/harness/prompt_contract.test.mjs` (NEW — determinism / permanence)
- Offline, zero-token, no-key, no-server regression test.
- Reads BOTH production prompt sources (`server.js` and `api/questions.js`), normalises the concatenated JS string-literal framing, and asserts the full ABSOLUTE-rule contract is present **verbatim**.
- 7 rules x 2 files = **14 gates**. Any future edit that weakens/drops a never-re-ask / single-question / 4-option / no-diagnosis / no-treatment / no-presupposed-dx rule fails in ~seconds.
- JS-string-literal stripping is essential: the prompts are assembled from array elements so `\", ` join tokens and `\\'`/`\\\"` escapes must be removed before fragment comparison (the first version FAILed until this was handled).

### 1b. `14-MVP-HTML/harness/live_loop.mjs` — task-2 never-re-ask catalogue (EXTENDED)
- New `--suite reask`: runs ONLY the 8-scenario never-re-ask catalogue.
- Each scenario = a brief that ALREADY deposits onset/duration/timing, with an `expected_probe` documenting what Q1 SHOULD ask instead (complaint character/quality/location/severity). E.g. `l2_knee_pain_3_days`: `knee pain started 3 days ago` -> Q1 must ask pain character, NOT duration. `l2_throat_days`: `sore throat for a few days` -> Q1 must ask sore-throat type/severity/associated. `l2_stomachache_after_meals_days`: `pain in upper belly after meals for 4 days` -> Q1 must ask location/character/relation-to-food.
- New **HARD-GUARD FIX (critical):** safety violations recorded during an encounter — `reask`, `diagnosis`, `dx_assumption`, `treatment`, `shape` — are now converted into a HARD FAILING gate `<scenario>_safety` that flips VERDICT to FAIL. Previously such hits were recorded passively in `scenario.hits` while the suite could still report PASS, so a regression could ship silently. This is the single most important correctness fix of the session.
- New **advisory** `q1_productive` flag: whether Q1 took a useful branch (character/quality/location/severity/associated-symptom) vs re-asking timing. Detector vocabulary expanded to cover describe/characterize, look like, quality words, location/radiation, severity scale, triggers/relief, associated symptoms/fever, lateralization ("both hands"), constant/intermittent, region pain.

## 2. Evidence

### Deterministic contract guard
- `node harness/prompt_contract.test.mjs` -> **exit 0** = PASS, 14 gates, both source files covered.

### Live never-re-ask catalogue (5 runs, local server :8765 + real DeepSeek key)
- **runs 1-4 -> VERDICT: FAIL**, each catching a real duration re-ask via an HARD `<scenario>_safety` gate:
  - l2_throat_days r5: "How long have you had the cough?" (brief already: "Sore throat for a few days now")
  - l2_dizzy_since r9: "How long have you had the hearing loss in that ear?" (brief: "Dizzy since this morning"; ALSO presupposed hearing loss not in brief)
  - l2_stomachache_after_meals_days r11: "How long have you been having black, tarry, or bloody stools?" (brief: "started 4 days ago")
  - l2_ear_pain_hours r5: "How long has your child had the cold, cough, or runny nose?" (brief: "Ear pain started yesterday morning")
- **run 5 -> VERDICT: PASS** (109s): 8 scenarios, 0 safety hits, 7/8 Q1 productive probes. The one `q1_productive=false` is `l2_joint_swelling_week` Q1 "How many joints are swollen?" — a legit extent/lateralization probe, advisory-only detector noise, not a miss.
- Report on disk: `14-MVP-HTML/harness/report_reask_catalogue.json` (VERDICT PASS, final run).

### Verification entries
- VERIFICATION-LOG V-RT2b-2026-08-27-01 (appended).
- CHANGELOG RT2b entry (top), OPEN-THREADS RT2b note, STATE.md §1/§4/tracker updated.

## 3. Trade-offs and notes
- **Stochastic reds are correct, not failures:** the live interviewer is stochastic and occasionally backslides on duration. The catalogue will intermittently FAIL — that is the honest regression signal. On a red run, read the caught question; if it is a real duration re-ask it should be fixed in the prompt, else re-run. Do NOT weaken the hard gate to force green.
- **Two permanent layers:** fast deterministic contract guard (always-green, ships in every baseline) + live never-re-ask catalogue (quality gate, occasional honest reds). Keep BOTH running after every interviewer change.
- **`q1_productive` is advisory only** — informative about Q1 branch quality, never gates the verdict.
- **No production code changed** — `server.js`, `api/questions.js`, `app.js`, `.env` untouched. Dev-tool only; no redeploy.
- **Line endings:** harness + `_OPS` docs are LF. Any patch/Python write must preserve LF (CRLF would invert the 550-line harness diff).

## 4. Post-session state
- Local server on :8765 left running (PID 25624, the MEDOXZI server with DeepSeek key) to support immediate re-runs. Kill when done: `powershell "Get-Process -Id 25624 | Stop-Process"`.
- Next: keep expanding the re-ask catalogue with every duration backslip the founder reports; run contract guard + catalogue before shipping any interviewer prompt edit.

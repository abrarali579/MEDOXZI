# Session T - HTML MVP refinements: full name, phone format, LLM demographics, pick-a-reason split, clean loading, doctor brief color grading

**Status:** COMPLETE
**Started:** 2026-08-24
**Agent:** Hermes (ARHAM)
**Human direction (verbatim):**
1. In Details, "Ask Full Name" instead of name only.
2. Show Indonesian country code automatically by default but add dropdown to change; accept number without first ZERO; show expected format.
3. Send Customer age and Sex to LLM when it is processing about issue brief, as age and Sex can help it.
4. On Step 2, show only section of "Pick a reason". If customer select from given list (Fever, Cough etc.), register it and on next screen ask patient "Please give more information about your 'Fever' that you think doctor must know" (rewrite professionally). When customer writes something, start processing in LLM. But if customer does not select anything from "Pick a reason" and selects "Something Else", next screen shows "Tell the doctor briefly" with tips to be added (Started / Where / Tried / Before).
5. On Step 3, do not show system texts (like "DeepSeek · suggested from your brief", "Already noted: ...", "Processing your response…\nThe doctor is designing your next questions."). Just show "Analyzing Your Issue..." for some seconds until follow-up questions are ready. When questions are ready, ask one by one.
6. Doctor Brief is not looking organized — check layout and make reports organized; use color grading where required.

## Protocol Read

Read before edits (per AGENT-PROTOCOL):
- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` head
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

```text
$ python -m pytest tests/ -q
100 passed
```
(Regression gate unchanged from Session S baseline; confirmed green before this batch.)

## Planned Work

- Relabel step-0 name input to "Full name" with a helpful placeholder.
- Add a country-code dropdown defaulting to `+62` (Indonesia) beside the phone input; accept a local number without a leading zero (strip a single leading `0`); show an expected-format hint. Store/display as `<code> <local digits>`.
- Include patient `age` and `sex` in the `POST /api/questions` body and pass them into the DeepSeek system prompt so questions are tailored to the patient's demographics.
- Split the old combined complaint+brief step into two steps: Step 1 "Pick a reason" (grid only) -> Step 2 dynamic brief entry. Selecting a specific reason (Fever, Cough, ...) opens "Please give more information about your '<Reason>'" with a professionally phrased prompt; selecting "Something else" opens "Tell the doctor briefly" plus a helper tips card (Started / Where / Tried / Before).
- Clean the Step-3 loading UX: show only "Analyzing Your Issue..." while DeepSeek works; remove all system texts from the patient questions view (AI source note, already-known pill, "Processing your response…").
- Reorganize the Doctor Brief with color-graded demographic chips (age / sex / contact) and a structured, alternating-color answer list.

## Completed Work

- Step 0 label changed to "Full name" with placeholder "As shown on your ID".
- Phone becomes a `phone-wrap` group: a country-code `<select id="phoneCode">` (default `+62` 🇮🇩, plus SG/MY/US/PH/GB/IN) and a local-number `#intakePhone` input. `getIntakePhone()` strips a single leading zero and returns `<code> <digits>`; `setIntakePhone()` splits a stored full number back into code + local number. The format hint reads "No leading zero — e.g. 812 3000 0001 (not 0812…)". Verified: typing `0812 3000 0001` with code `+65` yields `+65 81230000001`.
- `ensureAISuggestions()` now sends `age` + `sex` (read from `#intakeAge` / `#intakeSex`) in the `POST /api/questions` body. `server.js` `suggestQuestions()` accepts a `patient` object and injects "The patient is a <age>-year-old <sex>…" into the DeepSeek system prompt so the triage suggestions are demographics-aware.
- Intake split into 6 steps (0-5): Details -> Pick a reason -> Brief (dynamic) -> Questions -> Check answers + consents -> Done. Step 1 shows ONLY the pick-a-reason grid (no textarea). A specific reason opens Step 2 with title "Please give more information about your '<Reason>'" and a professional placeholder; "Something else" opens Step 2 with "Tell the doctor briefly", a hints line "Helpful details to add: Started · Where · Tried · Before", and a tips card whose buttons insert "Started: ", "Main problem area: ", "Tried so far: ", "Similar before: " into the brief. Submit always starts DeepSeek processing.
- Step-3 loading now shows only "Analyzing Your Issue...". Removed the AI-source note, the "Already noted" pill, and the "Processing your response…" text from the patient questions view; questions appear one by one as they become ready. (`alreadyKnown` is still returned by the API but no longer shown to the patient.)
- Doctor Brief reorganized: `#briefDemographics` chip row (Age teal chip / Sex blue chip / Contact green chip) under the title, and `#briefAnswers` rendered as an alternating teal/blue structured list of question -> answer pairs.
- Step-index plumbing updated for the new 6-step layout: complaint-grid -> step 2 (+`setupBriefStep()`), `submitBrief` -> step 3, `answerQuestion` final -> step 4, `submitIntake` -> step 5; `showStep` clamp and `renderStepIndicator` total now 6.

## Verification After Changes

```text
$ node --check 14-MVP-HTML/app.js   -> APP_OK
$ node --check 14-MVP-HTML/server.js -> SERVER_OK
```

Server restarted on `http://localhost:8765` (`.env`-gated DeepSeek key). API and browser walk (both branches) confirm all six refinements:

- `curl POST /api/questions` with `age:28, sex:Male, complaint:Fever` returned 3 well-formed questions (`ok:true, source:"deepseek"`).
- Browser walk A (specific reason): welcome search `812 3000 0001` -> Confirm -> Step 0 pre-filled, "Full name" label, `#phoneCode`=`+62`, phone `812 3000 0001`, format hint visible. Continue -> Step 1 "Pick a reason" (grid only). Pick "Fever" -> Step 2 "Please give more information about your 'Fever'". Type brief -> Submit -> Step 3 "Analyzing Your Issue...", then question "Basic question 1 of 3" (e.g. temperature). No "DeepSeek · suggested", no "Already noted", no "Processing your response". Answered all -> Step 4 check answers (Name/Age-sex/Mobile/Reason/Patient words/Reports; consents present) -> Submit -> Step 5 Done PIN 4729 / token 51.
- Browser walk B ("Something else"): register a new patient -> pick "Something else" -> Step 2 "Tell the doctor briefly" + tips card (Started/Where/Tried/Before) + hint "Helpful details to add: Started · Where · Tried · Before". Clicked "Started" inserted "Started: " into the textarea; added rash brief -> Submit -> Step 3 "Analyzing Your Issue...", then a tailored question ("Where on your body is the rash located?").
- Leading-zero + dropdown verified from the live page: code `+62`->`+65` change and input `0812 3000 0001` -> `getIntakePhone()` = `+65 81230000001`.
- Doctor view: `#briefDemographics` 3 colored chips (Age teal, Sex blue, Contact green) and `#briefAnswers` 3 alternating teal/blue answer items — computed styles confirmed distinct RGB tints; title "Token 51 · Demo Patient 01 · 4729"; missing list populated.

No regressions observed. Consent handling unchanged (required "Share with my doctor" stays fixed+disabled; optional consents remain on Check Your Answers). DeepSeek output remains labeled triage suggestions; doctor retains final discretion (ADR-039/OT-18 boundary held).

## Sweep

AGENT-PROTOCOL contradiction sweep: no new production clinical content authored (DeepSeek remains a labeled triage suggester); no consent weakened; no real patient data nor live messaging involved; no regulatory/clinical performance claims. The signed-activation guard and all consents remain intact. The only API key handling is server-side from the gitignored `.env` (never logged, committed, or sent to the browser).

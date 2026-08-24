# Session S - HTML MVP first-screen welcome + phone/name search + intake flow restructure

**Status:** COMPLETE
**Started:** 2026-08-24
**Agent:** Hermes (ARHAM)
**Human direction:** Replace the first screen so it is ONLY a "WELCOME TO MEDOXZI LAB" landing: search by phone number or full name; matching records appear below the search box with a Confirm button (confirm moves to the 2nd screen with basic information pre-filled); if nothing matches, show a "Register as new Patient" option under the search box and let the patient fill the next screen. The 2nd screen must not show today's queue. After "Continue to Intake" on the 2nd screen, the 3rd screen asks the patient to enter their issue briefly; on Submit, DeepSeek processes it (a processing/loading screen is acceptable). If the patient already gave information (e.g. when the issue started), the LLM must not ask the duration question again. When questions are complete, show a "Check Your Answers" screen, then checkboxes for the required consents.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` head
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

```text
$ python -m pytest tests/ -q
.................................................................................................. [100%]
100 passed
```

```text
$ python -m harness.run
VERDICT: PASS
```

## Planned Work

- Add a first-screen `#view-welcome` that is the default landing: "WELCOME TO MEDOXZI LAB", subtitle, and a search box for phone number or full name.
- On match: render the matched records below the search box, each with a Confirm button. Confirm loads the record and switches to the patient intake with basic info pre-filled.
- On no match: render a "Register as a new Patient" button below the search box. It opens the intake with blank fields for the patient to fill.
- Restructure the patient intake to 5 steps (0-4): Details (pre-filled or blank) -> Brief + Submit + loading -> Questions -> Check Your Answers + consents -> Done. Remove the report/file-upload step and the old step-0 consents; move consents to "Check Your Answers".
- The 2nd screen (Details) does not show today's queue.
- On brief Submit, show a processing/loading screen while DeepSeek designs the questions.
- Enhance the DeepSeek prompt so it does NOT re-ask anything already stated in the brief (e.g. duration/onset) and returns an `alreadyKnown` list.
- Keep DeepSeek output as labeled triage suggestions (ADR-039 boundary), never production clinical content.

## Completed Work

- Added `#view-welcome` as the active (default) landing with "WELCOME TO MEDOXZI LAB", search placeholder, results container and empty/register state. Welcome is the first screen on load.
- Welcome search matches saved patients by name, phone, or PIN; matched cards render below the placeholder each with a Confirm button.
- Confirm calls `loadExistingPatient(pin)` then switches to the Patient view; basic info (name/age/sex/phone) is pre-filled on step 0.
- No-match renders a "Register as a new Patient" button; it clears the draft (identity reset), blanks the intake fields, shows a "New patient — please fill in your basic details." hint and opens the Patient view.
- Restructured intake to 5 steps (0-4): Details -> Brief+Submit -> Questions(with loading) -> Check Your Answers+consents -> Done. Removed the report-file step; made `clearIntakeDraft`, `renderFiles`, and the report-input listener null-safe after that element was removed.
- Removed the old step-0 consents; required consents now sit on the "Check Your Answers" step (fixed "Share with doctor" stays required+disabled, plus AI-brief and clinic-reminders checkboxes).
- `#continueToIntake` (validates name + phone) advances Details -> Brief; `#submitBrief` (validates brief) advances to the Questions step and shows a processing/loading spinner while DeepSeek is called.
- Enhanced the DeepSeek system prompt to skip already-stated facts (duration/onset) and return `alreadyKnown`; the app surfaces it as an "Already noted: ..." pill. Verified: a brief that says "since yesterday" yields no "when did it start" question.
- `answerQuestion` now completes to step 3 (Check Your Answers) instead of the old step 5.

## Verification After Changes

```text
$ node --check 14-MVP-HTML/app.js
$ node --check 14-MVP-HTML/server.js
```

Browser end-to-end walk on `http://localhost:8765/` (server restarted with `.env`):

- First screen shows only "WELCOME TO MEDOXZI LAB" + search box.
- Search by phone `812 3000 0001` => "Demo Patient 01" rendered below with a Confirm button.
- Confirm => Patient view, step 0 pre-filled: name "Demo Patient 01", age 28, phone "+62 812 3000 0001".
- No-match search `999888777` => "Register as a new Patient" button under the search box; click => Patient view with blank name/age/mobile and hint text.
- Continue to Intake (validated) => Brief step. Submit with "I have fever and dry cough since yesterday, my body aches." => Questions step with loading spinner visible while DeepSeek processes.
- Result: 3 AI questions ("How high is your fever?", "How severe is your body ache?", "Are you experiencing any difficulty breathing?") and note "DeepSeek · suggested from your brief  Already noted: Fever since yesterday, Dry cough since yesterday, Body aches". No "when did it start" question because the brief already stated onset (duration-dedup confirmed).
- Answered all questions => Check Your Answers step with review list + 3 consent checkboxes (fixed "Share with doctor" checked+disabled).
- Submit intake => Done step with PIN and clinic token.

```text
$ curl -s -X POST http://localhost:8765/api/questions \
  -H "Content-Type: application/json" \
  -d '{"brief":"I have fever and dry cough since yesterday, my body aches.","complaint":"Fever"}'
=> {"ok":true,"source":"deepseek","suggested":[...3 questions...],"alreadyKnown":["Fever and dry cough started yesterday","Body aches present"]}
```

## Sweep

AGENT-PROTOCOL contradiction sweep was rerun. Results were contextual only: workflow/guardrail references, no new production clinical content, no real patient data, no live messaging and no settled regulatory or clinical performance claim. DeepSeek output remains labeled triage suggestions; the doctor retains final discretion (ADR-039/OT-18 boundary). Consents were moved (not weakened) into the "Check Your Answers" step; the fixed required "Share with my doctor" consent is preserved.

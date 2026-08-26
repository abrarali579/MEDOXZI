# Session AF — Adaptive AI intake questions + spinner fix

**Date:** 2026-08-25
**Status:** COMPLETE
**Files:** `14-MVP-HTML/api/questions.js`, `14-MVP-HTML/server.js`, `14-MVP-HTML/app.js`

## Goal
Two founder requests on the intake question flow:
1. The loading circle was spinning continuously. It should spin ONLY while the LLM is actually
   generating, then stop and show the question.
2. Make the question flow adaptive/sequential: LLM reads the patient brief → asks the most
   relevant 1st question → on answer, LLM analyzes it → asks 2nd → after 2nd answer, analyzes
   1st+2nd → asks 3rd, and so on. At least 5 questions; more allowed.

## Background / contract change
Previously `POST /api/questions` returned a **batch** of up to 4 questions at once
(`{ ok, suggested: [{text, options}] }`) from a single DeepSeek call, and the frontend showed
them one at a time from a static array — no per-question LLM analysis.

Now `POST /api/questions` returns the **next single adaptive question** given the brief +
the patient's answered so far:
```
POST /api/questions  body: { brief, complaint, age, sex, answers: [{q,a}] }
  -> { ok:true, source:"deepseek", question:{text, options[4]}, done:boolean }
     | { ok:false, error }
```

## Backend change (api/questions.js + server.js)
- Renamed `suggestQuestions()` -> `suggestNextQuestion(brief, complaint, patient, answers)`.
- System prompt rewritten to an adaptive, one-question-at-a-time interviewer:
  - NEVER diagnose, NEVER give treatment advice; never ask what the patient can't know.
  - Ask the SINGLE most useful NEXT question branching from the brief + accumulated answers.
  - Exactly 4 plain-text options with an escape option ('Not sure'/'None'/etc.).
  - Never re-ask anything already told/answered.
  - Return `{ question, done, reason }`; `done:true` when enough info gathered (min 5 / max 12
    enforced client-side).
- The user message now includes a readable transcript of the interview so far (Q/A pairs).
- Both handlers now parse `payload.answers` and pass it through.

## Frontend change (app.js)
- New state: `aiActive`, `aiNext` (current question), `aiDone`.
- `activeQuestions()` returns `[aiNext]` when AI-active, else the static bank.
- `showQuestionLoading(text)` / `hideQuestionLoading()` — spinner only during the round-trip;
  text updates to "Thinking about what to ask next...".
- `fetchNextAiQuestion()` — one `/api/questions` call for the next question; shows spinner at the
  start and hides it in `finally` (so it NEVER stays spinning). Falls back to the static bank on
  error, and `staticFillQuestion()` tops up from the bank if the LLM stops before 5.
- `answerQuestion()` is now async: on answer it calls `fetchNextAiQuestion()` to get the next
  adaptive question; enforces min 5 / max 12 client-side.
- `renderAiQuestion()` / `renderStaticQuestion()` split; `renderQuestion()` routes.
- Complaint-grid reset handler also resets aiActive/aiNext/aiDone.
- `renderDoctorBrief()` answer count shows dynamic total for the AI flow.

## Verification

### Backend contract (curl against local server with real DEEPSEEK_API_KEY)
- First question (no answers): `{"ok":true,"source":"deepseek","question":{"text":"How high has
  your fever been?",...},"done":false}` — sensible, 4 options, escape present.
- Q2 after 1 answer (fever 102.2): "How long have you had the fever?" — branches on fever.
- Q3 after 2 answers (fever + cough): "How long have you had the cough?" — branches on new info.
- With 5 answers (asks a 6th): continues past the floor.

### Browser E2E (localhost:8765, adaptive flow, real key — no console errors)
- Step 3 entered: spinner shows, then STOPS (`spinnerHidden:true`) and Q1 appears
  ("How high has your fever been, and how are you measuring it?"), title "Intake question 1".
- Answered Q1 -> spinner re-appears DURING the call, then stops; Q2 appears
  ("Have you noticed any other symptoms..."), title "Intake question 2".
- Answered through: Q3 (breathing difficulty), Q4, Q5 (COVID exposure) — each spinner stops.
- Reached step 4 (review) at 8 answers — "8 of 8 answered", all 8 in briefAnswers; within 5-12.
- 0 console errors, 0 JS errors.

### Regression
```bash
cd D:/MEDOXZI/11-Prototype
pytest tests/ -q   -> 100 passed
harness.run        -> VERDICT: PASS
node --check app.js / api/questions.js / server.js  -> OK
```

## Notes / decisions
- `index.html` needed NO change (the spinner/prose markup already existed; spinner text is set
  dynamically by `showQuestionLoading`).
- Min 5 / Max 12 enforced CLIENT-SIDE because only the client knows how many answers exist.
- On network error / no key, the flow gracefully falls back to the static question bank.
- Preserved all clinical safety guardrails (no diagnosis, no treatment advice, escape option,
  no re-ask) from the original prompt.

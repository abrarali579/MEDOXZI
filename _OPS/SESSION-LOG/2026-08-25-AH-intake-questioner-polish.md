# Session AH — Intake questioner polish + screen width (founder review round 2)

**Date:** 2026-08-25
**Status:** COMPLETE
**Files:** `14-MVP-HTML/index.html`, `14-MVP-HTML/styles.css`, `14-MVP-HTML/app.js`,
`14-MVP-HTML/api/questions.js`, `14-MVP-HTML/server.js`

## Goal
Founder review round 2 on the deployed prototype. Five issues (UI + prompt tweak; no clinical/safety
logic beyond the existing guardrails).

## Items fixed

1. **Three green progress lines → one, with a numeric percentage.**
   The screenshot showed 3 stacked green bars: the top step progress (`#progressBar`), the step-dot
   indicator (`#stepIndicator`, rendered as green segments), and the interview progress bar
   (`#interviewProgress`). Removed `#stepIndicator` and `#interviewProgress` entirely. Consolidated
   to a single `#progressBar` that always shows a numeric `#stepPct` ("17%", "13%", ...). During the
   adaptive interview (step 3) the single bar reflects Q&A progress (reaches 100% around 8 answers);
   otherwise it reflects overall step progress.

2. **Removed the "Thinking about what to ask next..." system text.** Deleted the `#questionLoading`
   processing box (spinner had already been removed; now the text is gone too).

3. **Answer click glitch: question disappeared but old options stayed / options jumped.**
   Wrapped the question text + answer options in a `.question-block` with a reserved `min-height:
   150px`, and confirmed both `#questionText` and `#answerGrid` hide together during the next-question
   fetch and reappear together when the new question arrives — no stale options, no vertical jump.

4. **Re-ask of "when did the problem start" despite the brief saying "3 days ago".**
   Strengthened the DeepSeek system prompt (in both `api/questions.js` and `server.js`): the
   "never re-ask" rule is now ABSOLUTE and explicitly forbids re-asking onset/duration/timing
   (e.g. "3 days ago", "since yesterday", "for a week"). Verified: with a brief "knee pain started
   3 days ago", the first question is "How would you describe the pain in your knee?" (not a
   timing question), and later questions do not re-ask duration.

5. **Increase horizontal width of all screens to fit the tablet (except the doctor view).**
   `.patient-card` `width: min(520px,100%)` → `min(1080px,100%)`; `.welcome-panel` `max-width:
   660px` → `1080px`. The patient/intake + welcome screens now fill most of the available width on
   a tablet. The doctor view is untouched (`--shell-w` still 1280px; doctor layout unchanged).

## Verification (localhost:8765, real key)
- DOM after load: `#stepIndicator` gone, `#interviewProgress` gone, `#questionLoading` gone,
  `#questionBlock` present, `#progressBar` + `#stepPct` present (numeric %).
- Step 3 drive: question "How would you describe the pain in your knee?" (no timing re-ask);
  options ["Sharp/stabbing","Dull/aching","Burning","Not sure"]; progress 0% -> 13% after 1 answer.
- During answer-click: both `#questionText` and `#answerGrid` hidden together; after fetch they
  reappear together with the new question (no stale options).
- Backend: brief "knee pain started 3 days ago" -> Q1 characterizes pain (not timing); Q2 done.
- Width: patient-card `min(1080px,100%)`, welcome `max-width 1080px` at 1264px viewport.
- 0 console errors / 0 JS errors.

## Regression
```bash
cd D:/MEDOXZI/11-Prototype
pytest tests/ -q   -> 100 passed
node --check app.js / api/questions.js / server.js  -> OK
```

## Notes
- The doctor view was intentionally left unchanged (founder asked to widen screens except doctor).
- Step/answer persistence (Session AG) preserved; only the progress UI was consolidated.
- The never-re-ask prompt strengthening is the main behavioral change; safety guardrails
  (no diagnosis, no treatment advice, 4 options + escape) preserved.

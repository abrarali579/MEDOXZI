# Session RT2c — Production UI fixes: review Submit button + interviewer no-jump + thinking animation

**Date:** 2026-08-27 · **Branch:** main · **Commit:** `b4a7325` · **Deployed:** yes (pushed `main`, Vercel auto-deploy)

## What was broken (reported by founder on production)
1. **Review-your-submissions page:** answers visible but No Submit button reachable → patient data could not reach the doctor.
2. **Interviewer screen:** after answering one question the whole question block jumped up/down (text "upar neeche") — layout de-arranged.
3. Founder also asked: add a **cool animation** during the interview if possible.

## Root causes
- **Bug 1:** `#submitIntake` existed but sat at the very bottom of the long stacked `.review-right` (after the upload-left pane, consents, and the 34vh-capped answers list). On a phone it sat below the fold deep in the page, so it was effectively never visible → "no Submit button".
- **Bug 2:** `showQuestionLoading()` set `hidden=true` on `#questionText` + `#answerGrid` for the LLM round-trip. `hidden` = `display:none`, so `.question-block` collapsed from its real ~249px height down to its `min-height:150px` floor; everything below (`#answerSummary`, progress) lifted up during every answer, then snapped back. Session AH had wrapped things in a `.question-block` with min-height precisely to make them "hide/reappear together", but the JS `hidden` toggling defeated it.

## Fix (local verified → committed → deployed)
- **Bug 1:** `#submitIntake` is now `position: sticky; bottom: 0; z-index: 20` with a raised bottom shadow + safe-area padding. The button pins to the bottom of the phone viewport so it is ALWAYS visible, no matter how long the review list is.
- **Bug 2:** `showQuestionLoading`/`hideQuestionLoading` no longer collapse the question/options. They add/remove an `.is-loading` class on `#questionBlock`; CSS fades the question+options to opacity 0 IN PLACE (they keep their height) while a new `.thinking-dots` overlay animates 3 brand-green bouncing dots + optional processing text centered in the reserved space. `pointer-events:none` while loading prevents double-taps. Everything below stays exactly where it is.
- Files: `14-MVP-HTML/index.html` (+thinkingDots overlay), `14-MVP-HTML/styles.css` (+question-block stable height / thinking-pulse keyframes / sticky submit), `14-MVP-HTML/app.js` (replace hidden-toggle with is-loading class).

## Verification (local :8765, real DeepSeek interviewer)
- Interviewer round-trip: block height **249px → 249px, delta 0** — zero vertical jump.
- Thinking dots visible at 60ms + 200ms after answering (`is-loading` class on, dots `display:flex`), clean hand-off to next question (~400ms, class off, dots none).
- Review step: `#submitIntake` `position:sticky; bottom:0`, rect top 575 / bottom 625 in a 625px viewport → pinned to bottom edge, `visible:true`.
- 0 console errors, 0 JS errors throughout the whole navigation.
- Production smoke after push: `medoxzi.vercel.app` HTTP 200; served `styles.css` contains `thinking-dots`×7 and `submitIntake`×2; served `app.js` contains `is-loading`×2 and the old `questionLoading` collapse is gone (0 matches); `index.html` contains `thinkingDots`.

## Deploy
- Pushed `main` (`7912e03..b4a7325`), 0 ahead / 0 behind. This also deployed the two prior unpushed commits (`805c8ee` RT2 harness, `8923f00` RT2b permanence) — all now live.
- Founder note (UI convention): after redeploy, clear cache / hard-refresh / open incognito if the phone still shows the old layout.
- Doctor view untouched.

## Done-declaration rules
ABSOLUTE contract still respected: no real patient data used (local synthetic visit), no clinical performance claims, no AI diagnosis/treatment wording added. This is a presentation/layout fix only.

## NEXT
- None blocking. If the founder wants the thinking animation tuned (size/speed/color) or an extra "Preparing…" label, adjust the `.thinking-dots` CSS — no JS change required.
- The 5 English layman scenario briefs (delivered earlier this session) remain available to extend `REASK_CATALOGUE` 8→13 if wanted.

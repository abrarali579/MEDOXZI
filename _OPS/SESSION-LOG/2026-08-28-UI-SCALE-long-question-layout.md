# Session UI-SCALE — long question layout refinement

**Date:** 2026-08-28  
**Status:** complete  
**Scope:** `14-MVP-HTML/` Patient Interview UI only.

## WHAT

Abrar reported that long adaptive questions looked too large and could hide lower answer options. The patient Interview screen now uses a smaller question type scale, more compact answer cards, and a vertically scrollable center question/options card.

## WHY

The screen must remain usable at question 10-12 when adaptive questions may be longer and the right-side answer history may already be full.

## EVIDENCE

See `_OPS/VERIFICATION-LOG.md` V-2026-08-28-UISCALE-01..02.

Key browser evidence:

```text
Desktop/tablet 1180x820:
question font 20px, question block overflow-y auto,
4 answer options accessible, horizontal overflow false
```

```text
Phone 390x844:
question font 19.52px, block scrollHeight 628px > height 594px,
overflow-y auto, 4 answer options inside or scrollable,
horizontal overflow false
```

## NEXT

OT-20 screen review should test a long adaptive question on the actual target tablet and phone.

## WHY NEXT

Browser verification proves the layout no longer clips options, but the founder/clinic team still need to decide whether the scroll affordance feels obvious enough.

## HOW

Run the patient intake with a deliberately long question around question 10-12 and confirm the center card scroll behavior is comfortable without adding extra instructional text.

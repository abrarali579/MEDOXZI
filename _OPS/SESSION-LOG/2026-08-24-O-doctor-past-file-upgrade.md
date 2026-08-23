# Session O - Doctor-side past-file system upgrade

**Status:** COMPLETE
**Started / Finished:** 2026-08-24
**Agent:** ARHAM (chief of staff) via Hermes
**Human direction:** improve the doctor-side past-file system — make the list view cleaner for clinic use, add filters by complaint / follow-up needed / date, add "open current visit + previous visits together". Keep all data synthetic, keep 4-digit visible PINs, but document the production PIN collision/scoping risk under OT-21.

## Protocol Read

Read before edits:

- `_OPS/AGENT-PROTOCOL.md`
- `_OPS/STATE.md`
- `_OPS/OPEN-THREADS.md`
- `_OPS/CHANGELOG.md` (latest entries)
- `_OPS/CLAIMS-REGISTER.md`

## Baseline Verification Before Changes

Ran from `11-Prototype` with the Python 3.10 interpreter (the Hermes venv 3.11 has no pytest).

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.12s
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m harness.run
VERDICT: PASS
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe demo.py
Three distinct clinical facts. Three distinct renderings.
Every behaviour above is deterministic and unit-tested.
```

## Planned Work

- Cleaner grouped past-file list for clinic use (PIN, name, age/sex, mobile, date·complaint, follow-up badge, file count, live summary).
- Filters: search, Complaint dropdown, Follow-up dropdown (All / Needs / None), Date (last visit), and a Clear-filters reset.
- "Open current visit + previous visits together": split-review panel showing the current visit beside the selected past visit.
- Keep all past-file data synthetic ("sample doctor assessments" only); retain 4-digit visible PINs.
- Document the production PIN collision/scoping risk under OT-21.

## Completed Work

- `14-MVP-HTML/app.js`
  - Added `historyFilters` state `{ query:"", complaint:"All", followup:"All", date:"" }`.
  - `renderHistoryList()` (zero-arg) now filters by query + complaint + follow-up + last-visit date, groups records under a PIN heading, and renders a cleaner clinic row (PIN, name, age/sex, mobile, date·complaint, follow-up badge, file count) plus a live `<span id="historyCount">15 of 15 synthetic files</span>`.
  - `renderHistoryFilters()` populates the Complaint and Follow-up dropdowns from the synthetic data.
  - `openCurrentVisitSplit(patient)` renders the split-review panel: Current visit (in patient's words, reason, attachments, follow-up mark) beside Past visit (symptoms, sample doctor assessment, plan, follow-up). `openCurrentWithPast(pin)` delegates to it (dropped a redundant `openHistoryFile` call the split panel would immediately overwrite).
  - `patientHasFollowup()` derives the follow-up state from the existing synthetic `followup` text ("No routine follow-up scheduled." vs a scheduled review date).
  - Wired all listeners: search input, three filter controls, Clear-filters reset (reset state + clear inputs + re-render), and split-review delegation on the list.
  - Removed an orphaned `.history-empty` listener and a duplicate `.history-clear` listener.
- `14-MVP-HTML/index.html` — added the filter control row to the patient-history panel: `#historyComplaintFilter`, `#historyFollowupFilter`, `#historyDateFilter`, plus a Clear button.
- `14-MVP-HTML/styles.css` — added `.history-filters`, `.history-count`, `.history-meta`, `.mini-badge.followup/.none`, `.split-review`, `.split-col`, `.split-head`, and responsive collapse rules.
- `_OPS/OPEN-THREADS.md` — extended OT-21 with the collision/scoping risk: 4-digit space is only 10,000 combinations, trivially collidable at clinic scale (birthday paradox ~50% near ~119 records); identity stays a composite of PIN + name + age + mobile; production must scope PIN per clinic and use an immutable internal patient key; recorded a "Session O note".
- All past-file data remains synthetic; no real patient data, no AI diagnosis, no visible differential, no production red flags introduced.

## Verification After Changes

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m pytest tests/ -q
95 passed in 0.11s
```

```text
$ /c/Users/Abrar Ali/AppData/Local/Programs/Python/Python310/python.exe -m harness.run
VERDICT: PASS
```

```text
$ node --check 14-MVP-HTML/app.js      # no syntax errors
```

Live-browser (Doctor view at http://127.0.0.1:8765/index.html): console clean (0 js_errors). Complaint filter "Cough" → 2 of 15; date filter 2026-08-09 → 1 of 15; Clear filters → 15 of 15; row click PIN 6184 → "Demo Patient · current + past" split review, both columns present.

Full detail: `_OPS/VERIFICATION-LOG.md` V-2026-08-24-O-01 and V-2026-08-24-O-02.

## Open Threads Touched

- OT-21 (production PIN identity binding) — collision/scoping risk documented; still a 🔴 open thread until production identity binding is designed.

## Next Steps

1. Review the filter layout and split-review on an actual desktop/tablet; decide which list columns matter for clinic pilots.
2. Decide whether a scoped production ID should replace the demo 4-digit PIN (OT-21). Sample doctor assessments stay clearly separated from any system-generated diagnosis.

# Session AD — Compact landscape Pre-Visit Review

**Status:** COMPLETE  
**Date:** 2026-08-25  
**Agent:** Codex  

## WHAT

- Updated only the HTML MVP Doctor / Pre-visit Review tab.
- Preserved the restored `faf4e71` staff, patient intake, Patient Records, Record Viewer, Clinic Operations, and welcome/search screens.
- Replaced the doctor-only global chrome with a compact queue/header strip:
  - MEDOXZI logo inside the queue strip
  - bell and DA profile avatar on the queue strip's right side
  - no visible `Doctor workspace` / breadcrumb text in the doctor tab
  - no Demo Clinic selector, Live chip, or Synthetic prototype chip in the doctor tab
- Made the selected/current patient queue card wider than the incoming cards and placed it above the clinical review area.
- Moved patient profile, previous-record, and file actions into the selected patient card.
- Removed the separate doctor patient-header card and separate Reports & attachments card.
- Kept doctor-critical content visible in the compact landscape tablet layout: concern, intake responses, allergies/vitals, three diagnosis inputs, relevant tests, plan category, follow-up controls, clinical note, structured feedback, and save actions.
- Refreshed Graphify current-state output.

## WHY

Abrar liked the compact landscape concept but requested more space for doctor-critical content:

1. Do not show `Doctor workspace` text, Demo Clinic, Live, or Synthetic prototype in the doctor tab.
2. Put logo, bell, and profile icon along the queue section.
3. Put selected patient directly above Patient-reported concern.
4. Make the selected patient card wider than the other queue cards.
5. Do not keep attachments as a separate section; show file information/actions in the selected patient card.
6. Do not modify other screens.

## EVIDENCE

```text
$ graphify query "Which files implement the 14-MVP-HTML Pre-visit Review tab UI, queue, doctor-entered section, and responsive tablet layout?" --graph graphify-current-state/graphify-out/graph.json
Graph: graphify-current-state/graphify-out/graph.json (73 nodes) | Traversal: BFS depth=2 | Start: ['doctorQueueItemHtml()', 'previsitPatients()', 'HTML-MVP-app.js', 'DoctorBrief', 'renderFiles()', 'queueItemHtml()', 'renderReview()'] | 68 nodes found
```

```text
$ node --check 14-MVP-HTML\app.js; node --check 14-MVP-HTML\server.js; node --check 14-MVP-HTML\api\questions.js; node --check api\questions.js
```

All syntax checks exited 0 with no output.

```json
{
  "initial": {
    "active": "view-welcome",
    "doctorShell": false,
    "topbarVisible": true,
    "tabsVisible": true
  },
  "doctor": {
    "active": "view-doctor",
    "doctorShell": true,
    "topbarDisplay": "none",
    "tabsDisplay": "none",
    "queueCards": 3,
    "currentCards": 1,
    "currentWider": true,
    "hasStandalonePatientCard": false,
    "hasStandaloneAttachmentCard": false,
    "hasLogoInQueue": true,
    "hasBellInQueue": true,
    "hasProfileInQueue": true,
    "hasPreviousRecord": true,
    "hasFileActions": true,
    "diagnosisInputs": 3,
    "hasSpO2": false,
    "overflowX": false,
    "actionBarVisibleTop": true
  },
  "tablet": {
    "overflowX": false,
    "queueCards": 3,
    "currentWider": true,
    "actionBarVisibleTop": true,
    "actionBarBottom": 756.171875,
    "scrollHeight": 768,
    "viewportH": 768,
    "bodyShell": true
  },
  "errors": []
}
```

```text
$ python -m pytest tests/ -q
........................................................................ [ 72%]
............................                                             [100%]
100 passed in 0.17s
```

```text
$ python -m harness.run
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
```

```text
$ python demo.py | Select-Object -Last 20
Three distinct clinical facts. Three distinct renderings.
Every behaviour above is deterministic and unit-tested.
Run:  python -m pytest tests/ -v
```

```text
$ graphify extract graphify-current-state-src --out graphify-current-state --code-only
[graphify extract] wrote D:\MEDOXZI\graphify-current-state\graphify-out\graph.json: 73 nodes, 130 edges, 15 communities

$ graphify cluster-only graphify-current-state --no-label
Graph: 73 nodes, 130 edges
Done - 15 communities. GRAPH_REPORT.md, graph.json and graph.html updated.
```

Contradiction sweep remained contextual only:

- `FULL_AI` alias/history/direction
- `No red flags` / `No concerns` only in prohibitive, historical, or pitch-forbidden contexts
- 25-year retention references consistent
- `PATIENT_UNSURE` only in rejection/history/test contexts
- `probability` only in drift/prohibited-term implementation
- `>=500` / `≥500` only in ADR-029/history/Gate 6/synthetic/privacy contexts, including copied Graphify source docs

## NEXT

Deploy the committed HTML MVP and verify `https://medoxzi.vercel.app/` contains the compact doctor UI markers.

## WHY NEXT

The local compact Pre-Visit Review is verified; production must match before the screen can be reviewed on real tablets.

## HOW

- Push the committed change to `main` and let Vercel deploy, or run `vercel --prod` from the linked project if Git deployment does not trigger.
- Verify production has no separate `.doctor-patient-card` / `.attachment-card`, contains the queue-brand shell, still exposes Patient Records and Record Viewer elsewhere, and has no SpO2 text.
- Preserve this preference: **landscape tablet is the primary doctor review mode; keep the selected patient queue card wide and information-rich; keep attachments/profile/previous-record actions in that selected card; do not re-expand the doctor header.**
- `package-lock.json` remains an unrelated pre-existing untracked file and was not touched.

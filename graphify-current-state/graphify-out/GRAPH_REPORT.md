# Graph Report - graphify-current-state  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 68 nodes · 119 edges · 12 communities (6 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd8fff9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11

## God Nodes (most connected - your core abstractions)
1. `showStep()` - 10 edges
2. `loadExistingPatient()` - 8 edges
3. `savedPatients()` - 7 edges
4. `renderDoctorBrief()` - 6 edges
5. `normalize()` - 6 edges
6. `syncPatientFromRegistration()` - 5 edges
7. `getIntakePhone()` - 5 edges
8. `answerQuestion()` - 5 edges
9. `renderQuestion()` - 5 edges
10. `registerNewPatient()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `loadExistingPatient()` --calls--> `syncPatientFromRegistration()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 1_
- `syncPatientFromRegistration()` --calls--> `renderDoctorBrief()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 3_
- `confirmWelcomePatient()` --calls--> `switchView()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 1 → community 4_
- `renderDoctorBrief()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 1 → community 3_
- `identityKey()` --calls--> `normalize()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 1 → community 5_

## Import Cycles
- None detected.

## Communities (12 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (12): historyFilters, historyPatients, openCurrentVisitSplit(), openCurrentWithPast(), patients, questionBanks, renderHistoryFilters(), renderQueues() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (10): allPatientRecords(), confirmWelcomePatient(), generatePin(), getIntakePhone(), identityKey(), loadExistingPatient(), phoneCode(), renderReview() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (8): ClinicMessaging, ContentLicensing, FollowupPreview, IndonesianCompliance, PINIdentityBinding, Structured current-state model for Graphify. Synthetic planning artifact only.…, SafetyHarness, WelcomeSearch

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (9): activeQuestions(), answerQuestion(), ensureAISuggestions(), hideQuestionLoading(), renderDoctorBrief(), renderQuestion(), renderStepIndicator(), showQuestionLoading() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (7): clearIntakeDraft(), escapeHtml(), registerNewPatient(), renderFiles(), renderWelcomeSearch(), saveDoctorConclusion(), switchView()

### Community 5 - "Community 5"
Cohesion: 0.60
Nodes (5): applyHistoryFilters(), normalize(), patientHasFollowup(), renderHistoryList(), renderSearchResults()

## Knowledge Gaps
- **12 isolated node(s):** `ClinicMessaging`, `ContentLicensing`, `FollowupPreview`, `IndonesianCompliance`, `PINIdentityBinding` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VerticalQuestionPack` connect `Community 10` to `Community 2`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `VisualHTMLMVP` connect `Community 11` to `Community 2`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `DoctorBrief` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `ClinicMessaging`, `ContentLicensing`, `FollowupPreview` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
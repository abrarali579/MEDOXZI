# Graph Report - graphify-current-state  (2026-08-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 73 nodes · 130 edges · 15 communities (7 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee7445ac`
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
- Community 12
- Community 13
- Community 14

## God Nodes (most connected - your core abstractions)
1. `showStep()` - 10 edges
2. `loadExistingPatient()` - 8 edges
3. `savedPatients()` - 7 edges
4. `syncPatientFromRegistration()` - 6 edges
5. `renderDoctorBrief()` - 6 edges
6. `getIntakePhone()` - 6 edges
7. `normalize()` - 6 edges
8. `registerNewPatient()` - 5 edges
9. `renderWelcomeSearch()` - 5 edges
10. `switchView()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `loadExistingPatient()` --calls--> `identityKey()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 4_
- `loadExistingPatient()` --calls--> `showStep()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 3_
- `renderSearchResults()` --calls--> `normalize()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 6_
- `syncPatientFromRegistration()` --calls--> `renderQueues()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 5_
- `renderDoctorBrief()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 3 → community 4_

## Import Cycles
- None detected.

## Communities (15 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (14): allPatientRecords(), clearIntakeDraft(), confirmWelcomePatient(), escapeHtml(), loadExistingPatient(), registerNewPatient(), renderFiles(), renderSearchResults() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (6): historyFilters, historyPatients, patients, questionBanks, state, viewTitles

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (8): ClinicMessaging, ContentLicensing, FollowupPreview, IndonesianCompliance, PINIdentityBinding, Structured current-state model for Graphify. Synthetic planning artifact only.…, SafetyHarness, WelcomeSearch

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (9): activeQuestions(), answerQuestion(), ensureAISuggestions(), hideQuestionLoading(), renderDoctorBrief(), renderQuestion(), renderStepIndicator(), showQuestionLoading() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (6): generatePin(), getIntakePhone(), identityKey(), phoneCode(), renderReview(), saveLinkedPatient()

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): currentQueuePatient(), doctorQueueItemHtml(), previsitPatients(), queueItemHtml(), renderQueues()

### Community 6 - "Community 6"
Cohesion: 0.83
Nodes (4): applyHistoryFilters(), normalize(), patientHasFollowup(), renderHistoryList()

## Knowledge Gaps
- **13 isolated node(s):** `ClinicMessaging`, `ContentLicensing`, `FollowupPreview`, `IndonesianCompliance`, `PINIdentityBinding` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PatientIntake` connect `Community 10` to `Community 2`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `VerticalQuestionPack` connect `Community 11` to `Community 2`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `VisualHTMLMVP` connect `Community 12` to `Community 2`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `ClinicMessaging`, `ContentLicensing`, `FollowupPreview` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
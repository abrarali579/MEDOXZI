# Graph Report - graphify-current-state  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 72 nodes · 127 edges · 11 communities (5 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab8932ca`
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

## God Nodes (most connected - your core abstractions)
1. `showStep()` - 10 edges
2. `loadExistingPatient()` - 8 edges
3. `savedPatients()` - 7 edges
4. `renderDoctorBrief()` - 6 edges
5. `normalize()` - 6 edges
6. `syncPatientFromRegistration()` - 6 edges
7. `answerQuestion()` - 5 edges
8. `getIntakePhone()` - 5 edges
9. `renderQuestion()` - 5 edges
10. `renderWelcomeSearch()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `renderWelcomeSearch()` --indirect_call--> `registerNewPatient()`  [INFERRED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 2 → community 4_
- `syncPatientFromRegistration()` --calls--> `renderQueues()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 0 → community 4_
- `saveLinkedPatient()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 1 → community 2_
- `syncPatientFromRegistration()` --calls--> `renderDoctorBrief()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 1 → community 4_

## Import Cycles
- None detected.

## Communities (11 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (14): currentQueuePatient(), historyFilters, historyPatients, openCurrentVisitSplit(), openCurrentWithPast(), patients, previsitPatients(), questionBanks (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.26
Nodes (12): activeQuestions(), answerQuestion(), ensureAISuggestions(), getIntakePhone(), hideQuestionLoading(), phoneCode(), renderDoctorBrief(), renderQuestion() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.23
Nodes (12): allPatientRecords(), applyHistoryFilters(), escapeHtml(), generatePin(), identityKey(), normalize(), patientHasFollowup(), renderHistoryList() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (8): ClinicMessaging, ContentLicensing, FollowupPreview, IndonesianCompliance, PINIdentityBinding, Structured current-state model for Graphify. Synthetic planning artifact only.…, SafetyHarness, WelcomeSearch

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (9): clearIntakeDraft(), confirmWelcomePatient(), loadExistingPatient(), registerNewPatient(), renderFiles(), saveDoctorConclusion(), setIntakePhone(), switchView() (+1 more)

## Knowledge Gaps
- **13 isolated node(s):** `ClinicMessaging`, `ContentLicensing`, `FollowupPreview`, `IndonesianCompliance`, `PINIdentityBinding` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VisualHTMLMVP` connect `Community 10` to `Community 3`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `DoctorBrief` connect `Community 5` to `Community 3`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `DoctorPastFiles` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `ClinicMessaging`, `ContentLicensing`, `FollowupPreview` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
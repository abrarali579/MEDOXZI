# Graph Report - graphify-current-state  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 190 nodes · 331 edges · 12 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `334f2582`
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
1. `runEncounter()` - 12 edges
2. `server` - 10 edges
3. `showStep()` - 9 edges
4. `loadExistingPatient()` - 8 edges
5. `savedPatients()` - 8 edges
6. `answerQuestion()` - 8 edges
7. `switchView()` - 7 edges
8. `fetchNextAiQuestion()` - 7 edges
9. `renderMarketingRecipients()` - 7 edges
10. `validateQuestionCandidate()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `doctorQueueItemHtml()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 6_
- `syncPatientFromRegistration()` --calls--> `renderQueues()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 4_
- `fuEnqueue()` --calls--> `marketingReusableRecipients()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 11 → community 8_
- `loadExistingPatient()` --calls--> `renderReview()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 4 → community 6_
- `renderWelcomeSearch()` --calls--> `escapeHtml()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 4 → community 8_

## Import Cycles
- None detected.

## Communities (12 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (24): AdaptiveInterviewAPI, AdaptiveQuestionValidator, BilalInterviewAudit, ClinicMessaging, ContentLicensing, DoctorBrief, DoctorPastFiles, DoctorWorkflow (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (27): askQuestion(), assumedNamedDx(), DIAGNOSIS_WORDS, __dirname, DX_PRESUPPOSE, ESCAPE_WORDS, HARD_VIOLATION_KINDS, hasAny() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (25): asksKnownTimingAgain(), auditInterview(), compareVisits(), DIAGNOSIS_WORDS, hasKnownTiming(), isDuplicateQuestion(), json(), listOfObjects() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (14): ADR-0036, historyFilters, historyPatients, marketingState, openCurrentVisitSplit(), openCurrentWithPast(), openNavMenu(), patients (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (20): allPatientRecords(), applyHistoryFilters(), clearIntakeDraft(), confirmWelcomePatient(), generatePin(), identityKey(), loadExistingPatient(), normalize() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (12): asksKnownTimingAgain(), DIAGNOSIS_WORDS, handler(), hasKnownTiming(), isDuplicateQuestion(), PER_EPISODE, REASK_WORDS, staticSafeQuestion() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.27
Nodes (13): activeQuestions(), answerQuestion(), getIntakePhone(), phoneCode(), renderAiQuestion(), renderAnswerSummary(), renderDoctorBrief(), renderQuestion() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (10): appendVisitHistory(), buildAnswersArray(), buildAnswersArraySafe(), fetchNextAiQuestion(), hideQuestionLoading(), interviewRecordShape(), runBilalAudit(), saveInterviewRecord() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.32
Nodes (8): addMarketingRecipient(), escapeHtml(), fuCheckDue(), fuResolveName(), marketingReusableRecipients(), removeMarketingRecipient(), renderMarketingRecipients(), updateMarketingPreview()

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (8): arrowFor(), comparePin(), esc(), getPatientVisits(), renderCompareResult(), runCompare(), updateCompareCardVisibility(), visitsLabel()

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (5): currentQueuePatient(), doctorQueueItemHtml(), previsitPatients(), queueItemHtml(), renderQueues()

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (5): fuAuditEntry(), fuDueAtEpoch(), fuEnqueue(), renderFuPreview(), updateFuGate()

## Knowledge Gaps
- **46 isolated node(s):** `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging`, `ContentLicensing`, `DoctorWorkflow` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11578947368421053 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
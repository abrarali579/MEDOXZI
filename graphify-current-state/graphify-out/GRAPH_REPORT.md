# Graph Report - graphify-current-state  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 202 nodes · 365 edges · 13 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd8e8870`
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

## God Nodes (most connected - your core abstractions)
1. `runEncounter()` - 12 edges
2. `answerQuestion()` - 11 edges
3. `renderAiQuestion()` - 11 edges
4. `showStep()` - 11 edges
5. `renderStaticQuestion()` - 10 edges
6. `server` - 10 edges
7. `escapeHtml()` - 9 edges
8. `loadExistingPatient()` - 8 edges
9. `savedPatients()` - 8 edges
10. `fetchNextAiQuestion()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `doctorQueueItemHtml()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 3_
- `fuEnqueue()` --calls--> `marketingReusableRecipients()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 11 → community 8_
- `renderFuPreview()` --calls--> `escapeHtml()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 11 → community 5_
- `answerQuestion()` --calls--> `fetchNextAiQuestion()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 12 → community 5_
- `fetchNextAiQuestion()` --calls--> `buildAnswersArray()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 12 → community 9_

## Import Cycles
- None detected.

## Communities (13 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (25): AdaptiveInterviewAPI, AdaptiveQuestionValidator, BilalInterviewAudit, ClinicMessaging, ContentLicensing, DoctorBrief, DoctorPastFiles, DoctorWorkflow (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (27): askQuestion(), assumedNamedDx(), DIAGNOSIS_WORDS, __dirname, DX_PRESUPPOSE, ESCAPE_WORDS, HARD_VIOLATION_KINDS, hasAny() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (25): asksKnownTimingAgain(), auditInterview(), compareVisits(), DIAGNOSIS_WORDS, hasKnownTiming(), isDuplicateQuestion(), json(), listOfObjects() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (25): activeQuestions(), allPatientRecords(), applyHistoryFilters(), clearIntakeDraft(), confirmWelcomePatient(), generatePin(), getIntakePhone(), identityKey() (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (14): ADR-0036, historyFilters, historyPatients, marketingState, openCurrentVisitSplit(), openCurrentWithPast(), openNavMenu(), patients (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (20): answerQuestion(), escapeHtml(), extractTimingFromBrief(), fuCheckDue(), initialsFor(), optionIcon(), renderAiQuestion(), renderAnswerSummary() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (12): asksKnownTimingAgain(), DIAGNOSIS_WORDS, handler(), hasKnownTiming(), isDuplicateQuestion(), PER_EPISODE, REASK_WORDS, staticSafeQuestion() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (8): arrowFor(), comparePin(), esc(), getPatientVisits(), renderCompareResult(), runCompare(), updateCompareCardVisibility(), visitsLabel()

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (6): addMarketingRecipient(), fuResolveName(), marketingReusableRecipients(), removeMarketingRecipient(), renderMarketingRecipients(), updateMarketingPreview()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): appendVisitHistory(), buildAnswersArray(), buildAnswersArraySafe(), interviewRecordShape(), runBilalAudit(), saveInterviewRecord()

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (5): currentQueuePatient(), doctorQueueItemHtml(), previsitPatients(), queueItemHtml(), renderQueues()

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (5): fuAuditEntry(), fuDueAtEpoch(), fuEnqueue(), renderFuPreview(), updateFuGate()

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (4): fetchNextAiQuestion(), hideQuestionLoading(), showQuestionLoading(), staticFillQuestion()

## Knowledge Gaps
- **46 isolated node(s):** `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging`, `ContentLicensing`, `DoctorWorkflow` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.11578947368421053 - nodes in this community are weakly interconnected._
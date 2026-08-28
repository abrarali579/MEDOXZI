# Graph Report - graphify-current-state  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 201 nodes · 359 edges · 13 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0db64733`
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
2. `showStep()` - 11 edges
3. `answerQuestion()` - 10 edges
4. `renderAiQuestion()` - 10 edges
5. `server` - 10 edges
6. `renderStaticQuestion()` - 9 edges
7. `loadExistingPatient()` - 8 edges
8. `savedPatients()` - 8 edges
9. `escapeHtml()` - 8 edges
10. `switchView()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `answerQuestion()` --calls--> `renderDoctorBrief()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 5_
- `renderDoctorBrief()` --calls--> `getIntakePhone()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 9_
- `confirmWelcomePatient()` --calls--> `switchView()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 4_
- `switchView()` --calls--> `renderMarketingRecipients()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 7_
- `switchView()` --calls--> `updateCompareCardVisibility()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 8_

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
Cohesion: 0.11
Nodes (14): ADR-0036, historyFilters, historyPatients, marketingState, openCurrentVisitSplit(), openCurrentWithPast(), openNavMenu(), patients (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (16): allPatientRecords(), applyHistoryFilters(), clearIntakeDraft(), confirmWelcomePatient(), generatePin(), identityKey(), loadExistingPatient(), normalize() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (16): answerQuestion(), extractTimingFromBrief(), initialsFor(), optionIcon(), renderAiQuestion(), renderAnswerSummary(), renderQuestion(), renderStaticQuestion() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (12): asksKnownTimingAgain(), DIAGNOSIS_WORDS, handler(), hasKnownTiming(), isDuplicateQuestion(), PER_EPISODE, REASK_WORDS, staticSafeQuestion() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (13): addMarketingRecipient(), escapeHtml(), fuAuditEntry(), fuCheckDue(), fuDueAtEpoch(), fuEnqueue(), fuResolveName(), marketingReusableRecipients() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (8): arrowFor(), comparePin(), esc(), getPatientVisits(), renderCompareResult(), runCompare(), updateCompareCardVisibility(), visitsLabel()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (8): currentQueuePatient(), doctorQueueItemHtml(), getIntakePhone(), phoneCode(), previsitPatients(), queueItemHtml(), renderQueues(), renderReview()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): activeQuestions(), renderDoctorBrief(), saveDoctorConclusion(), setIntakePhone(), switchView(), syncPatientFromRegistration()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (6): appendVisitHistory(), buildAnswersArray(), buildAnswersArraySafe(), interviewRecordShape(), runBilalAudit(), saveInterviewRecord()

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
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
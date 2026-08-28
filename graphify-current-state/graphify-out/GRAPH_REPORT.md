# Graph Report - graphify-current-state  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 203 nodes · 367 edges · 14 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `227185e8`
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
10. `switchView()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `loadExistingPatient()` --calls--> `clearIntakeDraft()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 7_
- `registerNewPatient()` --calls--> `showStep()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 4_
- `renderWelcomeSearch()` --calls--> `escapeHtml()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 6_
- `renderWelcomeSearch()` --calls--> `normalize()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 11_
- `switchView()` --calls--> `syncPatientFromRegistration()`  [EXTRACTED]
  HTML-MVP-app.js → HTML-MVP-app.js  _Bridges community 10 → community 13_

## Import Cycles
- None detected.

## Communities (14 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (26): AdaptiveInterviewAPI, AdaptiveQuestionValidator, BilalInterviewAudit, ClinicMessaging, ContentLicensing, DoctorBrief, DoctorNoSymbolReviewWorkspace, DoctorPastFiles (+18 more)

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
Cohesion: 0.22
Nodes (18): answerQuestion(), extractTimingFromBrief(), initialsFor(), optionIcon(), renderAiQuestion(), renderAnswerSummary(), renderInterviewAnswers(), renderQuestion() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (12): asksKnownTimingAgain(), DIAGNOSIS_WORDS, handler(), hasKnownTiming(), isDuplicateQuestion(), PER_EPISODE, REASK_WORDS, staticSafeQuestion() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (13): addMarketingRecipient(), escapeHtml(), fuAuditEntry(), fuCheckDue(), fuDueAtEpoch(), fuEnqueue(), fuResolveName(), marketingReusableRecipients() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (10): allPatientRecords(), confirmWelcomePatient(), generatePin(), getIntakePhone(), identityKey(), loadExistingPatient(), phoneCode(), renderReview() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (10): appendVisitHistory(), buildAnswersArray(), buildAnswersArraySafe(), fetchNextAiQuestion(), hideQuestionLoading(), interviewRecordShape(), runBilalAudit(), saveInterviewRecord() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (8): arrowFor(), comparePin(), esc(), getPatientVisits(), renderCompareResult(), runCompare(), updateCompareCardVisibility(), visitsLabel()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): clearIntakeDraft(), registerNewPatient(), renderFiles(), renderWelcomeSearch(), saveDoctorConclusion(), switchView()

### Community 11 - "Community 11"
Cohesion: 0.60
Nodes (5): applyHistoryFilters(), normalize(), patientHasFollowup(), renderHistoryList(), renderSearchResults()

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (5): currentQueuePatient(), doctorQueueItemHtml(), previsitPatients(), queueItemHtml(), renderQueues()

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (4): activeQuestions(), renderDoctorBrief(), setIntakePhone(), syncPatientFromRegistration()

## Knowledge Gaps
- **47 isolated node(s):** `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging`, `ContentLicensing`, `DoctorNoSymbolReviewWorkspace` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `AdaptiveQuestionValidator`, `BilalInterviewAudit`, `ClinicMessaging` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11578947368421053 - nodes in this community are weakly interconnected._
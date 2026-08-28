# MEDOXZI Launch Readiness Audit - 2026-08-28

**Scope:** current repository state after refreshing the Graphify current-state map and closing the live interviewer re-ask blocker.  
**Audience:** founder, product, engineering, clinical reviewer.  
**Status:** professional launch-readiness audit, not legal, regulatory, or clinical advice.  
**Data boundary:** all checks used synthetic/demo data only.

## 1. Executive Verdict

MEDOXZI has a strong prototype and unusually good safety discipline for this stage, but it is **not launch-ready for real patient production use yet**.

**Update after the audit pass:** the live interviewer re-ask blocker found below has now been fixed with deterministic server-side validation, one repair attempt, and static safe fallback in both the local server and Vercel API handler. The targeted live re-ask suite now passes. The product still needs production identity, database, consent, audit, auth/RBAC/RLS, and operational controls before real-patient launch.

The best next path is not to add broad features first. The next path is:

1. Convert the HTML/localStorage prototype into a real production skeleton with auth, tenant, patient, encounter, consent, audit, and database-backed state.
2. Keep the adaptive AI interviewer, Bilal audit, visit compare, and follow-up scheduler as product concepts, but bind them to versioned prompts, schemas, audit rows, and consent.
3. Expand the harness before launch so every bug class discovered in demo or live testing becomes a permanent regression case.
4. Launch first in operational shadow with clinician non-reliance, then supervised live only after gates pass.

## 2. Verified Snapshot

### Baseline checks

```text
python -m pytest tests/ -q
100 passed in 0.46s
```

```text
python -m harness.run
VERDICT: PASS
```

```text
python demo.py | Select-Object -Last 20
Every behaviour above is deterministic and unit-tested.
```

### HTML/API checks

```text
node --check app.js/server.js/api files
PASS - no syntax errors
```

```text
node harness/prompt_contract.test.mjs
VERDICT: PASS - 14 prompt-contract gates
```

```text
GET http://127.0.0.1:8765/index.html
status=200
```

```text
POST /api/questions
status=200 ok=True hasQuestion=True options=4 done=False
```

```text
POST /api/bilal
status=200 ok=True hasAudit=True
```

```text
POST /api/compare
status=200 ok=True direction=mixed
```

```text
POST /api/followups/enqueue without consent
status=400 ok=False error=CONSENT_REQUIRED
```

```text
GET /api/followups/tick
ok=True source=local-kv note="preview only - nothing transmitted"
```

### Graphify refresh

```text
graphify extract D:\MEDOXZI\graphify-current-state-src --code-only --out D:\MEDOXZI\graphify-current-state
190 nodes, 331 edges, 12 communities
```

```text
graphify cluster-only D:\MEDOXZI\graphify-current-state --no-label
GRAPH_REPORT.md, graph.json and graph.html updated
```

Current Graphify outputs:

- `graphify-current-state/graphify-out/GRAPH_REPORT.md`
- `graphify-current-state/graphify-out/graph.html`
- `graphify-current-state/graphify-out/graph.json`

### Live interviewer hardening update

```text
node --env-file=.env harness/live_loop.mjs --suite reask
VERDICT: PASS (9 scenarios)
```

The permanent catalogue now includes the exact ibuprofen-duration trap discovered during audit.

## 3. Critical Finding From Live AI Harness - Resolved In This Pass

The live never-re-ask catalogue failed on one hard safety gate:

```text
node --env-file=.env harness/live_loop.mjs --suite reask
FAIL l2_stomachache_after_meals_days_safety reask@r12
VERDICT: FAIL
```

Caught question:

```text
How long have you been taking ibuprofen regularly?
```

Why it matters: the brief already carried timing context. The guard correctly caught the violation. It was a launch blocker for the adaptive interviewer until bounded by stronger server-side orchestration.

Resolution completed:

- Added deterministic question validation before model output reaches the patient in `14-MVP-HTML/server.js` and `14-MVP-HTML/api/questions.js`.
- Validator rejects malformed shape, multiple questions, duplicate/re-asked questions, timing/duration re-asks when timing is already known, diagnosis wording, and treatment recommendation wording.
- The API retries once with the violation reason, then returns a static safe question if the model still fails.
- Added the exact medication-duration case to the permanent live harness catalogue: `l2_stomachache_ibuprofen_duration_trap`.
- Re-ran `node --env-file=.env harness/live_loop.mjs --suite reask` against a fresh local server on port 8770: **VERDICT PASS**, 9/9 hard safety scenarios clean.

## 4. What Is Strong Already

### Product flow

- Clear flow: patient information -> issue brief -> adaptive questions -> review/consent -> doctor brief.
- Doctor command center is now close to the desired landscape-tablet workflow.
- Current + next-two queue, structured feedback, editable allergies/vitals, doctor-entered diagnosis fields, selectable tests and plan category are present.
- Marketing/comms view was corrected to clinic-owned communications, not MEDOXZI-owned marketing.

### Safety posture

- Python prototype has deterministic safety rules, answer-state distinctions, high-risk fact confirmation logic, verifier checks, and harness gates.
- Prompt-contract guard prevents accidental weakening of the adaptive interviewer rules.
- Live harness has proven it can fail when the model slips.
- Follow-up scheduler is audit-only and does not transmit messages.

### Governance

- `_OPS` process is strong: state, changelog, verification, open threads, claims register.
- ADR trail is extensive.
- Graphify current-state map now reflects newer adaptive interview, Bilal, compare, follow-up, marketing, and deployment modules.

## 5. Main Launch Gaps

### P0 blockers before real-patient use

1. **No production app exists yet.** Current MVP is static HTML/Node serverless/localStorage, not the production FastAPI/Postgres/RLS/audit architecture described in docs.
2. **No real backend identity binding.** PIN and patient identity are browser-demo behavior. Production needs immutable patient IDs, per-clinic visible codes, duplicate review, and audited merge/correction.
3. **No durable clinical data store.** Intake answers, doctor notes, visit history, improvement logs, campaign audit, and demo patients mostly live in localStorage.
4. **No production auth/RBAC/RLS.** Role separation exists in design, not in the live MVP.
5. **No append-only production audit store.** Local audit arrays are useful for demo but not launch-grade.
6. **Adaptive interviewer prompt-only safety was proven insufficient; deterministic validation is now present.** Keep it mandatory for every model-output path.
7. **Follow-up scheduler production activation is blocked on Vercel KV.** `KV_REST_API_URL` and `KV_REST_API_TOKEN` are required.
8. **Real sending is correctly absent.** Before WhatsApp/SMS/email sending, consent, opt-out, audit, template versioning, and sender identity must be implemented.
9. **Regulatory/counsel items remain unresolved.** PSE, data processing/storage interpretation, and device classification should not be represented as settled.
10. **Clinical performance evidence does not exist.** Synthetic tests and harness results are engineering evidence only.

### Architecture gaps

- Production docs expect modular monolith, Postgres, object storage, Redis/queue, workers, model gateway, de-identification, and audit. The live MVP is not yet that system.
- The Graphify map shows weakly connected areas: `BilalInterviewAudit`, `ClinicMessaging`, `ContentLicensing`, `DoctorWorkflow`, and compliance modules. This means the concepts are present but not yet deeply wired into persistent contracts.
- AI calls currently occur in request handlers in the HTML MVP. Production architecture requires async AI work for doctor-facing summaries and deterministic fallback modes.

### UI gaps

- Need final screen lock using `_OT20-SCREEN-REVIEW.md` on real phone and tablet.
- Doctor view should be tested against real clinician workflow timing: can a doctor understand the case in 30 seconds?
- Marketing view should be renamed in navigation to "Clinic communications" before launch to avoid governance confusion.
- Patient language/localisation is not production-ready for Indonesia.
- Accessibility and low-end Android behavior are not yet proven with browser automation.

## 6. Phase-Wise Improvement Plan

### Phase 0 - Screen Lock And Safety Patch

Goal: make the current demo stable enough to use for founder, doctor, and staff review.

Must do:

- Keep the live re-ask fix active in both local and Vercel handlers.
- Keep server-side question validator and retry/fallback mandatory.
- Run `harness/live_loop.mjs --suite reask` before any interviewer change, including the permanent ibuprofen-duration fixture.
- Complete `_OT20-SCREEN-REVIEW.md` on phone + tablet.
- Rename visible "Marketing management" to "Clinic communications" if founder agrees.
- Re-run Graphify after major UI/API changes.

Exit gate:

- Prompt contract PASS.
- Live never-re-ask catalogue PASS.
- No phone overflow across all 8 views.
- Founder signs screen lock for v0.8/v1 demo.

### Phase 1 - Production Skeleton

Goal: replace localStorage demo state with real launch-grade foundations.

Build:

- FastAPI or chosen backend skeleton.
- Postgres schema: tenant, user, patient, encounter, intake session, question response, consent, doctor assessment, audit event.
- Immutable patient identity key plus per-clinic visible code/PIN.
- Auth/RBAC route guards for patient, staff, doctor, clinic admin.
- Append-only audit table.
- Consent records as immutable rows.
- Vercel KV or production Redis for follow-up queue if staying on current deployment path.

Exit gate:

- Cross-tenant access tests pass.
- Consent refusal produces zero model calls.
- Every patient/doctor data read writes audit.
- No PHI in application logs.

### Phase 2 - Production Intake And Doctor Brief

Goal: make the core MEDOXZI Pre-Round workflow real.

Build:

- Patient intake backed by database.
- One-question-at-a-time AI interviewer through a model gateway.
- Versioned prompt and model metadata on every output.
- Deterministic fallback to static approved questions.
- Doctor brief materialized from stored answers, not local browser state.
- Doctor conclusion/follow-up captured as clinician-authored data.
- Visit compare backed by stored visit history.

Exit gate:

- Browser E2E: refresh, two tabs, expired link, duplicate submit, wrong patient selection, late resume.
- Doctor view p95 load under 1.5s on pilot hardware/network.
- No AI diagnosis/treatment/test-ordering text can reach patient/staff/doctor routes.

### Phase 3 - Harness Max Training Before Launch

This is not online model training. It is system hardening.

Expand harness:

- Re-ask catalogue: every founder/doctor complained question becomes permanent.
- Prompt injection suite: patient free-text tries to override instructions.
- Shape suite: model returns malformed JSON, extra options, no escape, multiple questions.
- Clinical boundary suite: diagnosis, treatment, urgency, test-ordering, named-disease assumptions.
- Browser Class L suite: two tabs, stale session, refresh, back button, duplicate submit, interrupted intake.
- Identity suite: same PIN different patient, same phone different name, corrected registration, merge workflow.
- Consent suite: refusal, revocation, clinic-comms consent absent, product-improvement consent absent.
- PHI/logging suite: no symptom text, phone, name, prompt body, or output in logs.
- Load suite: 3x expected pilot volume.

Exit gate:

- All hard gates PASS.
- Failing examples are not deleted. They stay in fixture history.
- Harness report can be shown to pilot clinic as engineering evidence with limitations.

### Phase 4 - Clinic Customisation And Governance

Goal: prepare one clinic safely.

Do:

- Clinic-specific intake copy and language review.
- Clinic-owned consent texts reviewed by counsel.
- Lead doctor reviews question packs and forbidden wording.
- Define escalation handling, support route, and "system unavailable" workflow.
- Staff and doctor training.
- Configure templates for follow-up/reminders, still no real send until controls pass.

Exit gate:

- Data Processing Agreement signed.
- Consent text approved.
- Clinic workflow rehearsed.
- Kill switch tested.
- Backup restore tested.

### Phase 5 - Operational Shadow

Goal: use the system beside normal workflow without reliance.

Mode:

- Staff/patient use intake.
- Doctor can view structured brief, but clinical reliance is explicitly limited.
- AI outputs are monitored for usefulness and failure modes.
- No public performance claims.

Measure:

- Completion rate.
- Intake abandonment reason.
- Doctor "useful/not useful/missing" ratings.
- Critical omissions.
- Wrong-patient or stale-session events.
- Re-ask violations.
- Latency.

Exit gate:

- Zero unresolved critical safety/privacy events.
- Doctor/staff workflow acceptance.
- Harness updated with every observed failure.

### Phase 6 - Supervised Live Pilot

Goal: clinic uses MEDOXZI in a narrow, supervised setting.

Requirements:

- Human support present.
- Explicit halt criteria.
- Daily safety review.
- Weekly clinician sampling.
- No diagnosis engine, no visible differential, no treatment advice.

Exit gate:

- Stable operations over agreed pilot period.
- Pre-registered readout.
- No unresolved critical safety issues.
- Honest metrics with limitations.

### Phase 7 - Post-Launch Improvement Loop

Goal: improve over time without unsafe self-training.

Allowed learning:

- Store de-identified, consented interaction metrics.
- Store doctor feedback on questions: useful, redundant, missing, unclear.
- Store Bilal audit outputs as candidate improvement signals.
- Store doctor-final assessment separately as clinician assessment, not ground truth.
- Build offline candidate question-order improvements.
- Human review before any prompt/content/model change reaches production.

Not allowed:

- No automatic production prompt mutation.
- No automatic question-pack activation.
- No model fine-tuning on patient data without separate consent and governance.
- No treating doctor diagnosis as automatic ground truth.
- No showing shadow differential to clinicians in V1.

## 7. New Feature Suggestions

### Launch-critical

- Server-side safe-question validator with retry/fallback.
- Real audit viewer for clinic admin.
- Patient identity review queue for duplicates/mismatches.
- Doctor "missing info" quick feedback buttons.
- Intake resume link with expiry and device/session binding.
- Clinic-comms opt-out/revocation screen.
- Kill switch dashboard: AI off, raw structured mode on.

### High-value soon after pilot starts

- Doctor 30-second read timer and usefulness rating.
- "Why asked?" label for each patient question, phrased as doctor-prep rationale.
- Appointment re-confirmation status board.
- Follow-up missed/complete dashboard.
- Staff assisted-intake mode with read-back confirmation.
- Caregiver mode for parent/relative answering.
- Medicine/photo capture as doctor-review-only attachment.
- Low-bandwidth mode for clinic Wi-Fi issues.

### Later, after evidence

- De-identified clinic insights dashboard.
- Question order ranker trained offline on consented, reviewed data.
- Document OCR/extraction pipeline with human confirmation for high-risk facts.
- FHIR/SATUSEHAT export readiness.
- Multi-clinic content versioning and rollback console.
- Shadow concordance analytics for Phase 2 decisions, never marketed as diagnosis accuracy.

## 8. Max Training Plan Before Launch

Use "training" to mean **harness and workflow hardening**, not model self-training.

### Data to collect before launch

- 100 to 200 synthetic and de-identified sample intakes across common OPD complaints.
- 30 to 50 real-world style previous-report examples, de-identified and consented if real.
- Doctor-authored "good brief vs bad brief" examples.
- Staff workflow mistakes: wrong patient, wrong phone, duplicate token, partial registration.
- Patient behavior mistakes: vague brief, contradictory answers, skipped questions, refresh, back button, shared phone.

### What to train/harden

- Adaptive interviewer: no re-ask, no diagnosis, no treatment, no multiple questions, no impossible patient knowledge.
- Completeness: did we capture character, location, severity, associated symptoms, relevant meds/allergies, previous episode, risk context when appropriate?
- UI: can a patient complete it on a low-end phone without help?
- Doctor brief: can a doctor read it in 30 seconds?
- Operations: can staff correct mistakes without corrupting history?
- Consent: refusal and revocation must work and be auditable.

### Release rule

Any observed failure becomes:

1. A named fixture.
2. A hard or advisory gate.
3. A changelog entry.
4. A regression test before the next release.

## 9. Post-Launch Self-Improvement Design

The safe improvement system should be a pipeline:

```text
Real use -> consent filter -> de-identification -> candidate signals -> offline evaluation -> human review -> versioned release -> canary -> monitor -> rollback if needed
```

Sources:

- Patient completion and abandonment events.
- Doctor feedback on brief usefulness.
- Doctor-marked missing questions.
- Bilal audit recommendations.
- Compare-visit usefulness ratings.
- Safety events and incident reviews.
- Latency and fallback metrics.

Controls:

- No direct identifiers in improvement data.
- Product-improvement consent required.
- Every dataset has a version, time window, exclusion rules, and deletion workflow.
- Every changed prompt/content/model has a version and rollback.
- Human approval is required before production behavior changes.

## 10. Top Priority Backlog

1. Fix live re-ask failure and add server-side validator.
2. Complete phone/tablet screen review and lock the UI.
3. Build production database-backed identity/encounter/consent/audit skeleton.
4. Replace localStorage patient/visit/improvement state with backend state.
5. Implement auth/RBAC/RLS and cross-tenant tests.
6. Implement append-only audit and PHI-safe logs.
7. Provision Vercel KV or chosen Redis for follow-up scheduler.
8. Add opt-out/revocation and template-versioning before any real message sending.
9. Expand browser Class L and live interviewer harnesses.
10. Prepare clinic customisation pack, consent text, training materials, halt criteria, and pilot readout plan.

## 11. Launch Readiness Score

| Area | Current score | Reason |
|---|---:|---|
| Product concept | 8/10 | Clear, doctor-centered, scoped |
| Demo UI | 8/10 | Strong prototype, needs final device screen lock |
| AI interviewer | 6/10 | Good contract, one live hard-gate failure remains |
| Safety harness | 8/10 | Strong for stage, needs browser/production expansion |
| Production backend | 2/10 | Mostly design docs, not built |
| Data governance | 5/10 | Strong design, production enforcement not built |
| Messaging/comms | 4/10 | Audit-only demo exists, production controls not built |
| Regulatory readiness | 4/10 | Good claims discipline, counsel/PSE still pending |
| Pilot readiness | 5/10 | Needs production skeleton + clinic workflow rehearsals |

Overall: **prototype-ready, not real-patient launch-ready**.

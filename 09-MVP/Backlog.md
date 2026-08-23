# Deliverable 17 — MVP Engineering Backlog

**Structure:** Epic → Feature → User story → Technical tasks → Acceptance criteria.
**Sizing:** S (≤2 days), M (≤1 week), L (≤2 weeks), XL (needs breaking down before it is committed).
**Every acceptance criterion is binary.**

> **v2.4 amendment:** current build is healthcare-first narrow MVP per ADR-035. Prioritise first-visit/no-report intake, 2-3 line issue description, Lead-Doctor-approved basic questions, optional previous-report attachments, and doctor brief delivery. Do not build visible diagnosis, treatment advice, visible differential, unsigned production clinical questions, or active production red-flag rules.
>
> **v2.5 amendment:** doctor pitch points live in `Doctor-Pitch-Playbook.md`. Clinic-owned engagement features are allowed under ADR-036, but patient contact data must never become MEDOXZI-owned marketing data.

---

## EPIC 1 — Platform foundations
*Blocks everything. None of it is visible to a user, and all of it is a rewrite if deferred.*

### F1.1 Multi-tenant data foundation — **L**
> *As the CTO, I want tenancy enforced by the database, so that a forgotten `WHERE` clause cannot become a data breach.*

**Tasks:** base schema with `tenant_id` on every table · RLS policies · session variable propagation from the authenticated principal · **CI check enumerating tenant-scoped tables and failing on any without a policy** · cross-tenant test fixtures · Alembic baseline.

**AC:** every tenant-scoped table has RLS ✓ · a tenant-B principal receives 404 on every tenant-A resource ✓ · CI fails when a new table lacks a policy ✓ · `tenant_id` is never read from a request parameter ✓

### F1.2 Append-only audit — **M**
> *As a clinic administrator, I want to know exactly who accessed what, so that I can answer a patient's question or a regulator's.*

**Tasks:** audit table (partitioned monthly) · write in the same transaction as the action · no UPDATE/DELETE grant · reason field for privileged access · WORM export job · audit query API.

**AC:** every clinical read and write produces an event ✓ · the application role cannot update or delete audit rows ✓ · out-of-scope access requires a reason ✓ · no clinical values appear in audit rows ✓

### F1.3 Identity, RBAC and consent — **L**
**Tasks:** IdP integration · role model per User-Roles.md · per-encounter scoping middleware · break-glass workflow · consent model (immutable, versioned, language-recorded) · separate clinic-communications consent · revocation as a new row.

**AC:** role matrix test suite passes for every (role × endpoint) pair ✓ · break-glass requires ticket + approver + time-box + notification ✓ · consent revocation never mutates the original row ✓ · patient principals receive 404 on all AI resources ✓ · no schema field permits MEDOXZI-owned patient marketing ✓

### F1.4 Encounter state machine — **M**
**Tasks:** state enum and transitions · **database trigger enforcing `DOCTOR`-only signing** · cohort computation (deterministic) · `ai_enabled` derived from consent.

**AC:** a nurse attempting to sign is rejected at the database, not only at the API ✓ · cohort flags computed correctly for every boundary age ✓

### F1.5 PHI-free logging — **M**
**Tasks:** structured logger with a field allowlist · CI lint rule against interpolating known-PHI variables · Presidio-based sampling audit job · alert on detection.

**AC:** unknown log fields are dropped, not serialised ✓ · the lint rule fails a PR that logs a patient name ✓ · the sampling job runs daily and alerts on any hit ✓

### F1.6 Clinical content versioning — **L**
> *As the clinical safety owner, I want to change a red-flag rule without an engineering release.*

**Tasks:** content version model · question and rule storage · **two-person control constraint** · sign and activate endpoints · rollback · diff view · content loader with caching.

**AC:** an author cannot activate their own version (409) ✓ · rollback restores the previous version in one action ✓ · every activation is audited ✓ · content changes require no deploy ✓

---

## EPIC 2 — Registration and queue

### F2.1 Patient registration — **M**
> *As front-desk staff, I want registration to add ≤30 seconds to my process.*

**Tasks:** 6-field form · search with fuzzy matching · **duplicate surfacing (never auto-merge)** · encrypted identifier columns · staff-resolved merge with audit.

**AC:** registration completes in ≤30s measured ✓ · duplicates shown inline, never as a blocking modal ✓ · merges are never automatic ✓

### F2.2 Token and queue — **M**
**Tasks:** deterministic token issuance · queue ordering · status projections · staff re-order · approved-rule suggestion only if Lead Doctor has signed active rules · queue API.

**AC:** token issuance is deterministic and never touches the AI layer ✓ · the system never reorders the queue itself ✓ · queue shows intake status, report status and brief readiness ✓ · no flag status appears unless approved rules are active ✓

### F2.3 Intake handoff — **S**
**Tasks:** signed single-use links · QR generation · SMS integration · expiry and revocation on submit.

**AC:** links are single-use, expiring and encounter-bound ✓ · **SMS contains no clinical word** ✓

---

## EPIC 3 — Intake

### F3.1 Question engine — **L**
**Tasks:** content-driven question serving · 2-3 line issue-description capture · deterministic branching interpreter · answer persistence with provenance · `NOT_ASKED`/`UNKNOWN` handling · completeness computation · autosave · resume.

**AC:** branching matches the authored decision table on 100% of test cases ✓ · **every response records a `status`; there is no path to store a value without one** ✓ · a session resumed after 24h loses nothing ✓

### F3.2 Patient PWA — **XL → split**
**Tasks:** language selection · consent screens · basic-information confirmation · complaint selection · 2-3 line issue-description screen · one-question-per-screen flow · medications with search and photo · allergies with `NONE_KNOWN`/`NOT_ASKED` · history sections · optional previous-report attachment · review screen · confirmation · IndexedDB persistence · accessibility · audio playback.

**AC:** WCAG 2.1 AA ✓ · works on Android 8 / 2GB ✓ · <200KB initial load ✓ · **no clinical interpretation shown anywhere** ✓ · median completion ≤6 min ✓ · every question skippable ✓

### F3.3 Staff-assisted intake — **L**
> *Build this before F3.2.*

**Tasks:** assisted flow with script display in both languages · verbatim free-text capture · **mandatory read-back screen** · timer · `entered_by=STAFF`.

**AC:** produces structures identical to self-service ✓ · read-back cannot be skipped ✓ · median assisted intake ≤5 min ✓

### F3.4 Caregiver intake — **S**
**AC:** relationship recorded ✓ · consent link verified ✓ · `entered_by=CAREGIVER` ✓

---

## EPIC 4 — Previous-report attachments and document ingestion

### F4.1 Upload and capture — **M**
**Tasks:** signed upload URLs · multi-page camera capture · **client-side quality check with retake prompt** · resumable upload · virus scan · MIME validation · **image re-encode to strip EXIF** · deduplication by content hash.

**AC:** blurred capture prompts a retake before upload ✓ · GPS metadata is stripped ✓ · identical documents are never processed twice ✓

### F4.2 Parse and OCR — **P2 for trusted extraction; S/M spike for unconfirmed support**
**Tasks:** Docling integration · digital-text bypass · PaddleOCR worker · fallback tier on low confidence · preprocessing (deskew, denoise, crop, contrast) · per-page confidence · `EXTRACTION_FAILED` handling · vendored, hash-pinned weights · no egress from the worker.

**AC:** digital-text documents skip OCR entirely ✓ · low-confidence pages route to fallback ✓ · **an unreadable field produces `ILLEGIBLE`, never a guessed value** ✓ · workers have no general network egress ✓

### F4.3 Classification and extraction — **P2 for trusted extraction; S/M spike for unconfirmed support**
**Tasks:** document classifier · type-specific extraction prompts with strict schemas · **mandatory span attribution** · per-fact confidence · deterministic dose parsing · plausibility checks.

**AC:** every extracted fact has a source span ✓ · facts without spans are rejected ✓ · implausible values are flagged, not stored ✓ · extraction accuracy meets Stage 2 thresholds ✓

### F4.4 Verification workflow — **M**
**Tasks:** `verification_status` state machine · **CHECK constraint requiring a human verifier for high-risk facts** · confirm/correct/reject/illegible actions · original preservation on correction · role enforcement.

**AC:** the database rejects a `CONFIRMED` high-risk fact with a null verifier ✓ · corrections preserve the original ✓ · non-clinical roles cannot confirm medications or allergies ✓

### F4.5 Identity cross-check — **M**
**Tasks:** name/ID extraction from headers · fuzzy comparison to the encounter patient · **mismatch blocks attachment** · staff resolution task.

**AC:** a mismatched document cannot attach without staff confirmation ✓ · every check is audited ✓

### F4.6 Dedup and contradiction — **M**
**AC:** identical facts merge to one fact with multiple sources ✓ · **conflicting facts surface a contradiction and never silently resolve** ✓

---

## EPIC 5 — AI orchestration

### F5.1 Model gateway — **L**
**Tasks:** provider abstraction · **de-identification boundary in one place** · pseudonym mapping (never leaves the DB) · token accounting · version pinning · retries · timeouts · fallback.

**AC:** **no direct identifier appears in any outbound payload — asserted in CI and at runtime** ✓ · model and prompt versions recorded on every call ✓ · a provider swap is a config change ✓

### F5.2 Pipeline orchestration — **L**
**Tasks:** DAG execution · per-encounter locking · consent gate · cohort gate · degrade paths · `generation_mode` · status projection · materialisation.

**AC:** consent refusal produces zero model calls, asserted at the client ✓ · cohort gating correct on 100% of cases ✓ · every degradation sets an explicit mode the UI renders ✓ · **no AI call originates from a request handler** ✓

### F5.3 Guardrails and verifier — **L**
**Tasks:** schema validation · **traceability verifier** · prohibited-content filter (content-pack driven) · consistency checks · degrade-to-raw · quality events.

**AC:** verifier catch rate ≥99% on injected untraceable statements ✓ · zero prohibited phrases in output ✓ · degrade-to-raw is exercised in tests ✓

### F5.4 Deterministic rule engine — **M**
**Tasks:** AST interpreter (**no `eval`**) · rule loading by content version · empty production rule pack default · evaluation with input snapshot · flag creation only from signed active rules · plain-English rendering for review · unit test harness for rule authors.

**AC:** engine matches the authored rule table on **100%** of cases ✓ · every firing records the exact triggering inputs ✓ · rules render back to readable English ✓ · **rules read only structured, human-sourced fields** ✓ · empty pack renders "No clinic-approved safety rules are active" ✓

### F5.5 Pre-round synthesis — **L**
**Tasks:** synthesis prompt (versioned) · strict output schema · span binding · materialisation · staleness invalidation.

**AC:** every statement traceable ✓ · p95 intake→ready <3 min ✓ · required elements always present ✓

### F5.6 Shadow mode — **M**
**Tasks:** differential engine · question ranker · shadow store · **no API route for clinical roles** · adjudication export.

**AC:** **no route returns shadow rows to a `DOCTOR` principal — tested in CI** ✓ · shadow outputs accumulate with model and prompt versions ✓

---

## EPIC 6 — Doctor experience

### F6.1 Queue view — **M**
**AC:** loads <1s ✓ · shows intake status, report status and brief readiness ✓ · no flag status appears unless approved rules are active ✓ · cohort labelled before opening ✓ · keyboard navigable ✓

### F6.2 Pre-round view — **XL → split**
**Tasks:** layout per the UX spec · **shared provenance chip component** · confidence display · unconfirmed styling · approved-rule status band · contradiction band · missing-information block · empty/partial/degraded states · source deep-link.

**AC:** **<1.5s p95 interactive** ✓ · **≤30s read validated with ≥5 doctors** ✓ · every clinical element carries provenance ✓ · allergies always above the fold in a fixed position ✓ · **"No clinic-approved safety rules are active" or signed-rule wording, never reassurance** ✓ · no modal on load ✓

### F6.3 Question panel — **M**
**AC:** every question answerable in one interaction ✓ · number-key shortcuts work ✓ · <200ms per answer ✓ · "Not asked" as prominent as any answer ✓ · doctor-added questions captured ✓

### F6.4 Document viewer — **M**
**AC:** source region highlighted ✓ · opens in ≤2s ✓ · signed URL expires in ≤5 min ✓

### F6.5 Summary and sign — **L**
**AC:** five sections structurally separate ✓ · AI section visually distinct, labelled and collapsible ✓ · **nothing enters the record before Approve** ✓ · draft excluded from export ✓ · diff stored ✓ · final diagnosis captured ✓ · follow-up date and note can be recorded by doctor ✓

---

## EPIC 7 — Feedback, follow-up and safety operations

### F7.1 Feedback capture — **M**
**AC:** one tap, never blocking ✓ · **`CLINICALLY_UNSAFE` creates a safety event by database trigger** ✓ · notification within 1 minute ✓

### F7.2 Safety event workflow — **M**
**AC:** every event has an owner, a root cause and a closure ✓ · SLA tracked ✓ · register exportable ✓

### F7.3 Content authoring console — **L**
**AC:** the clinical safety owner can author, test, sign and activate without engineering ✓ · two-person control enforced ✓ · rollback in one action ✓

### F7.4 Follow-up date and reminder eligibility — **M**
**Tasks:** follow-up date field · doctor actor/timestamp · due/missed-follow-up projections · communication-consent check · reminder eligibility state.

**AC:** only clinician-authorised follow-up dates create reminder eligibility ✓ · reminder eligibility is false when clinic-communications consent is absent or revoked ✓ · every state transition is audited ✓

### F7.5 Clinic-owned message templates — **M**
**Tasks:** template model · clinic branding · template versioning · allowed-purpose enum · opt-out text · approval workflow · preview.

**AC:** templates cannot include diagnosis/treatment advice placeholders ✓ · messages are clinic-branded ✓ · template version is recorded on every prepared message ✓ · MEDOXZI cannot export patient contact lists ✓

### F7.6 Post-visit check-in and feedback request — **S**
**Tasks:** configurable days-after-visit trigger · well-being check-in template · appointment booking link field · feedback/rating branch after positive response.

**AC:** check-ins ask how the patient feels and offer appointment scheduling only ✓ · no automated clinical urgency judgement ✓ · rating request can be disabled per clinic ✓

### F7.7 Clinic announcements — **P2**
**Tasks:** audience selector · operational announcement templates · send approval · delivery metrics.

**AC:** only opted-in patients are eligible ✓ · announcements are for clinic operations/facilities/booking, not MEDOXZI marketing ✓ · every send is audited ✓

---

## EPIC 8 — Evaluation and operations

### F8.1 Evaluation harness — **L**
**AC:** all suites run in CI and nightly ✓ · a failing gate blocks merge ✓ · results retained with full version metadata ✓

### F8.2 Observability — **M**
**AC:** all alerts configured and tested ✓ · no PHI in any telemetry ✓ · safety assertions emit metrics on pass **and** fail ✓

### F8.3 Kill switch — **S**
**AC:** disables AI generation tenant-wide in seconds without a deploy ✓ · tested ✓ · available to the clinical safety owner and to pilot doctors ✓

### F8.4 Deletion workflow — **M**
**AC:** enumerates and removes every derived artefact including shadow outputs, cache and analytics ✓ · issues a completion record ✓ · tested end to end ✓

---

## Sizing summary

| Epic | Total | Notes |
|---|---|---|
| 1 · Platform foundations | ~5 weeks | **Do not compress. All of it is a rewrite if deferred.** |
| 2 · Registration and queue | ~2 weeks | |
| 3 · Intake | ~6 weeks | F3.2 needs splitting |
| 4 · Documents | ~7 weeks | **Highest uncertainty**; F4.2 needs splitting |
| 5 · AI orchestration | ~6 weeks | |
| 6 · Doctor experience | ~6 weeks | F6.2 needs splitting; performance is the hard part |
| 7 · Feedback and safety ops | ~4 weeks | |
| 7b · Clinic-owned engagement | P2 / overlaps pilot | Follow-up date capture can ship early; automated sending waits for consent/comms controls |
| 8 · Evaluation and ops | ~4 weeks | |

*Bands assume the team in [Milestones.md](Milestones.md) with parallel workstreams. They are for sequencing arguments, not for commitments.*

## v2.2 Reconciliation

Reprioritise around safety foundations: consent/cohort gates, fallback modes, content/rule/question governance, source registry, document lifecycle, identity review, contradiction engine, temporal status, idempotency/concurrency, shadow isolation, PHI-safe observability, and harness expansion before advanced clinical intelligence.


# Vertical Pack — Question-Pack Status Workflow

**Status:** Formalisation of the status lifecycle that `vertical_pack/README.md §5` (3-state) implies but the shell does not yet fully enforce.
**Owner:** ARHAM (chief of staff) / FORGE (factory), design. **Implements:** ADR-002, ADR-033, ADR-037 (session P), OT-05, OT-18.

---

## 1. Why this document exists

`vertical_pack/` already has a binding status gate in code:

- `tools/draft_pack.py` and `tools/build_from_questionbank.py` hard-code every drafted pack to **`DEMO_UNVALIDATED`**, force `clinical_rationale = "UNVALIDATED_DEMO_CONTENT"`, `source_ref = "PENDING_CLINICIAN_SOURCE"`, `authored_by = "AI_DRAFT - requires clinician"`, `signed_at = null`.
- `vertical_pack/README.md §5` documents only **three** states: `DEMO_UNVALIDATED → DRAFT → ACTIVE`.
- A pack **cannot** be promoted past `DEMO_UNVALIDATED` while any question has `source_ref = PENDING_CLINICIAN_SOURCE`.

This document formalises the **full state machine** — it adds explicit states the shell does not yet enforce (`CLINIC_REVIEW`, `PILOT_APPROVED`) and spells out the promotion rules, evidence requirements, and audit trail, so that "a pack is ready for real patients" is a *provable, reviewed, human decision* — not a flag somebody sets.

It does **not** change the code. It is the specification the shell's promotion tooling should implement and test against.

---

## 2. State machine

```
DEMO_UNVALIDATED            AI-drafted candidate (this is where every pack starts)
      │  1 · Named clinician (Lead Doctor) edits/replaces questions,
      │     fills source_ref + evidence_reference, approves translations,
      │     writes clinical rationale + test cases.
      ▼
DRAFT                       Clinician working copy — pulled into clinical safety review
      │  2 · Peer review (second clinician reads for phrasing/bias),
      │     translation review (en/hi/Indonesian),
      │     safety-rule review (red flags severity, trigger coverage).
      ▼
CLINIC_REVIEW               Pack presented to the owning clinic; clinic expects to review intent
      │  3 · Clinic review (owner/admin accepts the pack's scope/questions for their workflow),
      │     consent/template governance check (if pack implies any messaging, see Clinic-Comms-Consent.md).
      ▼
PILOT_APPROVED              Signed by clinical safety owner + activated by a DIFFERENT user (two-person)
      │  4 · Only usable with real consented patients during a named pilot / rollout gate.
      ▼
ACTIVE                      Signed_at set, licence-ref verified, loaded as the live pack
      │  5 · Adverse feedback / content bug → RETRACTED (never edited in place).
      ▼
RETRACTED                   Archived; new version forks from the last GOOD state.
```

**No automated path crosses any promotion boundary.** Every transition is a human, clinical-safety (and for `CLINIC_REVIEW`→`PILOT_APPROVED`, a clinic-commercial) decision.

> State names are **canonical** and are chosen to be unambiguous in code, logs and audit events. `DEMO_UNVALIDATED`, `DRAFT`, `CLINIC_REVIEW`, `PILOT_APPROVED`, `ACTIVE`, `RETRACTED`.

---

## 3. Promotion rules (per transition)

| Transition | Actor | Required evidence | Can be automated? |
|---|---|---|---|
| `DEMO_UNVALIDATED` → `DRAFT` | Named clinician (Lead Doctor) | Every question: `source_ref != PENDING_CLINICIAN_SOURCE`; `clinical_rationale` not placeholder; `authored_by` names the clinician (or clinician-approved source). | No — human mandatory |
| `DRAFT` → `CLINIC_REVIEW` | Clinical safety owner | Peer-review record; translation approval; red-flag `safety_rules` reviewed; license refs (`licence_ref`) attached per source. | No |
| `CLINIC_REVIEW` → `PILOT_APPROVED` | Clinic admin/owner + clinical safety owner | Clinic acceptance record; consent/template check; named pilot scope. | No |
| `PILOT_APPROVED` → `ACTIVE` | **Two different people**: clinical safety owner signs, a **different** user activates | `signed_at` set; `evidence_reference` non-empty; `licence_ref` verified (OT-05 gate). | No |
| `ACTIVE` → `RETRACTED` | Clinical safety owner | Reason; `retracted_at`; superseding version id. | Only on safety-event trigger |

**Two-person control** (aligns with Data-Model `two_person_activation`, §261): for any pack containing safety/red-flag rules, `activated_by_user_id != authored_by_user_id`. In the current AI-drafted model, `authored_by` is `AI_DRAFT - requires clinician`, so the clinician who signs the red flags counts as `authored_by`; activation must still be a **different human**.

---

## 4. Envelope fields the promotion tooling must verify

Every vertical pack JSON carries the `content_pack_v0.1.json` envelope. Promotion to each state adds a hard verification:

| Field | `DEMO_UNVALIDATED` | `DRAFT` | `CLINIC_REVIEW` | `PILOT_APPROVED` | `ACTIVE` |
|---|---|---|---|---|---|
| `status` | `DEMO_UNVALIDATED` | `DRAFT` | `CLINIC_REVIEW` | `PILOT_APPROVED` | `ACTIVE` |
| `signed_at` | `null` | `null` | `null` | set | set |
| `evidence_reference` | `[]`/placeholder | set per question | set per question | set per question | set per question |
| `source_ref` (per question) | `PENDING_CLINICIAN_SOURCE` | != placeholder | != placeholder | != placeholder | != placeholder |
| `licence_ref` (per source) | NULL / pending | pending | attached | verified | verified (OT-05) |
| human audit event | required + named | required + named | required + named | required + 2-person | required + 2-person |

**Rule:** a pack with any `source_ref == PENDING_CLINICIAN_SOURCE` **cannot** leave `DEMO_UNVALIDATED`. This is the same rule the README already states; this doc makes it a testable checklist.

---

## 5. Audit trail

Every state change writes an append-only `pack_status_event` (shadow of `audit_event`, Data-Model §227) with:

```
pack_status_event
  id bigserial
  pack_id / content_version
  from_status, to_status
  actor_user_id, actor_role
  reason            -- mandatory, free text
  evidence_summary  -- jsonb: signed refs, licence refs, reviewer ids
  occurred_at
```

- **Append-only.** No update/delete grants for app roles.
- A pack's full history is reconstructable from these rows.
- Audit details are **never** in the pack JSON itself (the JSON is content; events are governance).

---

## 6. Guardrails / boundary

- **No pack is usable with real patients until `PILOT_APPROVED`/`ACTIVE`.** Anything in `DEMO_UNVALIDATED`/`DRAFT` is demo/harness material only.
- Passing the **harness** (`draft_pack.py` gates: F1.PROHIBITED, F3.DIFFERENTIAL_SHAPE, F4.COMPLETENESS; drift + abstention) means *structurally safe to hand a clinician* — **not** clinical validation, and not an activation.
- Red-flag/safety content stays `UNVALIDATED_DEMO_CONTENT` in rationale until a clinician replaces it.
- Bulk generation at scale blocks until OT-05 (licensing audit) clears (ADR-033).
- This document governs the **question-pack content lifecycle**, not the app/PIN/consent systems.

---

## 7. Suggested automation (to implement, not yet present)

- `tools/promote_pack.py` — CLI that enforces the §4 checklist before allowing a status change, writes the §5 audit event atomically.
- CI gate: a pack with a `source_ref == PENDING_CLINICIAN_SOURCE` fails the "active-pack" check (mirrors `gate_literature.py`).
- State-machine unit test: assert no `DEMO_UNVALIDATED → ACTIVE` jump is possible programmatically.

These should be added under `vertical_pack/tools/` and be run by the same harness that runs the 95 tests.

---

## References
- `11-Prototype/medoxzi/content/vertical_pack/README.md` (§5 lifecycle, §6 harness guard)
- `tools/draft_pack.py`, `tools/build_from_questionbank.py`, `tools/gate_literature.py`
- ADR-002 (curated+signed), ADR-033 (AI drafts, expert signs, licence gate), ADR-037 (activation gate, screening-only)
- OT-05 (licensing audit), OT-18 (Lead Doctor sign-off)
- `04-Architecture/Data-Model.md` §261 (two-person activation), §227 (audit_event)

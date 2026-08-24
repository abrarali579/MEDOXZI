# PIN Identity Binding — Design

**Status:** Design (not implemented). **Implements OT-21 decision (ADR-037, founder instruction, session P).**
**Owner:** ARHAM (chief of staff), design.
**Dependencies:** ADR-037 §5 (full/large PIN appears only inside a doctor's patient records, never on the main list view). Relates to but does not replace `Access-Control.md`, `Threat-Model.md`, `Privacy.md`.

---

## 1. Purpose

This document specifies how a clinic's **patient PIN** is bound to a persistent, immutable patient identity such that:

1. A PIN *alone* can never resolve a live patient record (privacy floor).
2. The full/large PIN is **surface-exposed only inside a doctor's open patient record** — never in search results, list views, or staff-facing searches.
3. A PIN cannot be silently re-bound to a mismatched identity without an audited, human-approved corrective action.
4. Identity comparison uses the **composite key**: `PIN + name + age + mobile`, never PIN alone (matches Data Model §2 core entities and ADR-037 §5).
5. Emergencies are covered by break-glass consistent with `Access-Control.md` §2.6.

---

## 2. Terminology

| Term | Meaning |
|---|---|
| **PIN** | The clinic-issued patient access/identifier code. Short "display" form vs **full/large PIN** (shown only inside an open record). |
| **Composite identity** | `(PIN, normalized_name, age, mobile)` — four fields compared together. |
| **Internal patient key** | Immutable `patient.id` (UUID) that never changes, referenced by encounters. |
| **Binding** | The act of linking a claimed composite identity to an existing internal patient key, or creating one. |
| **Rebind** | Changing which internal key a given PIN/identity resolves to. |
| **Break-glass** | Time-boxed, audited, elevated access a clinic admin or support uses only for unavoidable cases (Access-Control §2.6). |

---

## 3. Binding rules

### 3.1 Resolution (lookup) — does NOT expose the full PIN

- A search by PIN is allowed **only inside a doctor's already-open patient record session**, or during an active intake where the patient is physically present and consented.
- The **main list and any search-result list render only a masked form**: e.g. `••••12` (last two digits) with `name, age, mobile` — **never the full PIN** (ADR-037 §5).
- Resolution returns the internal `patient_id` plus masked PIN; the full PIN is fetched **only when rendering an open record**, gated by the record-screen context.

### 3.2 Composite match

- On intake or staff registration, the claimed identity is normalized and compared against the clinic's patient set on **all four** fields:
  - `normalized_name` (case/script-normalized)
  - `age` (derived from `dob` by `dob_precision`; see Data Model patient)
  - `mobile` (`contact_encrypted` compare by hash/encrypted match)
  - masked-PIN similarity as a **hint only**, not a match criterion by itself
- **Match = all four align.** A partial match (e.g. same PIN but different mobile) is **not** auto-merged — it raises a resolution conflict (see §4).

### 3.3 Create vs bind

- **No existing composite** → create a new `patient` row with a fresh internal key; record PIN in the encrypted identifier store.
- **Existing composite, no mismatch** → bind the claim to the existing key; no special action.
- **Existing composite, conflict** → never resolve silently; route to §4.

---

## 4. Rebind and conflict handling

The invariant: **a PIN cannot be re-bound to a mismatched identity without an audited human action.**

| Situation | Automatic? | Action |
|---|---|---|
| Same PIN, all four fields match | Yes | Bind, no event beyond normal audit |
| Same PIN, any field differs | **No** | Blocked. Flag `RESOLUTION_CONFLICT`. No silent merge. |
| Duplicate PIN detected at creation | **No** | Blocked at constraint. |
| Merge of two patient records | **No** | Clinician/`CLINICAL_SAFETY_OWNER` decision only; full audit `before_value`/`after_value`; sets `is_merged_into`. |

**Conflict resolution** requires:
- a logged-in staff/doctor role,
- a stated reason (mandatory field),
- the full before/after identity snapshot in `audit_event`,
- and for merges, a second human approval when the records both have clinical content (two-person control, Data Model §261 two_person_activation principle).

---

## 5. Exposure controls (surface rule)

| Surface | Full PIN shown? | Masked PIN? | Notes |
|---|---|---|---|
| Patient list / search results | **No** | Yes (`••••12`) | ADR-037 §5 hard rule |
| Open patient record (doctor) | **Yes** | — | Only context where full PIN is rendered |
| Staff intake screen (active, consenting patient) | Yes (transient) | — | Patient physically present, pre-submit |
| Audit log | Encrypted/hash | — | Never raw full PIN in plaintext export |
| Any dashboard / analytics | **No** | No | De-identified only (see Insights design) |

**Data-layer enforcement:** no endpoint returns the full PIN column unless the request carries a record-open scope; verified in CI (`patient-cannot-reach-AI` style suite in Access-Control §5).

---

## 6. Proposed schema (refinement to Data Model)

Extend `patient` (Data Model §77) with identity-binding fields (all additive, additive migration):

```
patient
  id uuid PK
  ...
  pin_encrypted        text          -- full PIN, app-level encrypted, never plaintext
  pin_masked           text          -- derived, e.g. 'xxxx12', for list rendering
  pin_tier             enum(LEGACY_SHORT, FULL)  -- ADR-037: migrate to full
  identity_status      enum(ACTIVE, RESOLUTION_CONFLICT, MERGED) DEFAULT 'ACTIVE'
  conflict_reason       text          -- set when RESOLUTION_CONFLICT
  bound_at             timestamptz
  bound_by_user_id     uuid FK
```

And an immutable, append-only ledger for binding/rebind events (mirrors `audit_event` but focused):

```
pin_binding_event
  id bigserial
  patient_id uuid FK
  actor_user_id uuid FK
  action enum(CREATE, BIND, REBIND_PRIMARY, MERGE, CONFLICT_BLOCKED, BREAK_GLASS)
  reason text               -- mandatory for REBIND_PRIMARY / MERGE / BREAK_GLASS
  before_identity jsonb
  after_identity jsonb
  occurred_at timestamptz
```

- **Append-only**: no `UPDATE`/`DELETE` grant for app roles (same rule as `audit_event`, Data Model §229).
- **Constraint:** a row where `identity_status = 'RESOLUTION_CONFLICT'` blocks any normal (non-resolution) read path from auto-binding.

---

## 7. Threat-mapping

| Threat | Mitigation |
|---|---|
| Guess PIN to read a record from the list | Full PIN never on list; masked only |
| Rebind a PIN to steal/substitute identity | Composite match + conflict block + audit ledger |
| Silent merge corrupting the record | Merge requires human + two-person control on clinical |
| Support snooping records via PIN | Break-glass only, Access-Control §2.6 |
| PIN leaked in analytics | PIN columns never reach analytics/aggregates |
| Replay of a stale consent identity | Binding relative to live, consented encounter only |

---

## 8. Gates before this is real

- [ ] Real patient data is **not** used; this design is for the production phase (Phase 4), not the local prototype.
- [ ] `pin_tier` migration to `FULL` requires cohort review + human-authored policy, not auto-promotion.
- [ ] A written counsel opinion on identity/health-data classification is recorded (pending, owner: founder).
- [ ] CI suite added: *"no endpoint returns full PIN without record-open scope"* and *"conflict never auto-binds."*

---

## 9. Boundary / non-goals

- No real patient data may be stored in the prototype or tests.
- This design does **not** implement messaging or consent capture (see `Clinic-Comms-Consent.md`).
- It does **not** perform live deployment (see `Deployment-Prep.md`).
- It does **not** authorise MEDOXZI to use patient identities for marketing (ADR-021/036).

---

## References
- ADR-037 (founder, session P) — OT-21 decision: full PIN only inside doctor records.
- `05-Security-Compliance/Access-Control.md`
- `04-Architecture/Data-Model.md` (§ core entities, constraints §231+, §281 identity binding reconciliation)
- `05-Security-Compliance/Threat-Model.md`, `Privacy.md`

# Follow-up Capture — Design

**Status:** Design (not implemented). Supports v2.6 doctor-value story (STATE.md immediate action #7).
**Scope:** Recording a doctor-tied follow-up date/note per patient encounter + a doctor queue view. **NO messaging, NO auto-scheduling** — messaging is a separate consent-gated module (`Clinic-Comms-Consent.md`).
**Owners:** ARHAM (design) · engineering.

---

## 1. Purpose

After a consultation the doctor records a follow-up: a date and a note attached to that patient's **encounter**. This gives the clinic a working queue of upcoming/overdue follow-ups and captures the value story without sending any message prematurely.

**Boundary (restate):** synthetic/demo data only; no real patient data in tests; no diagnosis/red-flag/urgency language anywhere in this feature. The doctor keeps full clinical authority — this tool only *records* and *lists*.

---

## 2. Data model

A follow-up record binds to an **encounter** (not to the patient blob). Fields:

| Field | Type | Notes |
|---|---|---|
| `followup_id` | internal key | immutable, auto-generated, per clinic |
| `encounter_id` | FK | the consultation this follow-up belongs to |
| `clinic_id` | FK | scope isolation (multi-clinic safety) |
| `patient_key` | immutable patient key | internal, never a PIN alone |
| `patient_identity` | snapshot | composite: PIN + name + age + mobile, captured at encounter time (identity must never rest on PIN alone — see `PIN-Identity-Binding.md`) |
| `doctor_id` | FK | doctor who records it |
| `follow_up_date` | date | target follow-up |
| `note` | text | free-text doctor note |
| `status` | enum | `OPEN` / `RESCHEDULED` / `COMPLETED` |
| `created_at` / `created_by` | ts + FK | audit trail |
| `updated_at` / `updated_by` | ts + FK | audit trail (every status change logged) |

**Invariant:** a follow-up always references a valid encounter and an immutable `patient_key`; `patient_identity` is a snapshot so later identity edits don't silently re-point the follow-up.

---

## 3. Doctor queue view

A doctor-only view listing patients with upcoming or overdue follow-ups:

- **Upcoming** — sorted by `follow_up_date` ascending (soonest first).
- **Overdue** — `follow_up_date < today` and `status = OPEN`, sorted by overdue days desc.
- Row shows: patient display name, composite identity confirmation, target date, status, doctor's note.
- Action: mark `COMPLETED` (closed) or `RESCHEDULED` (new date + reason) — each logged with `by` + timestamp.

It **does not** notify anyone, **does not** auto-schedule, and **does not** surface to the patient.

---

## 4. NON-GOALS (explicit)

- **No message is sent** — no reminder, no WhatsApp/Email/SMS outbound (that is `Clinic-Comms-Consent.md`, gated by ADR-036/OT-19).
- **No auto-scheduling** — the system proposes nothing; the doctor decides.
- **No MEDOXZI-owned marketing** — patient contact data is never used for MEDOXZI promotion (ADR-021).
- **No clinical advice** — no red-flag, urgency, or diagnosis language; the note is the doctor's own. This feature is a data-organising aid, not a medical device (OT-02).

---

## 5. Boundary

- Synthetic/demo data only in development and tests.
- The follow-up queue is a doctor-only, clinic-internal tool.
- Activating reminders later **requires** the consent/opt-out/audit/template controls in `Clinic-Comms-Consent.md` to exist first.

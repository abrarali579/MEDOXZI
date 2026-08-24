# Clinic-Owned Communication Consent — Design

**Status:** Design only. **No messaging may go live until this design is implemented and reviewed.** Implements repo PRES-8 / OT-19 / ADR-036, with consent-at-data-submission fixed by founder decision (ADR-037).
**Owners:** ARHAM (design) · engineering · clinic.
**Boundary (restate):** consent is clinic-owned; MEDOXZI never uses patient contacts for its own marketing (ADR-021/036); no AI diagnosis, treatment advice, pressure language, or false urgency in any message.

---

## 1. Consent capture at intake (ADR-037)

Consent is requested at **data-submission time**, during the intake form, before submission.

- One explicit, separate checkbox (with granular sub-options), **not** bundled into a generic "I agree":
  - **Follow-up reminders** — appointment follow-up / reschedule notices for this clinic.
  - **Announcements / check-ins** — clinic updates and check-in messages.
  - Default: **neither granted**. Consent is affirmative opt-in.
- Clear wording guidance: plain language, e.g. *"May this clinic contact you about your follow-up and appointments? You can change this anytime and it never affects your care."* No pressure language, no pre-checked boxes, no false urgency.
- Consent is recorded with the submission and is **revocable**.

---

## 2. Consent record schema

Every grant/revoke is a durable, immutable record:

| Field | Type | Notes |
|---|---|---|
| `consent_id` | internal key | auto-generated |
| `clinic_id` / `patient_key` | FK | scope + immutable patient |
| `consent_type` | enum | `FOLLOWUP` / `ANNOUNCEMENT` |
| `grant` | bool | true = granted, false = revoked |
| `template_version` | string | version of the consent/opt-in wording shown (see §5) |
| `channel` | enum | which channel(s) this consent covers (SMS / Email / others) |
| `recorded_at` / `source` | ts + string | timestamp + where the decision was made |
| `by` | FK/user | clinic staff who recorded it (or `PATIENT_SELF`) |

Latest `consent_id` per `(clinic, patient_key, consent_type)` is authoritative. Prior rows are history (audit), never deleted.

---

## 3. Opt-out / revocation flow

- Any channel — the patient can revoke via the clinic, a reply-word, or a stated channel; all are valid.
- Revocation is recorded as a new consent row with `grant=false` immediately.
- Must **not affect care**: revoking communication never blocks or alters treatment or intake.
- A revoke is honoured going forward; it does not erase history (audit keeps the record).

---

## 4. Audit log

Two append-only logs, both required before any outbound message can be sent:

- **Outbound message log** — every clinic-sent message: `message_id`, `to_scope` (never stored raw contact beyond need), `template_version`, `clinic_id`, `patient_key`, sent timestamp, carrier result.
- **Consent-change log** — every grant/revoke (the consent schema above), plus who/when.

Both are clinic-internal, retained per repo retention policy, and never use patient contact data for MEDOXZI marketing (ADR-021).

---

## 5. Template-versioning governance

- **Versioned templates**: every outbound message template has a `template_id` + `version_id`; changed text = new version, never edited in place.
- **Approval**: a named human (clinic owner/manager) approves a template version before it can be sent; the system refuses to send an unapproved version.
- **Clinic-branded**: templates are clinic-branded; MEDOXZI branding is not used to message patients, and no MEDOXZI-owned marketing ever goes to patients (ADR-021).
- **Content rules**: no AI diagnosis, no treatment advice, no pressure language, no false urgency (ADR-036).

---

## 6. SENDING GATE — checklist proving controls exist

No message is sent until **all** are true and evidenced:

- [ ] Consent granted for that `consent_type` + channel (latest record `grant=true`).
- [ ] Consent not revoked (checked at send time, not cached at intake).
- [ ] Consent wording version matches the `template_version` referenced.
- [ ] Template is the current **approved** version.
- [ ] Outbound message audit log is live (append-only).
- [ ] Consent-change log is live.
- [ ] Revocation does not affect care (no dependence between care and messaging).
- [ ] Clinic owns the branded template; MEDOXZI marketing path is empty for patients.

---

## 7. Boundary

- **This design does not integrate any messaging provider**; provider wiring is out of scope.
- No outbound messaging is implemented or sent under this document.
- Consent is clinic-owned and revocable; MEDOXZI never contacts patients for its own purposes (ADR-021/036).

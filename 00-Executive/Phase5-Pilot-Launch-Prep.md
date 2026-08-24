# Phase 5 — Pilot Launch Prep Checklist

**Status:** Documentation / readiness checklist only. **Actual screen lock, production UI, and real-patient use are gated by human review (OT-20) and clinical sign-off (OT-18) — this document does NOT perform or authorise them.**
**Owner:** ARHAM (chief of staff) — prep documentation; the gates themselves are founder/doctor-owned.

---

## 1. Purpose

This is the **checklist** a reviewer (founder/doctor/clinic staff) uses during the OT-20 visual review and for the subsequent screen-lock and pilot-launch decisions. It does not claim the app is ready — it defines what "ready" must be proven to look like, so the human review is structured and repeatable.

**Two deliverables are gated behind this document:**
- **P0.1** — production frontend engineering (modular ES-module rebuild of the 901-line `app.js` monolith) only after the reviewer approves the current `14-MVP-HTML/` on the right dimensions.
- **Screen lock** — the medical-record lock that hides the full PIN and record content when the clinic workstation is unattended.

---

## 2. OT-20 visual review — what the reviewer must confirm

Run on a **phone / tablet / doctor-desktop** (the three target dimensions). The reviewer checks, item by item:

| # | Check | Pass/fail |
|---|---|---|
| V1 | Visual tone is calm and clinic-credible (no alarm, no marketing feel) | |
| V2 | Four-digit prototype PINs display and validate correctly on each size | |
| V3 | Returning-patient selection syncs its stored profile correctly | |
| V4 | Complaint-specific demo options appear for each complaint | |
| V5 | Helper chips behave on the smallest screen | |
| V6 | Step 7 layout, PIN screen and "done" screen render cleanly | |
| V7 | **Doctor past-file filter controls** and the **current+past split review** are understandable | |
| V8 | No data-capture helper implies anything beyond its scope | |

**Outcome:** if **any** V-item fails, the item is a blocker for P0.1 and returns to engineering **before** the monolith refactor.

---

## 3. Screen-lock requirement (post-review)

The production app must lock the medical record when the clinic workstation is **unattended or idle**, because the full PIN and patient record are only ever viewable inside an open record (ADR-037 §5).

How review validates the lock is *specified*:

- **Idle timeout**: auto-lock after N minutes of inactivity (configurable per clinic).
- **Re-auth**: unlock requires the doctor/staff credential — the patient PIN is **never** the unlock credential.
- **Fast suspend**: manual lock on switch-away / screen-off.
- **Contents hidden**: the open record, full PIN, and patient history are blanked on lock, never left on screen.
- **No bypass**: lock must trigger even mid-record (not only at idle).

This document **specifies** the lock; it does **not** claim the lock is implemented. Implementation is P0.1-post-OT-20.

---

## 4. Pilot-launch readiness (before any real use)

All of the following must be **true and evidenced** before a single real consented patient interacts:

- [ ] OT-20 visual review passed (V1–V8 all pass, or blockers resolved and re-reviewed).
- [ ] Screen lock implemented and tested as in §3.
- [ ] Named **Lead Doctor** has signed the question pack(s) promoted to `PILOT_APPROVED`/`ACTIVE` (Pack-Status-Workflow §3; ADR-018 / OT-18). Nothing in `DEMO_UNVALIDATED`/`DRAFT` is usable with patients.
- [ ] Licence audit (OT-05) cleared for the packs in use.
- [ ] Consent/opt-out/audit/template controls exist per ADR-036 and `Clinic-Comms-Consent.md` (only if any messaging is in scope).
- [ ] **No real patient data** used unless the clinic explicitly consents and every data flow is compliant.
- [ ] PSE / counsel opinions (OT-14, OT-01, OT-02) advanced as far as the founder owns them.
- [ ] PIN identity binding design reviewed (`PIN-Identity-Binding.md`).

**No item on this checklist is optional for production.** Skipping a gate is not "faster" — it is non-compliant.

---

## 5. Human gates — what the assistant can and cannot do

| Item | Who performs | Assistant role |
|---|---|---|
| Visual review / approve tone & layout (OT-20) | Founder/doctor/staff | Prepares the V1–V8 checklist; cannot approve |
| Lead Doctor sign-off on clinical content (OT-18) | Named doctor | Drafts candidate content only; cannot sign |
| Licensing audit (OT-05) | Founder + counsel | Assembles the audit inputs; cannot clear |
| PSE registration, counsel opinions (OT-14, OT-01, OT-02) | Founder/host | Tracks and flags; cannot file |

The assistant **documents readiness** and **defines what passing means**; it does not perform the gates or claim completion for them.

---

## 6. Boundary

- No production UI and no screen lock are shipped by this document.
- No real patient data is used in any prototype or test.
- No patient-facing message is sent (see `Clinic-Comms-Consent.md` for the sending gate).
- This readiness checklist is the *contract* the human reviewer and engineering use; it is not a completion claim on its own.

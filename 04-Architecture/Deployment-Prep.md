# MVP Production Deployment — Design

**Status:** Architecture/design only. **NOT a live deployment. No real patient data may be stored under this doc.**
**Grounding:** ADR-034 (in-country inference feasible; storage resolved via Indonesian VPS; storage location ≠ processing location), OT-01 (Indonesian data storage), OT-14 (PSE Lingkup Privat registration — founder-owned).
**Owners:** ARHAM (design) · engineering · founder (gates).
**Boundary (restate):** local AI/standard tools are fine until actual product launch; storage location and processing location are confirmed separately.

---

## 1. Target architecture

- **Data lives in Indonesia**: an Indonesian VPS / cloud-first deployment (ADR-034, OT-01).
- **Storage location ≠ processing location**: record that the *processing* location must be **[Confirmed]** separately from storage; do not assume they are the same region (STATE.md genuinely-unknown).
- Frontend is phone/tablet-first (per founder directive); backend is a stateless API over a single relational DB, multi-tenant scoped per clinic.

---

## 2. Database design (patient records)

Multi-clinic relational model:

- `clinic` — id, name.
- `patient` — **immutable internal `patient_key`** (auto, per clinic) + composite identity columns (**PIN, name, age, mobile**). The PIN is **never** the sole key.
- `patient_identity_history` — immutable snapshots of the composite identity over time (audit; identity is composite, not PIN-alone).
- `encounter`, `followup`, `consent`, `audit_log` — as in the respective feature designs, all scoped by `clinic_id`.

**Composite identity invariant:** a patient is looked up by the *tuple* PIN + name + age + mobile, not by PIN alone (OT-21). This is enforced at the data layer, and the longer/bigger PIN is used only in doctor-facing record contexts — never in the main list.

---

## 3. PIN identity binding — enforcement layer

The immutable-identity layer (deep design in `05-Security-Compliance/PIN-Identity-Binding.md`):

- A PIN can belong to at most one composite identity within a clinic.
- The PIN **cannot be re-bound to a mismatched identity** without an **audited human action** (doctor/clinic staff, time-stamped, with reason).
- Re-binding is never automatic and never silent — it is a first-class audited event.

This prevents patient history from attaching to the wrong mobile/name/age identity (STATE.md immediate action #2 rationale).

---

## 4. Auth model — clinic staff vs doctor

- References `05-Security-Compliance/Access-Control.md` (privacy tiers, break-glass, no identity on the main list).
- **Clinic staff** vs **doctor** roles; doctor-only surfaces (follow-up queue, record view with full PIN) are gated by role.
- Screen lock (see `Phase5-Pilot-Launch-Prep.md` §3) applies at the workstation level for open records.
- Credentials/secrets are managed per the workspace Secrets Management System — never in repo, never hard-coded.

---

## 5. DEPLOYMENT GATES (none may be skipped)

| Gate | Owner | Status |
|---|---|---|
| PSE registration (OT-14) | Founder | **[Confirmed]** founder holds PT/PMA, handles all requirements |
| Source-licensed question packs (OT-05) | Founder + counsel | design with AI from most-common diseases + Harness anti-hallucination |
| Lead Doctor sign-off on clinical content (OT-18) | Named doctor | doctors retain full discretion on whether to act on questions |
| Consent / opt-out / audit / template controls (ADR-036) | engineering | `Clinic-Comms-Consent.md` |
| Storage/processing location confirmed | engineering | flag; not yet **[Confirmed]** |

---

## 6. NOT IN SCOPE

- No live deployment.
- No real patient data stored.
- No production clinical question pack before named Lead Doctor sign-off.
- No messaging before consent/opt-out/audit/template controls exist.
- "Data processing" handled locally at launch; standard AI tools acceptable until then (founder directive).

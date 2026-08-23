# User Roles and Permissions

## 1. Role definitions

| Role | Who | Primary surface | Clinical authority |
|---|---|---|---|
| `PATIENT` | The patient | Patient PWA | None |
| `CAREGIVER` | Family member / attendant acting for the patient | Patient PWA | None |
| `FRONT_DESK` | Registration staff | Staff console | None |
| `INTAKE_STAFF` | Trained assisted-intake staff | Staff console | None (records verbatim) |
| `NURSE` | Triage / vitals | Staff console (clinical subset) | Acts on red flags; records vitals |
| `DOCTOR` | Consulting physician | Doctor dashboard | **Full clinical authority** |
| `CLINICAL_SAFETY_OWNER` | Named physician accountable for clinical content | Content console + safety queue | Authors and signs clinical content |
| `CLINIC_ADMIN` | Clinic administrator | Admin console | None |
| `SUPPORT` | Our support engineer | Support console | None — **break-glass only** |

## 2. Permission matrix

Legend: ✅ full · 🟡 conditional · ⬜ none

| Capability | PATIENT | CAREGIVER | FRONT_DESK | INTAKE_STAFF | NURSE | DOCTOR | SAFETY_OWNER | ADMIN | SUPPORT |
|---|---|---|---|---|---|---|---|---|---|
| Register patient | 🟡 self | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Issue / manage token | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Enter own intake | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Enter intake for another | ⬜ | 🟡 linked patient | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Upload documents | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| View own intake data | ✅ | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| View AI interpretation | **⬜ never** | **⬜ never** | ⬜ | ⬜ | 🟡 red flags only | ✅ | 🟡 review context | ⬜ | ⬜ |
| View pre-round view | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 triage subset | ✅ | 🟡 with clinical reason | ⬜ | ⬜ |
| Confirm extracted facts | ⬜ | ⬜ | ⬜ | 🟡 non-high-risk | 🟡 | ✅ | ⬜ | ⬜ | ⬜ |
| Confirm **medications / allergies** | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 per clinic policy | ✅ | ⬜ | ⬜ | ⬜ |
| Answer clinical questions | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 | ✅ | ⬜ | ⬜ | ⬜ |
| **Approve / sign encounter** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **✅ only** | ⬜ | ⬜ | ⬜ |
| Record final diagnosis | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| Submit feedback on AI | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 | ✅ | ✅ | ⬜ | ⬜ |
| Author / edit clinical content | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 propose | **✅ sign** | ⬜ | ⬜ |
| Activate a content version | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | 🟡 co-sign | ⬜ |
| Manage users / roles | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| Configure retention / residency | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| View audit log | ⬜ | 🟡 own access log | ⬜ | ⬜ | ⬜ | ⬜ | 🟡 safety scope | ✅ | ⬜ |
| Access PHI | ✅ own | 🟡 linked | 🟡 demographic only | 🟡 active encounter | 🟡 active encounter | ✅ assigned | 🟡 reasoned | ⬜ | 🟡 **break-glass** |
| Export encounter | ⬜ | ⬜ | 🟡 approved only | ⬜ | ⬜ | ✅ | ⬜ | 🟡 bulk with approval | ⬜ |

## 3. Structural rules (enforced in schema and middleware, not in UI)

1. **Only `DOCTOR` can sign.** Enforced by a database constraint on the encounter state transition, not by hiding a button.
2. **Least privilege by encounter, not by role alone.** Clinical roles see a patient only while that patient is in their active queue or assigned list; access outside that window requires a stated reason and generates a high-severity audit event.
3. **`SUPPORT` has no standing PHI access.** Break-glass requires: a ticket reference, a time-boxed grant, an approver, immediate notification to the clinic admin, and a full audit record. 🔐
4. **Patients and caregivers can never reach AI interpretation.** Enforced at the API layer by resource type, not by frontend routing. This is standing constraint #2 and is tested in CI.
5. **Caregiver links are explicit, recorded, consented and revocable**, with relationship stored on the encounter.
6. **`CLINICAL_SAFETY_OWNER` is a person, not a permission bundle.** The role requires a named, contracted individual; the system refuses to activate a content version without a signature from a user holding it.
7. **Content activation is two-person.** Author and activator cannot be the same identity for red-flag rules. 🩺
8. **Every role's session is time-limited**; clinical roles re-authenticate on device change.

## 4. Consent model

| Consent | Granularity | Default | Revocable | Effect if refused |
|---|---|---|---|---|
| Treatment / record | Per patient, per clinic policy | Per clinic | Per clinic policy | Clinic's existing process applies |
| **AI-assisted processing** | Per patient | **Off until given** | Yes | Intake captured and shown raw; **zero LLM calls**; encounter proceeds normally |
| De-identified product improvement | Per patient | **Off** | Yes | Data excluded from all datasets; already-included records removed at the next build |
| Caregiver representation | Per caregiver-patient link | Off | Yes | Caregiver cannot act |
| Guardian consent (minors, persons requiring a guardian) | Per patient | Required where applicable | Yes | Intake requires an authorised guardian ⚖️ |

Consent records are immutable, versioned against the consent text shown, stored with the language displayed, and reproducible on demand.

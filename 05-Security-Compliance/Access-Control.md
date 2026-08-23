# Access Control

## 1. Model

**Three layers, each independently sufficient to stop a mistake in the layer above.**

| Layer | Mechanism | Stops |
|---|---|---|
| 1 · Authorisation | RBAC + per-encounter scoping in middleware | A role doing something it should not |
| 2 · Data | Postgres row-level security keyed to `app.tenant_id` | A query that forgot a `WHERE tenant_id =` |
| 3 · Constraint | Database triggers and CHECK constraints | An authorised role doing a clinically unsafe thing (signing without a doctor role, confirming a medication without a human) |

**Design rule:** *no security property depends on the frontend.* Hiding a button is presentation, not access control.

## 2. Scoping rules

| Rule | Detail |
|---|---|
| **Tenant** | Resolved from the authenticated principal and set as a session variable; **never accepted from a request parameter or header** |
| **Encounter scope** | Clinical roles access a patient only while that patient is in their active queue or assigned list |
| **Out-of-scope access** | Permitted with a stated reason; generates a high-severity audit event and a weekly report to the clinic admin |
| **Break-glass** | `SUPPORT` has **no standing PHI access**. A grant requires a ticket reference, an approver, a time box (≤4h), immediate notification to the clinic admin, and full audit. It expires automatically. |
| **Patient scope** | A patient principal can reach only their own encounters, and only non-AI resources |
| **Caregiver scope** | Only patients with an active, consented, unrevoked link |
| **Service accounts** | Workers use narrowly-scoped credentials; the AI worker role cannot read `patient.name_encrypted` at all |

## 3. Sensitive operations requiring elevated control

| Operation | Control |
|---|---|
| Sign an encounter | `DOCTOR` role + database trigger |
| Confirm a medication or allergy from extraction | Clinical role + CHECK constraint requiring a human verifier |
| Activate a clinical content version | `CLINICAL_SAFETY_OWNER` signature + **a different user** to activate |
| Bulk export | Admin + approval + audit + rate limit |
| Erasure / deletion | Admin + reason + completion record |
| Change retention or residency configuration | Admin + re-authentication + audit |
| Break-glass | As above |
| Read the audit log | Admin; safety owner limited to safety scope |

## 4. Authentication

| Principal | Method |
|---|---|
| Patient | Single-use intake link (high-entropy, short-lived, bound to encounter, revoked on submit). **No account creation** — it is the largest avoidable drop-off in the funnel |
| Caregiver | Same, plus a consented link record |
| Staff / nurse / doctor | Username + password + **MFA**; SSO where available; short sessions; device binding on shared tablets |
| Clinical safety owner | As clinical, plus re-auth for signing content |
| Admin | MFA mandatory; re-auth for every sensitive operation |
| Support | MFA + break-glass workflow |
| Services | Short-lived credentials from the secret store; no static keys |

## 5. Verification

These are tests, not policies.

- **Cross-tenant suite** — every clinical endpoint attempted with a principal from tenant B against tenant A data; all must fail. Blocks merge.
- **Role matrix suite** — every (role × endpoint) pair asserted against [User-Roles.md](../02-Product/User-Roles.md).
- **Patient-cannot-reach-AI suite** — every AI resource attempted with a patient principal; must return 404.
- **Constraint suite** — attempts to sign as a nurse, confirm a medication as an admin, activate content as its own author; all must fail at the database.
- **RLS coverage check** — a CI job enumerating tenant-scoped tables and asserting every one has a policy. A new table without RLS fails the build.

## v2.2 Reconciliation

Access control must include break-glass support with reason, expiry, audit, and review. Shadow hypothesis storage is isolated from patient/staff/doctor roles and unavailable through doctor-facing APIs. Support access cannot silently view PHI or shadow results outside explicit audited scope.


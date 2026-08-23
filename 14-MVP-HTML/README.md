# MEDOXZI HTML MVP Prototype

**Status:** local visual prototype, not production software.

This folder contains the first phone/tablet-first MVP visualization. It exists so the founder, doctors, staff and future agents can inspect the workflow before the real product is built.

Open `index.html` in a browser.

## Scope

- Staff registration and token issue.
- Manual clinic token entry, so an existing clinic token system can remain the source of token numbers.
- Existing patient search by name, Patient Identification Number (PIN), or mobile number.
- Returning-patient selection fills both staff registration and patient intake fields.
- Patient/caregiver intake on phone/tablet.
- Basic personal information.
- Patient's 2-3 line issue description.
- Demo-only basic history questions.
- Optional previous report attachment preview.
- Patient review and done screen.
- Patient Identification Number generated on submission and shown to the patient to save for next visit.
- Doctor queue, doctor brief, source-bound intake view.
- Doctor conclusion with follow-up date and clinic-owned reminder preview.

## Boundaries

- Synthetic demo data only.
- No diagnosis.
- No treatment advice.
- No visible differential.
- No production red flags.
- No real WhatsApp/Email sending.
- Demo questions are `DEMO_UNVALIDATED` and must not be used with real patients until a named Lead Doctor signs the pack.
- PIN binding is local browser prototype behaviour only; production must enforce it in the backend with immutable identity/audit controls.
- Question options are demo-only but now vary by selected complaint so the interaction feels realistic.

## Next Product Decisions To Test Visually

- Does the patient flow feel short enough on a phone?
- Which questions should be one-screen-per-question versus grouped?
- Should staff start intake by QR, tablet handoff, or assisted mode?
- Where should existing-patient search live in the final clinic workflow?
- What exact PIN format should clinics use?
- What exact fields must the doctor see in the first 30 seconds?
- Where should follow-up date capture live in the doctor workflow?

## Data Collection Features Worth Considering

- Medicine strip/prescription photo capture.
- Allergy card with "none known", "not sure", and free text.
- Caregiver mode when a parent/relative answers.
- Staff read-back confirmation for assisted intake.
- Support needs such as wheelchair, interpreter, hearing support.
- Returning-patient previous visit picker.

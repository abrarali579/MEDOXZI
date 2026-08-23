# Evidence Sprint Runbook

**Status:** operational runbook for OT-04  
**Created:** 2026-08-23, session G  
**Purpose:** make the next real-world step executable without starting production build.

## Safety and Data Rules

- Do not store real patient/client documents in this repository.
- Prefer documents redacted by the sender before receipt.
- If redaction is done by the team, keep originals in an approved secure location outside this repo and record only de-identified taxonomy here.
- Do not upload real documents to LLMs, OCR APIs, or third-party tools during the sprint unless a lawful basis, contract, and explicit approval exist.
- Do not create clinical, legal, accounting, or other professional advice content during the sprint.
- Do not treat sprint observations as statistical proof. This is a build/no-build and first-vertical decision sprint.

## Roles

| Role | Responsibility |
|---|---|
| Founder | source contacts, run buyer conversations, decide first vertical in writing |
| Designer/researcher | run intake smoke tests, maintain taxonomy, summarise friction |
| Engineering observer | review document taxonomy for extraction architecture implications |
| Domain contact | provide sample formats or de-identified examples, not production sign-off |

## Day-by-Day Plan

### Day 0 - Setup

- Choose two candidate verticals.
- Create an external secure folder for raw examples.
- Copy `Evidence-Sprint-Templates.md` into working notes outside the repo if it will contain sensitive detail.
- Define document categories expected for each vertical.

### Day 1-3 - Document Reality

Target: 100-200 documents across at least two verticals.

For each document, record:

- vertical;
- document type;
- source type;
- digital text / scan / photo;
- handwritten / printed / mixed;
- page count;
- capture quality;
- language;
- tables present;
- stamps/signatures present;
- whether identity fields exist;
- extraction difficulty notes.

Engineering output:

- taxonomy summary;
- top extraction risks;
- likely OCR/parser routes;
- cost drivers;
- harness seed categories.

### Day 3-4 - Intake Smoke Test

Target: at least 10 participants per vertical.

Use a 10-question intake mock for each vertical. Measure:

- completion;
- time;
- abandonment point;
- questions that confused people;
- questions perceived as intrusive;
- device/context constraints;
- whether assisted mode seems necessary.

Do not ask for sensitive health, legal, financial, or identity details unless the sprint has a lawful and approved collection path. Mock scenarios are acceptable.

### Day 4-5 - Buyer Conversations

Target: at least 4 conversations across the two verticals.

Primary question:

> How many times does the same case get typed into a computer before an expert can act on it?

Capture:

- repeated-entry count;
- who does the entry;
- current tools;
- turnaround delay;
- cost of rework;
- buying owner;
- must-have integrations;
- willingness-to-pilot signal.

## Exit Decision

The sprint exits only when the founder writes a first-vertical decision.

Recommended decision structure:

1. Chosen first vertical.
2. Why it wins against the alternative.
3. Document reality summary.
4. Intake completion summary.
5. Buyer pain summary.
6. Biggest build risk.
7. What is deferred.
8. What must be true to reverse the decision.

## Repository Output Allowed

Allowed in repo:

- aggregate counts;
- taxonomy categories;
- de-identified examples written from scratch;
- decision memo;
- sprint method notes;
- open questions.

Not allowed in repo:

- real documents;
- screenshots containing personal/client data;
- names, phone numbers, addresses, IDs, dates of birth;
- medical records, prescriptions, legal files, invoices, bank statements, or claim files;
- verbatim sensitive content from a real person.

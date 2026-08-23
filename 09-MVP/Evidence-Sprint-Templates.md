# Evidence Sprint Templates

**Status:** blank templates for OT-04  
**Created:** 2026-08-23, session G  

Use these templates outside the repo if the notes contain sensitive details. Commit only de-identified summaries.

## 1. Document Taxonomy Row

| Field | Value |
|---|---|
| `doc_id` | sprint-local ID, no personal data |
| `vertical` | healthcare / legal / accounting / insurance / other |
| `document_type` | prescription / lab report / contract / invoice / statement / other |
| `source_type` | sender-redacted / public sample / synthetic / team-redacted |
| `format` | PDF / image / scan / photo / paper sample |
| `digital_text` | yes / no / partial / unknown |
| `handwriting` | none / some / mostly / all |
| `page_count` | number |
| `capture_quality` | good / usable / poor / unreadable |
| `language` | Indonesian / English / mixed / other |
| `tables` | none / simple / complex |
| `identity_fields_present` | yes / no / uncertain |
| `high_risk_fields_present` | yes / no / uncertain |
| `extraction_risk` | low / medium / high |
| `notes_deidentified` | no names, IDs, addresses, dates of birth, or verbatim sensitive facts |

## 2. Intake Smoke Test Row

| Field | Value |
|---|---|
| `participant_id` | sprint-local ID |
| `vertical` | healthcare / legal / accounting / other |
| `scenario_type` | mock / own case de-identified |
| `completed` | yes / no |
| `time_minutes` | number |
| `stopped_at_question` | question number or none |
| `confusing_question_ids` | list |
| `intrusive_question_ids` | list |
| `needed_assistance` | yes / no |
| `device_context` | phone / desktop / assisted / other |
| `notes_deidentified` | no sensitive details |

## 3. Buyer Conversation Row

| Field | Value |
|---|---|
| `conversation_id` | sprint-local ID |
| `vertical` | healthcare / legal / accounting / other |
| `role` | owner / practitioner / operations / admin |
| `repeated_entry_count` | 0 / 1 / 2 / 3+ / unknown |
| `who_retypes` | expert / assistant / admin / client / mixed |
| `current_tools` | categories only |
| `delay_pain` | low / medium / high |
| `error_pain` | low / medium / high |
| `buyer` | owner / partner / clinic manager / other |
| `pilot_signal` | no / weak / moderate / strong |
| `must_have_integrations` | categories only |
| `notes_deidentified` | no names or sensitive client details |

## 4. First-Vertical Decision Memo

```text
# First-Vertical Decision

Date:
Decision owner:

## Decision

Chosen first vertical:

## Alternatives Compared

- Option A:
- Option B:

## Evidence Summary

Documents collected:
Intake smoke test:
Buyer conversations:

## Why This Vertical Wins

1.
2.
3.

## Main Risks

1.
2.
3.

## What Is Deferred

1.
2.
3.

## Reversal Criteria

We would revisit this decision if:

1.
2.
3.
```


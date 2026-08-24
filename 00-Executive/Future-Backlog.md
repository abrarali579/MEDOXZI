# ⚠️ Do Not Build Now – MEDOXZI Future Gated Backlog

## Overview
This document lists future feature ideas that are gated and must not be implemented until their preconditions are satisfied. It references ADR-031 (horizontal platform discipline), ADR-023 (shadow differential ranking), and OT-04 (evidence sprint).

### Feature 1 – Voice‑to‑Voice Patient Intake
- **Description:** End‑to‑end voice interaction where a patient speaks into a device, the system transcribes, enriches with structured fields, and produces a voice‑output confirmation.
- **Value to Clinic:** 24/7 intake, reduces administrative load, speeds up patient triage.
- **Blocking Preconditions:**
  1. Gate 6+ validation complete (clinical workflow reviewed).
  2. Licensed speech‑to‑text engine integration, compliant with Indonesia's PDP Law (OT-01) and PSE scope (OT-14).
  3. Lead Doctor sign‑off on voice‑generated clinical notes.
  4. Consent workflow for audio data captured.
- **Risk Note:** Potential for incorrect clinical data due to transcription errors; requires human review before action.

### Feature 2 – Trusted Previous‑Report Document Extraction
- **Description:** Automated extraction of structured data from PDFs/word docs of prior clinical reports using optical / text recognition and schema mapping.
- **Value to Clinic:** Enables longitudinal patient data aggregation without manual entry.
- **Blocking Preconditions:**
  1. OT‑04 Evidence Sprint: real documents collected and stored with verifiable provenance.
  2. Legal review of PII handling in documents.
  3. Gate 6+ validation plus Lead Doctor counsel.
- **Risk Note:** Extraction can misinterpret handwriting or low‑resolution scans; extraction against imagined documents violates data integrity.

### Feature 3 – Additional Specialty Packs (Non‑OPC / Second Vertical)
- **Description:** Modular packages of domain‑specific forms, templates, and decision support rules for specialties not currently in the OPC.
- **Value to Clinic:** Expands MEDOXZI's market reach and provides specialty‑specific value.
- **Blocking Preconditions:**
  1. ADR‑031 horizontal discipline ensures verticals remain loosely coupled.
  2. Completed licensing audit for new specialty content.
  3. Red‑flag content placeholder cleared only after expert sign‑off.
- **Risk Note:** Without expert sign‑off, risk of incorrect or outdated clinical guidance; may expose clinicians to liability.

### Feature 4 – Shadow Differential Suggestion
- **Description:** Ranking of possible differential diagnoses for a patient encounter, presented as a list with scores but not probabilities; “shadow” meaning not actionable until clinician reviews.
- **Value to Clinic:** Supports diagnostic reasoning, reduces missed diagnoses.
- **Blocking Preconditions:**
  1. Gate 6+ validation (clinical workflow verified).
  2. Named Lead Doctor sign‑off on ranking algorithm.
  3. ADR‑023: Ensure outputs are rankings, not probabilistic statements.
- **Risk Note:** Ranking errors could mislead clinicians; must remain non‑actionable until human review.

## Summary of Gating

| Feature | Gate | Clinician Sign‑off | Evidence Sprint | Legal / Compliance |
|---------|------|--------------------|-----------------|--------------------|
| Voice‑to‑Voice | 6+ | Lead Doctor | – | PDP (OT-01) / PSE (OT-14) |
| Document Extraction | – | Lead Doctor | OT‑04 | PII review |
| Specialty Packs | – | Lead Doctor | – | Licensing audit |
| Shadow Differential | 6+ | Lead Doctor | – | ADR‑023 compliance |

> **Note:** None of these features may proceed until the described preconditions are satisfied. The project plan must move through all gates before any development begins.

---
// End of Future Gated Backlog

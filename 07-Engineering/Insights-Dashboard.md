# De‑identified Clinic Insights Dashboard – Post‑MVP Pilot Design

## 1. Purpose & Scope
This document describes the design of a **de‑identified clinic insights dashboard** that will be delivered as part of the MEDOXZI **post‑MVP** pilot.
The dashboard is intended to give a clinic a quick way to see key intake metrics without exposing any patient‑identifying information and is **not** a marketing engine.

## 2. ADR Context
* **ADR‑036** – Research dashboards and marketing services are classified as post‑MVP.
* **ADR‑021** – Patient contact data may not be used for third‑party marketing.
The design follows both ADRs by ensuring that all presented data is aggregate and de‑identified, and by requiring separate clinic approval for any case‑study narrative.

## 3. Core Metrics (All Aggregate, No Identifiers)
| Metric | Definition | Notes |
|--------|------------|-------|
| **Intakes Completed** | Total number of intake forms successfully submitted in a selected period | Excludes failed submissions |
| **Average Intake Duration** | Mean time (minutes) from intake start to completion | Calculated per day, week, and month |
| **Complaint Code Distribution** | Count of intake records per predefined complaint code | Codes are defined by the platform (e.g., "C01", "C02") |
| **Doctor Queue Throughput** | Number of intakes routed to a doctor per hour | Helps assess staffing loads |
| **Follow‑up Capture Rate** | Percentage of intakes that resulted in a scheduled follow‑up appointment | Computed over the last 30 days |
| **Intake Success Rate** | Ratio of completed intakes to total attempts | Indicates usability of the intake form |
| **Peak Intake Period** | Hour(s) with the highest intake volume | Trend over the selected period |
| **Geographic Intake Breakdown** | Distribution of intakes by clinic‑defined regions (e.g., zip code ranges) | Only regional identifiers, not exact addresses |
| **Time to First Response** | Average time from intake submission to first clinician reply | Useful for quality monitoring |

## 4. Fields Explicitly Excluded from the Dashboard
The following fields are never displayed in any visual or export, per ADR‑021 and privacy best practices:
* Patient **name**
* Phone / mobile number
* PIN or any form of **credential**
* Exact date of birth / age (only grouped age ranges are acceptable)
* Free‑text issue description
* Full or partial **address** (street, city, state, zip)
* Any identifier that links back to an individual (e.g., patient ID)

## 5. Dashboard Layout (High‑Level)
The UI is organized into three primary sections: **Overview**, **Details**, and **Export**.

### 5.1 Overview (Top‑Bar)
* **Date Range Selector** – Customizable date picker
* **Metric Summary Widgets** – Cards displaying the metrics from section 3 in concise numeric form with trend arrows
* **Refresh Button** – Manual data refresh

### 5.2 Details (Tabs)
* **Intake Summary Table** – Paginated table showing columns: Date, Intake Count, Avg Duration, Region, Complaint Code Frequency
* **Doctor Queue Diagram** – Heatmap of throughput by hour and doctor
* **Follow‑up Funnel** – Sankey diagram showing flow from intake to follow‑up appointment
* **Geographic Map** – Choropleth map of intake density by region

### 5.3 Export
* **CSV/Excel Download** – Aggregate data only, no identifiers
* **PDF Snapshot** – Snapshot of the dashboard view, annotated with a watermark "Clinic‑Internal Only"

## 6. Clinic Case‑Study Preparation Flow
1. **Opt‑In Request** – Clinic sends an opt‑in email to MEDOXZI; the request is recorded in the system.
2. **Data Pull** – MEDOXZI pulls the aggregated de‑identified dataset for the requested period.
3. **Draft Narrative** – A concise narrative (≤ 200 words) is generated, incorporating the key metrics and findings.
4. **Clinic Review** – The clinic receives the draft and may request edits; no patient data is shared.
5. **Final Approval** – Clinic signs off on the narrative; approval is logged.
6. **External Publication** – Once approved, MEDOXZI can publish the case study for marketing purposes, ensuring no identifiers remain in the text or images.

## 7. De‑Identification Checklist
* **Data Aggregation** – All metrics are sums, averages, or counts over periods, never per‑patient.
* **Redaction of Personal Tokens** – Names, phone numbers, addresses, and PINs are never stored in the dashboard layer.
* **Hashing / Tokenization** – Any system‑level user identifiers are hashed before use in reports.
* **No Direct IDs** – Patient IDs, clinic IDs, or doctor IDs are excluded from any exported file.
* **Access Controls** – Dashboard access is limited to clinic staff with a clinician role; role‑based access is enforced by MEDOXZI.
* **Audit Logging** – Every dashboard query and export is logged for compliance audit.
* **Encryption at Rest & Transit** – Data is encrypted in the database and over TLS.
* **Periodical Review** – De‑identification procedures are reviewed quarterly by the compliance team.

## 8. Boundary & Governance
* The dashboard remains an **internal tool** for the clinic, not a public face.
* All analytics are licensed under the MIT‑style clause in the MEDOXZI EULA.
* No patient‑level insights can be derived from the dashboard; any attempt to reverse‑engineer data is rejected by the back‑end.
* The clinic must sign a separate data‑sharing agreement before any case study is published.
* Marketing teams may not reference the dashboard data in external campaigns without clinic sign‑off.

## 9. Note on Value Proposition
The **primary purpose** of this dashboard is to provide a *time‑saving* and *value‑proof* tool for clinicians during the doctor pitch cycle. It shows high‑level performance but does not function as a marketing engine. The emphasis is on helping doctors assess workflow efficiency and patient throughput, not on promoting MEDOXZI to prospective clients.

## 10. Future Enhancements (Post‑Pilot)
* Custom drill‑down per region with age‑group overlays (still aggregate)
* Predictive wait‑time modeling using historical throughput data
* Integration of clinician satisfaction surveys (de‑identified)
* Export to BI platforms (embedding, API)

## 11. References
* ADR‑021 – *Privacy of Patient Contact Data*
* ADR‑036 – *Post‑MVP Research Dashboards and Marketing*
* MEDOXZI Platform Design Docs – *Intake Flow Architecture*

This document is a living artifact; updates are made via the repository as part of the engineering sprint.

──────────────────────────────────────────

Prepared by: The MEDOXZI Engineering Team
Date: 2026‑08‑24

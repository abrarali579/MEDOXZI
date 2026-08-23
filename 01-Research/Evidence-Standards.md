# Evidence Standards

How every claim in this repository is labelled, sourced and maintained. Referenced by every other document.

## 1. Source hierarchy (highest authority first)

1. **Official regulatory sources** — CDSCO, MoHFW, MeitY, PIB, FDA, EU MDR bodies. Primary documents only, never summaries of them.
2. **Peer-reviewed research** — with preference for RCTs, systematic reviews and prospective studies over retrospective and single-site work.
3. **Recognised clinical guidelines** — national and international specialty bodies, with the publication date always recorded.
4. **Official vendor / product documentation** — the vendor's own technical docs, not their marketing pages, and never a press release.
5. **Official source repositories** — the repository itself, read directly.
6. **Reputable healthcare / technology publications** — treated as leads to primary sources, not as sources.
7. **Secondary commentary, review sites, aggregators** — lowest weight; usable only to indicate that something is worth verifying.

## 2. Claim labels

| Label | Definition | May it drive an architecture decision alone? |
|---|---|---|
| **[Confirmed]** | Verified against a primary source, with a link and an access date | Yes |
| **[Vendor Claim]** | Asserted by the vendor; not independently verified | No — flag as an assumption |
| **[Third-Party Claim]** | Asserted by a review site, analyst or journalist | No |
| **[Inference]** | Our reasoned judgement from available evidence | Yes, if labelled as judgement and the reasoning is shown |
| **[Unverified]** | Not verified in this pass | **No.** Must be escalated to Open-Questions |

## 3. Rules

- **Never fabricate.** No invented citations, repositories, product capabilities, prices, regulations or clinical evidence. If it cannot be verified, it is **[Unverified]** — an honest gap is more useful than a plausible fiction.
- **No capability inferred from marketing language.** "AI-powered clinical intelligence" is not a capability; it is a phrase.
- **Record the access date** for anything that changes — pricing, product features, repository statistics, regulatory status.
- **Distinguish "the source says X" from "X is true."** For contested or commercial claims, report the former.
- **Re-verification cadence:** competitive and pricing claims every 3 months; regulatory claims every 6 months or on any known amendment; repository claims at each phase gate.
- **Any [Unverified] or [Vendor Claim] that would change an architecture, cost or regulatory decision must appear in [Open-Questions.md](../00-Executive/Open-Questions.md).**

## 4. When a source cannot be retrieved

State it. Do not paraphrase from memory, and do not substitute a secondary source while implying the primary was read. Several PubMed/PMC pages returned access challenges during the 23 Aug 2026 research pass; every claim depending on them is marked **[Unverified]** and listed in the Research Log with instructions for retrieval.

## 5. Escalation markers used throughout

| Marker | Meaning |
|---|---|
| ⚖️ | Requires qualified legal or regulatory review. Nothing here is legal advice. |
| 🩺 | Requires clinician review and sign-off before implementation |
| 🔐 | Requires security/privacy review |
| ⚠️ | Known risk or caveat that must be read before relying on the surrounding content |

# Horizontal Positioning — v2.3

**Date:** 2026-08-23 · **Status:** v2.3 strategic shift, superseded in sequencing by ADR-035 · **Supersedes:** the healthcare-only framing in v1–v2.2

> **v2.4 update:** the founder has explicitly chosen to proceed healthcare-first and defer/skip the Evidence Sprint for now (ADR-035). Keep the horizontal architecture discipline where feasible, but the immediate build is MEDOXZI Pre-Round for OPD, not a two-vertical sprint.

---

## 1. The shift

MEDOXZI is no longer positioned as a healthcare product with a healthcare architecture. It is a **domain-neutral professional intake and briefing platform**, of which healthcare is **vertical #1**.

**The pattern, stated once:**

```
Client/Customer → AI Intake → Documents → Missing Questions → Structured Brief → Human Expert → Decision
```

Wherever an expensive professional spends scarce time gathering low-value information before they can apply judgement, this pattern applies.

| Vertical | What the system does | What the firm saves |
|---|---|---|
| **Healthcare / OPD** | Patient history, prior records, missing questions → doctor brief | Consultation time lost to history-taking |
| **Legal / law firms** | Client narrative, contracts, evidence → lawyer case brief | 30–60 min initial interview |
| **Accounting / tax** | Financials, invoices, returns → accountant-ready case | Bookkeeping and reconciliation prep |
| **Business setup / PRO** | Applicant activity, shareholders, visas, docs → recommended process | Repetitive consultation time |
| **Insurance claims** | Incident details, images, invoices, policy → adjuster brief | Claims cycle time |
| **Lending / mortgage** | Income, liabilities, statements → eligibility brief | RM screening workload |
| **Recruitment / HR** | CV, questionnaire → structured profile + gaps | Initial screening cost |
| **Real estate** | Requirements, budget, financing → agent-ready buyer profile | Discovery-call time |
| **Automotive workshops** | Issue description, dashboard images → mechanic brief | Inspection and intake time |
| **IT helpdesk / MSP** | Problem, screenshots, logs → engineer brief | L1 triage |
| **Cybersecurity** | Incident details, logs, screenshots → structured incident package | Analyst triage time |

**The real product is not medical.** It is *"stop paying an expert to collect information a form and a document parser could have collected."*

## 2. Why this is a strong move

| Effect | Why it matters |
|---|---|
| **Regulatory surface shrinks** | A general-purpose information-organisation tool is a different regulatory object from a clinical product. See §4. |
| **The riskiest vertical stops being the only vertical** | Device classification, health-data rules, 25-year retention, clinical sign-off — none of it applies to a law firm. |
| **The architecture was already domain-neutral** | See §3. Things mostly have to *move*, not be rebuilt. |
| **Customer diversity de-risks the company** | One clinic saying no stops being existential. |
| **The customisation step becomes the product** | Expert-approved question banks per domain is the same mechanism everywhere. |
| **Bigger market, same engine** | Every row above is one pipeline with different content. |

## 3. What is already horizontal, and what is not

**Most of the architecture never was healthcare-specific.**

| Component | Status | Notes |
|---|---|---|
| Provenance model (who said this) | ✅ **Horizontal** | A lawyer needs "client-stated vs document-derived" as much as a doctor |
| Verifier (traceability, reliability, temporal) | ✅ **Horizontal** | "Traceable ≠ true" is domain-neutral |
| Answer states (`NOT_ASKED` ≠ `UNKNOWN` ≠ `no`) | ✅ **Horizontal** | The defect class is universal |
| Document pipeline (parse, OCR, classify, extract, confidence, spans) | ✅ **Horizontal** | Only the *extraction schemas* differ |
| Concept codes (ADR-025) | ✅ **Horizontal** | `SYMPTOM_DYSPNEA` and `CLAIM_VEHICLE_DAMAGE` are the same construct |
| Question graph + utility scoring | ✅ **Horizontal** | Discriminating questions exist in every domain |
| Harness (contamination, abstention, drift, calibration, Class L) | ✅ **Horizontal** | Every gate applies verbatim |
| Multi-tenancy, RLS, audit, consent | ✅ **Horizontal** | |
| Expert sign-off before production content | ✅ **Horizontal** | Doctor / partner / senior accountant — same mechanism |
| **Question bank content** | ⚠️ **Vertical** | Move to a vertical pack |
| **Red-flag / escalation rules** | ⚠️ **Vertical** | "Chest pain + exertion" ↔ "limitation period expires in 14 days" |
| **Terminology / concept dictionary** | ⚠️ **Vertical** | |
| **Cohort gates** (paediatric, pregnancy) | ⚠️ **Vertical** | Healthcare-only construct |
| **Prohibited-language list** | ⚠️ **Vertical** | "No diagnosis" ↔ "no legal advice" — same idea, different words |

**Required refactor:** everything ⚠️ moves from "the content pack" into a **`vertical_pack`** — a versioned, expert-signed bundle scoped to one domain. The engine loads a vertical pack; **the engine does not know what a symptom is.**

This is a **days-scale design change, not a rewrite**, because content was already data rather than code (ADR-008, ADR-015).

## 4. What this does and does not do for regulation ⚖️

**The genuinely good news.** Medical device classification turns on **intended use** — software with a *medical purpose* (diagnostic, therapeutic, monitoring) is in scope; software with an *administrative* purpose is not. **[Third-Party Claim — practitioner sources; not yet verified against a Kemenkes primary document]**

A tool serving law firms, accountants, insurers, recruiters **and** clinics is evidently a general-purpose information system. That is a materially stronger position than a healthcare-only product arguing it happens not to diagnose.

**The discipline this demands — the part that matters:**

> **The horizontal claim is only protective if the architecture is genuinely horizontal.**

If the healthcare vertical ships clinical rules, a medical question bank, clinical red flags and clinical urgency language while the legal vertical ships none of it, then **the healthcare vertical is a different product wearing the same name** — and a regulator will look at the healthcare vertical, not at the marketing.

**Three rules that keep the positioning true:**

1. **No clinical capability may exist in the engine.** If a feature only makes sense for medicine, it belongs in a vertical pack.
2. **Every vertical uses the same mechanisms.** Escalation rules exist in every pack — legal has deadline rules, insurance has fraud-indicator rules. Healthcare is not special-cased.
3. **The intended-use statement is a product artefact, not a marketing line.** It goes in documentation, contract and UI, and the product must be describable without domain-specific verbs.

**What does NOT change:**
- Red-flag packs still ship **empty** and still require named expert sign-off (ADR-015)
- The differential engine stays in **shadow** — still the feature most likely to create a medical purpose
- No clinical performance claim may be made
- **Counsel confirmation is still required** (OT-02). Positioning strengthens the argument; it does not settle it.

## 5. The observation worth sitting with

**Healthcare is the hardest vertical to start in, and it is the one being started in because of where the brief began.**

| | Healthcare (Klinik Pratama) | Legal / Accounting / Recruitment |
|---|---|---|
| Documents | Handwritten scripts, thermal prints, phone photos | Clean digital PDFs |
| Intake user | Elderly, mixed literacy, waiting room, one-time use | Literate professional client, motivated, at a desk |
| Regulatory | Device classification, health-data rules, 25-yr retention | Ordinary commercial software |
| Expert sign-off | Named doctor, clinical governance | Partner review, no equivalent burden |
| Harm if wrong | Patient safety | Commercial, recoverable |
| Buyer | Clinic owner, price-sensitive | Firm used to paying for software |
| Sales cycle | Slow, trust-heavy | Faster |

**This is not an argument to abandon healthcare.** The domain knowledge is built, the pack is designed, and the EMR mandate is a real wedge. It is an argument to consider **proving the engine in an easier vertical first**, then entering healthcare with a working product, references and revenue.

Note the asymmetry: a pipeline built for clean legal PDFs will not survive a handwritten Indonesian prescription — but **an engine hardened on handwritten prescriptions handles legal PDFs trivially.** Healthcare-first is harder engineering that produces a stronger engine.

**Historical recommendation:** run the Evidence Sprint across **two verticals at once** — healthcare plus one commercial vertical the founder can access quickly. Cost is nearly identical, it reveals which reaches revenue first, and it forces the architecture to stay horizontal from day one instead of being retrofitted. This recommendation is now deferred by ADR-035, not disproven.

## 6. Naming

`MEDOXZI` reads as medical. If the platform is horizontal, the platform name should not carry a vertical.

- **Platform:** a neutral name — the engine, sold to any professional firm
- **MEDOXZI Pre-Round:** the healthcare vertical pack
- Other packs named per vertical

Not urgent. Recorded so it is not discovered at pitch time, when a clinically-named product makes the horizontal argument harder to make in the room.

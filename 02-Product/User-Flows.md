# User Flows

## 1. Patient self-service intake (happy path)

```mermaid
sequenceDiagram
    autonumber
    participant P as Patient
    participant D as Front desk
    participant A as Patient PWA
    participant S as Backend
    participant W as AI workers

    P->>D: Arrives
    D->>S: Register / look up patient
    S-->>D: Token #47, encounter created
    D->>P: Token slip + QR / SMS link
    P->>A: Opens link, selects language
    A->>P: Consent screen (plain language)
    P->>A: Grants treatment + AI consent
    A->>P: Basic personal information confirmation
    A->>P: Chief complaint list
    P->>A: "Chest pain"
    A->>P: 2-3 line issue description
    P->>A: "Pain when walking for 3 days"
    A->>S: Fetch question set (content bank v1.4, chest pain)
    S-->>A: Lead-Doctor-approved branching question set
    loop Each question
        A->>P: Question with fast controls
        P->>A: Answer / skip (NOT_ASKED)
        A->>S: Autosave
    end
    A->>P: Medications, allergies, conditions, surgeries, family/social
    A->>P: Optional previous reports
    P->>A: Skips, or attaches reports for doctor review
    A->>A: Quality check if attached
    A->>S: Upload if attached (encrypted, tenant-scoped)
    S->>W: Enqueue optional document jobs
    A->>P: Review everything entered
    P->>A: Corrects one medication, submits
    A->>S: Submit intake
    S->>W: Enqueue pre-round pipeline
    W->>W: Optional parse → OCR → classify → extract → normalise
    W->>W: Empty production red-flag rules unless Lead Doctor signed
    W->>W: LLM synthesis → verifier
    W->>S: Materialise Pre-Round View
    S-->>D: Queue shows: intake complete, brief ready
    Note over P: Patient sees token status only.<br/>No clinical interpretation. Ever.
```

## 2. Staff-assisted intake

```mermaid
flowchart TD
    A[Patient cannot self-serve:<br/>literacy · language · age · disability ·<br/>no device · preference] --> B[Staff opens assisted intake<br/>for that token]
    B --> C[Staff selects patient's language]
    C --> D["Staff asks questions as written,<br/>records answers verbatim"]
    D --> E{Patient uses<br/>a non-clinical word?}
    E -->|Yes| F["Record patient's words in free text<br/>AND select the closest structured option"]
    E -->|No| G[Record structured answer]
    F --> H[Continue]
    G --> H
    H --> I[Staff photographs prior records]
    I --> J["Staff reads back the summary<br/>to the patient in their language"]
    J --> K{Patient confirms?}
    K -->|No| D
    K -->|Yes| L["Submit — entered_by=STAFF,<br/>staff user id recorded"]
    L --> M[Identical downstream pipeline]

    style D fill:#e8f4ff
    style J fill:#e8f4ff
```

**Design note:** the read-back step (J) is not politeness. It is the accuracy control that makes staff-assisted data trustworthy, and it is a required step, not an optional one. 🩺

## 3. Doctor consultation flow

```mermaid
flowchart TD
    A[Doctor opens OPD queue] --> B["Sees tokens: intake status,<br/>report status, brief readiness"]
    B --> C[Clicks next patient]
    C --> D{Intake status?}
    D -->|None| E["Empty state — registration data only.<br/>No fabricated content."]
    D -->|Partial| F["Partial banner: N of M sections.<br/>Unanswered sections named."]
    D -->|Complete| G[Full Pre-Round View]
    E --> H
    F --> H
    G --> H["Doctor reads snapshot (≤30s)"]
    H --> I{Approved safety rules active?}
    I -->|Yes| J["Reads rule, inputs and rationale.<br/>Decides — system never blocks."]
    I -->|No| K["'No clinic-approved safety rules are active' shown —<br/>NOT 'no concern'"]
    J --> L[Question panel]
    K --> L
    L --> M["One-tap answers<br/>Yes/No/Unknown/Not asked/MCQ/numeric"]
    M --> N[Structured encounter state updates]
    N --> O{Contradiction detected?}
    O -->|Yes| P["Both values shown side by side.<br/>Doctor resolves. Nothing overwritten."]
    O -->|No| Q
    P --> Q[Doctor examines patient, records findings]
    Q --> R["Draft summary — five separated sections"]
    R --> S{Edits needed?}
    S -->|Yes| T[Edit inline; diff captured]
    S -->|No| U
    T --> U["APPROVE — enters clinical record"]
    U --> V[Final diagnosis captured]
    V --> W[One-tap feedback]
    W --> X[Next patient]

    style U fill:#d9f2d9,stroke:#080,stroke-width:2px
    style K fill:#fff4d9
```

## 4. Document correction flow

```mermaid
flowchart LR
    A["Doctor sees: Metformin 500mg BD<br/>⚠ unconfirmed · confidence 0.62"] --> B[Clicks the fact]
    B --> C["Source image opens with the<br/>region highlighted"]
    C --> D{Correct?}
    D -->|Yes| E[Confirm → CONFIRMED<br/>+ actor + timestamp]
    D -->|No| F[Edit value]
    F --> G["Corrected value stored;<br/>original extraction PRESERVED"]
    G --> H["Labelled as an extraction-error example<br/>→ governed dataset"]
    D -->|Illegible| I["Mark unreadable —<br/>no value enters the record"]
    E --> J[Structured record updated]
    G --> J
    I --> J
```

## 5. Red-flag escalation while the patient is still waiting

```mermaid
sequenceDiagram
    participant W as Rule engine
    participant S as Backend
    participant N as Nurse/front desk
    participant D as Doctor
    participant P as Patient

    W->>S: Rule RF-CHEST-02 fired (severity HIGH)
    S->>S: Create SafetyFlag + audit event
    S->>N: Staff banner + suggested queue re-order
    Note over N: Staff decide. System never auto-reorders.
    N->>N: Assess patient in person
    alt Urgent
        N->>S: Re-order queue / escalate per clinic protocol
        N->>D: Notify
    else Not urgent on assessment
        N->>S: Record staff assessment + reason
    end
    S->>D: Flag visible with rule, inputs and staff assessment
    Note over P: Patient is NEVER shown the flag,<br/>a severity, or a possible cause.
```

## 6. Consent refusal flow

```mermaid
flowchart TD
    A[Consent screen] --> B{AI processing consent}
    B -->|Granted| C[Full pipeline]
    B -->|Refused| D["Intake captured normally"]
    D --> E["NO LLM calls made — enforced at the<br/>orchestration layer, verified in tests"]
    E --> F["Documents stored and viewable;<br/>OCR only if separately consented"]
    F --> G["Doctor sees raw structured intake<br/>+ 'AI processing declined by patient'"]
    G --> H["Encounter proceeds normally"]
    B -->|Later withdrawn| I["Deletion workflow:<br/>AI outputs derived from this patient deleted<br/>with their source"]

    style E fill:#ffe8e8,stroke:#c00
```

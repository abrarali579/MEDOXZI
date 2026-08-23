"""Extracted clinical facts and their verification lifecycle.

Mirrors the database CHECK constraint in ``db/schema.sql``: a high-risk fact
cannot reach CONFIRMED without a human verifier. Enforced here as well as in
the schema, because defence in depth is cheaper than an incident.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum


class FactType(str, Enum):
    MEDICATION = "MEDICATION"
    CONDITION = "CONDITION"
    LAB_RESULT = "LAB_RESULT"
    ALLERGY = "ALLERGY"
    PROCEDURE = "PROCEDURE"
    VITAL = "VITAL"
    PREGNANCY = "PREGNANCY"
    ANTICOAGULANT_USE = "ANTICOAGULANT_USE"
    PATIENT_IDENTITY = "PATIENT_IDENTITY"
    DATE_OF_BIRTH = "DATE_OF_BIRTH"
    REPORT_OWNERSHIP = "REPORT_OWNERSHIP"
    OTHER = "OTHER"


class VerificationStatus(str, Enum):
    UNCONFIRMED = "UNCONFIRMED"
    CONFIRMED = "CONFIRMED"
    CORRECTED = "CORRECTED"
    REJECTED = "REJECTED"
    ILLEGIBLE = "ILLEGIBLE"


class SourceReliability(str, Enum):
    TRUSTED_CLINIC_RECORD = "TRUSTED_CLINIC_RECORD"
    PATIENT_REPORTED = "PATIENT_REPORTED"
    CAREGIVER_REPORTED = "CAREGIVER_REPORTED"
    OCR_UNVERIFIED = "OCR_UNVERIFIED"
    EXTERNAL_UNVERIFIED = "EXTERNAL_UNVERIFIED"
    UNCERTAIN = "UNCERTAIN"


class TemporalStatus(str, Enum):
    CURRENT = "CURRENT"
    HISTORICAL = "HISTORICAL"
    DATE_UNKNOWN = "DATE_UNKNOWN"
    SUPERSEDED = "SUPERSEDED"
    REPORTED_STOPPED = "REPORTED_STOPPED"
    NEEDS_CONFIRMATION = "NEEDS_CONFIRMATION"


#: Fact types where a wrong value can directly harm a patient. These always
#: require a human before they are treated as fact.
HIGH_RISK_TYPES = frozenset({
    FactType.MEDICATION,
    FactType.ALLERGY,
    FactType.PREGNANCY,
    FactType.ANTICOAGULANT_USE,
    FactType.PATIENT_IDENTITY,
    FactType.DATE_OF_BIRTH,
    FactType.REPORT_OWNERSHIP,
})

CLINICAL_ROLES = frozenset({"DOCTOR", "NURSE"})


class VerificationError(Exception):
    pass


@dataclass
class ExtractedFact:
    fact_id: str
    tenant_id: str
    encounter_id: str
    fact_type: FactType
    raw_text: str
    normalised_value: dict
    confidence: float
    source_span_id: str
    document_id: str
    source_reliability: SourceReliability = SourceReliability.OCR_UNVERIFIED
    temporal_status: TemporalStatus = TemporalStatus.DATE_UNKNOWN
    field_confidence: dict[str, float] = field(default_factory=dict)
    source_crop_id: str | None = None
    reviewer_decision: str | None = None
    is_handwritten: bool = False
    verification_status: VerificationStatus = VerificationStatus.UNCONFIRMED
    verified_by_user_id: str | None = None
    verified_by_role: str | None = None
    verified_at: datetime | None = None
    corrected_value: dict | None = None
    original_value: dict | None = None
    duplicate_of: str | None = None
    contradicts: list[str] = field(default_factory=list)

    @property
    def is_high_risk(self) -> bool:
        """Handwritten documents make every fact high-risk regardless of type,
        because handwriting is the failure mode we trust least."""
        return self.fact_type in HIGH_RISK_TYPES or self.is_handwritten

    # ----------------------------------------------------------- transitions

    def confirm(self, user_id: str, role: str) -> None:
        if self.is_high_risk and role not in CLINICAL_ROLES:
            raise VerificationError(
                f"{self.fact_id}: a high-risk fact ({self.fact_type.value}) "
                f"cannot be confirmed by role {role}"
            )
        if not user_id:
            raise VerificationError(
                f"{self.fact_id}: confirmation requires a human actor"
            )
        self.verification_status = VerificationStatus.CONFIRMED
        self.reviewer_decision = "CONFIRMED"
        self._stamp(user_id, role)

    def correct(self, user_id: str, role: str, corrected_value: dict) -> None:
        if self.is_high_risk and role not in CLINICAL_ROLES:
            raise VerificationError(
                f"{self.fact_id}: role {role} may not correct a high-risk fact"
            )
        # The original extraction is preserved — it is the supervision label
        # that tells us where extraction goes wrong.
        self.original_value = dict(self.normalised_value)
        self.corrected_value = corrected_value
        self.verification_status = VerificationStatus.CORRECTED
        self.reviewer_decision = "CORRECTED"
        self._stamp(user_id, role)

    def reject(self, user_id: str, role: str) -> None:
        self.verification_status = VerificationStatus.REJECTED
        self.reviewer_decision = "REJECTED"
        self._stamp(user_id, role)

    def mark_illegible(self, user_id: str, role: str) -> None:
        """No value enters the record. We do not guess."""
        self.verification_status = VerificationStatus.ILLEGIBLE
        self.normalised_value = {}
        self.reviewer_decision = "ILLEGIBLE"
        self._stamp(user_id, role)

    def _stamp(self, user_id: str, role: str) -> None:
        self.verified_by_user_id = user_id
        self.verified_by_role = role
        self.verified_at = datetime.now(timezone.utc)

    # ---------------------------------------------------------------- render

    def display_value(self) -> dict:
        return self.corrected_value or self.normalised_value

    def provenance_label(self) -> str:
        if self.verification_status is VerificationStatus.CONFIRMED:
            return f"Record (confirmed by {self.verified_by_role})"
        if self.verification_status is VerificationStatus.CORRECTED:
            return f"Record (corrected by {self.verified_by_role})"
        if self.verification_status is VerificationStatus.ILLEGIBLE:
            return "Record (illegible — no value)"
        return f"Record {self.confidence:.2f} — UNCONFIRMED"

    def enters_clinical_record(self) -> bool:
        """The gate. Anything high-risk needs a named human behind it."""
        if self.verification_status in (VerificationStatus.REJECTED,
                                        VerificationStatus.ILLEGIBLE,
                                        VerificationStatus.UNCONFIRMED):
            return False
        if self.is_high_risk and self.verified_by_user_id is None:
            return False
        return True

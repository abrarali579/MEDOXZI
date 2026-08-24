"""Structured current-state model for Graphify.

Synthetic planning artifact only. It converts the repository's current STATE.md
and OPEN-THREADS.md status into code-shaped nodes so Graphify can build a local
knowledge graph without sending project documents to an external model.
"""


class MEDOXZICurrentState:
    repository_version = "v2.6"
    active_vertical = "healthcare_first_narrow_mvp"
    production_app = "not_built"
    public_repo = "https://github.com/abrarali579/MEDOXZI"

    def depends_on(self):
        return [
            VisualHTMLMVP,
            VerticalQuestionPack,
            SafetyHarness,
            DoctorWorkflow,
            ClinicMessaging,
            IndonesianCompliance,
        ]


class VisualHTMLMVP:
    status = "active_visual_iteration"
    location = "14-MVP-HTML"
    verified_url = "http://127.0.0.1:8765/index.html"

    def contains(self):
        return [
            WelcomeSearch,
            PatientIntake,
            DoctorBrief,
            DoctorPastFiles,
            FollowupPreview,
        ]


class WelcomeSearch:
    purpose = "patient_lookup_or_new_registration"
    search_fields = ["phone", "full_name"]
    match_action = "confirm_existing_patient"
    no_match_action = "register_new_patient"


class PatientIntake:
    purpose = "collect_patient_words_and_basic_context"
    steps = [
        "details",
        "pick_reason",
        "brief",
        "ai_questions",
        "review_and_consent",
        "done",
    ]
    fields_sent_to_questions = ["full_name", "phone", "age", "sex", "complaint", "brief"]

    def feeds(self):
        return [DoctorBrief, VerticalQuestionPack]


class DoctorBrief:
    purpose = "source_bound_doctor_review_before_consult"
    includes = ["demographic_chips", "patient_words", "answer_list", "attachments", "missing_items"]
    forbidden_outputs = ["ai_diagnosis", "visible_differential", "treatment_advice"]

    def receives_from(self):
        return [PatientIntake, DoctorPastFiles]


class DoctorPastFiles:
    purpose = "search_scroll_open_old_synthetic_files"
    features = ["complaint_filter", "followup_filter", "date_filter", "current_plus_past_split"]
    data_status = "synthetic_demo_only"

    def links_to(self):
        return [PINIdentityBinding, DoctorBrief]


class PINIdentityBinding:
    status = "prototype_only"
    visible_pin = "larger_pin_in_doctor_record_only"
    production_need = "immutable_internal_patient_key_and_audited_duplicate_resolution"
    risk = "short_visible_pin_collision_without_clinic_scope"


class VerticalQuestionPack:
    status = "forty_literature_packs_active_by_founder_override"
    source = "OPD_Java_Disease_QuestionBank"
    contents = ["screening_questions", "icd10_refs", "clinical_purpose"]
    boundary = "questions_not_diagnosis"

    def guarded_by(self):
        return [SafetyHarness, ContentLicensing]


class SafetyHarness:
    tests = "100_passed"
    harness = "9_of_9_gates_pass"
    protects_against = ["contamination", "fabrication", "diagnostic_drift", "calibration_failure"]


class ClinicMessaging:
    status = "disabled_until_controls_exist"
    allowed_owner = "clinic_owned_only"
    required_controls = ["consent", "opt_out", "audit", "template_versioning", "sender_identity"]
    forbidden = ["medoxzi_patient_marketing", "ai_diagnosis_in_messages", "false_urgency"]


class IndonesianCompliance:
    storage = "design_for_indonesia_storage"
    pse_registration = "founder_owned"
    processing_location = "counsel_pending"
    medical_device_position = "founder_de_risked_but_counsel_optional"


class ContentLicensing:
    status = "activation_gate_for_future_pack_generation"
    permitted_sources = ["public_health_guidance", "permissive_open_access", "customer_material", "expert_written_knowledge"]
    prohibited_sources = ["paywalled_journals", "textbooks", "scraped_competitors"]


class FollowupPreview:
    status = "disabled_preview_only"
    depends_on = ["ClinicMessaging"]


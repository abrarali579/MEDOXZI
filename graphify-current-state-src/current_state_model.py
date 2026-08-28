"""Structured current-state model for Graphify.

Synthetic planning artifact only. It converts the repository's current STATE.md
and OPEN-THREADS.md status into code-shaped nodes so Graphify can build a local
knowledge graph without sending project documents to an external model.
"""


class MEDOXZICurrentState:
    repository_version = "v2.7"
    active_vertical = "healthcare_first_narrow_mvp"
    production_app = "not_built"
    deployed_html_mvp = "https://medoxzi.vercel.app"
    public_repo = "https://github.com/abrarali579/MEDOXZI"

    def depends_on(self):
        return [
            VisualHTMLMVP,
            AdaptiveInterviewAPI,
            VerticalQuestionPack,
            SafetyHarness,
            DoctorWorkflow,
            ClinicMessaging,
            MarketingManagement,
            FollowupScheduler,
            BilalInterviewAudit,
            VisitCompare,
            IndonesianCompliance,
        ]


class VisualHTMLMVP:
    status = "active_visual_iteration_deployed"
    location = "14-MVP-HTML"
    local_url = "http://127.0.0.1:8765/index.html"
    production_url = "https://medoxzi.vercel.app"

    def contains(self):
        return [
            WelcomeSearch,
            PatientIntake,
            ProfessionalInterviewScreen,
            DoctorBrief,
            DoctorPastFiles,
            MarketingManagement,
            FollowupScheduler,
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
        "adaptive_ai_questions",
        "review_and_consent",
        "done",
    ]
    fields_sent_to_questions = ["full_name", "phone", "age", "sex", "complaint", "brief"]
    ui_rules = [
        "one_progress_bar_with_numeric_percent",
        "no_spinner_or_thinking_text",
        "question_block_keeps_height",
        "professional_tablet_interview_screen",
        "tap_option_auto_next_question",
        "mobile_question_first_stack",
        "fixed_scroll_answers_so_far_panel",
        "no_duplicate_previous_questions_under_options",
        "answers_persist_in_local_storage",
        "min_five_max_twelve_questions",
    ]

    def feeds(self):
        return [ProfessionalInterviewScreen, DoctorBrief, VerticalQuestionPack, AdaptiveInterviewAPI, BilalInterviewAudit]


class ProfessionalInterviewScreen:
    location = ["14-MVP-HTML/index.html", "14-MVP-HTML/styles.css", "14-MVP-HTML/app.js"]
    purpose = "patient_facing_one_question_at_a_time_tablet_interview"
    layout = [
        "left_patient_context_chips",
        "center_large_question_and_four_answer_cards",
        "right_fixed_scroll_answers_so_far_panel",
        "back_and_skip_action_bar",
    ]
    interaction = "answer_card_tap_records_answer_and_fetches_next_question_automatically"
    responsive = "three_column_tablet_layout_stacks_question_first_on_phone"
    boundary = "no_diagnosis_shown_and_no_treatment_advice"

    def uses(self):
        return [AdaptiveInterviewAPI, AdaptiveQuestionValidator]


class AdaptiveInterviewAPI:
    location = "14-MVP-HTML/api/questions.js"
    local_mirror = "14-MVP-HTML/server.js"
    model_provider = "DeepSeek"
    behavior = "one_question_at_a_time"
    contract = [
        "never_reask_onset_duration_timing_from_brief_or_answers",
        "exactly_one_question",
        "exactly_four_options_with_escape",
        "no_diagnosis",
        "no_treatment_advice",
        "adaptive_next_question_from_prior_answers",
    ]
    runtime_guard = "deterministic_candidate_validator_with_single_repair_and_static_safe_fallback"

    def guarded_by(self):
        return [AdaptiveQuestionValidator, PromptContractHarness, LiveInterviewHarness]


class AdaptiveQuestionValidator:
    location = ["14-MVP-HTML/api/questions.js", "14-MVP-HTML/server.js"]
    purpose = "validate_model_question_before_patient_sees_it"
    rejects = [
        "malformed_question_or_not_exactly_four_options",
        "multiple_questions_in_one_turn",
        "duplicate_questions_already_answered",
        "known_timing_duration_reask",
        "diagnosis_wording",
        "treatment_recommendation_language",
    ]
    fallback = "safe_static_question_after_one_repair_attempt"


class DoctorBrief:
    purpose = "source_bound_doctor_review_before_consult"
    includes = [
        "current_plus_two_queue",
        "structured_feedback",
        "demographic_chips",
        "patient_words",
        "answer_list",
        "attachments",
        "allergies_and_vitals_inputs",
        "doctor_entered_priority_diagnoses",
        "doctor_selected_relevant_tests",
        "doctor_selected_plan_category",
        "sticky_assessment_action_bar",
    ]
    forbidden_outputs = ["ai_diagnosis", "visible_differential", "treatment_advice"]

    def receives_from(self):
        return [PatientIntake, DoctorPastFiles, VisitCompare, BilalInterviewAudit]


class DoctorPastFiles:
    purpose = "search_scroll_open_old_synthetic_files"
    features = ["complaint_filter", "followup_filter", "date_filter", "previous_record_action"]
    data_status = "synthetic_demo_only"

    def links_to(self):
        return [PINIdentityBinding, DoctorBrief, VisitCompare]


class DoctorWorkflow:
    purpose = "clinician_owned_documentation_and_previsit_review"
    preferred_layout = "landscape_tablet_first"
    boundaries = [
        "doctor_keeps_final_discretion",
        "doctor_fields_are_clinician_entered",
        "tests_are_doctor_selected_not_ai_ordered",
        "deepseek_output_is_screening_questions_only",
    ]


class PINIdentityBinding:
    status = "prototype_only"
    visible_pin = "larger_pin_in_doctor_record_only"
    production_need = "immutable_internal_patient_key_and_audited_duplicate_resolution"
    risk = "short_visible_pin_collision_without_clinic_scope"


class VerticalQuestionPack:
    status = "forty_literature_packs_active_by_adr039_founder_override"
    source = "OPD_Java_Disease_QuestionBank"
    contents = ["screening_questions", "icd10_refs", "clinical_purpose", "no_red_flag_screens_by_adr038"]
    boundary = "questions_not_diagnosis"

    def guarded_by(self):
        return [SafetyHarness, ContentLicensing]


class SafetyHarness:
    tests = "100_passed"
    harness = "9_of_9_gates_pass"
    protects_against = ["contamination", "fabrication", "diagnostic_drift", "calibration_failure"]


class PromptContractHarness:
    location = "14-MVP-HTML/harness/prompt_contract.test.mjs"
    purpose = "offline_guard_for_absolute_prompt_rules"
    gates = "fourteen_prompt_contract_gates"


class LiveInterviewHarness:
    location = "14-MVP-HTML/harness/live_loop.mjs"
    purpose = "drives_real_deepseek_interviewer_against_synthetic_scenarios"
    suites = ["default_live_loop", "never_reask_catalogue"]
    regression_cases = ["stomachache_ibuprofen_duration_trap"]


class ClinicMessaging:
    status = "audit_only_until_controls_exist"
    allowed_owner = "clinic_owned_only"
    required_controls = ["consent", "opt_out", "audit", "template_versioning", "sender_identity"]
    forbidden = ["medoxzi_patient_marketing", "ai_diagnosis_in_messages", "false_urgency"]


class MarketingManagement:
    location = "14-MVP-HTML"
    purpose = "clinic_communications_management_view"
    behavior = "prepare_and_audit_not_send"
    governance = "clinic_owned_communication_consent_not_marketing_consent"

    def depends_on(self):
        return [ClinicMessaging, FollowupScheduler]


class FollowupScheduler:
    location = "14-MVP-HTML/api/followups"
    status = "implemented_but_production_blocked_on_vercel_kv"
    storage = "Upstash_Redis_sorted_set_fu_queue"
    cron = "daily_09_00_utc"
    production_blocker = "KV_REST_API_URL_and_KV_REST_API_TOKEN"

    def requires(self):
        return [ClinicMessaging, VercelDeployment]


class BilalInterviewAudit:
    location = "14-MVP-HTML/api/bilal.js"
    purpose = "audit_completed_interviews_and_suggest_missing_questions"
    output_status = "improvement_log_not_production_self_training"
    boundary = "no_automatic_behavior_change"


class VisitCompare:
    location = "14-MVP-HTML/api/compare.js"
    purpose = "compare_current_visit_with_previous_patient_reported_visit"
    boundary = "patient_reported_diff_only_no_diagnosis_or_treatment"


class VercelDeployment:
    root_config = "vercel.json"
    subdir_config = "14-MVP-HTML/vercel.json"
    root_directory_option = "14-MVP-HTML"
    required_env = ["DEEPSEEK_API_KEY", "KV_REST_API_URL", "KV_REST_API_TOKEN"]


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
    status = "superseded_by_followup_scheduler_audit_only"
    depends_on = ["ClinicMessaging", "FollowupScheduler"]

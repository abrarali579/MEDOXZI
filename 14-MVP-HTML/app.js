const state = {
  token: 51,
  currentStep: 0,
  complaint: "Fever",
  answers: {},
  files: [],
  doctorSaved: false,
};

const questions = [
  "When did this problem start?",
  "Is it getting better, worse, or staying the same?",
  "Are you taking any regular medicines?",
  "Do you know of any medicine allergy?",
];

const patients = [
  { token: 49, name: "A. Demo", meta: "F 31", status: "No intake", docs: "0" },
  { token: 50, name: "B. Demo", meta: "M 42", status: "Partial", docs: "1 pending" },
  { token: 51, name: "Demo Patient", meta: "M 34", status: "Ready", docs: "0" },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function switchView(viewName) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
}

function renderQueues() {
  const html = patients
    .map(
      (patient) => `
        <button class="queue-item" type="button" data-token="${patient.token}">
          <span class="token">${patient.token}</span>
          <span>
            <span class="queue-name">${patient.name}</span>
            <span class="queue-meta">${patient.meta} · Docs ${patient.docs}</span>
          </span>
          <span class="mini-badge">${patient.status}</span>
        </button>
      `,
    )
    .join("");
  $("#staffQueue").innerHTML = html;
  $("#doctorQueue").innerHTML = html;
  $("#waitingCount").textContent = `${patients.length} waiting`;
}

function syncPatientFromRegistration() {
  const name = $("#patientName").value || "Demo Patient";
  const age = $("#patientAge").value || "34";
  const sex = $("#patientSex").value || "Male";
  $("#intakeName").value = name;
  $("#intakeAge").value = age;
  $("#intakeSex").value = sex;
  patients[2].name = name;
  patients[2].meta = `${sex.charAt(0)} ${age}`;
  renderQueues();
  renderDoctorBrief();
}

function showStep(step) {
  state.currentStep = Math.max(0, Math.min(step, 7));
  $$(".intake-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === state.currentStep);
  });

  const total = 7;
  $("#stepLabel").textContent =
    state.currentStep < 7 ? `Step ${state.currentStep + 1} of ${total}` : "Done";
  $("#progressBar").style.width = `${Math.min(100, ((state.currentStep + 1) / total) * 100)}%`;
  $("#backStep").disabled = state.currentStep === 0;
  $("#nextStep").style.display = state.currentStep >= 6 ? "none" : "";
  $("#skipStep").style.display = state.currentStep >= 6 ? "none" : "";

  if (state.currentStep === 4) {
    renderQuestion();
  }
  if (state.currentStep === 6) {
    renderReview();
  }
}

function renderQuestion() {
  const index = Object.keys(state.answers).length;
  const nextQuestion = questions[Math.min(index, questions.length - 1)];
  $("#questionTitle").textContent = `Basic question ${Math.min(index + 1, questions.length)} of ${questions.length}`;
  $("#questionText").textContent = nextQuestion;
  $("#answerSummary").innerHTML = Object.entries(state.answers)
    .map(([question, answer]) => `<div><strong>${question}</strong><br>${answer}</div>`)
    .join("");
  $$(".answer-grid button").forEach((button) => button.classList.remove("selected"));
}

function answerQuestion(answer) {
  const index = Object.keys(state.answers).length;
  const question = questions[Math.min(index, questions.length - 1)];
  state.answers[question] = answer;

  if (Object.keys(state.answers).length >= questions.length) {
    showStep(5);
  } else {
    renderQuestion();
  }
  renderDoctorBrief();
}

function renderFiles() {
  if (!state.files.length) {
    $("#fileList").textContent = "No reports attached. This is a normal first-visit state.";
    return;
  }
  $("#fileList").innerHTML = state.files.map((file) => `<div>${file} · doctor-review only</div>`).join("");
}

function renderReview() {
  const rows = [
    ["Name", $("#intakeName").value],
    ["Age / sex", `${$("#intakeAge").value} / ${$("#intakeSex").value}`],
    ["Reason", state.complaint],
    ["Patient words", $("#issueText").value || "Not entered"],
    ["Reports", state.files.length ? `${state.files.length} attached` : "No previous reports"],
  ];

  $("#reviewList").innerHTML = rows
    .map(([label, value]) => `<div class="review-item"><strong>${label}</strong><span>${value}</span></div>`)
    .join("");
}

function renderDoctorBrief() {
  const name = $("#intakeName")?.value || $("#patientName")?.value || "Demo Patient";
  const age = $("#intakeAge")?.value || $("#patientAge")?.value || "34";
  const sex = $("#intakeSex")?.value || $("#patientSex")?.value || "Male";
  $("#briefTitle").textContent = `Token ${state.token} · ${name} · ${sex}, ${age}`;
  $("#briefIssue").textContent = $("#issueText")?.value || "Not entered";
  $("#briefFiles").textContent = state.files.length
    ? `${state.files.length} file(s) attached for doctor review only.`
    : "No previous reports attached.";

  const answerEntries = Object.entries(state.answers);
  $("#briefAnswers").innerHTML = answerEntries.length
    ? answerEntries.map(([q, a]) => `<li>${q}: <strong>${a}</strong></li>`).join("")
    : "<li>No basic questions answered yet.</li>";

  const missing = questions.filter((question) => !state.answers[question]);
  $("#missingItems").textContent = missing.length ? missing.join(" · ") : "No demo questions missing.";
}

function saveDoctorConclusion() {
  state.doctorSaved = true;
  const followupNeeded = $("#followupNeeded").value;
  const followupDate = $("#followupDate").value;
  const consent = $("#clinicCommsConsent").checked;

  if (followupNeeded === "Yes" && followupDate) {
    $("#reminderPreview").textContent =
      `Clinic message preview only\n\nDear ${$("#intakeName").value || "Patient"}, this is a reminder from the clinic for your follow-up visit on ${followupDate}.\n\nSending is disabled until clinic-owned consent, opt-out, audit and template controls are implemented.\n\nConsent selected in demo: ${consent ? "yes" : "no"}`;
  } else {
    $("#reminderPreview").textContent =
      "Doctor conclusion saved. No follow-up reminder preview because follow-up is not marked as needed or no date was selected.";
  }
  switchView("ops");
}

document.addEventListener("DOMContentLoaded", () => {
  renderQueues();
  showStep(0);
  renderDoctorBrief();

  $$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
  $$("[data-jump]").forEach((button) =>
    button.addEventListener("click", () => switchView(button.dataset.jump)),
  );

  $("#registrationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    syncPatientFromRegistration();
    switchView("patient");
  });

  $("#backStep").addEventListener("click", () => showStep(state.currentStep - 1));
  $("#nextStep").addEventListener("click", () => showStep(state.currentStep + 1));
  $("#skipStep").addEventListener("click", () => showStep(state.currentStep + 1));
  $("#submitIntake").addEventListener("click", () => {
    patients[2].status = "Ready";
    renderQueues();
    renderDoctorBrief();
    showStep(7);
  });

  $$(".complaint-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      state.complaint = button.dataset.complaint;
      $$(".complaint-grid button").forEach((el) => el.classList.remove("selected"));
      button.classList.add("selected");
      showStep(3);
    });
  });

  $$(".answer-grid button").forEach((button) => {
    button.addEventListener("click", () => answerQuestion(button.dataset.answer));
  });

  $("#reportInput").addEventListener("change", (event) => {
    state.files = Array.from(event.target.files).map((file) => file.name);
    renderFiles();
    renderDoctorBrief();
  });

  ["intakeName", "intakeAge", "intakeSex", "issueText"].forEach((id) => {
    $(`#${id}`).addEventListener("input", renderDoctorBrief);
  });

  $("#saveDoctor").addEventListener("click", saveDoctorConclusion);
});

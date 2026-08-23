const state = {
  token: 51,
  pin: "",
  linkedIdentity: null,
  currentStep: 0,
  complaint: "Fever",
  answers: {},
  files: [],
  doctorSaved: false,
};

const questions = [
  {
    text: "When did this problem start?",
    options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"],
  },
  {
    text: "Is it getting better, worse, or staying the same?",
    options: ["Getting better", "Getting worse", "Same", "Not sure"],
  },
  {
    text: "Are you taking any regular medicines?",
    options: ["Yes", "No", "I don't know names", "Not asked"],
  },
  {
    text: "Do you know of any medicine allergy?",
    options: ["Yes", "No known allergy", "Not sure", "Not asked"],
  },
];

const patients = [
  {
    token: 49,
    pin: "MXZ-2408-1049",
    name: "A. Demo",
    age: "31",
    sex: "Female",
    phone: "+62 812 1111 1111",
    meta: "F 31",
    status: "No intake",
    docs: "0",
  },
  {
    token: 50,
    pin: "MXZ-2408-1050",
    name: "B. Demo",
    age: "42",
    sex: "Male",
    phone: "+62 812 2222 2222",
    meta: "M 42",
    status: "Partial",
    docs: "1 pending",
  },
  {
    token: 51,
    pin: "",
    name: "Demo Patient",
    age: "34",
    sex: "Male",
    phone: "+62 812 0000 0000",
    meta: "M 34",
    status: "Ready",
    docs: "0",
  },
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
  const phone = $("#patientPhone").value || "";
  const token = $("#clinicToken").value || "51";
  state.token = token;
  $("#intakeName").value = name;
  $("#intakeAge").value = age;
  $("#intakeSex").value = sex;
  $("#intakePhone").value = phone;
  patients[2].name = name;
  patients[2].age = age;
  patients[2].sex = sex;
  patients[2].phone = phone;
  patients[2].token = token;
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
  $("#questionText").textContent = nextQuestion.text;
  $$(".answer-grid button").forEach((button, optionIndex) => {
    const option = nextQuestion.options[optionIndex];
    button.textContent = option;
    button.dataset.answer = option;
    button.hidden = !option;
    button.classList.remove("selected");
  });
  $("#answerSummary").innerHTML = Object.entries(state.answers)
    .map(([question, answer]) => `<div><strong>${question}</strong><br>${answer}</div>`)
    .join("");
}

function answerQuestion(answer) {
  const index = Object.keys(state.answers).length;
  const question = questions[Math.min(index, questions.length - 1)];
  state.answers[question.text] = answer;

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
    ["Mobile", $("#intakePhone").value || "Not entered"],
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
  $("#briefTitle").textContent = `Token ${state.token} · ${name} · ${sex}, ${age}${state.pin ? ` · ${state.pin}` : ""}`;
  $("#briefIssue").textContent = $("#issueText")?.value || "Not entered";
  $("#briefFiles").textContent = state.files.length
    ? `${state.files.length} file(s) attached for doctor review only.`
    : "No previous reports attached.";

  const answerEntries = Object.entries(state.answers);
  $("#briefAnswers").innerHTML = answerEntries.length
    ? answerEntries.map(([q, a]) => `<li>${q}: <strong>${a}</strong></li>`).join("")
    : "<li>No basic questions answered yet.</li>";

  const missing = questions.filter((question) => !state.answers[question.text]);
  $("#missingItems").textContent = missing.length
    ? missing.map((question) => question.text).join(" · ")
    : "No demo questions missing.";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function identityKey(name, age, phone) {
  return `${normalize(name)}|${normalize(age)}|${normalize(phone).replace(/\D/g, "")}`;
}

function generatePin(name, age, phone) {
  let hash = 0;
  const source = identityKey(name, age, phone);
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  const suffix = String(hash).slice(-6).padStart(6, "0");
  return `MXZ-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}-${suffix}`;
}

function savedPatients() {
  const stored = JSON.parse(localStorage.getItem("medoxziDemoPatients") || "[]");
  return [...patients.filter((patient) => patient.pin), ...stored];
}

function saveLinkedPatient() {
  const name = $("#intakeName").value || "Demo Patient";
  const age = $("#intakeAge").value || "34";
  const sex = $("#intakeSex").value || "Male";
  const phone = $("#intakePhone").value || "";
  const key = identityKey(name, age, phone);
  const existing = state.linkedIdentity;

  if (existing && existing.identityKey !== key) {
    alert("This PIN is locked to its original name, age and mobile number. Create a new patient record instead.");
    return false;
  }

  const pin = existing?.pin || generatePin(name, age, phone);
  const patient = { pin, name, age, sex, phone, identityKey: key };
  const stored = JSON.parse(localStorage.getItem("medoxziDemoPatients") || "[]").filter(
    (item) => item.pin !== pin,
  );
  stored.push(patient);
  localStorage.setItem("medoxziDemoPatients", JSON.stringify(stored));
  state.pin = pin;
  state.linkedIdentity = patient;
  patients[2].pin = pin;
  patients[2].name = name;
  patients[2].age = age;
  patients[2].sex = sex;
  patients[2].phone = phone;
  return true;
}

function renderSearchResults(query = "") {
  const term = normalize(query);
  if (!term) {
    $("#searchResults").textContent = "Search before creating a new record.";
    return;
  }
  const results = savedPatients().filter((patient) => {
    const haystack = `${patient.name} ${patient.pin} ${patient.phone}`.toLowerCase();
    return haystack.includes(term);
  });

  if (!results.length) {
    $("#searchResults").textContent = "No matching existing patient found. Continue as new.";
    return;
  }

  $("#searchResults").innerHTML = results
    .map(
      (patient) => `
        <button type="button" class="search-result" data-pin="${patient.pin}">
          <strong>${patient.name}</strong>
          <span>${patient.pin} · ${patient.phone}</span>
        </button>
      `,
    )
    .join("");
}

function loadExistingPatient(pin) {
  const patient = savedPatients().find((item) => item.pin === pin);
  if (!patient) return;
  state.pin = patient.pin;
  state.linkedIdentity = {
    ...patient,
    identityKey: patient.identityKey || identityKey(patient.name, patient.age, patient.phone),
  };
  $("#patientName").value = patient.name;
  $("#patientAge").value = patient.age;
  $("#patientSex").value = patient.sex;
  $("#patientPhone").value = patient.phone;
  syncPatientFromRegistration();
  $("#searchResults").innerHTML = `<div class="identity-lock">Loaded ${patient.pin}. This record is locked to ${patient.name}, age ${patient.age}, mobile ${patient.phone}.</div>`;
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

  $("#existingSearch").addEventListener("input", (event) => renderSearchResults(event.target.value));
  $("#searchResults").addEventListener("click", (event) => {
    const button = event.target.closest("[data-pin]");
    if (button) loadExistingPatient(button.dataset.pin);
  });

  $("#backStep").addEventListener("click", () => showStep(state.currentStep - 1));
  $("#nextStep").addEventListener("click", () => showStep(state.currentStep + 1));
  $("#skipStep").addEventListener("click", () => showStep(state.currentStep + 1));
  $("#submitIntake").addEventListener("click", () => {
    if (!saveLinkedPatient()) return;
    patients[2].status = "Ready";
    $("#doneToken").textContent = state.token;
    $("#donePin").textContent = state.pin;
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

  ["intakeName", "intakeAge", "intakeSex", "intakePhone", "issueText"].forEach((id) => {
    $(`#${id}`).addEventListener("input", renderDoctorBrief);
  });

  $("#saveDoctor").addEventListener("click", saveDoctorConclusion);
});

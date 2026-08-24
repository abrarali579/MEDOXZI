const state = {
  token: 51,
  pin: "",
  linkedIdentity: null,
  currentStep: 0,
  complaint: "Fever",
  answers: {},
  files: [],
  doctorSaved: false,
  aiQuestions: null,
  aiBriefKey: "",
};

const questionBanks = {
  Fever: [
    { text: "When did the fever start?", options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"] },
    { text: "How has it changed?", options: ["Going down", "Going up", "Comes and goes", "Not sure"] },
    { text: "Any cough, throat pain, or runny nose?", options: ["Cough", "Throat pain", "Runny nose", "None"] },
    { text: "Have you taken any medicine for it?", options: ["Yes", "No", "I don't know names", "Not asked"] },
  ],
  Cough: [
    { text: "When did the cough start?", options: ["Today", "2-3 days", "More than 1 week", "More than 1 month"] },
    { text: "What kind of cough is it?", options: ["Dry", "With phlegm", "Comes at night", "Not sure"] },
    { text: "Any fever with it?", options: ["Yes", "No", "Not sure", "Not asked"] },
    { text: "Have you tried any medicine or syrup?", options: ["Yes", "No", "I don't know names", "Not asked"] },
  ],
  "Stomach pain": [
    { text: "When did the stomach pain start?", options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"] },
    { text: "Where is the pain mostly?", options: ["Upper", "Lower", "One side", "All over"] },
    { text: "Any vomiting or loose motions?", options: ["Vomiting", "Loose motions", "Both", "None"] },
    { text: "Is eating making it better or worse?", options: ["Better", "Worse", "No change", "Not sure"] },
  ],
  Headache: [
    { text: "When did the headache start?", options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"] },
    { text: "Where do you feel it most?", options: ["Front", "One side", "Back of head", "All over"] },
    { text: "Any nausea or light sensitivity?", options: ["Nausea", "Light bothers me", "Both", "None"] },
    { text: "Have you taken anything for it?", options: ["Yes", "No", "I don't know names", "Not asked"] },
  ],
  "Body pain": [
    { text: "When did the body pain start?", options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"] },
    { text: "Where is it most noticeable?", options: ["Whole body", "Joints", "Back", "Legs"] },
    { text: "Is there fever with it?", options: ["Yes", "No", "Not sure", "Not asked"] },
    { text: "Does rest help?", options: ["Yes", "No", "A little", "Not sure"] },
  ],
  "Something else": [
    { text: "When did this problem start?", options: ["Today", "Yesterday", "2-3 days ago", "More than 1 week"] },
    { text: "Is it getting better, worse, or staying the same?", options: ["Getting better", "Getting worse", "Same", "Not sure"] },
    { text: "Have you taken any regular medicines?", options: ["Yes", "No", "I don't know names", "Not asked"] },
    { text: "Do you know of any medicine allergy?", options: ["Yes", "No known allergy", "Not sure", "Not asked"] },
  ],
};

function activeQuestions() {
  if (state.aiQuestions && state.aiQuestions.length) {
    return state.aiQuestions;
  }
  return questionBanks[state.complaint] || questionBanks["Something else"];
}

const patients = [
  {
    token: 49,
    pin: "1049",
    name: "Ayesha Demo",
    age: "31",
    sex: "Female",
    phone: "+62 812 1111 1111",
    meta: "F 31",
    status: "No intake",
    docs: "0",
  },
  {
    token: 50,
    pin: "1050",
    name: "Budi Demo",
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

const historyPatients = [
  {
    pin: "4729",
    name: "Demo Patient 01",
    age: "28",
    sex: "Female",
    phone: "+62 812 3000 0001",
    complaint: "Cough",
    lastVisit: "2026-08-03",
    symptoms: "Dry cough for 4 days, mild throat irritation, no report attached.",
    assessment: "Sample doctor assessment: acute upper respiratory infection.",
    treatment: "Doctor advised rest, fluids and follow-up if symptoms persisted.",
    followup: "No routine follow-up scheduled.",
    reports: ["No previous reports"],
  },
  {
    pin: "6184",
    name: "Demo Patient 02",
    age: "35",
    sex: "Male",
    phone: "+62 812 3000 0002",
    complaint: "Stomach pain",
    lastVisit: "2026-08-04",
    symptoms: "Upper abdominal burning after meals, nausea, no vomiting.",
    assessment: "Sample doctor assessment: gastritis-like symptoms.",
    treatment: "Doctor recorded diet advice and prescribed clinic-selected medicine.",
    followup: "Review in 7 days if pain continued.",
    reports: ["Old prescription photo"],
  },
  {
    pin: "5903",
    name: "Demo Patient 03",
    age: "41",
    sex: "Female",
    phone: "+62 812 3000 0003",
    complaint: "Headache",
    lastVisit: "2026-08-05",
    symptoms: "One-sided headache, light sensitivity, nausea, started yesterday.",
    assessment: "Sample doctor assessment: migraine-type headache.",
    treatment: "Doctor noted trigger review and clinic-selected medicine.",
    followup: "Follow-up if episodes became frequent.",
    reports: ["No previous reports"],
  },
  {
    pin: "7361",
    name: "Demo Patient 04",
    age: "52",
    sex: "Male",
    phone: "+62 812 3000 0004",
    complaint: "Fever",
    lastVisit: "2026-08-06",
    symptoms: "Fever for 2 days with body pain and tiredness.",
    assessment: "Sample doctor assessment: viral fever.",
    treatment: "Doctor recorded observation advice and return precautions.",
    followup: "Review after 2 days if fever persisted.",
    reports: ["Temperature log photo"],
  },
  {
    pin: "2846",
    name: "Demo Patient 05",
    age: "63",
    sex: "Female",
    phone: "+62 812 3000 0005",
    complaint: "Body pain",
    lastVisit: "2026-08-07",
    symptoms: "Knee and back pain after walking, no fever.",
    assessment: "Sample doctor assessment: osteoarthritis flare.",
    treatment: "Doctor recorded activity modification and pain plan.",
    followup: "Follow-up in 2 weeks.",
    reports: ["Knee X-ray report photo"],
  },
  {
    pin: "9137",
    name: "Demo Patient 06",
    age: "19",
    sex: "Male",
    phone: "+62 812 3000 0006",
    complaint: "Skin rash",
    lastVisit: "2026-08-08",
    symptoms: "Itchy red patches on arms after new soap.",
    assessment: "Sample doctor assessment: contact dermatitis.",
    treatment: "Doctor recorded avoidance advice and clinic-selected topical medicine.",
    followup: "No routine follow-up scheduled.",
    reports: ["Rash photo"],
  },
  {
    pin: "3470",
    name: "Demo Patient 07",
    age: "46",
    sex: "Female",
    phone: "+62 812 3000 0007",
    complaint: "Cough",
    lastVisit: "2026-08-09",
    symptoms: "Cough with phlegm for 1 week, worse at night.",
    assessment: "Sample doctor assessment: bronchitis-like symptoms.",
    treatment: "Doctor recorded chest exam note and clinic-selected medicine.",
    followup: "Review in 5 days.",
    reports: ["No previous reports"],
  },
  {
    pin: "8251",
    name: "Demo Patient 08",
    age: "33",
    sex: "Male",
    phone: "+62 812 3000 0008",
    complaint: "Loose motions",
    lastVisit: "2026-08-10",
    symptoms: "Loose motions since morning, mild cramps, ate outside last night.",
    assessment: "Sample doctor assessment: acute gastroenteritis.",
    treatment: "Doctor recorded hydration advice and clinic-selected medicine.",
    followup: "Return if not improving.",
    reports: ["No previous reports"],
  },
  {
    pin: "1695",
    name: "Demo Patient 09",
    age: "57",
    sex: "Female",
    phone: "+62 812 3000 0009",
    complaint: "High sugar follow-up",
    lastVisit: "2026-08-11",
    symptoms: "Tiredness, increased thirst, brought glucometer readings.",
    assessment: "Sample doctor assessment: diabetes follow-up.",
    treatment: "Doctor reviewed readings and adjusted clinic plan.",
    followup: "Follow-up in 1 month.",
    reports: ["Glucometer reading photo"],
  },
  {
    pin: "6042",
    name: "Demo Patient 10",
    age: "44",
    sex: "Male",
    phone: "+62 812 3000 0010",
    complaint: "Blood pressure follow-up",
    lastVisit: "2026-08-12",
    symptoms: "Occasional headache, home BP readings brought to clinic.",
    assessment: "Sample doctor assessment: hypertension follow-up.",
    treatment: "Doctor recorded BP review and clinic-selected plan.",
    followup: "Follow-up in 2 weeks.",
    reports: ["BP log photo"],
  },
  {
    pin: "7580",
    name: "Demo Patient 11",
    age: "25",
    sex: "Female",
    phone: "+62 812 3000 0011",
    complaint: "Sore throat",
    lastVisit: "2026-08-13",
    symptoms: "Pain while swallowing, mild fever, no cough.",
    assessment: "Sample doctor assessment: acute pharyngitis.",
    treatment: "Doctor recorded throat exam note and clinic-selected medicine.",
    followup: "No routine follow-up scheduled.",
    reports: ["No previous reports"],
  },
  {
    pin: "4368",
    name: "Demo Patient 12",
    age: "39",
    sex: "Male",
    phone: "+62 812 3000 0012",
    complaint: "Back pain",
    lastVisit: "2026-08-14",
    symptoms: "Lower back pain after lifting boxes, no attached reports.",
    assessment: "Sample doctor assessment: mechanical low back pain.",
    treatment: "Doctor recorded posture advice and clinic-selected medicine.",
    followup: "Review if not improving in 1 week.",
    reports: ["No previous reports"],
  },
  {
    pin: "2914",
    name: "Demo Patient 13",
    age: "30",
    sex: "Female",
    phone: "+62 812 3000 0013",
    complaint: "Urine burning",
    lastVisit: "2026-08-15",
    symptoms: "Burning urination and frequency for 2 days.",
    assessment: "Sample doctor assessment: urinary tract infection symptoms.",
    treatment: "Doctor recorded urine test request and clinic-selected plan.",
    followup: "Follow-up with test result.",
    reports: ["Urine test slip"],
  },
  {
    pin: "6805",
    name: "Demo Patient 14",
    age: "48",
    sex: "Male",
    phone: "+62 812 3000 0014",
    complaint: "Dizziness",
    lastVisit: "2026-08-16",
    symptoms: "Dizziness when standing, reduced sleep, no chest complaint entered.",
    assessment: "Sample doctor assessment: vertigo-like symptoms.",
    treatment: "Doctor recorded examination note and clinic-selected medicine.",
    followup: "Review in 3 days if dizziness continued.",
    reports: ["No previous reports"],
  },
  {
    pin: "5273",
    name: "Demo Patient 15",
    age: "22",
    sex: "Female",
    phone: "+62 812 3000 0015",
    complaint: "Eye irritation",
    lastVisit: "2026-08-17",
    symptoms: "Red itchy eye, watery discharge, no vision note entered.",
    assessment: "Sample doctor assessment: conjunctivitis-like symptoms.",
    treatment: "Doctor recorded hygiene advice and clinic-selected eye plan.",
    followup: "No routine follow-up scheduled.",
    reports: ["Eye photo"],
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
            <span class="queue-meta">${patient.pin || "New record"} · ${patient.meta} · Docs ${patient.docs}</span>
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

function allPatientRecords() {
  return [...historyPatients, ...patients.filter((patient) => patient.pin)];
}

const historyFilters = {
  query: "",
  complaint: "All",
  followup: "All",
  date: "",
};

function patientHasFollowup(patient) {
  return !/^no routine follow-up/i.test(normalize(patient.followup));
}

function uniqueComplaints() {
  return Array.from(new Set(historyPatients.map((patient) => patient.complaint))).sort();
}

function applyHistoryFilters(patients) {
  const term = normalize(historyFilters.query);
  return patients.filter((patient) => {
    if (historyFilters.complaint !== "All" && patient.complaint !== historyFilters.complaint) return false;
    if (historyFilters.followup === "Needs follow-up" && !patientHasFollowup(patient)) return false;
    if (historyFilters.followup === "No follow-up" && patientHasFollowup(patient)) return false;
    if (historyFilters.date && patient.lastVisit !== historyFilters.date) return false;
    if (!term) return true;
    const haystack = [
      patient.pin,
      patient.name,
      patient.phone,
      patient.complaint,
      patient.symptoms,
      patient.assessment,
      patient.lastVisit,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

function renderHistoryFilters() {
  const complaintOptions = ["All", ...uniqueComplaints()]
    .map(
      (item) =>
        `<option value="${item}" ${item === historyFilters.complaint ? "selected" : ""}>${item}</option>`,
    )
    .join("");
  $("#historyComplaintFilter").innerHTML = complaintOptions;

  const followupOptions = ["All", "Needs follow-up", "No follow-up"]
    .map(
      (item) =>
        `<option value="${item}" ${item === historyFilters.followup ? "selected" : ""}>${item}</option>`,
    )
    .join("");
  $("#historyFollowupFilter").innerHTML = followupOptions;

  $("#historyDateFilter").value = historyFilters.date;
  $("#historyCount").textContent = "15 synthetic files";
}

function renderHistoryList() {
  const matches = applyHistoryFilters(historyPatients);
  $("#historyList").innerHTML = matches
    .map(
      (patient) => `
        <button class="history-row" type="button" data-history-pin="${patient.pin}">
          <span class="history-pin">${patient.pin}</span>
          <span>
            <strong>${patient.name}</strong>
            <small>${patient.age}/${patient.sex} · ${patient.phone}</small>
            <small>${patient.lastVisit} · ${patient.complaint}</small>
          </span>
          <span class="history-meta">
            ${patientHasFollowup(patient) ? '<span class="mini-badge followup">Follow-up</span>' : '<span class="mini-badge none">No follow-up</span>'}
            <span class="mini-badge">${patient.reports.length} file</span>
          </span>
        </button>
      `,
    )
    .join("");

  if (!matches.length) {
    $("#historyList").innerHTML = `<div class="empty-state">No sample file matched your filters.</div>`;
  }
  $("#historyCount").textContent = `${matches.length} of 15 synthetic files`;
}

function openCurrentWithPast(pin) {
  const patient = historyPatients.find((item) => item.pin === pin);
  if (!patient) return;
  openCurrentVisitSplit(patient);
}

function openCurrentVisitSplit(pastPatient) {
  const current = {
    name: $("input#intakeName")?.value || $("input#patientName")?.value || "Demo Patient",
    age: $("input#intakeAge")?.value || $("input#patientAge")?.value || "34",
    sex: $("input#intakeSex")?.value || $("input#patientSex")?.value || "Male",
    complaint: state.complaint,
    symptoms: $("textarea#issueText")?.value || "Not entered",
    files: state.files,
    followup: $("select#followupNeeded")?.value || "No",
  };

  const currentVisitHtml = `
    <article>
      <h3>Current visit — in patient's words <span class="source">Patient</span></h3>
      <p>${current.symptoms}</p>
    </article>
    <article>
      <h3>Current visit — reason <span class="source">Patient</span></h3>
      <p>${current.complaint} · ${current.age}/${current.sex}</p>
    </article>
    <article>
      <h3>Current visit — attachments <span class="source">Attachment</span></h3>
      <ul>${current.files.length ? current.files.map((f) => `<li>${f} · doctor-review only</li>`).join("") : "<li>No previous reports attached.</li>"}</ul>
    </article>
    <article>
      <h3>Current visit — follow-up mark <span class="source">Clinic</span></h3>
      <p>${current.followup === "Yes" ? "Follow-up needed this visit." : "No follow-up marked for this visit."}</p>
    </article>
  `;

  const pastVisitHtml = `
    <article>
      <h3>Past visit ${pastPatient.lastVisit} — symptoms <span class="source">Patient</span></h3>
      <p>${pastPatient.symptoms}</p>
    </article>
    <article>
      <h3>Past visit — doctor assessment <span class="source">Sample doctor</span></h3>
      <p>${pastPatient.assessment}</p>
    </article>
    <article>
      <h3>Past visit — plan <span class="source">Sample doctor</span></h3>
      <p>${pastPatient.treatment}</p>
    </article>
    <article>
      <h3>Past visit — follow-up <span class="source">Clinic</span></h3>
      <p>${pastPatient.followup}</p>
    </article>
  `;

  $("#historyFileTitle").textContent = `${current.name} · current + past`;
  $("#historyFile").innerHTML = `
    <div class="split-review">
      <div class="split-col split-current">
        <div class="split-head"><strong>Current visit</strong><span class="status-pill safe">In patient's words</span></div>
        ${currentVisitHtml}
      </div>
      <div class="split-col split-past">
        <div class="split-head"><strong>Past visit</strong><span class="status-pill safe">${pastPatient.lastVisit} · PIN ${pastPatient.pin}</span></div>
        ${pastVisitHtml}
      </div>
    </div>
  `;
}

function openCloseSplitReview() {
  $("#historyFileTitle").textContent = "Select a past file";
  $("#historyFile").innerHTML = `<p class="quiet">Open a past file to see how previous symptoms, reports and doctor assessment can appear for review.</p>`;
}

function openHistoryFile(pin) {
  const patient = historyPatients.find((item) => item.pin === pin);
  if (!patient) return;

  $("#historyFileTitle").textContent = `${patient.name} · PIN ${patient.pin}`;
  $("#historyFile").innerHTML = `
    <div class="file-summary">
      <div><strong>Patient</strong><span>${patient.age} / ${patient.sex}</span></div>
      <div><strong>Mobile</strong><span>${patient.phone}</span></div>
      <div><strong>Last visit</strong><span>${patient.lastVisit}</span></div>
      <div><strong>Reason</strong><span>${patient.complaint}</span></div>
    </div>
    <article>
      <h3>Symptoms recorded <span class="source">Patient</span></h3>
      <p>${patient.symptoms}</p>
    </article>
    <article>
      <h3>Doctor assessment <span class="source">Sample doctor</span></h3>
      <p>${patient.assessment}</p>
    </article>
    <article>
      <h3>Doctor plan <span class="source">Sample doctor</span></h3>
      <p>${patient.treatment}</p>
    </article>
    <article>
      <h3>Follow-up <span class="source">Clinic</span></h3>
      <p>${patient.followup}</p>
    </article>
    <article>
      <h3>Reports / files <span class="source">Attachment</span></h3>
      <ul>${patient.reports.map((report) => `<li>${report}</li>`).join("")}</ul>
    </article>
  `;
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

function clearIntakeDraft({ keepIdentity = true } = {}) {
  state.currentStep = 0;
  state.complaint = "Fever";
  state.answers = {};
  state.files = [];
  state.doctorSaved = false;
  if (!keepIdentity) {
    state.pin = "";
    state.linkedIdentity = null;
  }
  $("#issueText").value = "I have fever and body pain since yesterday. I feel tired and want the doctor to check.";
  $("#reportInput").value = "";
  renderFiles();
  $$(".complaint-grid button").forEach((button) => button.classList.remove("selected"));
}

function renderStepIndicator() {
  const el = $("#stepIndicator");
  if (!el) return;
  const total = 7;
  const cur = state.currentStep;
  el.innerHTML = Array.from({ length: total }, (_, i) => {
    const cls = i < cur ? "step-dot done" : i === cur ? "step-dot current" : "step-dot";
    return `<span class="${cls}"></span>`;
  }).join("");
}

function showStep(step) {
  state.currentStep = Math.max(0, Math.min(step, 7));
  $$(".intake-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === state.currentStep);
  });
  renderStepIndicator();

  const total = 7;
  $("#stepLabel").textContent =
    state.currentStep < 7 ? `Step ${state.currentStep + 1} of ${total}` : "Done";
  $("#progressBar").style.width = `${Math.min(100, ((state.currentStep + 1) / total) * 100)}%`;
  $("#backStep").disabled = state.currentStep === 0;
  $("#nextStep").style.display = state.currentStep >= 6 ? "none" : "";
  $("#skipStep").style.display = state.currentStep >= 6 ? "none" : "";

  if (state.currentStep === 4) {
    renderQuestion();
    ensureAISuggestions();
  }
  if (state.currentStep === 6) {
    renderReview();
  }
}

function renderQuestion() {
  const questions = activeQuestions();
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

async function ensureAISuggestions() {
  const brief = ($("#issueText")?.value || "").trim();
  const complaint = state.complaint;
  const key = `${complaint}|${brief}`;
  if (state.aiQuestions && state.aiBriefKey === key) {
    return; // already have suggestions for this brief
  }
  if (!brief) {
    // No brief yet: show the static-only pill state (nothing to suggest from).
    const note = $("#aiSourceNote");
    if (note) {
      note.hidden = false;
      note.innerHTML = `<span class="pill">Static question set</span> (write your concern above and DeepSeek can tailor questions)`;
    }
    return;
  }
  try {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: brief.slice(0, 1200), complaint }),
    });
    const data = await res.json();
    // Only apply if the brief hasn't changed since we dispatched.
    if (key !== `${state.complaint}|${($("#issueText")?.value || "").trim()}`) return;
    const note = $("#aiSourceNote");
    if (data && data.ok && Array.isArray(data.suggested) && data.suggested.length) {
      state.aiQuestions = data.suggested;
      state.aiBriefKey = key;
      // Reset answers so the (possibly different) AI questions start fresh.
      state.answers = {};
      if (note) {
        note.hidden = false;
        note.innerHTML = `<span class="pill deepseek">DeepSeek · suggested from your brief</span>`;
      }
      if (state.currentStep === 4) renderQuestion();
      renderDoctorBrief();
    } else {
      // Fallback to the static set; note why.
      state.aiQuestions = null;
      state.aiBriefKey = "";
      const msg = (data && data.error) || "unavailable";
      if (note) {
        note.hidden = false;
        note.innerHTML = msg === "NO_API_KEY"
          ? `<span class="pill">Static question set</span> (DeepSeek key not configured locally)`
          : `<span class="pill">Static question set</span> (DeepSeek offline)`;
      }
    }
  } catch (err) {
    // Local server not running -> static set, no error surfaced to patient.
    state.aiQuestions = null;
    state.aiBriefKey = "";
    const note = $("#aiSourceNote");
    if (note) {
      note.hidden = false;
      note.innerHTML = `<span class="pill">Static question set</span> (run the local server for DeepSeek questions)`;
    }
  }
}

function answerQuestion(answer) {
  const questions = activeQuestions();
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
    $("#fileList").textContent = "No reports attached. This is normal for a first visit.";
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

  const questions = activeQuestions();
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
  const usedPins = new Set(savedPatients().map((patient) => patient.pin));
  let pin = "";
  do {
    pin = String(Math.floor(1000 + Math.random() * 9000));
  } while (usedPins.has(pin));
  return pin;
}

function savedPatients() {
  const stored = JSON.parse(localStorage.getItem("medoxziDemoPatients") || "[]");
  const combined = [...allPatientRecords(), ...stored];
  const byPin = new Map();
  combined.forEach((patient) => byPin.set(patient.pin, patient));
  return Array.from(byPin.values());
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
  const patient = { pin, name, age, sex, phone, identityKey: key, complaint: state.complaint };
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
    $("#searchResults").textContent = "Search first. If no record appears, continue as a new patient.";
    return;
  }
  const results = savedPatients().filter((patient) => {
    const haystack = `${patient.name} ${patient.pin} ${patient.phone}`.toLowerCase();
    return haystack.includes(term);
  });

  if (!results.length) {
    $("#searchResults").textContent = "No matching patient found. Continue as a new record.";
    return;
  }

  $("#searchResults").innerHTML = results
    .map(
      (patient) => `
        <button type="button" class="search-result" data-pin="${patient.pin}">
          <strong>${patient.name}</strong>
          <span>${patient.pin} · ${patient.phone} · ${patient.sex}, ${patient.age}</span>
        </button>
      `,
    )
    .join("");
}

function loadExistingPatient(pin) {
  const patient = savedPatients().find((item) => item.pin === pin);
  if (!patient) return;
  clearIntakeDraft({ keepIdentity: true });
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
  $("#donePin").textContent = patient.pin;
  $("#doneToken").textContent = state.token;
  renderReview();
  showStep(0);
  $("#searchResults").innerHTML = `<div class="identity-lock"><strong>${patient.name}</strong><span>${patient.pin} loaded. Mobile ${patient.phone}. Update today's issue, then submit this visit.</span></div>`;
}

function saveDoctorConclusion() {
  state.doctorSaved = true;
  const followupNeeded = $("#followupNeeded").value;
  const followupDate = $("#followupDate").value;
  const consent = $("#clinicCommsConsent").checked;

  if (followupNeeded === "Yes" && followupDate) {
    $("#reminderPreview").textContent =
      `Clinic reminder preview\n\nDear ${$("#intakeName").value || "Patient"}, this is a reminder for your follow-up visit on ${followupDate}.\n\nSending stays off until consent, opt-out, audit and template controls are implemented.\n\nConsent selected in this prototype: ${consent ? "yes" : "no"}`;
  } else {
    $("#reminderPreview").textContent =
      "Doctor note saved. No reminder preview because follow-up is not marked as needed or no date was selected.";
  }
  switchView("ops");
}

document.addEventListener("DOMContentLoaded", () => {
  renderQueues();
  renderHistoryFilters();
  renderHistoryList();
  openHistoryFile(historyPatients[0].pin);
  showStep(0);
  renderDoctorBrief();

  $$(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
  $$("[data-jump]").forEach((button) =>
    button.addEventListener("click", () => switchView(button.dataset.jump)),
  );

  $(".history-clear").addEventListener("click", () => {
    historyFilters.query = "";
    historyFilters.complaint = "All";
    historyFilters.followup = "All";
    historyFilters.date = "";
    $(".history-search input").value = "";
    $("input#historyDateFilter").value = "";
    renderHistoryFilters();
    renderHistoryList();
  });

  $("select#historyComplaintFilter").addEventListener("change", (event) => {
    historyFilters.complaint = event.target.value;
    renderHistoryList();
  });
  $("select#historyFollowupFilter").addEventListener("change", (event) => {
    historyFilters.followup = event.target.value;
    renderHistoryList();
  });
  $("input#historyDateFilter").addEventListener("change", (event) => {
    historyFilters.date = event.target.value;
    renderHistoryList();
  });
  $("input#historyDateFilter").addEventListener("input", (event) => {
    historyFilters.date = event.target.value;
    renderHistoryList();
  });

  $("#registrationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.linkedIdentity) {
      clearIntakeDraft({ keepIdentity: false });
    }
    syncPatientFromRegistration();
    switchView("patient");
  });

  $("#existingSearch").addEventListener("input", (event) => renderSearchResults(event.target.value));
  $("#searchResults").addEventListener("click", (event) => {
    const button = event.target.closest("[data-pin]");
    if (button) loadExistingPatient(button.dataset.pin);
  });
  $(".history-search input").addEventListener("input", (event) => {
    historyFilters.query = event.target.value;
    renderHistoryList();
  });
  $(".history-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-pin]");
    if (!button) return;
    openCurrentWithPast(button.dataset.historyPin);
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
      state.answers = {};
      state.aiQuestions = null;
      state.aiBriefKey = "";
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

  $$(".detail-chips button").forEach((button) => {
    button.addEventListener("click", () => {
      const current = $("#issueText").value.trim();
      const addition = button.dataset.detail;
      $("#issueText").value = current ? `${current}\n${addition}` : addition;
      $("#issueText").focus();
      renderDoctorBrief();
    });
  });

  ["intakeName", "intakeAge", "intakeSex", "intakePhone", "issueText"].forEach((id) => {
    $(`#${id}`).addEventListener("input", () => {
      if (id === "issueText") {
        state.aiQuestions = null;
        state.aiBriefKey = "";
      }
      renderDoctorBrief();
    });
  });

  $("#saveDoctor").addEventListener("click", saveDoctorConclusion);
});

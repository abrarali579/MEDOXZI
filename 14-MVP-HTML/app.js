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
  // Adaptive AI interview state.
  aiActive: false,
  aiNext: null,
  aiDone: false,
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
  // When the adaptive AI flow is active, the "list" is just the current question.
  if (state.aiActive && state.aiNext) {
    return [state.aiNext];
  }
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
    name: "Abrar Ali",
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

const viewTitles = {
  staff: ["Medoxzi", "Front desk"],
  patient: ["Medoxzi", "Patient intake"],
  doctor: ["Medoxzi", "Pre-visit review"],
  records: ["Medoxzi", "Patient records"],
  viewer: ["Medoxzi", "Record viewer"],
  ops: ["Medoxzi", "Clinic operations"],
};

function switchView(viewName, options = {}) {
  if (viewName === "patient" && !options.preserveDraft) {
    const hasPatientDraft = ($("#intakeName")?.value || "").trim() || ($("#intakePhone")?.value || "").trim();
    if (!hasPatientDraft && $("#patientName") && $("#patientPhone")) {
      syncPatientFromRegistration();
    }
  }
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  $$(".dropdown-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  document.body.classList.toggle("doctor-shell", viewName === "doctor");
  const sectionsBlock = $("#navSections");
  if (sectionsBlock) sectionsBlock.hidden = viewName !== "doctor";
  if (typeof window.closeNavMenu === "function") window.closeNavMenu();
}

function currentQueuePatient() {
  return patients.find((patient) => String(patient.token) === String(state.token)) || patients[2];
}

function previsitPatients() {
  const current = currentQueuePatient();
  const incoming = patients.filter((patient) => patient !== current).slice(0, 2);
  return [current, ...incoming];
}

function queueItemHtml(patient, { current = false, compact = false } = {}) {
  const label = current ? "Current patient" : compact ? "Incoming" : patient.status;
  const statusClass = current ? "mini-badge current" : "mini-badge";
  const itemClass = current ? "queue-item current-patient" : "queue-item incoming-patient";
  return `
    <button class="${itemClass}" type="button" data-token="${patient.token}" ${current ? 'aria-current="true"' : ""}>
      <span class="token">${patient.token}</span>
      <span>
        <span class="queue-name">${patient.name}</span>
        <span class="queue-meta">${patient.pin || "New profile"} · ${patient.meta} · Docs ${patient.docs}</span>
      </span>
      <span class="${statusClass}">${label}</span>
    </button>
  `;
}

function doctorQueueItemHtml(patient, { current = false } = {}) {
  if (current) {
    const age = $("#intakeAge")?.value || $("#patientAge")?.value || patient.age || "34";
    const sex = $("#intakeSex")?.value || $("#patientSex")?.value || patient.sex || "Male";
    const phone = getIntakePhone() || patient.phone || "+62 812 0000 0000";
    const fileLabel = state.files.length ? state.files[0] : "Blood_Test_May14.pdf";
    return `
      <section class="doctor-queue-card current" data-token="${patient.token}" aria-current="true">
        <span class="doctor-token">${patient.token}</span>
        <span class="patient-avatar queue-avatar" aria-hidden="true">AA</span>
        <span class="doctor-queue-copy">
          <strong>${patient.name}</strong>
          <span>Patient ID ${patient.pin || state.pin || patient.token}</span>
          <span class="queue-chip-row">
            <span class="demo-chip demo-age">${age} yrs</span>
            <span class="demo-chip demo-sex">${sex}</span>
            <span class="demo-chip demo-contact">${phone}</span>
          </span>
        </span>
        <span class="queue-stat">
          <small>Intake</small>
          <span class="queue-progress"><span></span></span>
          <strong>93%</strong>
        </span>
        <span class="queue-stat eta">
          <small>ETA</small>
          <strong>2 min</strong>
        </span>
        <span class="selected-file">
          <span class="file-mark">PDF</span>
          <span id="briefFiles">${fileLabel}</span>
        </span>
        <span class="selected-actions">
          <button class="secondary compact" type="button">View</button>
          <button class="secondary compact" type="button">Download</button>
          <button class="secondary compact" type="button">Patient profile</button>
          <button class="secondary compact" data-jump="viewer" type="button">Previous record</button>
          <button class="secondary compact icon-only" type="button" aria-label="More patient actions">⋮</button>
        </span>
      </section>
    `;
  }
  return `
    <button class="doctor-queue-card ${current ? "current" : "incoming"}" type="button" data-token="${patient.token}" ${current ? 'aria-current="true"' : ""}>
      <span class="doctor-token">${patient.token}</span>
      <span class="doctor-queue-copy">
        <strong>${patient.name}</strong>
        <span>${patient.token === 49 ? "ETA 10:40" : "ETA 11:05"}</span>
      </span>
    </button>
  `;
}

function renderQueues() {
  $("#staffQueue").innerHTML = patients.map((patient) => queueItemHtml(patient)).join("");
  $("#doctorQueue").innerHTML = previsitPatients()
    .map((patient, index) => doctorQueueItemHtml(patient, { current: index === 0 }))
    .join("");
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
  $("#historyCount").textContent = "15 synthetic records";
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
    $("#historyList").innerHTML = `<div class="empty-state">No synthetic file matched these filters.</div>`;
  }
  $("#historyCount").textContent = `${matches.length} of 15 synthetic records`;
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
      <h3>Current visit - patient-reported concern <span class="source">Patient</span></h3>
      <p>${current.symptoms}</p>
    </article>
    <article>
      <h3>Current visit - reason <span class="source">Patient</span></h3>
      <p>${current.complaint} · ${current.age}/${current.sex}</p>
    </article>
    <article>
      <h3>Current visit - reports & attachments <span class="source">Attachment</span></h3>
      <ul>${current.files.length ? current.files.map((f) => `<li>${f} - doctor-review only</li>`).join("") : "<li>No previous reports attached.</li>"}</ul>
    </article>
    <article>
      <h3>Current visit - follow-up status <span class="source">Clinic</span></h3>
      <p>${current.followup === "Yes" ? "Follow-up marked for this visit." : "No follow-up currently marked for this visit."}</p>
    </article>
  `;

  const pastVisitHtml = `
    <article>
      <h3>Past visit ${pastPatient.lastVisit} - symptoms <span class="source">Patient</span></h3>
      <p>${pastPatient.symptoms}</p>
    </article>
    <article>
      <h3>Past visit - doctor assessment <span class="source">Sample doctor</span></h3>
      <p>${pastPatient.assessment}</p>
    </article>
    <article>
      <h3>Past visit - plan <span class="source">Sample doctor</span></h3>
      <p>${pastPatient.treatment}</p>
    </article>
    <article>
      <h3>Past visit - follow-up <span class="source">Clinic</span></h3>
      <p>${pastPatient.followup}</p>
    </article>
  `;

  $("#historyFileTitle").textContent = `${current.name} · current + past`;
  $("#historyFile").innerHTML = `
    <div class="split-review">
      <div class="split-col split-current">
        <div class="split-head"><strong>Current visit</strong><span class="status-pill safe">Patient-reported</span></div>
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
  $("#historyFile").innerHTML = `<p class="quiet">Open a past file to compare previous concerns, reports, and sample doctor assessments.</p>`;
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
    <button class="primary full" type="button" data-compare-pin="${patient.pin}">Compare with current visit</button>
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
  setIntakePhone(phone);
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
  $("#issueText").value = "I have fever and body pain since yesterday. I feel tired and would like the doctor to review it.";
  const reportEl = $("#reportInput");
  if (reportEl) reportEl.value = "";
  const fileEl = $("#fileList");
  if (fileEl) renderFiles();
  $$(".complaint-grid button").forEach((button) => button.classList.remove("selected"));
}

function updateSingleProgress() {
  const bar = $("#progressBar");
  const pctEl = $("#stepPct");
  if (!bar) return;
  let pct = 0;
  const total = 6;
  if (state.currentStep === 3) {
    // During the adaptive interview, the single bar reflects how far the Q&A has
    // progressed (reaches 100% around 8 answers, matching the 5-12 range).
    const answered = Object.keys(state.answers).length;
    pct = Math.min(100, Math.round((answered / 8) * 100));
  } else {
    pct = Math.min(100, Math.round(((state.currentStep + 1) / total) * 100));
  }
  bar.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
}

function showStep(step) {
  state.currentStep = Math.max(0, Math.min(step, 5));
  try { localStorage.setItem("medoxzi_step", String(state.currentStep)); } catch (e) {}
  $$(".intake-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === state.currentStep);
  });

  const total = 6;
  const stepLabel = $("#stepLabel");
  if (stepLabel) stepLabel.textContent =
    state.currentStep < 5 ? `Step ${state.currentStep + 1} of ${total}` : "Done";
  updateSingleProgress();
  $("#backStep").disabled = state.currentStep === 0;
  $("#backStep").style.display = state.currentStep === 5 ? "none" : "";
  $("#nextStep").style.display = "none";
  $("#skipStep").style.display = "none";

  if (state.currentStep === 3) {
    // Reset any previous adaptive flow, then begin: ask the LLM for the FIRST
    // question based on the brief. Every call shows/hides the question pair
    // together and the single progress bar reflects the interview.
    state.aiActive = true;
    state.aiNext = null;
    state.aiDone = false;
    updateSingleProgress();
    fetchNextAiQuestion().then(() => {
      if (state.currentStep === 3) {
        if (state.aiActive && state.aiNext) renderAiQuestion();
        else if (!state.aiActive) renderStaticQuestion();
        else showStep(4); // AI started but stopped immediately (done) -> review
      }
    });
  }
  if (state.currentStep === 4) {
    renderReview();
  }
}

let _processingActive = false;

function updateInterviewProgress() {
  updateSingleProgress();
}

function showQuestionLoading(processingText) {
  _processingActive = true;
  // Keep the question + options in place (do NOT collapse them): we only
  // fade them out with an animation so the layout below never jumps.
  const block = $("#questionBlock");
  if (block) block.classList.add("is-loading");
  const tip = $("#processingText");
  if (tip && processingText) tip.textContent = processingText;
}

function hideQuestionLoading() {
  _processingActive = false;
  const block = $("#questionBlock");
  if (block) block.classList.remove("is-loading");
}

function renderAnswerSummary() {
  $("#answerSummary").innerHTML = Object.entries(state.answers)
    .map(([question, answer]) => `<div><strong>${question}</strong><br>${answer}</div>`)
    .join("");
}

function renderStaticQuestion() {
  const questions = questionBanks[state.complaint] || questionBanks["Something else"];
  const index = Object.keys(state.answers).length;
  const nextQuestion = questions[Math.min(index, questions.length - 1)];
  updateInterviewProgress();
  $("#questionTitle").textContent = `Intake question ${Math.min(index + 1, questions.length)} of ${questions.length}`;
  $("#questionText").textContent = nextQuestion.text;
  $("#questionText").hidden = false;
  $("#answerGrid").hidden = false;
  $$(".answer-grid button").forEach((button, optionIndex) => {
    const option = nextQuestion.options[optionIndex];
    button.textContent = option;
    button.dataset.answer = option;
    button.hidden = !option;
    button.classList.remove("selected");
  });
  renderAnswerSummary();
}

function renderAiQuestion() {
  const answeredCount = Object.keys(state.answers).length;
  const q = state.aiNext;
  if (!q) {
    // Nothing more to ask; move on.
    showStep(4);
    return;
  }
  updateInterviewProgress();
  $("#questionTitle").textContent = `Intake question ${answeredCount + 1} (adaptive)`;
  $("#questionText").textContent = q.text;
  $("#questionText").hidden = false;
  $("#answerGrid").hidden = false;
  $$(".answer-grid button").forEach((button, optionIndex) => {
    const option = q.options[optionIndex];
    button.textContent = option;
    button.dataset.answer = option;
    button.hidden = !option;
    button.classList.remove("selected");
  });
  renderAnswerSummary();
}

function renderQuestion() {
  if (state.aiActive) {
    renderAiQuestion();
    return;
  }
  renderStaticQuestion();
}

function buildAnswersArray() {
  return Object.entries(state.answers).map(([q, a]) => ({ q, a }));
}

/**
 * Fetch the NEXT single adaptive question from the backend, given the brief
 * and all the patient's answers so far. Shows the spinner only while the LLM
 * is actually generating, then hides it once a question (or a done signal)
 * returns. Enforces min 5 / max 12 questions client-side.
 */
async function fetchNextAiQuestion() {
  if (!state.aiActive) return;
  const brief = ($("#issueText")?.value || "").trim();
  const complaint = state.complaint;
  const age = ($("#intakeAge")?.value || "").trim();
  const sex = ($("#intakeSex")?.value || "").trim();
  const answers = buildAnswersArray();
  const answeredCount = answers.length;

  // Spinner only during the real LLM round-trip.
  showQuestionLoading("Examining your answers...");

  try {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: brief.slice(0, 1200), complaint, age, sex, answers }),
    });
    const data = await res.json();

    if (data && data.ok && data.question && Array.isArray(data.question.options)) {
      state.aiNext = { text: data.question.text, options: data.question.options.slice(0, 4) };
      state.aiDone = false;
    } else {
      // No question back (done signal, or fallback). If we're still below the
      // minimum of 5, top up from the static bank so the flow never drops short.
      if (answers.length < 5 && staticFillQuestion()) {
        return; // staticFillQuestion set state.aiNext; keep the flow going
      }
      state.aiNext = null;
      state.aiDone = true;
    }
  } catch (err) {
    // Network / backend unavailable — fall back to the static bank from here.
    state.aiActive = false;
    state.aiNext = null;
    state.aiDone = true;
    if (buildAnswersArray().length < 5) staticFillQuestion();
  } finally {
    hideQuestionLoading();
  }
}

/**
 * If the LLM stops early (done) or errors before we've asked min 5 questions,
 * fill the remainder from the static bank for the current complaint so we never
 * drop below the minimum. Skips questions already asked.
 */
function staticFillQuestion() {
  const asked = new Set(Object.keys(state.answers));
  const bank = questionBanks[state.complaint] || questionBanks["Something else"];
  const next = bank.find((q) => !asked.has(q.text));
  if (next) {
    state.aiNext = next;
    state.aiDone = false;
    return true;
  }
  return false;
}

async function answerQuestion(answer) {
  const answeredCount = Object.keys(state.answers).length;

  if (state.aiActive) {
    if (!state.aiNext) {
      showStep(4);
      return;
    }
    state.answers[state.aiNext.text] = answer;
    renderAnswerSummary();
    updateInterviewProgress();

    // Enforce min 5 / max 12: keep asking until we've hit the floor of 5 (or the
    // LLM genuinely has nothing more to ask) AND the LLM is done, capped at 12.
    const nextCount = Object.keys(state.answers).length;
    const tooMany = nextCount >= 12;
    const llmDone = Boolean(state.aiDone) && nextCount >= 5;
    if (tooMany || llmDone) {
      state.aiNext = null;
      showStep(4);
    } else {
      await fetchNextAiQuestion();
      if (state.currentStep === 3) renderAiQuestion();
    }
  } else {
    // Static bank path (offline / fallback).
    const questions = questionBanks[state.complaint] || questionBanks["Something else"];
    const index = answeredCount;
    const question = questions[Math.min(index, questions.length - 1)];
    state.answers[question.text] = answer;
    if (Object.keys(state.answers).length >= questions.length) {
      showStep(4);
    } else {
      renderQuestion();
    }
  }
  renderDoctorBrief();
  try { localStorage.setItem("medoxzi_answers", JSON.stringify(state.answers)); } catch (e) {}
}

function renderFiles() {
  if (!state.files.length) {
    $("#fileList").textContent = "No reports attached. This is normal for a first visit.";
    return;
  }
  $("#fileList").innerHTML = state.files.map((file) => `<div>${file} - doctor-review only</div>`).join("");
}

function setupBriefStep() {
  const title = $("#briefTitleId");
  const subtitle = $("#briefSubtitle");
  const issue = $("#issueText");
  const tips = $("#briefTips");
  const tipHint = $("#briefTip");
  const isOther = state.complaint === "Something else";
  if (title) {
    title.textContent = isOther
      ? "Tell the doctor briefly"
      : `Add details about your ${state.complaint.toLowerCase()}`;
  }
  if (subtitle) {
    subtitle.textContent = isOther
      ? "Describe what is happening in your own words."
      : "Share what started, where you feel it, and anything you have already tried.";
  }
  if (issue) {
    issue.value = "";
    issue.placeholder = isOther
      ? "Example: I have fever and body pain since yesterday."
      : `Example: my ${state.complaint.toLowerCase()} started today and has not improved.`;
  }
  if (tips) tips.hidden = !isOther;
  if (tipHint) {
    tipHint.textContent = isOther
      ? "Helpful details to add: Started · Where · Tried · Before"
      : "Helpful details: when it started, where you feel it, what you tried, and whether it happened before.";
  }
  if (issue) issue.focus();
}

function renderReview() {
  const rows = [
    ["Name", $("#intakeName").value],
    ["Age / sex", `${$("#intakeAge").value} / ${$("#intakeSex").value}`],
    ["Mobile", getIntakePhone() || "Not entered"],
    ["Reason", state.complaint],
    ["Patient-reported concern", $("#issueText").value || "Not entered"],
    ["Reports", state.files.length ? `${state.files.length} attached` : "No previous reports"],
  ];

  $(".review-list").innerHTML = rows
    .map(([label, value]) => `<div class="review-item"><strong>${label}</strong><span>${value}</span></div>`)
    .join("");

  // Right pane: the patient's accumulating answers (scrolls within).
  const qa = $("#reviewAnswers");
  if (qa) {
    qa.innerHTML = Object.entries(state.answers)
      .map(([q, a]) => `<div><strong>${q}</strong><br>${a}</div>`)
      .join("");
  }
}

function renderDoctorBrief() {
  const name = $("#intakeName")?.value || $("#patientName")?.value || "Demo Patient";
  const age = $("#intakeAge")?.value || $("#patientAge")?.value || "34";
  const sex = $("#intakeSex")?.value || $("#patientSex")?.value || "Male";
  const questions = activeQuestions();
  $("#briefTitle").textContent = `${name} · Patient ID ${state.pin || state.token}`;
  $("#briefIssue").textContent = $("#issueText")?.value || "Not entered";
  $("#briefFiles").textContent = state.files.length ? state.files[0] : "No file attached";
  const attachmentCount = $("#attachmentCount");
  if (attachmentCount) {
    attachmentCount.textContent = state.files.length ? `${state.files.length} file uploaded` : "No files";
  }

  const demographicsEl = $("#briefDemographics");
  if (demographicsEl) {
    demographicsEl.innerHTML = [
      `<span class="demo-chip demo-age">${age} yrs</span>`,
      `<span class="demo-chip demo-sex">${sex}</span>`,
      `<span class="demo-chip demo-contact">${getIntakePhone() || "No phone"}</span>`,
    ].join("");
  }

  const answerEntries = Object.entries(state.answers);
  const answerCount = $("#answerCount");
  if (answerCount) {
    const total = state.aiActive ? Math.max(5, Math.min(12, answerEntries.length)) : questions.length;
    answerCount.textContent = `${answerEntries.length} of ${total} answered`;
  }
  $("#briefAnswers").innerHTML = answerEntries.length
    ? answerEntries.map(
        ([q, a]) =>
          `<li class="answer-item"><span class="answer-q">${q}</span><strong class="answer-a">${a}</strong></li>`
      ).join("")
    : `<li class="answer-item empty">No intake questions answered yet.</li>`;

  const missingItems = $("#missingItems");
  if (missingItems) {
    const missing = questions.filter((question) => !state.answers[question.text]);
    missingItems.textContent = missing.length
      ? missing.map((question) => question.text).join(" · ")
      : "All visible intake questions are complete.";
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

// Phone helpers — Indonesian default +62, accept number without leading zero.
function phoneCode() {
  const el = $("#phoneCode");
  return (el && el.value) || "+62";
}

function getIntakePhone() {
  let num = ($("#intakePhone")?.value || "").trim();
  // Strip a single leading zero (e.g. 0812... -> 812...).
  if (num.startsWith("0")) num = num.slice(1);
  const digits = num.replace(/\D/g, "");
  if (!digits) return "";
  return `${phoneCode()} ${digits}`;
}

function setIntakePhone(fullPhone) {
  const s = String(fullPhone || "").trim();
  if (!s) return;
  let code = "+62";
  let number = s;
  const m = s.match(/^(\+\d{1,3})\s*(.*)$/);
  if (m) {
    code = m[1];
    number = m[2].trim();
  }
  const codeEl = $("#phoneCode");
  if (codeEl) {
    if (codeEl.querySelector(`option[value="${code}"]`)) {
      codeEl.value = code;
    } else {
      codeEl.value = "+62";
    }
  }
  const numEl = $("#intakePhone");
  if (numEl) numEl.value = number;
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
  const phone = getIntakePhone();
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
    $("#searchResults").textContent = "Search before registering. If no record appears, continue with a new patient profile.";
    return;
  }
  const results = savedPatients().filter((patient) => {
    const haystack = `${patient.name} ${patient.pin} ${patient.phone}`.toLowerCase();
    return haystack.includes(term);
  });

  if (!results.length) {
    $("#searchResults").textContent = "No matching patient found. Continue with a new patient profile.";
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
  $("#searchResults").innerHTML = `<div class="identity-lock"><strong>${patient.name}</strong><span>${patient.pin} loaded. Mobile ${patient.phone}. Update today's concern, then submit this visit.</span></div>`;
}

function renderWelcomeSearch(query = "") {
  const term = normalize(query);
  const resultsEl = $("#welcomeResults");
  const emptyState = $("#welcomeEmpty");
  if (!resultsEl) return;

  if (!term) {
    resultsEl.innerHTML = "";
    if (emptyState) emptyState.hidden = true;
    return;
  }

  const results = savedPatients().filter((patient) => {
    const haystack = `${patient.name} ${patient.pin} ${patient.phone}`.toLowerCase();
    return haystack.includes(term);
  });

  if (!results.length) {
    resultsEl.innerHTML = "";
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.innerHTML = `
        <p>No record matched “${escapeHtml(query.trim())}”.</p>
        <button type="button" id="welcomeRegisterNew" class="btn primary">Register new patient</button>`;
      const registerBtn = $("#welcomeRegisterNew");
      if (registerBtn) registerBtn.addEventListener("click", registerNewPatient);
    }
    return;
  }

  if (emptyState) emptyState.hidden = true;
  resultsEl.innerHTML = results
    .map(
      (patient) => `
        <div class="welcome-result" data-pin="${patient.pin}">
          <div class="welcome-result-info">
            <strong>${escapeHtml(patient.name)}</strong>
            <span>${patient.pin} · ${patient.phone} · ${patient.sex}, ${patient.age}</span>
          </div>
          <button type="button" class="btn primary" data-confirm-pin="${patient.pin}">Confirm</button>
        </div>
      `,
    )
    .join("");
}

function confirmWelcomePatient(pin) {
  const patient = savedPatients().find((item) => item.pin === pin);
  if (!patient) return;
  loadExistingPatient(pin); // pre-fills basic info on step 0
  switchView("patient");
}

function registerNewPatient() {
  clearIntakeDraft({ keepIdentity: false });
  const hint = $("#detailsHint");
  if (hint) hint.textContent = "New patient - please fill in the basic details.";
  $("#intakeName").value = "";
  $("#intakeAge").value = "";
  $("#intakeSex").value = "";
  const codeEl = $("#phoneCode");
  if (codeEl) codeEl.value = "+62";
  $("#intakePhone").value = "";
  $("#issueText").value = "";
  showStep(0);
  switchView("patient", { preserveDraft: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function saveDoctorConclusion() {
  state.doctorSaved = true;
  const followupField = $("#followupNeeded");
  const followupNeeded = followupField?.type === "checkbox" ? (followupField.checked ? "Yes" : "No") : followupField.value;
  const followupDate = $("#followupDate").value;
  const consent = $("#clinicCommsConsent").checked;

  if (followupNeeded === "Yes" && followupDate) {
    $("#reminderPreview").textContent =
      `Clinic reminder preview\n\nDear ${$("#intakeName").value || "Patient"}, this is a reminder for your follow-up visit on ${followupDate}.\n\nSending remains disabled until consent, opt-out, audit, and template controls are implemented.\n\nConsent selected in this prototype: ${consent ? "yes" : "no"}`;
  } else {
    $("#reminderPreview").textContent =
      "Assessment saved. No reminder preview is shown because follow-up is not marked as needed or no date was selected.";
  }
  switchView("ops");
}

document.addEventListener("DOMContentLoaded", () => {
  renderQueues();
  renderHistoryFilters();
  renderHistoryList();
  openHistoryFile(historyPatients[0].pin);
  // Restore the workflow step across refresh (kept in localStorage by showStep).
  let savedStep = 0;
  try { savedStep = Math.max(0, Math.min(Number(localStorage.getItem("medoxzi_step")) || 0, 5)); } catch (e) {}
  showStep(savedStep);
  // Restore named values that survive a refresh.
  try {
    const savedAnswers = JSON.parse(localStorage.getItem("medoxzi_answers") || "{}");
    if (savedAnswers && typeof savedAnswers === "object" && !Array.isArray(savedAnswers)) state.answers = savedAnswers;
    if (state.answers && Object.keys(state.answers).length) {
      state.aiActive = true;
      state.aiDone = true; // resume from saved answers; don't re-ask
      state.aiNext = null;
    }
  } catch (e) {}
  renderDoctorBrief();

  $$(".dropdown-item").forEach((item) => item.addEventListener("click", () => switchView(item.dataset.view)));
  $$("[data-jump]").forEach((button) =>
    button.addEventListener("click", () => switchView(button.dataset.jump)),
  );

  // 3-dots left slide-in navigation drawer
  const navMenuBtn = $("#navMenuBtn");
  const navDrawer = $("#navDrawer");
  const drawerBackdrop = $("#drawerBackdrop");
  const drawerCloseBtn = $("#drawerCloseBtn");

  function openNavMenu() {
    navDrawer.hidden = false;
    drawerBackdrop.hidden = false;
    requestAnimationFrame(() => {
      navDrawer.classList.add("open");
      drawerBackdrop.classList.add("open");
    });
    navMenuBtn.setAttribute("aria-expanded", "true");
  }
  window.closeNavMenu = function () {
    if (!navDrawer.classList.contains("open")) return;
    navDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
    navMenuBtn.setAttribute("aria-expanded", "false");
    setTimeout(() => {
      navDrawer.hidden = true;
      drawerBackdrop.hidden = true;
    }, 240);
  };
  function toggleNavMenu() {
    if (navDrawer.classList.contains("open")) closeNavMenu();
    else openNavMenu();
  }
  navMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNavMenu();
  });
  drawerCloseBtn.addEventListener("click", closeNavMenu);
  drawerBackdrop.addEventListener("click", closeNavMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNavMenu();
  });
  navDrawer.addEventListener("click", (e) => e.stopPropagation());

  // Pre-visit extra-section toggles (Intake responses / Doctor entry)
  const toggleIntake = $("#toggleIntakeAnswers");
  const toggleDoctor = $("#toggleDoctorEntry");
  function applySectionToggles() {
    const intakeCard = document.querySelector("#view-doctor .intake-card");
    const doctorEntryCard = document.querySelector("#view-doctor .doctor-entry-card");
    if (intakeCard) intakeCard.style.display = toggleIntake.checked ? "" : "none";
    if (doctorEntryCard) doctorEntryCard.style.display = toggleDoctor.checked ? "" : "none";
  }
  if (toggleIntake) toggleIntake.addEventListener("change", applySectionToggles);
  if (toggleDoctor) toggleDoctor.addEventListener("change", applySectionToggles);
  window.applySectionToggles = applySectionToggles;

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

  const welcomeSearch = $("#welcomeSearch");
  if (welcomeSearch) {
    welcomeSearch.addEventListener("input", (event) => renderWelcomeSearch(event.target.value));
  }
  const welcomeResults = $("#welcomeResults");
  if (welcomeResults) {
    welcomeResults.addEventListener("click", (event) => {
      const button = event.target.closest("[data-confirm-pin]");
      if (button) confirmWelcomePatient(button.dataset.confirmPin);
    });
  }
  $(".history-search input").addEventListener("input", (event) => {
    historyFilters.query = event.target.value;
    renderHistoryList();
  });
  $(".history-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-pin]");
    if (!button) return;
    openHistoryFile(button.dataset.historyPin);
    switchView("viewer");
  });

  $("#historyFile").addEventListener("click", (event) => {
    const button = event.target.closest("[data-compare-pin]");
    if (!button) return;
    openCurrentWithPast(button.dataset.comparePin);
  });

  $("#backStep").addEventListener("click", () => showStep(state.currentStep - 1));
  $("#nextStep").addEventListener("click", () => showStep(state.currentStep + 1));
  $("#skipStep").addEventListener("click", () => showStep(state.currentStep + 1));

  const continueToIntake = $("#continueToIntake");
  if (continueToIntake) {
    continueToIntake.addEventListener("click", () => {
      const name = $("#intakeName").value.trim();
      const phoneNumber = ($("#intakePhone").value || "").trim();
      if (!name) {
        alert("Please enter your name to continue.");
        return;
      }
      if (!phoneNumber) {
        alert("Please enter your mobile number to continue.");
        return;
      }
      const fullPhone = getIntakePhone();
      $("#intakePhone").value = fullPhone.split(" ").slice(1).join(" ");
      showStep(1);
    });
  }

  const submitBrief = $("#submitBrief");
  if (submitBrief) {
    submitBrief.addEventListener("click", () => {
      const brief = $("#issueText").value.trim();
      if (!brief) {
        alert("Please describe your concern briefly so the doctor can prepare focused questions.");
        return;
      }
      renderDoctorBrief();
      showStep(3);
    });
  }

  $("#submitIntake").addEventListener("click", () => {
    if (!saveLinkedPatient()) return;
    patients[2].status = "Ready";
    $("#doneToken").textContent = state.token;
    $("#donePin").textContent = state.pin;
    renderQueues();
    renderDoctorBrief();
    showStep(5);
  });

  $$(".complaint-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      state.complaint = button.dataset.complaint;
      state.answers = {};
      state.aiQuestions = null;
      state.aiBriefKey = "";
      state.aiActive = false;
      state.aiNext = null;
      state.aiDone = false;
      try { localStorage.removeItem("medoxzi_answers"); } catch (e) {}
      $$(".complaint-grid button").forEach((el) => el.classList.remove("selected"));
      button.classList.add("selected");
      setupBriefStep();
      showStep(2);
    });
  });

  // Doctor-entry selectable options: Relevant tests (multi-select) and Plan
  // category (single-select). Toggle the .selected class.
  const testsRow = $(".tests-group .choice-row");
  if (testsRow) {
    testsRow.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      b.classList.toggle("selected");
    });
  }
  const planRow = $(".plan-group .choice-row");
  if (planRow) {
    planRow.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$(".plan-group .choice-row button").forEach((o) => o.classList.remove("selected"));
      b.classList.add("selected");
    });
  }

  $$(".answer-grid button").forEach((button) => {
    button.addEventListener("click", () => answerQuestion(button.dataset.answer));
  });

  const reportListener = $("#reportInput");
  if (reportListener) {
    reportListener.addEventListener("change", (event) => {
      state.files = Array.from(event.target.files).map((file) => file.name);
      renderFiles();
      renderDoctorBrief();
    });
  }

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

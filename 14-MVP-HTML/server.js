/**
 * MEDOXZI live-test server (local only).
 *
 * Serves the 14-MVP-HTML prototype and exposes one API endpoint:
 *   POST /api/questions
 *     body: { brief: string, complaint: string, answers: [{q,a}] }
 *     ->   { ok: true, source: "deepseek", question: {text, options[4]}, done: boolean }
 *       or { ok: false, error, fallback: true }
 *
 * DeepSeek is the processing LLM for turning a patient's free-text brief into
 * suggested follow-up triage questions. The API key is read ONLY from the
 * local .env file (DEEPSEEK_API_KEY), which is gitignored and is never
 * shipped, logged, or exposed to the browser.
 *
 * Run:  node --env-file=.env server.js     (serve on http://localhost:8765)
 * Optional: PORT=... to override the port.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, normalize, resolve, sep } from "node:path";

// Absolute folder containing server.js (Node >=20.11 supports import.meta.dirname).
const ROOT = import.meta.dirname;
const PORT = Number(process.env.PORT) || 8765;
const API_KEY = process.env.DEEPSEEK_API_KEY || "";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

/** Ask DeepSeek to give the NEXT adaptive intake question given the brief + answers so far. */
async function suggestNextQuestion(brief, complaint, patient, answers) {
  if (!API_KEY) {
    return { ok: false, source: "deepseek", error: "NO_API_KEY" };
  }
  const age = String(patient?.age || "").trim();
  const sex = String(patient?.sex || "").trim();
  let demographics;
  if (age && sex) {
    demographics = `The patient is a ${age}-year-old ${sex.toLowerCase()}. `;
  } else if (age) {
    demographics = `The patient is ${age} years old. `;
  } else if (sex) {
    demographics = `The patient is ${sex.toLowerCase()}. `;
  } else {
    demographics = "Patient age and sex are not provided. ";
  }
  demographics += "Use the patient's age and sex to tailor the question where relevant, but never make it awkward.";

  const sys = [
    "You act as the adaptive intake-triage question suggester inside MEDOXZI, a pre-consultation ",
    "intake tool for a general clinic. You NEVER diagnose and you NEVER give treatment advice, ",
    "and you never ask for anything the patient cannot know (never ask them for a diagnosis). ",
    "You are conducting a step-by-step, adaptive interview. One question at a time. ",
    demographics + " ",
    "You are given: the patient's reason for visiting (complaint), their short brief, and the list ",
    "of questions the patient has ALREADY answered (as question -> answer pairs). ",
    "Your job is to ask the SINGLE most useful NEXT question, branching from what they have already ",
    "said and answered, to progressively sharpen the brief for the doctor. ",
    "Rules (these are ABSOLUTE): ",
    "1) NEVER re-ask or repeat ANYTHING the patient already told you or already answered. ",
    "   In particular, if the patient already mentioned WHEN it started, a duration, or timing ",
    "   (e.g. '3 days ago', 'since yesterday', 'for a week'), you must NEVER ask a 'when did it ",
    "   start' / 'how long' / 'since when' question again. That information is already known. ",
    "2) Ask exactly ONE question per response. ",
    "3) The question must have exactly 4 plain-text answer options; include one escape option when ",
    "   sensible ('Not sure', \"I don't know\", 'None', 'Not asked', etc.). ",
    "4) Keep all text in clear, simple English. ",
    "5) When you have gathered enough to give the doctor a useful picture, or when the patient's ",
    "   answers stop adding new information, return done: true and no question. ",
    "6) Always try to ask at least a few meaningful questions (the client enforces a minimum of 5 ",
    "   and a maximum of 12). ",
    "Respond as strict JSON only — no markdown, no prose, in this shape: ",
    '{ "question": {"text":"...","options":["a","b","c","d"]}, "done": false, "reason": "short rationale" }. ',
    "When done, return { question: null, done: true }.",
  ].join("");

  // Build a readable transcript of the interview so far.
  const transcript = (Array.isArray(answers) ? answers : [])
    .map((a, i) => `Q${i + 1}: ${a.q}\nA${i + 1}: ${a.a}`)
    .join("\n\n");

  const user = [
    `Selected reason: ${complaint}.`,
    `Patient's brief: "${brief}".`,
    transcript ? `Interview so far:\n${transcript}` : "No questions answered yet (this is the first question).",
    `Ask the single most relevant next question now.`,
  ].join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, source: "deepseek", error: `HTTP_${res.status}:${body.slice(0, 200)}` };
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    // DeepSeek sometimes wraps JSON in ```json fences.
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) parsed = JSON.parse(m[1]);
  }

  const q = parsed?.question || parsed?.next_question || null;
  const done = Boolean(parsed?.done);

  if (done || !q) {
    return { ok: true, source: "deepseek", question: null, done: true };
  }

  const opts = Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [];
  const text = String(q.text || "").trim();
  if (!text || opts.length !== 4) {
    // Invalid question shape — treat as done so the client stops cleanly.
    return { ok: true, source: "deepseek", question: null, done: true };
  }

  return {
    ok: true,
    source: "deepseek",
    question: { text, options: opts },
    done: false,
    reason: String(parsed?.reason || "").trim(),
  };
}

/**
 * Ask DeepSeek (as "Bilal") to audit a completed interview against the
 * doctor's information needs. Local mirror of api/bilal.js.
 */
async function auditInterview(record) {
  if (!API_KEY) return { ok: false, source: "deepseek", error: "NO_API_KEY" };
  const complaint = String(record?.complaint || "Something else").trim();
  const brief = String(record?.brief || "").trim();
  const pin = String(record?.pin || "").trim();
  const name = String(record?.name || "the patient").trim();
  const age = String(record?.age || "").trim();
  const sex = String(record?.sex || "").trim();
  const conclusion = String(record?.conclusion || "").trim();
  const transcript = (Array.isArray(record?.answers) ? record.answers : [])
    .map((a, i) => `Q${i + 1}: ${String(a?.q || "")}\nA${i + 1}: ${String(a?.a || "")}`)
    .join("\n\n");
  const demos = [age, sex].filter(Boolean).join(", ");
  const patientLine = demos ? `${name} (${demos}, PIN ${pin || "n/a"})` : `${name} (PIN ${pin || "n/a"})`;

  const sys = [
    "You are BILAL, MEDOXZI's interview-quality auditor. MEDOXZI is a pre-consultation ",
    "intake tool: a patient answers an adaptive AI interview and a structured brief is passed ",
    "to the doctor BEFORE the consultation. ",
    "Your ONLY job is to judge whether that interview captured the information a doctor would ",
    "need to prepare for this complaint — nothing clinical, no diagnosis, no treatment advice. ",
    "You assess coverage, sharpness, and gaps so the intake can improve over time. ",
    "Respond as strict JSON only — no markdown, no prose — in this exact shape: ",
    '{ "purposeFit": 0.0, "good": ["..."], "missing": ["..."], ',
    '"recommendation": "...", "suggestedQuestions": ["..."] }. ',
    "purposeFit is a 0..1 score of how completely the interview covered what the doctor needs. ",
    "good/missing are 1-3 crisp bullet strings each. recommendation is ONE concrete, ",
    "actionable sentence the clinic could follow to get better info next time. ",
    "suggestedQuestions lists up to 3 questions that WOULD have added real doctor-relevant ",
    "information, phrased as the interviewer would ask. Be specific and practical, not generic. ",
    "If the interview is strong, say so honestly in good and give a high purposeFit; only flag ",
    "missing when the gap is genuinely doctor-relevant.",
  ].join("");

  const user = [
    `Complaint: ${complaint}.`,
    brief ? `Patient's brief: "${brief}".` : "No free-text brief was provided.",
    transcript ? `Completed interview:\n${transcript}` : "No structured answers were captured.",
    conclusion ? `Doctor's noted conclusion: "${conclusion}".` : "No doctor conclusion yet.",
    `Audit this interview for patient ${patientLine}. Return the JSON audit now.`,
  ].join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, source: "deepseek", error: `HTTP_${res.status}:${body.slice(0, 200)}` };
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) {
      try {
        parsed = JSON.parse(m[1]);
      } catch {
        parsed = null;
      }
    }
  }

  const audit = {
    purposeFit: Math.max(0, Math.min(1, parseFloat(parsed?.purposeFit) || 0)),
    good: strList(parsed?.good),
    missing: strList(parsed?.missing),
    recommendation: String(parsed?.recommendation || ""),
    suggestedQuestions: strList(parsed?.suggestedQuestions),
  };

  if (!audit.good.length && !audit.missing.length && !audit.recommendation) {
    return { ok: true, source: "deepseek", audit: null, note: "unparseable" };
  }
  return { ok: true, source: "deepseek", audit };
}

function strList(v) {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  if (typeof v === "string" && v.trim()) return [v.trim()].slice(0, 3);
  return [];
}

/**
 * Ask DeepSeek to diff two visit intakes into a doctor-useful, patient-reported
 * change summary. Local mirror of api/compare.js. Never diagnoses; only
 * reflects what the patient told this intake vs the previous one.
 */
async function compareVisits(previous, current, meta) {
  if (!API_KEY) return { ok: false, source: "deepseek", error: "NO_API_KEY" };
  const name = String(meta?.name || "the patient").trim();
  const pin = String(meta?.pin || "").trim();
  const age = String(meta?.age || "").trim();
  const sex = String(meta?.sex || "").trim();

  const formatVisit = (record, label) => {
    const complaint = String(record?.complaint || "Not stated").trim();
    const savedAt = String(record?.savedAt || "").trim();
    const answers = Array.isArray(record?.answers) ? record.answers : [];
    const lines = answers
      .filter((a) => a && typeof a === "object")
      .map((a, i) => `Q${i + 1}: ${String(a.q || "").trim()} → ${String(a.a || "").trim()}`)
      .join("\n");
    return [
      `${label}${savedAt ? ` (${savedAt.slice(0, 10)})` : ""}`,
      `Reason/concern: ${complaint}`,
      lines ? lines : "No structured answers captured.",
    ].join("\n");
  };

  const demos = `${name}${[age, sex].filter(Boolean).join(", ") ? ` (${[age, sex].filter(Boolean).join(", ")})` : ""}${pin ? ` (PIN ${pin})` : ""}`;

  const sys = [
    "You are MEDOXZI's visit-comparison assistant. MEDOXZI is a pre-consultation intake tool: ",
    "a returning patient answers a fresh adaptive interview, and the doctor wants a quick ",
    "read on how TODAY's intake compares with the PREVIOUS visit's — strictly as the patient ",
    "reported it. ",
    "Your job is ONLY to summarize patient-reported differences to help the doctor prepare. ",
    "You are NOT a doctor and you do NOT diagnose, treat, or infer clinical improvement/worsening. ",
    "Frame only what the patient said changed. Use the 'direction' field to label the overall arc ",
    "of the patient's own report: 'improved' if the patient's report suggests the issue has mostly ",
    "resolved or reduced, 'managed' if it appears stable/ongoing, 'exploratory' if the current ",
    "visit is probing something new, or 'mixed' otherwise. ",
    "Respond as strict JSON only — no markdown, no prose — in this exact shape: ",
    '{ "direction": "...", "summary": "...", "changed": [{ "field": "...", ',
    '"label": "...", "previous": "...", "current": "..." }], "improved": ["..."], ',
    '"watch": ["..."], "unansweredNow": ["..."] }. ',
    "changed lists verified patient-reported differences (field = the question topic). improved ",
    "lists 1-3 points where the patient's report suggests things are better or stable/consistent. ",
    "watch lists 1-3 points that are new, worse, or noteworthy. unansweredNow lists question topics ",
    "from the previous visit that were not re-answered this visit. Be concise, concrete, and ",
    "strictly pragmatic. If everything is consistent, say so honestly in summary and keep arrays short.",
  ].join("");

  const user = [
    `Patient: ${demos}.`,
    formatVisit(previous, "PREVIOUS visit intake"),
    "---",
    formatVisit(current, "CURRENT visit intake"),
    "Compare the two visits above and return the JSON comparison now.",
  ].join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, source: "deepseek", error: `HTTP_${res.status}:${body.slice(0, 200)}` };
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) {
      try {
        parsed = JSON.parse(m[1]);
      } catch {
        parsed = null;
      }
    }
  }

  const direction = String(parsed?.direction || "mixed");
  const allowed = ["improved", "managed", "exploratory", "mixed"];
  const compare = {
    direction: allowed.includes(direction) ? direction : "mixed",
    summary: String(parsed?.summary || ""),
    changed: listOfObjects(parsed?.changed),
    improved: strList4(parsed?.improved),
    watch: strList4(parsed?.watch),
    unansweredNow: strList4(parsed?.unansweredNow),
  };

  if (!compare.summary && !compare.changed.length) {
    return { ok: true, source: "deepseek", compare: null, note: "unparseable" };
  }
  return { ok: true, source: "deepseek", compare };
}

/** List helper capped at 4 (compare arrays can be a touch longer than bilal's 3). */
function strList4(v) {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 4);
  if (typeof v === "string" && v.trim()) return [v.trim()].slice(0, 4);
  return [];
}

/** Normalize an array of {field,label,previous,current} objects (max 6). */
function listOfObjects(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const item of v) {
    if (out.length >= 6) break;
    if (!item || typeof item !== "object") continue;
    const field = String(item.field || "").trim() || String(item.label || "").trim();
    if (!field) continue;
    out.push({
      field,
      label: String(item.label || field).trim(),
      previous: String(item.previous || "").trim(),
      current: String(item.current || "").trim(),
    });
  }
  return out;
}

const server = createServer(async (req, res) => {
  // Only allow local connections.
  const host = req.socket.remoteAddress || "";
  if (!(host === "127.0.0.1" || host === "::1" || host === "::ffff:127.0.0.1")) {
    return json(res, 403, { ok: false, error: "LOCAL_ONLY" });
  }

  // CORS for the same-origin demo page.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return json(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/questions" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      return json(res, 400, { ok: false, error: "BAD_JSON" });
    }
    const brief = String(payload.brief || "").trim();
    const complaint = String(payload.complaint || "Something else").trim();
    if (!brief) return json(res, 400, { ok: false, error: "NO_BRIEF" });
    const patient = {
      age: String(payload.age || "").trim(),
      sex: String(payload.sex || "").trim(),
    };
    const answers = Array.isArray(payload.answers)
      ? payload.answers.slice(0, 12).map((a) => ({ q: String(a?.q || "").trim(), a: String(a?.a || "").trim() }))
      : [];

    try {
      const result = await suggestNextQuestion(brief.slice(0, 1200), complaint, patient, answers);
      // Cleanup: never echo the API key or raw HTTP bodies containing it.
      delete result.raw;
      return json(res, result.ok ? 200 : 200, result); // 200 even for fallback so client can decide
    } catch (err) {
      return json(res, 200, { ok: false, source: "deepseek", error: "EXCEPTION", message: String(err?.message || "unknown") });
    }
  }

  if (url.pathname === "/api/bilal" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      return json(res, 400, { ok: false, error: "BAD_JSON" });
    }
    const record = payload.record && typeof payload.record === "object" ? payload.record : null;
    if (!record) return json(res, 400, { ok: false, error: "NO_RECORD" });
    try {
      const result = await auditInterview({
        pin: String(record.pin || "").trim(),
        name: String(record.name || "").trim(),
        age: String(record.age || "").trim(),
        sex: String(record.sex || "").trim(),
        complaint: String(record.complaint || "").trim(),
        brief: String(record.brief || "").trim(),
        conclusion: String(record.conclusion || "").trim(),
        answers: Array.isArray(record.answers)
          ? record.answers.slice(0, 12).map((a) => ({
              q: String(a?.q || "").trim(),
              a: String(a?.a || "").trim(),
            }))
          : [],
      });
      delete result.raw;
      return json(res, 200, result);
    } catch (err) {
      return json(res, 200, { ok: false, source: "deepseek", error: "EXCEPTION", message: String(err?.message || "unknown") });
    }
  }

  if (url.pathname === "/api/compare" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      return json(res, 400, { ok: false, error: "BAD_JSON" });
    }
    const previous = payload.previous && typeof payload.previous === "object" ? payload.previous : null;
    const current = payload.current && typeof payload.current === "object" ? payload.current : null;
    if (!previous || !current) return json(res, 400, { ok: false, error: "NEED_PREVIOUS_AND_CURRENT" });
    try {
      const norm = (record) => ({
        complaint: String(record?.complaint || "").trim(),
        savedAt: String(record?.savedAt || "").trim(),
        answers: Array.isArray(record?.answers)
          ? record.answers.slice(0, 12).map((a) => ({
              q: String(a?.q || "").trim(),
              a: String(a?.a || "").trim(),
            }))
          : [],
      });
      const result = await compareVisits(
        norm(previous),
        norm(current),
        {
          name: String(payload.name || "").trim(),
          pin: String(payload.pin || "").trim(),
          age: String(payload.age || "").trim(),
          sex: String(payload.sex || "").trim(),
        }
      );
      delete result.raw;
      return json(res, 200, result);
    } catch (err) {
      return json(res, 200, { ok: false, source: "deepseek", error: "EXCEPTION", message: String(err?.message || "unknown") });
    }
  }

  // Static file serving.
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  // Strip a single leading separator so path.join/resolve behave on Windows.
  const clean = pathname.replace(/^[\\/]+/, "");
  const filePath = resolve(ROOT, clean);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
    // Traversal above root is refused.
    return json(res, 403, { ok: false, error: "FORBIDDEN" });
  }
  if (!existsSync(filePath)) return json(res, 404, { ok: false, error: "NOT_FOUND" });

  res.writeHead(200, { "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream" });
  res.end(readFileSync(filePath));
});

server.listen(PORT, "127.0.0.1", () => {
  const keyStatus = API_KEY ? "configured" : "MISSING (add DEEPSEEK_API_KEY to .env)";
  console.log(`MEDOXZI live server -> http://localhost:${PORT}`);
  console.log(`DeepSeek API key: ${keyStatus}`);
});

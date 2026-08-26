/**
 * MEDOXZI — Vercel serverless function for the AI question-suggestion endpoint.
 *
 * Adaptive rewrite of the `suggestQuestions()` logic from the local server.js into
 * a Vercel Node function. It now asks for the NEXT single question per call.
 *   POST /api/questions
 *     body: { brief: string, complaint: string, age: string, sex: string, answers: [{q,a}] }
 *     ->   { ok: true, source: "deepseek", question: {text, options[4]}, done: boolean }
 *       or { ok: false, error, source: "deepseek" }   (client falls back to static banks)
 *
 * The DeepSeek API key is read ONLY from the Vercel environment variable
 * DEEPSEEK_API_KEY, set in the Vercel dashboard (Settings -> Environment
 * Variables). It is never shipped, logged, or exposed to the browser.
 *
 * Deployment root: Vercel project Root Directory = 14-MVP-HTML
 * (statically serve index.html/app.js/styles.css; api/ auto-runs this function).
 */

export default async function handler(req, res) {
  // Static files under 14-MVP-HTML/ are NOT served by this function — Vercel
  // serves them from the output directory. This handler answers /api/questions only.

  // Only allow modern Vercel "Other"/static + api pattern. Preflight:
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  let payload = {};
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ ok: false, error: "BAD_JSON" });
  }

  const brief = String(payload.brief || "").trim();
  const complaint = String(payload.complaint || "Something else").trim();
  if (!brief) return res.status(400).json({ ok: false, error: "NO_BRIEF" });

  const patient = {
    age: String(payload.age || "").trim(),
    sex: String(payload.sex || "").trim(),
  };

  // Optional: the patient's answers so far, as [{q, a}, ...]. Used for the adaptive interview.
  const answers = Array.isArray(payload.answers)
    ? payload.answers.slice(0, 12).map((a) => ({
        q: String(a?.q || "").trim(),
        a: String(a?.a || "").trim(),
      }))
    : [];

  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
  if (!API_KEY) {
    // Safe fallback: tell the client to use static banks. No exception thrown.
    return res.status(200).json({ ok: false, source: "deepseek", error: "NO_API_KEY" });
  }

  try {
    const result = await suggestNextQuestion(brief.slice(0, 1200), complaint, patient, answers);
    // Never echo diagnostics containing a key or raw HTTP body.
    delete result.raw;
    // 200 even for fallback so the client decides (matches local server.js).
    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json({
      ok: false,
      source: "deepseek",
      error: "EXCEPTION",
      message: String(err?.message || "unknown"),
    });
  }
}

/** Ask DeepSeek to give the NEXT adaptive intake question given the brief + answers so far. */
async function suggestNextQuestion(brief, complaint, patient, answers) {
  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
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
    "Rules: ",
    "1) NEVER re-ask or repeat anything the patient already told you or already answered. ",
    "2) Ask exactly ONE question per response. ",
    "3) The question must have exactly 4 plain-text answer options; include one escape option when ",
    "sensible ('Not sure', \"I don't know\", 'None', 'Not asked', etc.). ",
    "4) Keep all text in clear, simple English. ",
    "5) When you have gathered enough to give the doctor a useful picture, or when the patient's ",
    "answers stop adding new information, return done: true and no question. ",
    "6) Always try to ask at least a few meaningful questions (the client enforces a minimum of 5 ",
    "and a maximum of 12). ",
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

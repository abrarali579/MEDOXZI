/**
 * MEDOXZI — Vercel serverless function for the AI question-suggestion endpoint.
 *
 * Port of the verified `suggestQuestions()` logic from the local server.js into
 * a Vercel Node function. Behaviour is identical:
 *   POST /api/questions
 *     body: { brief: string, complaint: string, age: string, sex: string }
 *     ->   { ok: true, source: "deepseek", suggested: [{text, options[4]}], alreadyKnown: [...] }
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

  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
  if (!API_KEY) {
    // Safe fallback: tell the client to use static banks. No exception thrown.
    return res.status(200).json({ ok: false, source: "deepseek", error: "NO_API_KEY" });
  }

  try {
    const result = await suggestQuestions(brief.slice(0, 1200), complaint, patient);
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

/** Ask DeepSeek to turn a patient brief into suggested triage questions. */
async function suggestQuestions(brief, complaint, patient) {
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
  demographics += "Use the patient's age and sex to tailor the questions where relevant, but never make it awkward.";
  const sys = [
    "You act as the intake-triage question suggester inside MEDOXZI, a pre-consultation ",
    "intake tool for a general clinic. You NEVER diagnose and you NEVER give treatment advice. ",
    "Your only job: from a patient's short description of why they are visiting, propose at most ",
    "4 short follow-up questions the patient can answer on the intake tablet so the doctor gets a ",
    "clearer brief. Each question must have exactly 4 plain-text answer options, and every option ",
    "must include one escape option when sensible: 'Not sure', \"I don't know\", 'None', etc. ",
    demographics + " ",
    "Respond as strict JSON only — no markdown, no prose, in this shape: ",
    '{ "questions": [{"text":"...","options":["a","b","c","d"]}], "alreadyKnown": ["..."] }. ',
    "alreadyKnown is an optional array of facts the patient already told you that you deliberately ",
    "did NOT ask again. ",
    "The 4 questions should branch from what the patient already said, and must never ask for ",
    "things the patient can't know (never ask for a diagnosis). Keep all text in clear, simple English. ",
    "IMPORTANT — DO NOT re-ask anything the patient already told you. For example, if the patient gave ",
    "a start time or duration (e.g. 'since yesterday', 'for 3 days', 'it started last week'), do NOT include ",
    "a new 'when did it start' / duration / onset question. List those already-known facts in alreadyKnown ",
    "instead. A patient should never be asked the same thing twice.",
  ].join("");

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
        {
          role: "user",
          content: `Selected reason: ${complaint}. Patient says: "${brief}".`,
        },
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

  const raw = parsed?.questions;
  if (!Array.isArray(raw)) return { ok: false, source: "deepseek", error: "BAD_RESPONSE" };

  // Clamp to 4 questions, each 4 options, keep only string fields.
  const suggested = raw
    .slice(0, 4)
    .map((q) => {
      const opts = Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [];
      return { text: String(q.text || "").trim(), options: opts };
    })
    .filter((q) => q.text && q.options.length === 4);

  const alreadyKnown = Array.isArray(parsed?.alreadyKnown)
    ? parsed.alreadyKnown.map(String).slice(0, 8).filter(Boolean)
    : [];

  return suggested.length
    ? { ok: true, source: "deepseek", suggested, alreadyKnown }
    : { ok: false, source: "deepseek", error: "EMPTY_SUGGESTIONS" };
}

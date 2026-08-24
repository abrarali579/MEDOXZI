/**
 * MEDOXZI live-test server (local only).
 *
 * Serves the 14-MVP-HTML prototype and exposes one API endpoint:
 *   POST /api/questions
 *     body: { brief: string, complaint: string }
 *     ->   { ok: true, suggested: [{text, options[4]}], source: "deepseek" }
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

/** Ask DeepSeek to turn a patient brief into suggested triage questions. */
async function suggestQuestions(brief, complaint, patient) {
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
    "{ \"questions\": [{\"text\":\"...\",\"options\":[\"a\",\"b\",\"c\",\"d\"]}], \"alreadyKnown\": [\"...\"] }. ",
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

    try {
      const result = await suggestQuestions(brief.slice(0, 1200), complaint, patient);
      // Cleanup: never echo the API key or raw HTTP bodies containing it.
      delete result.raw;
      return json(res, result.ok ? 200 : 200, result); // 200 even for fallback so client can decide
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

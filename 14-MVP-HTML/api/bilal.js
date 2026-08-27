/**
 * MEDOXZI — Vercel serverless function for the BILAL interview audit.
 *
 * Bilal is a lightweight sub-agent (currently a purpose-scoped DeepSeek prompt)
 * whose job is to review every completed patient interview and answer one
 * question for the clinic: "Did this interview actually give the doctor the
 * most useful information for this patient's complaint?"
 *
 *   POST /api/bilal
 *     body: {
 *       record: {
 *         pin, name, age, sex, complaint, brief,
 *         answers: [{q, a}, ...],
 *         conclusion?: string,
 *         savedAt
 *       }
 *     }
 *     ->   {
 *           ok: true, source: "deepseek",
 *           audit: {
 *             purposeFit: 0..1,            // how much of the doctor's info need was covered
 *             good: [string],               // what the interview did well
 *             missing: [string],            // what was missed / could have been sharper
 *             recommendation: string,       // a concrete suggestion for the next interview
 *             suggestedQuestions: [string]  // up to 3 questions that would have helped
 *           }
 *         }
 *       or { ok: false, source: "deepseek", error, message }
 *
 * The DeepSeek API key is read ONLY from the Vercel environment variable
 * DEEPSEEK_API_KEY. It is never shipped, logged, or exposed to the browser.
 *
 * Deployment root: Vercel project Root Directory = 14-MVP-HTML
 * (api/ auto-runs this function; static files are served by Vercel output).
 */

export default async function handler(req, res) {
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

  const record = payload.record && typeof payload.record === "object" ? payload.record : null;
  if (!record) return res.status(400).json({ ok: false, error: "NO_RECORD" });

  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
  if (!API_KEY) {
    // Safe fallback: no key configured. Client shows "audit unavailable".
    return res.status(200).json({ ok: false, source: "deepseek", error: "NO_API_KEY" });
  }

  try {
    const result = await auditInterview(record);
    delete result.raw;
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

/** Ask DeepSeek (as "Bilal") to audit a completed interview against the doctor's info needs. */
async function auditInterview(record) {
  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
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
    "{ \"purposeFit\": 0.0, \"good\": [\"...\"], \"missing\": [\"...\"], ",
    "\"recommendation\": \"...\", \"suggestedQuestions\": [\"...\"] }. ",
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
    purposeFit: clamp01(parseFloat(parsed?.purposeFit)),
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

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Normalize any string-or-array field to a clean string array (max 3). */
function strList(v) {
  if (Array.isArray(v)) {
    return v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  }
  if (typeof v === "string" && v.trim()) return [v.trim()].slice(0, 3);
  return [];
}

/**
 * MEDOXZI — Vercel serverless function for patient visit comparison.
 *
 * The doctor opens a returning patient's record and wants a quick, objective
 * summary of how THIS visit's intake answers compare with the previous visit —
 * what the patient reports as new, better, worse, or unchanged — so the doctor
 * can focus the consultation.
 *
 *   POST /api/compare
 *     body: {
 *       previous: { complaint, answers: [{q, a}, ...], savedAt? },
 *       current:  { complaint, answers: [{q, a}, ...], savedAt? },
 *       name?, pin?, age?, sex?
 *     }
 *     -> {
 *          ok: true, source: "deepseek",
 *          compare: {
 *            direction: "improved" | "managed" | "exploratory" | "mixed",
 *            summary: string,
 *            changed: [{ field, label, previous, current }],   // verified differences
 *            improved: [string],                               // what looks better/stable
 *            watch: [string],                                  // what changed or is new/worse
 *            unansweredNow: [string]                           // fields from previous visit
 *          }
 *        }
 *       or { ok: false, ... }
 *
 * Hard boundary: this is a PATIENT-REPORTED change summary for the doctor's
 * preparation. It never diagnoses, never treats, and makes no claim about the
 * patient actually improving or worsening — it only reflects what the patient
 * told the intake this visit vs last visit.
 *
 * The DeepSeek API key is read ONLY from the Vercel environment variable
 * DEEPSEEK_API_KEY. Never shipped, logged, or exposed to the browser.
 *
 * Deployment root: Vercel project Root Directory = 14-MVP-HTML
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

  const previous = payload.previous && typeof payload.previous === "object" ? payload.previous : null;
  const current = payload.current && typeof payload.current === "object" ? payload.current : null;
  if (!previous || !current) {
    return res.status(400).json({ ok: false, error: "NEED_PREVIOUS_AND_CURRENT" });
  }

  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
  if (!API_KEY) {
    return res.status(200).json({ ok: false, source: "deepseek", error: "NO_API_KEY" });
  }

  try {
    const result = await compareVisits(previous, current, payload);
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

/** Ask DeepSeek to diff two visit intakes into a doctor-useful change summary. */
async function compareVisits(previous, current, meta) {
  const API_KEY = process.env.DEEPSEEK_API_KEY || "";
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

  const demos = `${[name, [age, sex].filter(Boolean).join(", ")].filter(Boolean).join(", ")}`.trim();

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
    "{ \"direction\": \"...\", \"summary\": \"...\", \"changed\": [{ \"field\": \"...\", ",
    "\"label\": \"...\", \"previous\": \"...\", \"current\": \"...\" }], \"improved\": [\"...\"], ",
    "\"watch\": [\"...\"], \"unansweredNow\": [\"...\"] }. ",
    "changed lists verified patient-reported differences (field = the question topic). improved ",
    "lists 1-3 points where the patient's report suggests things are better or stable/consistent. ",
    "watch lists 1-3 points that are new, worse, or noteworthy. unansweredNow lists question topics ",
    "from the previous visit that were not re-answered this visit. Be concise, concrete, and ",
    "strictly pragmatic. If everything is consistent, say so honestly in summary and keep arrays short.",
  ].join("");

  const user = [
    `Patient: ${demos}${pin ? ` (PIN ${pin})` : ""}.`,
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
    improved: strList(parsed?.improved),
    watch: strList(parsed?.watch),
    unansweredNow: strList(parsed?.unansweredNow),
  };

  if (!compare.summary && !compare.changed.length) {
    return { ok: true, source: "deepseek", compare: null, note: "unparseable" };
  }

  return { ok: true, source: "deepseek", compare };
}

/** Normalize any string-or-array field to a clean string array (max 4). */
function strList(v) {
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

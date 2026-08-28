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

const REASK_WORDS = [
  /\bwhen did (?:it|this|the) (?:start|begin)\b/i,
  /\bsince when\b/i,
  /\bhow long (?:have|has|did|you'?ve) (?:you|had|been|experienced|your)\b/i,
  /how (?:many|long) (?:days|weeks|months) (?:ago|have|has|did) (?:you|it|your)/i,
  /\bhow long (?:have )?you been (?:having|feeling|experiencing|dealing with|taking|using)\b/i,
  /\bduration of (?:your )?(?:symptom|complaint|symptoms|pain|cough|headache|medicine|medication)\b/i,
  /\bwhen (?:did )?(?:the|your) (?:pain|cough|headache|symptoms?) (?:start|begin|first appear)\b/i,
  /how (?:long|many (?:days|weeks)) (?:have|has|ago) (?:you |it |the |your )?(?:had|been suffering|experienced)/i,
];
const PER_EPISODE = [
  /\bwhen it occurs\b/i,
  /\btypically last\b/i,
  /\beach episode\b/i,
  /\bper episode\b/i,
  /\blast when it\b/i,
  /\bhow long does (?:it|the) \w+ (?:typically )?last\b/i,
];
const TIMING_CONTEXT = [
  /\b\d+\s*(?:hour|hours|day|days|week|weeks|month|months)\s+ago\b/i,
  /\bfor (?:the last |about |around |almost |nearly )?\d+\s*(?:hour|hours|day|days|week|weeks|month|months)\b/i,
  /\bsince (?:yesterday|this morning|last night|last week|last month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\bstarted\b/i,
  /\bbegan\b/i,
];
const DIAGNOSIS_WORDS = [
  /\bdiagnos(?:is|e)\b/i,
  /\bthe (?:patient )?(?:has|is)\b/i,
  /\bsuggestive of\b/i,
  /\bindicative of\b/i,
  /\bconsistent with\b/i,
  /\bmost likely (?:diagnosis|cause)\b/i,
];
const TREATMENT_RECOMMEND = [
  /\bshould take\b/i,
  /\bstart taking\b/i,
  /\bstop taking\b/i,
  /\bprescrib/i,
  /\badminister\b/i,
  /\ba dose of\b/i,
  /\btreatment plan\b/i,
  /\bI (?:recommend|suggest|advise)\b/i,
  /\byou (?:should|need to|ought to) (?:take|use|try|start|stop)\b/i,
  /\btake (?:two|three|\d+) (?:times|tablets?|doses?|mg)\b/i,
  /\brecommend\b/i,
];

function hasKnownTiming(brief, answers) {
  const text = [
    brief,
    ...(Array.isArray(answers) ? answers.flatMap((a) => [a.q, a.a]) : []),
  ].join(" ");
  return TIMING_CONTEXT.some((p) => p.test(text));
}

function asksKnownTimingAgain(text) {
  if (PER_EPISODE.some((p) => p.test(text))) return false;
  return REASK_WORDS.some((p) => p.test(text));
}

function isDuplicateQuestion(text, answers) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  return (Array.isArray(answers) ? answers : []).some((a) => {
    const prev = String(a?.q || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
    return prev && (prev.includes(normalized) || normalized.includes(prev));
  });
}

function validateQuestionCandidate(question, context) {
  const text = String(question?.text || "").trim();
  const options = Array.isArray(question?.options) ? question.options.map(String).map((s) => s.trim()) : [];
  if (!text || options.length !== 4 || options.some((o) => !o)) {
    return { ok: false, reason: "Invalid shape: question text and exactly four non-empty options are required." };
  }
  if ((text.match(/\?/g) || []).length > 1) {
    return { ok: false, reason: "Multiple questions in one response are not allowed." };
  }
  if (DIAGNOSIS_WORDS.some((p) => p.test(text))) {
    return { ok: false, reason: "Diagnosis wording is not allowed in intake questions." };
  }
  if (TREATMENT_RECOMMEND.some((p) => p.test(text))) {
    return { ok: false, reason: "Treatment advice or prescribing language is not allowed." };
  }
  if (isDuplicateQuestion(text, context.answers)) {
    return { ok: false, reason: "This repeats a question already answered." };
  }
  if (hasKnownTiming(context.brief, context.answers) && asksKnownTimingAgain(text)) {
    return { ok: false, reason: "Timing or duration is already known; ask about character, location, severity, triggers, or associated symptoms instead." };
  }
  return { ok: true, reason: "" };
}

function staticSafeQuestion(complaint, context, reason) {
  const label = String(complaint || "concern").toLowerCase();
  const candidates = [
    {
      text: `Where do you feel the ${label} most?`,
      options: ["One clear area", "It spreads to nearby areas", "It feels general", "Not sure"],
    },
    {
      text: `How would you describe the ${label}?`,
      options: ["Sharp or stabbing", "Dull or aching", "Burning or tight", "Not sure"],
    },
    {
      text: `How strong is it right now?`,
      options: ["Mild", "Moderate", "Severe", "Not sure"],
    },
    {
      text: `What seems to make it worse?`,
      options: ["Movement or activity", "Eating or drinking", "Resting or lying down", "Not sure"],
    },
    {
      text: `Do you have any other symptoms with it?`,
      options: ["Fever or chills", "Nausea or vomiting", "Weakness or dizziness", "None"],
    },
    {
      text: `Have you taken any medicine for this concern?`,
      options: ["Yes, it helped", "Yes, it did not help", "No", "Not sure"],
    },
  ];
  const picked = candidates.find((q) => validateQuestionCandidate(q, context).ok) || candidates[0];
  return {
    ok: true,
    source: "validator-fallback",
    question: picked,
    done: false,
    reason,
  };
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

  const userLines = [
    `Selected reason: ${complaint}.`,
    `Patient's brief: "${brief}".`,
    transcript ? `Interview so far:\n${transcript}` : "No questions answered yet (this is the first question).",
  ];
  const context = { brief, answers };
  let repairReason = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const user = [
      ...userLines,
      repairReason
        ? `The previous draft was rejected by a safety validator: ${repairReason} Ask a different valid question now.`
        : `Ask the single most relevant next question now.`,
    ].join("\n");

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: repairReason ? 0.2 : 0.4,
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

    const candidate = {
      text: String(q.text || "").trim(),
      options: Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [],
    };
    const validation = validateQuestionCandidate(candidate, context);
    if (validation.ok) {
      return {
        ok: true,
        source: "deepseek",
        question: candidate,
        done: false,
        reason: String(parsed?.reason || "").trim(),
      };
    }
    repairReason = validation.reason;
  }

  return staticSafeQuestion(complaint, context, repairReason);
}

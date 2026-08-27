/**
 * MEDOXZI — Prompt-contract regression test (Class D).
 *
 * Deterministic, offline, NO API key, NO server, NO live LLM.
 *
 * The never-re-ask / single-question / exactly-4-options / no-diagnosis /
 * no-treatment guarantees are NOT enforced by code — they live in the SYSTEM
 * PROMPT handed to a stochastic model. That means the only deterministic way to
 * stop a future edit from silently weakening the contract is to assert that the
 * exact instruction text is present, verbatim, in every production prompt source.
 *
 * This test reads the real deployed source files (server.js local dev path and
 * api/questions.js the Vercel production path) and asserts every hard-rule
 * fragment we have shipped is still there. It runs in the fast baseline, so a
 * prompt regression (e.g. "the 'when did it start' prohibition was trimmed")
 * fails the build in seconds instead of surfacing days later in a live run.
 *
 *   node harness/prompt_contract.test.mjs
 *
 * Exit 0 on PASS, 1 on FAIL. Report written to harness/report_prompt_contract.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Production prompt sources. server.js is the local dev server; api/questions.js
// is the file Vercel actually serves as /api/questions. BOTH must hold the same
// contract — a divergence here is itself a regression.
const SOURCES = {
  "server.js (local dev)": join(ROOT, "server.js"),
  "api/questions.js (production)": join(ROOT, "api", "questions.js"),
};

/**
 * The hard rules the interviewer is contractually bound to. Each entry is a
 * fragment that MUST appear verbatim (modulo surrounding quote/join tokens) in
 * the assembled system prompt of every source. These encode the ABSOLUTE rules
 * from MEDOXZI UX decisions:
 *   R1  never re-ask onset/duration/timing already given (the task-2 rule)
 *   R2  exactly one question per response
 *   R3  exactly 4 options (shape safety)
 *   R4  no diagnosis / no asking the patient for a diagnosis
 *   R5  no treatment advice
 *
 * Write fragments exactly as they appear across string-literal concatenation.
 * A fragment may cross one join boundary (start of line 2 of a multi-line
 * literal), so we collapse single-character gaps. To stay robust we search for
 * the normalized (whitespace-collapsed) fragment inside the normalized source.
 */
const RULES = [
  { id: "R1_never_reask", kind: "hard", desc: "NEVER re-ask anything already told/answered",
    fragment: "NEVER re-ask or repeat ANYTHING the patient already told you or already answered. " },
  { id: "R1bis_onset_timing", kind: "hard", desc: "explicit ban on re-asking 'when did it start' / 'how long' / 'since when'",
    fragment: "if the patient already mentioned WHEN it started, a duration, or timing (e.g. '3 days ago', 'since yesterday', 'for a week'), you must NEVER ask a 'when did it start' / 'how long' / 'since when' question again. That information is already known." },
  { id: "R2_single_question", kind: "hard", desc: "exactly ONE question per response",
    fragment: "Ask exactly ONE question per response." },
  { id: "R3_four_options", kind: "hard", desc: "exactly 4 plain-text answer options + escape",
    fragment: "The question must have exactly 4 plain-text answer options; include one escape option when sensible (" },
  { id: "R4_no_diagnosis", kind: "hard", desc: "never diagnose / never ask for a diagnosis",
    fragment: "You NEVER diagnose and you NEVER give treatment advice, and you never ask for anything the patient cannot know (never ask them for a diagnosis)." },
  { id: "R4bis_adaptive_single", kind: "hard", desc: "single most useful NEXT question",
    fragment: "Your job is to ask the SINGLE most useful NEXT question, branching from what they have already said and answered, to progressively sharpen the brief for the doctor." },
  { id: "R6_window", kind: "hard", desc: "5..12 round window referenced in prompt",
    fragment: "the client enforces a minimum of 5 and a maximum of 12" },
];

function normalize(s) {
  // The prompt is assembled from concatenated JS string literals. Before we can
  // compare a fragment against it, strip the string-literal framing that leaks
  // into the raw source text: escaped apostrophes/quotes (\\', \\") and the
  // `",`-join boundaries between consecutive quoted lines. Then collapse all
  // whitespace so a multi-line literal matches its single-line equivalent.
  let t = String(s);
  t = t.replace(/\\'/g, "'").replace(/\\"/g, '"');
  t = t.replace(/"\s*,\s*\n\s*"/g, " ");
  t = t.replace(/"/g, "");
  return t.replace(/\s+/g, " ").trim();
}

const report = { harness_version: "D0.1.0", sources: {}, gates: {}, verdict: "PASS" };
let hardFails = 0;

for (const [label, path] of Object.entries(SOURCES)) {
  let raw;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (e) {
    report.sources[label] = { error: String(e.message) };
    report.gates[`${label}:file_readable`] = { ok: false, kind: "hard" };
    hardFails++;
    continue;
  }
  const norm = normalize(raw);

  const src = { rules: {} };
  for (const rule of RULES) {
    const ok = norm.includes(normalize(rule.fragment));
    src.rules[rule.id] = {
      ok,
      desc: rule.desc,
      kind: rule.kind,
      detail: ok
        ? "present verbatim"
        : `MISSING or weakened in ${label} — contract broken`,
    };
    report.gates[`${label}:${rule.id}`] = { ok, kind: "hard" };
    if (!ok) hardFails++;
  }
  report.sources[label] = src;
}

report.verdict = hardFails === 0 ? "PASS" : "FAIL";
report.note =
  "Deterministic prompt-contract check. NOT clinical. Verifies the never-re-ask / single-q / 4-option / no-dx / no-treatment rules are intact verbatim in every production prompt source.";

const outPath = join(__dirname, "report_prompt_contract.json");
writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");

console.log("=".repeat(74));
console.log("  MEDOXZI PROMPT-CONTRACT REGRESSION (never-re-ask + hard rules)");
console.log("=".repeat(74));
for (const [label, src] of Object.entries(report.sources)) {
  console.log(`\n[${label}]`);
  for (const [id, r] of Object.entries(src.rules || {})) {
    console.log(`  ${r.ok ? "PASS" : "FAIL "}  ${id}  ${r.desc}`);
  }
}
console.log(`\n  VERDICT: ${report.verdict}\n`);
console.log(`  report -> ${outPath}`);
process.exit(report.verdict === "PASS" ? 0 : 1);

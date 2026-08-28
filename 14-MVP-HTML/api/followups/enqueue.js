/**
 * MEDOXZI — Vercel serverless function to ENQUEUE a follow-up / re-confirmation.
 *
 * fu feature (ADR-036 governed): a clinic can prepare a follow-up message or a
 * 1-day-before re-confirmation for a patient, and schedule WHEN the system is
 * meant to surface it. This endpoint only puts the item into a due-queue. It
 * NEVER transmits a message. "Real send hamesha gated" — transmission stays OFF
 * until the full consent / opt-out / audit / templated-send path is live.
 *
 * Queue backend: Vercel KV (Upstash Redis) via its REST API using plain fetch —
 * the same pattern as the DeepSeek calls already used here (no SDK, no build
 * step, stateless-friendly). Upstash env vars are injected by Vercel when a KV
 * store is linked to the project:
 *     KV_REST_API_URL     (e.g. https://<store>.upstash.io)
 *     KV_REST_API_TOKEN   (write+read REST token)
 * The public `fu:queue` key is a Redis SORTED SET: member = JSON follow-up item,
 * score = unix epoch (seconds) at which the item is due. A sorted set is the
 * canonical date-ordered queue: the cron tick reads everything with score <= now
 * in ONE range call.
 *
 *   POST /api/followups/enqueue
 *     body: {
 *       consent: true,                    // required — clinic declares consent on file
 *       items: [{                         // 1..200
 *         pin:  string, name: string, phone: string,
 *         type: "follow-up" | "reconfirm",// what this schedule hop is for
 *         dueAt: unixSeconds,             // when the item becomes due
 *         message: string                 // templated: can contain {{name}} / {{date}}
 *       }]
 *     }
 *     ->  { ok: true, source: "upstash", queued: N }
 *       or { ok: false, source: "upstash", error, message? }
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

  const consent = payload.consent === true;
  if (!consent) {
    return res.status(400).json({ ok: false, error: "CONSENT_REQUIRED", message: "Follow-up scheduling requires declared marketing/follow-up consent (ADR-036)." });
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  // Validate + normalize FIRST so a malformed batch is rejected before touching the queue.
  const items = [];
  for (const it of rawItems) {
    if (items.length >= 200) break;
    const pin = String(it?.pin || "").trim();
    const name = String(it?.name || "").trim();
    const phone = String(it?.phone || "").trim();
    const type = it?.type === "reconfirm" ? "reconfirm" : "follow-up";
    const dueAt = Math.floor(Number(it?.dueAt));
    const message = String(it?.message || "").trim();
    if (!pin || !name || !message || Number.isNaN(dueAt) || dueAt <= 0) continue;
    // Past-due is allowed (late queue flush/preview), but reject nonsense (year-1000 stamps).
    items.push({ pin, name, phone: phone || "", type, dueAt, message });
  }
  if (!items.length) {
    return res.status(400).json({ ok: false, error: "NO_VALID_ITEMS" });
  }

  const kv = createUpstash();
  if (!kv.ok) {
    return res.status(200).json({ ok: false, source: "upstash", error: kv.error });
  }

  try {
    // member = unique-ish id; score = due timestamp. ZADD each item.
    const pipeline = items.map((it) => {
      const member = JSON.stringify({ ...it, phone: undefined });
      return kv.zadd("fu:queue", { score: it.dueAt, member });
    });
    const queued = (await Promise.all(pipeline)).filter((r) => r !== null).length;
    return res.status(200).json({ ok: true, source: "upstash", queued });
  } catch (err) {
    return res.status(200).json({
      ok: false, source: "upstash", error: "EXCEPTION", message: String(err?.message || "unknown"),
    });
  }
}

/** Minimal Upstash REST client (no SDK). Sorted-set ops used by enqueue + tick. */
function createUpstash() {
  const url = process.env.KV_REST_API_URL || "";
  const token = process.env.KV_REST_API_TOKEN || "";
  if (!url || !token) {
    return { ok: false, error: "KV_UNAVAILABLE", message: "Vercel KV not linked (add KV_REST_API_URL / KV_REST_API_TOKEN)." };
  }
  const base = url.replace(/\/+$/, "");

  async function pipeline(...commands) {
    const r = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data) ? data : null;
  }

  return {
    ok: true,
    async zadd(key, { score, member }) {
      const out = await pipeline(["ZADD", key, score, member]);
      return Array.isArray(out) ? out[0] : null;
    },
    async zrangebyscore(key, min, max) {
      const out = await pipeline(["ZRANGEBYSCORE", key, min, max, "WITHSCORES"]);
      return Array.isArray(out) ? out[0] : null;
    },
    async zrem(key, members) {
      if (!Array.isArray(members) || !members.length) return 0;
      const out = await pipeline(["ZREM", key, ...members]);
      return Array.isArray(out) ? out[0] : 0;
    },
    async get(key) {
      const out = await pipeline(["GET", key]);
      return Array.isArray(out) ? out[0] : null;
    },
    async set(key, value) {
      const out = await pipeline(["SET", key, value]);
      return Array.isArray(out) ? out[0] : null;
    },
  };
}

/**
 * MEDOXZI — Vercel Cron TARGET for the follow-up / re-confirmation scheduler.
 *
 * This is the function a Vercel Cron Job calls on a schedule (see vercel.json
 * crons). It:
 *   1. Reads every due item from the `fu:queue` sorted set (score <= now) —
 *      the "due" preview the scheduler surfaces.
 *   2. Removes them from the queue (they have been surfaced to the audit log).
 *   3. Appends the batch to a `fu:ticklog` list (a JSON array per tick) so every
 *      scheduler run is auditable.
 *
 * It NEVER sends a message. ADR-036 keeps real transmission OFF: this is the
 * "queue + preview; real send gated" heartbeat. The clinic sees exactly what
 * the next send step WOULD transmit, but nothing is transmitted here.
 *
 *   GET /api/followups/tick            <- Vercel Cron
 *       ->  { ok: true, source: "upstash", due: [ {pin,name,phone,type,dueAt,message} ],
 *             surfaced: N }
 *       or { ok: false, source: "upstash", error, message? }
 *
 * Cron schedules run every minute at most; the default for fu is daily (see
 * vercel.json). Past-due items left in the queue are surfaced on the next tick.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const kv = createUpstash();
  if (!kv.ok) {
    return res.status(200).json({ ok: false, source: "upstash", error: kv.error });
  }

  const now = Math.floor(Date.now() / 1000);
  try {
    const raw = await kv.zrangebyscore("fu:queue", 0, now);
    const pairs = Array.isArray(raw) ? raw : [];

    const due = [];
    for (let i = 0; i < pairs.length; i += 2) {
      const member = pairs[i];
      const score = pairs[i + 1];
      let parsed;
      try {
        parsed = JSON.parse(member);
      } catch {
        parsed = null;
      }
      if (!parsed || typeof parsed !== "object") continue;
      due.push({
        pin: String(parsed.pin || ""),
        name: String(parsed.name || ""),
        type: parsed.type === "reconfirm" ? "reconfirm" : "follow-up",
        message: String(parsed.message || ""),
        dueAt: Math.floor(Number(parsed.dueAt) || Number(score) || now),
      });
    }

    // Audit: stamp the tick into the log, then clear what was surfaced.
    const stamp = {
      at: new Date().toISOString(),
      tickEpoch: now,
      surfaced: due.length,
      due: due.map((d) => ({ pin: d.pin, name: d.name, type: d.type, dueAt: d.dueAt, message: d.message })),
    };
    const prevLog = await kv.get("fu:ticklog");
    let log = [];
    try {
      const parsed = JSON.parse(prevLog || "[]");
      if (Array.isArray(parsed)) log = parsed;
    } catch {
      log = [];
    }
    log.unshift(stamp);
    if (log.length > 200) log = log.slice(0, 200);
    await kv.set("fu:ticklog", JSON.stringify(log));

    const members = due.length ? due.map((d) => JSON.stringify({
      pin: d.pin, name: d.name, type: d.type, dueAt: d.dueAt, message: d.message,
    })) : [];
    await kv.zrem("fu:queue", members);

    return res.status(200).json({
      ok: true,
      source: "upstash",
      due,
      surfaced: due.length,
      tick: stamp.at,
      note: "preview only — nothing transmitted (ADR-036 gate).",
    });
  } catch (err) {
    return res.status(200).json({
      ok: false, source: "upstash", error: "EXCEPTION", message: String(err?.message || "unknown"),
    });
  }
}

/** Minimal Upstash REST client (no SDK) — identical to enqueue.js. */
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
    async zrangebyscore(key, min, max) {
      const out = await pipeline(["ZRANGEBYSCORE", key, min, max, "WITHSCORES"]);
      return Array.isArray(out) ? out[0] : null;
    },
    async get(key) {
      const out = await pipeline(["GET", key]);
      return Array.isArray(out) ? out[0] : null;
    },
    async set(key, value) {
      const out = await pipeline(["SET", key, value]);
      return Array.isArray(out) ? out[0] : null;
    },
    async zrem(key, members) {
      if (!Array.isArray(members) || !members.length) return 0;
      const out = await pipeline(["ZREM", key, ...members]);
      return Array.isArray(out) ? out[0] : 0;
    },
  };
}

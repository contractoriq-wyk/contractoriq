// ═══ DrayageIQ Weekly Digest — /api/digest ═══
// Runs on a Vercel cron every Friday evening. For every opted-in user it
// computes last week's numbers from their cloud data and sends one SMS
// via Twilio. Protected by CRON_SECRET so only the scheduler can fire it.
//
// Required Vercel env vars:
//   CRON_SECRET           any long random string (Vercel cron sends it automatically)
//   SUPABASE_URL          e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  service_role key (Settings → API) — server only, NEVER in client
//   TWILIO_ACCOUNT_SID    from twilio.com console
//   TWILIO_AUTH_TOKEN     from twilio.com console
//   TWILIO_FROM           your Twilio number, e.g. +14435551234
//
// Manual test (sends ONE message to you only):
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     "https://getdrayageiq.com/api/digest?test=1&to=+1XXXXXXXXXX"

export default async function handler(req, res) {
  // ── auth: only the cron (or you, with the secret) may trigger sends ──
  const auth = req.headers["authorization"] || "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const {
    SUPABASE_URL, SUPABASE_SERVICE_KEY,
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM,
  } = process.env;
  const missing = ["SUPABASE_URL","SUPABASE_SERVICE_KEY","TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_FROM"]
    .filter(k => !process.env[k]);
  if (missing.length) return res.status(500).json({ error: "missing env", missing });

  // ── helpers ──
  const normalizePhone = (p) => {
    const d = String(p || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d.startsWith("1")) return "+" + d;
    if (String(p || "").startsWith("+")) return String(p);
    return null; // unusable — skip rather than guess
  };

  const weekStats = (blob) => {
    const weeks = Array.isArray(blob?.addedW) ? blob.addedW : [];
    if (!weeks.length) return null;
    const w = weeks[weeks.length - 1];
    const gross = Number(w.gross) || 0;
    const net = Number(w.net) || 0;
    const moves = Array.isArray(w.moves) ? w.moves : [];
    const miles = moves.reduce((s, m) => s + (Number(m.miles) || 0), 0);
    const rpm = miles > 0 ? gross / miles : null;
    const margin = gross > 0 ? (net / gross) * 100 : null;
    return { label: w.label || w.week || "latest week", net, gross, rpm, margin, moveCount: moves.length };
  };

  const buildMessage = (st) => {
    const parts = [`DrayageIQ Weekly — ${st.label}:`];
    parts.push(`Net $${st.net.toFixed(0)}`);
    if (st.rpm !== null) parts.push(`RPM $${st.rpm.toFixed(2)}`);
    if (st.margin !== null) parts.push(`Margin ${st.margin.toFixed(0)}%`);
    parts.push(`(${st.moveCount} moves)`);
    return parts.join(" · ") + " — full breakdown: getdrayageiq.com/?g=digest  Reply STOP to cancel.";
  };

  const sendSMS = async (to, body) => {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const creds = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const form = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body });
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, sid: j.sid || null, err: j.message || null };
  };

  // ── TEST MODE: one sample message to a number you specify ──
  if (req.query.test === "1") {
    const to = normalizePhone(req.query.to);
    if (!to) return res.status(400).json({ error: "bad ?to= number" });
    const sample = buildMessage({ label: "Wk 19", net: 3412, gross: 5240, rpm: 3.18, margin: 65, moveCount: 14 });
    const out = await sendSMS(to, sample);
    return res.status(out.ok ? 200 : 502).json({ test: true, ...out });
  }

  // ── PRODUCTION RUN: all opted-in users ──
  const q = `${SUPABASE_URL}/rest/v1/user_data?select=user_id,data`;
  const rows = await fetch(q, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  }).then(r => r.json());
  if (!Array.isArray(rows)) return res.status(502).json({ error: "supabase query failed", rows });

  const results = [];
  for (const row of rows) {
    const blob = row.data || {};
    if (!blob.digestOptIn) continue;
    const to = normalizePhone(blob.digestPhone);
    if (!to) { results.push({ user: row.user_id, skipped: "bad phone" }); continue; }
    const st = weekStats(blob);
    if (!st) { results.push({ user: row.user_id, skipped: "no weeks" }); continue; }
    const out = await sendSMS(to, buildMessage(st));
    results.push({ user: row.user_id, sent: out.ok, err: out.err });
    await new Promise(r => setTimeout(r, 250)); // gentle pacing for Twilio
  }
  const sent = results.filter(r => r.sent).length;
  return res.status(200).json({ ran: true, optedIn: results.length, sent, results });
}

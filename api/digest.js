// ═══ DrayageIQ Weekly Digest v2 — /api/digest ═══
// EMAIL-FIRST (free via Resend), SMS optional (Twilio, when configured).
// Cron fires Friday evening → for each opted-in user: compute last week's
// numbers from their cloud blob → send SMS if Twilio is configured AND their
// phone is valid, otherwise email their account address via Resend.
//
// FREE PATH env vars (Vercel → Settings → Environment Variables):
//   CRON_SECRET           any long random string
//   SUPABASE_URL          https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  service_role key — server only, NEVER in the client
//   RESEND_API_KEY        free at resend.com (100 emails/day tier)
//   DIGEST_FROM           "DrayageIQ <onboarding@resend.dev>" to start;
//                         switch to your domain after verifying it in Resend
//
// OPTIONAL SMS (adds texting when you're ready to pay Twilio):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//
// Manual test (one message to you only):
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     "https://getdrayageiq.com/api/digest?test=1&email=you@example.com"
//   (or &to=+1XXXXXXXXXX to test SMS once Twilio is configured)

export default async function handler(req, res) {
  const auth = req.headers["authorization"] || "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const {
    SUPABASE_URL, SUPABASE_SERVICE_KEY,
    RESEND_API_KEY, DIGEST_FROM,
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM,
  } = process.env;

  const coreMissing = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"].filter(k => !process.env[k]);
  if (coreMissing.length) return res.status(500).json({ error: "missing env", missing: coreMissing });
  const emailReady = !!(RESEND_API_KEY && DIGEST_FROM);
  const smsReady = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM);
  if (!emailReady && !smsReady) {
    return res.status(500).json({ error: "no channel configured", need: "RESEND_API_KEY+DIGEST_FROM (free) or Twilio vars" });
  }

  // ── helpers ──
  const normalizePhone = (p) => {
    const d = String(p || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d.startsWith("1")) return "+" + d;
    if (String(p || "").startsWith("+")) return String(p);
    return null;
  };

  const weekStats = (blob) => {
    const weeks = Array.isArray(blob?.addedW) ? blob.addedW : [];
    if (!weeks.length) return null;
    const w = weeks[weeks.length - 1];
    const gross = Number(w.gross) || 0;
    const net = Number(w.net) || 0;
    const moves = Array.isArray(w.moves) ? w.moves : [];
    const miles = moves.reduce((s, m) => s + (Number(m.miles) || 0), 0);
    return {
      label: w.label || w.week || "latest week",
      net, gross,
      rpm: miles > 0 ? gross / miles : null,
      margin: gross > 0 ? (net / gross) * 100 : null,
      moveCount: moves.length,
    };
  };

  const smsText = (st) => {
    const parts = [`DrayageIQ Weekly — ${st.label}:`, `Net $${st.net.toFixed(0)}`];
    if (st.rpm !== null) parts.push(`RPM $${st.rpm.toFixed(2)}`);
    if (st.margin !== null) parts.push(`Margin ${st.margin.toFixed(0)}%`);
    parts.push(`(${st.moveCount} moves)`);
    return parts.join(" · ") + " — full breakdown: getdrayageiq.com/?g=digest  Reply STOP to cancel.";
  };

  const emailHTML = (st) => `
  <div style="font-family:Arial,sans-serif;background:#080c16;color:#e2e8f0;padding:24px;border-radius:14px;max-width:480px;margin:0 auto">
    <div style="font-size:18px;font-weight:800;margin-bottom:4px">🚛 DrayageIQ Weekly</div>
    <div style="font-size:12px;color:#8aa0c0;margin-bottom:18px">${st.label} — your week, in numbers</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#8aa0c0">Net pay</td><td style="text-align:right;font-weight:800;color:#00ffcc">$${st.net.toFixed(2)}</td></tr>
      ${st.rpm !== null ? `<tr><td style="padding:8px 0;color:#8aa0c0">Rate per mile</td><td style="text-align:right;font-weight:800">$${st.rpm.toFixed(2)}</td></tr>` : ""}
      ${st.margin !== null ? `<tr><td style="padding:8px 0;color:#8aa0c0">Margin</td><td style="text-align:right;font-weight:800">${st.margin.toFixed(1)}%</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#8aa0c0">Moves</td><td style="text-align:right;font-weight:800">${st.moveCount}</td></tr>
    </table>
    <a href="https://getdrayageiq.com/?g=digest" style="display:block;text-align:center;margin-top:20px;padding:12px;border-radius:10px;background:#00ffcc;color:#000;font-weight:800;text-decoration:none">Open full breakdown →</a>
    <div style="font-size:10px;color:#4a6080;margin-top:16px;text-align:center">You get this because Weekly Digest is ON in your DrayageIQ menu — toggle it off there anytime.</div>
  </div>`;

  const sendSMS = async (to, body) => {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const creds = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const form = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body });
    const r = await fetch(url, { method: "POST", headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, channel: "sms", id: j.sid || null, err: j.message || null };
  };

  const sendEmail = async (to, st) => {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: DIGEST_FROM, to: [to], subject: `Your week: $${st.net.toFixed(0)} net — DrayageIQ Weekly`, html: emailHTML(st) }),
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, channel: "email", id: j.id || null, err: j.message || null };
  };

  const userEmail = async (uid) => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${uid}`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const j = await r.json().catch(() => ({}));
    return j.email || null;
  };

  // ── TEST MODE ──
  if (req.query.test === "1") {
    const st = { label: "Wk 19", net: 3412, gross: 5240, rpm: 3.18, margin: 65, moveCount: 14 };
    if (req.query.email && emailReady) {
      const out = await sendEmail(String(req.query.email), st);
      return res.status(out.ok ? 200 : 502).json({ test: true, ...out });
    }
    if (req.query.to && smsReady) {
      const to = normalizePhone(req.query.to);
      if (!to) return res.status(400).json({ error: "bad ?to= number" });
      const out = await sendSMS(to, smsText(st));
      return res.status(out.ok ? 200 : 502).json({ test: true, ...out });
    }
    return res.status(400).json({ error: "pass ?email= (free path) or ?to= (needs Twilio)", emailReady, smsReady });
  }

  // ── PRODUCTION RUN ──
  const rows = await fetch(`${SUPABASE_URL}/rest/v1/user_data?select=user_id,data`, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  }).then(r => r.json());
  if (!Array.isArray(rows)) return res.status(502).json({ error: "supabase query failed" });

  const results = [];
  for (const row of rows) {
    const blob = row.data || {};
    if (!blob.digestOptIn) continue;
    const st = weekStats(blob);
    if (!st) { results.push({ user: row.user_id, skipped: "no weeks" }); continue; }

    const phone = normalizePhone(blob.digestPhone);
    let out = null;
    if (smsReady && phone) out = await sendSMS(phone, smsText(st));
    if ((!out || !out.ok) && emailReady) {
      const em = await userEmail(row.user_id);
      if (em) out = await sendEmail(em, st);
      else if (!out) out = { ok: false, channel: "none", err: "no email on account" };
    }
    results.push({ user: row.user_id, ...(out || { ok: false, err: "no usable channel" }) });
    await new Promise(r => setTimeout(r, 250));
  }
  const sent = results.filter(r => r.ok).length;
  return res.status(200).json({ ran: true, optedIn: results.length, sent, emailReady, smsReady, results });
}

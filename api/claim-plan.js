// api/claim-plan.js — claims a pending plan after first sign-in
// Called by the app when a logged-in user's plan is "free": if they paid
// BEFORE creating their account, their purchase is waiting in pending_plans
// under their email — this endpoint moves it onto their account securely.
// Uses the service role key server-side so the client never needs (and never
// has) permission to write its own plan column.

const SUPABASE_URL = "https://idlcghudcpisyoyokmbb.supabase.co";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Server not configured" });

  // Verify the caller's Supabase session token — we only act for a real, logged-in user
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not signed in" });

  const sbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };

  try {
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
    });
    if (!userResp.ok) return res.status(401).json({ error: "Invalid session" });
    const user = await userResp.json();
    const email = (user.email || "").toLowerCase().trim();
    if (!user.id || !email) return res.status(401).json({ error: "Invalid session" });

    // Any purchase parked under this email?
    const pendResp = await fetch(
      `${SUPABASE_URL}/rest/v1/pending_plans?email=eq.${encodeURIComponent(email)}&select=plan`,
      { headers: sbHeaders }
    );
    const pending = await pendResp.json();
    if (!Array.isArray(pending) || pending.length === 0) return res.status(200).json({ plan: null });

    const plan = pending[0].plan;
    // Activate on their account
    const upsert = await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: user.id, plan, updated_at: new Date().toISOString() }),
    });
    if (!upsert.ok) throw new Error(`upsert ${upsert.status}`);
    // Remove the claimed row so it can't be claimed twice
    await fetch(`${SUPABASE_URL}/rest/v1/pending_plans?email=eq.${encodeURIComponent(email)}`, {
      method: "DELETE", headers: sbHeaders,
    });
    console.log(`claim-plan: ${email} claimed ${plan}`);
    return res.status(200).json({ plan });
  } catch (err) {
    console.error("claim-plan failed:", err.message);
    return res.status(500).json({ error: "Claim failed" });
  }
}

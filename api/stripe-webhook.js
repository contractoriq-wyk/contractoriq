// api/stripe-webhook.js — DrayageIQ payment activation
// Fires automatically when a customer completes ANY Stripe payment link
// checkout. Maps the purchase to a plan tier and activates it in Supabase:
//   - If the customer already has an account (same email): plan set instantly.
//   - If they paid BEFORE creating an account: saved to pending_plans, and
//     claimed automatically the first time they sign in (see api/claim-plan.js).
//
// Required Vercel environment variables (Settings → Environment Variables):
//   STRIPE_SECRET_KEY        — Stripe Dashboard → Developers → API keys (sk_live_...)
//   STRIPE_WEBHOOK_SECRET    — created when you add this webhook endpoint (whsec_...)
//   SUPABASE_SERVICE_ROLE_KEY — Supabase → Settings → API → service_role (NEVER in client code)

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = "https://idlcghudcpisyoyokmbb.supabase.co";

// Map Stripe amounts (in cents) to plan tiers. Update if prices change.
function planForAmount(cents) {
  if (cents === 1499) return "tier1";   // Standard $14.99/mo
  if (cents === 2499) return "tier2";   // Pro Smart $24.99/mo
  if (cents === 24900) return "tier2";  // Pro Smart Annual $249/yr
  if (cents === 3999) return "tier2";   // Fleet Pro Smart $39.99/mo
  if (cents === 8900) return "tier2";   // Growing Fleet $89/mo
  if (cents === 9700) return "tier2";   // Founding Member $97
  return null; // unknown amount — logged, not activated (e.g. old $1 trial)
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeKey || !webhookSecret || !serviceKey) {
    console.error("stripe-webhook: missing env vars");
    return res.status(500).json({ error: "Server not configured" });
  }

  // Verify the event genuinely came from Stripe (signature check)
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);
  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], webhookSecret);
  } catch (err) {
    console.error("stripe-webhook: signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true }); // ignore other events
  }

  const session = event.data.object;
  const email = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
  const plan = planForAmount(session.amount_total);
  if (!email || !plan) {
    console.error("stripe-webhook: no email or unmapped amount", session.amount_total, email);
    return res.status(200).json({ received: true, note: "no action" });
  }

  const sbHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  try {
    // 1) Does a Supabase auth user with this email already exist?
    const userLookup = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1&email=${encodeURIComponent(email)}`,
      { headers: sbHeaders }
    );
    const userData = await userLookup.json();
    const users = (userData.users || []).filter(u => (u.email || "").toLowerCase() === email);

    if (users.length > 0) {
      // 2a) Existing account — activate the plan directly on their user_data row
      const userId = users[0].id;
      const upsert = await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
        method: "POST",
        headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: userId, plan, updated_at: new Date().toISOString() }),
      });
      if (!upsert.ok) throw new Error(`user_data upsert ${upsert.status}: ${await upsert.text()}`);
      console.log(`stripe-webhook: activated ${plan} for existing user ${email}`);
    } else {
      // 2b) Paid before signing up — park the plan; claimed on first sign-in
      const pending = await fetch(`${SUPABASE_URL}/rest/v1/pending_plans`, {
        method: "POST",
        headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ email, plan, created_at: new Date().toISOString() }),
      });
      if (!pending.ok) throw new Error(`pending_plans insert ${pending.status}: ${await pending.text()}`);
      console.log(`stripe-webhook: parked ${plan} for future signup ${email}`);
    }
    return res.status(200).json({ received: true, activated: plan });
  } catch (err) {
    console.error("stripe-webhook: activation failed:", err.message);
    // 500 makes Stripe retry automatically (up to 3 days) — safety net
    return res.status(500).json({ error: "Activation failed, will retry" });
  }
}

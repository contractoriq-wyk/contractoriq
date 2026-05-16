/**
 * ContractorIQ / DrayageIQ — Secure Anthropic API Proxy
 * The API key NEVER reaches the browser — it lives here only.
 * File location in your GitHub repo: /api/claude.js
 */

const ALLOWED_ORIGINS = [
  "https://getcontractoriq.com",
  "https://www.getcontractoriq.com",
  "https://getdrayageiq.com",
  "https://www.getdrayageiq.com",
  "https://unyamwezinijikolamamajjj.com",
  "https://unyamwezinibakery.com",
];

const MAX_TOKENS_CAP = 4000;

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const isVercelPreview =
    origin.includes(".vercel.app") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1");
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || isVercelPreview;

  res.setHeader("Access-Control-Allow-Origin", isAllowedOrigin ? origin : "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAllowedOrigin) return res.status(403).json({ error: "Forbidden" });

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: "API not configured on server" });

  const body = req.body;

  if (body.max_tokens && body.max_tokens > MAX_TOKENS_CAP) {
    body.max_tokens = MAX_TOKENS_CAP;
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "Invalid request: messages required" });
  }

  // Pull betas out of body — send as header, NOT in body (Anthropic rejects betas in body)
  const betas = body.betas;
  const { betas: _removed, ...anthropicBody } = body;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  if (betas && Array.isArray(betas) && betas.length > 0) {
    headers["anthropic-beta"] = betas.join(",");
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(anthropicBody),
    });

    const data = await anthropicRes.json();

    if (data.usage) {
      console.log(`[proxy] model=${anthropicBody.model} in=${data.usage.input_tokens} out=${data.usage.output_tokens}`);
    }

    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error("[proxy] error:", err.message);
    return res.status(500).json({ error: "Proxy error: " + err.message });
  }
}

/**
 * ContractorIQ / DrayageIQ — Secure Anthropic API Proxy
 * -------------------------------------------------------
 * This serverless function runs on Vercel's edge servers.
 * The API key NEVER reaches the browser — it lives here only.
 *
 * Environment variable required in Vercel dashboard:
 *   ANTHROPIC_KEY = sk-ant-...   (NO "VITE_" prefix — server only)
 *
 * File location in your GitHub repo: /api/claude.js
 */

// Domains allowed to call this proxy
const ALLOWED_ORIGINS = [
  "https://getcontractoriq.com",
  "https://www.getcontractoriq.com",
  "https://getdrayageiq.com",
  "https://www.getdrayageiq.com",
  "https://unyamwezinijikolamamajjj.com",
  "https://unyamwezinibakery.com",
];

// Hard cap on tokens regardless of what the frontend requests
const MAX_TOKENS_CAP = 4000;

// Only Claude models allowed through this proxy
function isClaudeModel(model) {
  return typeof model === "string" && model.startsWith("claude-");
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";

  // Allow all Vercel preview URLs + localhost in development
  const isVercelPreview =
    origin.includes(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1");
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || isVercelPreview;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", isAllowedOrigin ? origin : "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Pre-flight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Block unknown origins in production
  if (!isAllowedOrigin) {
    console.warn("Blocked request from origin:", origin);
    return res.status(403).json({ error: "Forbidden" });
  }

  // Get server-side API key — never sent to browser
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_KEY environment variable not set");
    return res.status(500).json({
      error: "API not configured. Add ANTHROPIC_KEY in Vercel environment variables.",
    });
  }

  const body = req.body;

  // Validate model
  if (body.model && !isClaudeModel(body.model)) {
    return res.status(400).json({ error: "Model not permitted" });
  }

  // Enforce token cap
  if (body.max_tokens && body.max_tokens > MAX_TOKENS_CAP) {
    body.max_tokens = MAX_TOKENS_CAP;
  }

  // Block empty requests
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "Invalid request: messages required" });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicRes.json();

    // Log usage for monitoring (no sensitive data)
    if (data.usage) {
      console.log(
        `[claude-proxy] model=${body.model} input=${data.usage.input_tokens} output=${data.usage.output_tokens}`
      );
    }

    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error("[claude-proxy] fetch error:", err.message);
    return res.status(500).json({ error: "Proxy fetch failed: " + err.message });
  }
}

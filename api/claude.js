/**
 * DrayageIQ / ContractorIQ — Dual-Provider AI Proxy
 * OpenAI (primary) + Google Gemini (fallback).
 * The frontend still sends Anthropic-shaped requests and reads Anthropic-shaped
 * responses — this proxy translates in/out, so NO app code changes are needed.
 *
 * File location in your GitHub repo: /api/claude.js
 * Required Vercel env vars:  OPENAI_KEY   and   GEMINI_KEY
 */

const ALLOWED_ORIGINS = [
  "https://getcontractoriq.com",
  "https://www.getcontractoriq.com",
  "https://getdrayageiq.com",
  "https://www.getdrayageiq.com",
  "https://unyamwezinijikolamamajjj.com",
  "https://unyamwezinibakery.com",
];

const MAX_TOKENS_CAP = 8000;
const OPENAI_MODEL = "gpt-4o-mini";          // cheap, for chat/text
const OPENAI_MODEL_DOC = "gpt-4o";           // stronger reader for PDFs/images (accuracy matters)
const GEMINI_MODEL = "gemini-2.0-flash";     // fallback, handles PDFs well

// ---- best-effort per-IP rate limit (guards against the "looks like abuse" pattern) ----
const RL = globalThis.__ciq_rl || (globalThis.__ciq_rl = new Map());
function rateLimited(ip) {
  const now = Date.now(), WINDOW = 60000, MAX = 20; // 20 requests / minute / IP
  const arr = (RL.get(ip) || []).filter((t) => now - t < WINDOW);
  arr.push(now);
  RL.set(ip, arr);
  return arr.length > MAX;
}

// ---- translation helpers: Anthropic-shaped blocks -> provider formats ----
function blockToOpenAI(b) {
  if (typeof b === "string") return { type: "text", text: b };
  if (b.type === "text") return { type: "text", text: b.text };
  if (b.type === "image") {
    const s = b.source;
    return { type: "image_url", image_url: { url: `data:${s.media_type};base64,${s.data}` } };
  }
  if (b.type === "document") {
    const s = b.source;
    return { type: "file", file: { filename: "document.pdf", file_data: `data:${s.media_type};base64,${s.data}` } };
  }
  return { type: "text", text: "" };
}
function blockToGemini(b) {
  if (typeof b === "string") return { text: b };
  if (b.type === "text") return { text: b.text };
  if (b.type === "image" || b.type === "document") {
    const s = b.source;
    return { inlineData: { mimeType: s.media_type, data: s.data } };
  }
  return { text: "" };
}
function toOpenAIMessages(body) {
  const msgs = [];
  if (body.system) msgs.push({ role: "system", content: body.system });
  for (const m of body.messages) {
    msgs.push({
      role: m.role,
      content: typeof m.content === "string" ? m.content : m.content.map(blockToOpenAI),
    });
  }
  return msgs;
}
function toGeminiContents(body) {
  return body.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: typeof m.content === "string" ? [{ text: m.content }] : m.content.map(blockToGemini),
  }));
}
function hasPDF(body) {
  return body.messages.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b && b.type === "document")
  );
}
function anthropicShaped(text) {
  return { content: [{ type: "text", text: text || "" }] };
}

// ---- provider callers (each returns a string, or throws) ----
async function callOpenAI(body, cap, model) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_KEY}` },
    body: JSON.stringify({ model: model || OPENAI_MODEL, max_tokens: cap, messages: toOpenAIMessages(body) }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error("OpenAI " + r.status + ": " + (d.error?.message || "error"));
  const text = d.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned empty");
  return text;
}
async function callGemini(body, cap) {
  const payload = {
    contents: toGeminiContents(body),
    generationConfig: { maxOutputTokens: cap },
  };
  if (body.system) payload.systemInstruction = { parts: [{ text: body.system }] };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const d = await r.json();
  if (!r.ok) throw new Error("Gemini " + r.status + ": " + (d.error?.message || "error"));
  const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  if (!text) throw new Error("Gemini returned empty");
  return text;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const isPreview =
    origin.includes(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1");
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || isPreview;

  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAllowed) return res.status(403).json({ error: "Forbidden" });

  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many requests — slow down a moment." });

  const body = req.body;
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "Invalid request: messages required" });
  }
  const cap = Math.min(body.max_tokens || 1500, MAX_TOKENS_CAP);
  const isDoc = hasPDF(body) || body.messages.some(m=>Array.isArray(m.content)&&m.content.some(b=>b&&b.type==="image"));

  // For documents/images, use the stronger reader (gpt-4o) first for accuracy; Gemini as fallback.
  const order = ["openai", "gemini"];
  const openaiModel = isDoc ? OPENAI_MODEL_DOC : OPENAI_MODEL;

  const errors = [];
  for (const provider of order) {
    try {
      if (!process.env.OPENAI_KEY && provider === "openai") { errors.push("OPENAI_KEY not set"); continue; }
      if (!process.env.GEMINI_KEY && provider === "gemini") { errors.push("GEMINI_KEY not set"); continue; }
      const text = provider === "openai" ? await callOpenAI(body, cap, openaiModel) : await callGemini(body, cap);
      console.log(`[proxy] served by ${provider}${isDoc ? " (doc)" : ""}`);
      return res.status(200).json(anthropicShaped(text));
    } catch (err) {
      console.error(`[proxy] ${provider} failed:`, err.message);
      errors.push(err.message);
    }
  }
  return res.status(502).json({ error: "All AI providers failed. " + errors.join(" | ") });
}

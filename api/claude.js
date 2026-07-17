/**
 * DrayageIQ — Dual-Provider AI Proxy (hardened)
 * OpenAI (primary) + Google Gemini (fallback).
 * The frontend still sends Anthropic-shaped requests and reads Anthropic-shaped
 * responses — this proxy translates in/out, so NO app code changes are needed.
 *
 * File location in your GitHub repo: /api/claude.js
 * Required Vercel env vars:  OPENAI_KEY   and   GEMINI_KEY
 *
 * Hardening (Jul 16): payload size cap, stricter limits for costly doc/image
 * requests, narrowed preview-origin passthrough, lower token ceiling.
 */

const ALLOWED_ORIGINS = [
  "https://getdrayageiq.com",
  "https://www.getdrayageiq.com",
  "https://unyamwezinijikolamamajjj.com",
  "https://unyamwezinibakery.com",
];

const MAX_TOKENS_CAP = 4000;            // was 8000 — no legit request needs more; halves the abuse ceiling
const MAX_INLINE_BYTES = 5 * 1024 * 1024; // 5MB total base64 payload (app compresses images to ~300KB)
const OPENAI_MODEL = "gpt-4o-mini";      // cheap, for chat/text
const OPENAI_MODEL_DOC = "gpt-4o";       // stronger reader for PDFs/images (accuracy matters)
const GEMINI_MODEL = "gemini-2.0-flash"; // fallback, handles PDFs well

// ---- best-effort per-IP rate limits (per warm instance; the cheap first line of defense) ----
const RL = globalThis.__ciq_rl || (globalThis.__ciq_rl = new Map());
function rateLimited(ip, isDoc) {
  const now = Date.now(), WINDOW = 60000;
  const MAX = isDoc ? 8 : 20; // doc/image calls cost ~10x a chat call — tighter lane for them
  const key = ip + (isDoc ? ":doc" : ":txt");
  const arr = (RL.get(key) || []).filter((t) => now - t < WINDOW);
  arr.push(now);
  RL.set(key, arr);
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
function inlineBytes(body) {
  // Total size of all base64 media in the request — blocks oversized payloads
  // before any provider is called (and before we pay for them).
  let n = 0;
  for (const m of body.messages) {
    if (!Array.isArray(m.content)) continue;
    for (const b of m.content) {
      if (b && (b.type === "image" || b.type === "document") && b.source && b.source.data) {
        n += b.source.data.length;
      }
    }
  }
  return n;
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
  // Preview passthrough narrowed: only OUR project's Vercel previews, not any .vercel.app site
  const isPreview =
    (origin.includes("contractoriq") && origin.includes(".vercel.app")) ||
    origin.includes("localhost") || origin.includes("127.0.0.1");
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || isPreview;

  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAllowed) return res.status(403).json({ error: "Forbidden" });

  const body = req.body;
  if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "Invalid request: messages required" });
  }

  const isDoc = hasPDF(body) || body.messages.some(m=>Array.isArray(m.content)&&m.content.some(b=>b&&b.type==="image"));

  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (rateLimited(ip, isDoc)) return res.status(429).json({ error: "Too many requests — slow down a moment." });

  if (inlineBytes(body) > MAX_INLINE_BYTES) {
    return res.status(413).json({ error: "File too large — try a smaller file or fewer pages." });
  }

  const cap = Math.min(body.max_tokens || 1500, MAX_TOKENS_CAP);
  const openaiModel = isDoc ? OPENAI_MODEL_DOC : OPENAI_MODEL;
  const order = ["openai", "gemini"];

  const errors = [];
  for (const provider of order) {
    try {
      if (!process.env.OPENAI_KEY && provider === "openai") { errors.push("OPENAI_KEY not set"); continue; }
      if (!process.env.GEMINI_KEY && provider === "gemini") { errors.push("GEMINI_KEY not set"); continue; }
      const text = provider === "openai" ? await callOpenAI(body, cap, openaiModel) : await callGemini(body, cap);
      console.log(`[proxy] served by ${provider}${isDoc ? " (doc)" : ""} ip=${ip}`);
      return res.status(200).json(anthropicShaped(text));
    } catch (err) {
      console.error(`[proxy] ${provider} failed:`, err.message);
      errors.push(err.message);
    }
  }
  return res.status(502).json({ error: "All AI providers failed. " + errors.join(" | ") });
}

// api/ticker.js — Serverless proxy for Yahoo Finance quote prices
// Fetches from Yahoo Finance server-side to avoid CORS issues in browser

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  try {
    const url =
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" +
      encodeURIComponent(symbols) +
      "&fields=regularMarketPrice,regularMarketChangePercent&lang=en&region=US";

    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!r.ok) throw new Error("Yahoo status " + r.status);

    const data = await r.json();
    const quotes = data?.quoteResponse?.result || [];

    // Return a flat map: { "SPY": { price: 123.45, pct: 0.56 }, ... }
    const out = {};
    quotes.forEach((q) => {
      out[q.symbol] = {
        price: q.regularMarketPrice ?? null,
        pct: q.regularMarketChangePercent ?? null,
      };
    });

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

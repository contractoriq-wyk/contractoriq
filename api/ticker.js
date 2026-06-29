// api/ticker.js — Live stock/market prices
// Primary: Yahoo Finance v8 (no auth required)
// Fallback: Yahoo Finance v7 with cookie bypass

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com/",
    "Origin": "https://finance.yahoo.com",
  };

  // Try v8 first (more reliable, no crumb needed)
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChangePercent,shortName`;
    const r = await fetch(url, { headers });
    if (r.ok) {
      const data = await r.json();
      const quotes = data?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        const out = {};
        quotes.forEach((q) => {
          out[q.symbol] = {
            price: q.regularMarketPrice ?? null,
            pct: q.regularMarketChangePercent ?? null,
            name: q.shortName ?? null,
          };
        });
        return res.status(200).json(out);
      }
    }
  } catch (e) {}

  // Fallback: v7 with cookie
  try {
    // First get a crumb
    const cookieRes = await fetch("https://finance.yahoo.com/", { headers });
    const setCookie = cookieRes.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/A3=([^;]+)/);
    const cookie = cookieMatch ? `A3=${cookieMatch[1]}` : "";

    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...headers, Cookie: cookie },
    });
    const crumb = await crumbRes.text();

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=${encodeURIComponent(crumb)}&fields=regularMarketPrice,regularMarketChangePercent`;
    const r = await fetch(url, { headers: { ...headers, Cookie: cookie } });
    if (!r.ok) throw new Error("Yahoo v7 status " + r.status);
    const data = await r.json();
    const quotes = data?.quoteResponse?.result || [];
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

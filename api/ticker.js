// api/ticker.js — Live market prices via Polygon.io free tier
// Only fetches symbols we know work — skips unknowns gracefully

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const key = process.env.POLYGON_KEY;
  if (!key) return res.status(500).json({ error: "POLYGON_KEY not configured" });

  // Symbols confirmed to work on Polygon free tier — covers Quick Add panel + defaults
  const pmap = {
    "AMEX:SPY": "SPY", "AMEX:DIA": "DIA", "NASDAQ:QQQ": "QQQ",
    "AMEX:IWM": "IWM", "AMEX:GLD": "GLD", "AMEX:USO": "USO",
    "AMEX:TLT": "TLT",
    "NYSE:XOM": "XOM", "NASDAQ:JBHT": "JBHT", "NASDAQ:AAPL": "AAPL",
    "NASDAQ:TSLA": "TSLA", "NASDAQ:NVDA": "NVDA", "NASDAQ:GOOGL": "GOOGL",
    "NASDAQ:AMZN": "AMZN", "NYSE:CVX": "CVX", "NYSE:ODFL": "ODFL",
    "NASDAQ:META": "META", "NYSE:UNP": "UNP", "NYSE:UPS": "UPS",
    "NASDAQ:INTC": "INTC", "NYSE:F": "F", "NYSE:GM": "GM",
    "NYSE:DAL": "DAL", "NYSE:UAL": "UAL", "NYSE:AAL": "AAL",
    "NYSE:WMT": "WMT", "NASDAQ:COST": "COST", "NYSE:HD": "HD",
    // Crypto via Polygon crypto endpoint
    "COINBASE:BTCUSD": "X:BTCUSD",
    "COINBASE:ETHUSD": "X:ETHUSD",
  };

  const inSymbols = symbols.split(",").map(s => s.trim()).filter(Boolean);
  const supported = inSymbols.filter(s => pmap[s]);

  if (supported.length === 0) {
    return res.status(200).json({});
  }

  const stockSyms = supported.filter(s => !s.startsWith("COINBASE:"));
  const cryptoSyms = supported.filter(s => s.startsWith("COINBASE:"));

  try {
    const out = {};

    await Promise.all(stockSyms.map(async (proName) => {
      try {
        const sym = pmap[proName];
        const url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${key}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) return;
        const d = await r.json();
        const result = d?.results?.[0];
        if (!result?.c) return;
        const pct = result.o > 0 ? ((result.c - result.o) / result.o) * 100 : 0;
        out[proName] = { price: result.c, pct };
      } catch (e) {}
    }));

    await Promise.all(cryptoSyms.map(async (proName) => {
      try {
        const sym = pmap[proName];
        const url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${key}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) return;
        const d = await r.json();
        const result = d?.results?.[0];
        if (!result?.c) return;
        const pct = result.o > 0 ? ((result.c - result.o) / result.o) * 100 : 0;
        out[proName] = { price: result.c, pct };
      } catch (e) {}
    }));

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

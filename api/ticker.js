// api/ticker.js — Live market prices via Polygon.io
// Uses /v2/aggs/ticker/prev (works on free tier always)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const key = process.env.POLYGON_KEY;
  if (!key) return res.status(500).json({ error: "POLYGON_KEY not configured" });

  const pmap = {
    "AMEX:SPY": "SPY", "AMEX:DIA": "DIA", "NASDAQ:QQQ": "QQQ",
    "AMEX:IWM": "IWM", "CBOE:VIX": "VIX", "AMEX:GLD": "GLD",
    "AMEX:USO": "USO", "COINBASE:BTCUSD": "X:BTCUSD",
    "NYSE:XOM": "XOM", "NASDAQ:JBHT": "JBHT", "NASDAQ:AAPL": "AAPL",
    "NASDAQ:TSLA": "TSLA", "NASDAQ:NVDA": "NVDA", "NASDAQ:GOOGL": "GOOGL",
    "NASDAQ:AMZN": "AMZN", "NYSE:CVX": "CVX", "NYSE:ODFL": "ODFL",
    "COINBASE:ETHUSD": "X:ETHUSD", "NASDAQ:META": "META", "NYSE:UNP": "UNP",
  };

  const inSymbols = symbols.split(",").map(s => s.trim());

  try {
    const out = {};

    // Fetch each symbol using /prev endpoint (always available on free tier)
    await Promise.all(inSymbols.map(async (proName) => {
      try {
        const isCrypto = proName.startsWith("COINBASE:");
        const sym = pmap[proName] || proName.split(":").pop();

        let url;
        if (isCrypto) {
          // Crypto previous close
          url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${key}`;
        } else {
          // Stock previous close
          url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${key}`;
        }

        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) return;
        const d = await r.json();
        const result = d?.results?.[0];
        if (!result?.c) return;

        const price = result.c;
        const open = result.o;
        const pct = open > 0 ? ((price - open) / open) * 100 : 0;
        out[proName] = { price, pct };
      } catch (e) {}
    }));

    if (Object.keys(out).length === 0) {
      return res.status(503).json({ error: "No data available" });
    }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

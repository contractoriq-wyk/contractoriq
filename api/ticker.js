// api/ticker.js — Live market prices via Polygon.io
// Falls back to previous close when market is closed

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
  const stockSyms = inSymbols
    .filter(s => !s.startsWith("COINBASE:"))
    .map(s => pmap[s] || s.split(":").pop());

  try {
    const out = {};

    // Try snapshot first (works during market hours)
    const snapUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${stockSyms.join(",")}&apiKey=${key}`;
    const snapRes = await fetch(snapUrl);

    if (snapRes.ok) {
      const snapData = await snapRes.json();
      const tickers = snapData?.tickers || [];

      for (const t of tickers) {
        // Use day close if available, otherwise prevDay close
        const price = (t.day?.c && t.day.c > 0) ? t.day.c : (t.prevDay?.c || null);
        const prevClose = t.prevDay?.c || null;
        const pct = t.todaysChangePerc ?? (price && prevClose && prevClose > 0
          ? ((price - prevClose) / prevClose) * 100
          : 0);

        const proName = inSymbols.find(s => (pmap[s] || s.split(":").pop()) === t.ticker);
        if (proName && price) {
          out[proName] = {
            price,
            pct: pct ?? 0,
            prevClose,
            afterHours: !t.day?.c || t.day.c === 0,
          };
        }
      }
    }

    // For any symbols not yet in out, fetch previous close individually
    const missing = inSymbols.filter(s => !out[s] && !s.startsWith("COINBASE:"));
    for (const proName of missing) {
      try {
        const sym = pmap[proName] || proName.split(":").pop();
        // Get last trading day's data
        const prevUrl = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${key}`;
        const r = await fetch(prevUrl);
        if (r.ok) {
          const d = await r.json();
          const result = d?.results?.[0];
          if (result?.c) {
            const price = result.c;
            const prevOpen = result.o;
            const pct = prevOpen > 0 ? ((price - prevOpen) / prevOpen) * 100 : 0;
            out[proName] = { price, pct, afterHours: true };
          }
        }
      } catch (e) {}
    }

    // Crypto
    const cryptoSyms = inSymbols.filter(s => s.startsWith("COINBASE:"));
    for (const proName of cryptoSyms) {
      try {
        const poly = pmap[proName];
        if (!poly) continue;
        const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${poly}?apiKey=${key}`;
        const r = await fetch(url);
        if (r.ok) {
          const d = await r.json();
          const t = d?.ticker;
          const price = t?.day?.c || t?.prevDay?.c || null;
          const pct = t?.todaysChangePerc ?? 0;
          if (price) out[proName] = { price, pct };
        }
      } catch (e) {}
    }

    if (Object.keys(out).length === 0) {
      return res.status(503).json({ error: "No data available" });
    }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

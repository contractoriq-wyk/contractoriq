// api/ticker.js — Live market prices via Polygon.io
// Free tier: unlimited calls, 15-second delayed data for US stocks
// Docs: https://polygon.io/docs/stocks/get_v2_snapshot_locale_us_markets_stocks_tickers

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=15");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const key = process.env.POLYGON_KEY;
  if (!key) return res.status(500).json({ error: "POLYGON_KEY not configured" });

  // Map TradingView proNames to Polygon ticker symbols
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
  
  // Separate stock tickers from crypto
  const stockSyms = inSymbols
    .filter(s => !s.startsWith("COINBASE:"))
    .map(s => pmap[s] || s.split(":").pop());
  
  const cryptoSyms = inSymbols
    .filter(s => s.startsWith("COINBASE:"))
    .map(s => ({ proName: s, poly: pmap[s] }))
    .filter(s => s.poly);

  try {
    const out = {};

    // Fetch stocks snapshot (batch call)
    if (stockSyms.length > 0) {
      const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${stockSyms.join(",")}&apiKey=${key}`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        const tickers = data?.tickers || [];
        tickers.forEach(t => {
          const price = t.day?.c || t.prevDay?.c || null;
          const open = t.day?.o || t.prevDay?.o || null;
          const pct = t.todaysChangePerc ?? (price && open && open > 0 ? ((price - open) / open) * 100 : null);
          // Remap back to proName
          const proName = inSymbols.find(s => (pmap[s] || s.split(":").pop()) === t.ticker);
          if (proName && price) {
            out[proName] = { price, pct: pct ?? 0 };
          }
        });
      }
    }

    // Fetch crypto individually
    for (const { proName, poly } of cryptoSyms) {
      try {
        const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${poly}?apiKey=${key}`;
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          const t = data?.ticker;
          const price = t?.day?.c || t?.prevDay?.c || null;
          const pct = t?.todaysChangePerc ?? null;
          if (price) out[proName] = { price, pct: pct ?? 0 };
        }
      } catch (e) {}
    }

    if (Object.keys(out).length === 0) {
      return res.status(503).json({ error: "No data returned from Polygon" });
    }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

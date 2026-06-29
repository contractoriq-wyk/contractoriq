// api/ticker.js — Live market prices via multiple free sources
// No API key required — uses public endpoints

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  // Map TradingView proNames to Yahoo Finance symbols
  const ymap = {
    "AMEX:SPY": "SPY", "AMEX:DIA": "DIA", "NASDAQ:QQQ": "QQQ",
    "AMEX:IWM": "IWM", "CBOE:VIX": "%5EVIX", "AMEX:GLD": "GLD",
    "AMEX:USO": "USO", "COINBASE:BTCUSD": "BTC-USD",
    "NYSE:XOM": "XOM", "NASDAQ:JBHT": "JBHT", "NASDAQ:AAPL": "AAPL",
    "NASDAQ:TSLA": "TSLA", "NASDAQ:NVDA": "NVDA", "NASDAQ:GOOGL": "GOOGL",
    "NASDAQ:AMZN": "AMZN", "NYSE:CVX": "CVX", "NYSE:ODFL": "ODFL",
    "COINBASE:ETHUSD": "ETH-USD", "NASDAQ:META": "META", "NYSE:UNP": "UNP",
  };

  // Convert incoming proNames to Yahoo symbols
  const inSymbols = symbols.split(",").map(s => s.trim());
  const yahooSyms = inSymbols.map(s => ymap[s] || s.split(":").pop());
  const uniqueSyms = [...new Set(yahooSyms)].join(",");

  const baseHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com/",
    "Origin": "https://finance.yahoo.com",
  };

  // Method 1: Yahoo Finance v8 (most reliable, no crumb needed)
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(uniqueSyms)}&fields=regularMarketPrice,regularMarketChangePercent,shortName,regularMarketTime`;
    const r = await fetch(url, { headers: baseHeaders });
    if (r.ok) {
      const data = await r.json();
      const quotes = data?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        const yahooMap = {};
        quotes.forEach(q => {
          yahooMap[q.symbol] = {
            price: q.regularMarketPrice ?? null,
            pct: q.regularMarketChangePercent ?? null,
            name: q.shortName ?? null,
          };
        });
        // Remap back to proName keys
        const out = {};
        inSymbols.forEach(proName => {
          const ys = ymap[proName] || proName.split(":").pop();
          if (yahooMap[ys]) out[proName] = yahooMap[ys];
        });
        if (Object.keys(out).length > 0) {
          return res.status(200).json(out);
        }
      }
    }
  } catch (e) {}

  // Method 2: Yahoo Finance v7 with crumb
  try {
    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...baseHeaders, Cookie: "tbla_id=placeholder" },
    });
    const crumb = (await crumbRes.text()).trim();

    if (crumb && crumb.length < 50) {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(uniqueSyms)}&crumb=${encodeURIComponent(crumb)}`;
      const r = await fetch(url, { headers: baseHeaders });
      if (r.ok) {
        const data = await r.json();
        const quotes = data?.quoteResponse?.result || [];
        const yahooMap = {};
        quotes.forEach(q => {
          yahooMap[q.symbol] = { price: q.regularMarketPrice ?? null, pct: q.regularMarketChangePercent ?? null };
        });
        const out = {};
        inSymbols.forEach(proName => {
          const ys = ymap[proName] || proName.split(":").pop();
          if (yahooMap[ys]) out[proName] = yahooMap[ys];
        });
        if (Object.keys(out).length > 0) return res.status(200).json(out);
      }
    }
  } catch (e) {}

  return res.status(503).json({ error: "Market data temporarily unavailable" });
}

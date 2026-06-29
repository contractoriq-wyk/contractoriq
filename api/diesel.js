// api/diesel.js — Live national diesel price from EIA (US Energy Information Administration)
// Free government API, updates every Monday. No CORS issues — runs server-side on Vercel.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=1800");

  const key = process.env.EIA_KEY;
  if (!key) return res.status(500).json({ error: "EIA_KEY not configured" });

  try {
    // Series: Weekly U.S. No 2 Diesel Retail Prices (Dollars per Gallon)
    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${key}&frequency=weekly&data[0]=value&facets[product][]=EPD2D&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=1`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("EIA status " + r.status);

    const d = await r.json();
    const latest = d?.response?.data?.[0];
    if (!latest) throw new Error("No data returned");

    return res.status(200).json({
      price: parseFloat(latest.value).toFixed(3),
      period: latest.period,
      unit: "$/gal",
      source: "EIA U.S. Weekly Diesel Retail Price",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

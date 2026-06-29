// api/weather.js — Live weather for a city/location via OpenWeatherMap
// Free tier: 1000 calls/day. Runs server-side on Vercel to avoid CORS.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=900");

  const key = process.env.OWM_KEY;
  if (!key) return res.status(500).json({ error: "OWM_KEY not configured" });

  const { city, lat, lon } = req.query;
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "Provide city or lat+lon" });
  }

  try {
    // Build query — prefer lat/lon for accuracy, fall back to city name
    const location = lat && lon
      ? `lat=${lat}&lon=${lon}`
      : `q=${encodeURIComponent(city)}`;

    const url = `https://api.openweathermap.org/data/2.5/weather?${location}&appid=${key}&units=imperial`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("OWM status " + r.status);

    const d = await r.json();

    return res.status(200).json({
      city: d.name,
      state: d.sys?.country,
      temp: Math.round(d.main?.temp),
      feels_like: Math.round(d.main?.feels_like),
      condition: d.weather?.[0]?.main,
      description: d.weather?.[0]?.description,
      humidity: d.main?.humidity,
      wind_mph: Math.round(d.wind?.speed),
      wind_dir: d.wind?.deg,
      visibility_miles: d.visibility ? (d.visibility / 1609).toFixed(1) : null,
      icon: d.weather?.[0]?.icon,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

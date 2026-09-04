export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({ error: "RAILRADAR_API_KEY is missing in Vercel Environment Variables" });

  const url = new URL(req.url, "http://localhost");
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return res.json({ data: [] });

  try {
    const api = `https://api.railradar.in/v1/lookup/search/stations?q=${encodeURIComponent(q)}&limit=15`;
    const r = await fetch(api, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const text = await r.text();
    let j;
    try { j = JSON.parse(text); }
    catch { return res.status(r.status || 502).json({ error: `RailRadar returned non-JSON (HTTP ${r.status})` }); }

    if (!r.ok) return res.status(r.status).json(j);

    const raw = Array.isArray(j?.data) ? j.data :
                Array.isArray(j) ? j :
                Array.isArray(j?.stations) ? j.stations :
                Array.isArray(j?.data?.stations) ? j.data.stations : [];

    const rows = raw.map(s => ({
      code: String(s?.code || s?.stationCode || s?.station_code || "").trim().toUpperCase(),
      name: String(s?.name || s?.stationName || s?.station_name || "").trim(),
      city: String(s?.city || s?.cityName || "").trim(),
      state: String(s?.state || s?.stateName || "").trim()
    }))
    .filter(s => /^[A-Z0-9]{2,6}$/.test(s.code) && s.name)
    .filter((s, i, a) => a.findIndex(x => x.code === s.code) === i)
    .slice(0, 15);

    return res.json({ data: rows });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Station search failed" });
  }
}
export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({ error: "RAILRADAR_API_KEY is missing in Vercel Environment Variables" });

  const u = new URL(req.url, "http://localhost");
  const from = (u.searchParams.get("from") || "").trim().toUpperCase();
  const to = (u.searchParams.get("to") || "").trim().toUpperCase();

  if (!/^[A-Z0-9]{2,6}$/.test(from) || !/^[A-Z0-9]{2,6}$/.test(to)) {
    return res.status(400).json({ error: "Valid From and To station codes are required" });
  }
  if (from === to) return res.status(400).json({ error: "From and To station cannot be the same" });

  const p = new URLSearchParams();
  for (const k of ["date", "type", "category", "byCity", "live"]) {
    const v = u.searchParams.get(k);
    if (v) p.set(k, v);
  }
  if (!p.has("live")) p.set("live", "true");

  try {
    const endpoint = `https://api.railradar.in/v1/trains/between/${encodeURIComponent(from)}/${encodeURIComponent(to)}?${p.toString()}`;
    const r = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const text = await r.text();
    let j;
    try { j = JSON.parse(text); }
    catch { return res.status(r.status || 502).json({ error: `RailRadar returned non-JSON (HTTP ${r.status})` }); }

    if (!r.ok) return res.status(r.status).json(j);
    return res.json(j);
  } catch (e) {
    return res.status(502).json({ error: e.message || "Train search failed" });
  }
}
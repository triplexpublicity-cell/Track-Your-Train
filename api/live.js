export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({ error: "RAILRADAR_API_KEY is missing in Vercel Environment Variables" });

  const u = new URL(req.url, "http://localhost");
  const train = (u.searchParams.get("train") || "").trim();
  if (!/^\d{4,6}$/.test(train)) return res.status(400).json({ error: "Valid train number is required" });

  const p = new URLSearchParams();
  for (const k of ["date", "authoritative", "haltsOnly", "geometry", "format", "includeCoordinates"]) {
    const v = u.searchParams.get(k);
    if (v) p.set(k, v);
  }

  try {
    const endpoint = `https://api.railradar.in/v1/trains/${encodeURIComponent(train)}/live${p.toString() ? "?" + p.toString() : ""}`;
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
    return res.status(502).json({ error: e.message || "Live train request failed" });
  }
}

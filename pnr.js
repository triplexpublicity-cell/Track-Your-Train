export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({ error: "RAILRADAR_API_KEY is missing in Vercel Environment Variables" });

  const pnr = ((new URL(req.url, "http://localhost")).searchParams.get("pnr") || "").trim();
  if (!/^\d{10}$/.test(pnr)) return res.status(400).json({ error: "10 digit PNR is required" });

  try {
    const r = await fetch(`https://api.railradar.in/v1/pnr/${pnr}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const text = await r.text();
    let j;
    try { j = JSON.parse(text); }
    catch { return res.status(r.status || 502).json({ error: `RailRadar returned non-JSON (HTTP ${r.status})` }); }
    if (!r.ok) return res.status(r.status).json(j);
    return res.json(j);
  } catch (e) {
    return res.status(502).json({ error: e.message || "PNR request failed" });
  }
}
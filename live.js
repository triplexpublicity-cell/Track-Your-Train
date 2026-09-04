export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({error:"RAILRADAR_API_KEY environment variable is missing"});
  const url = new URL(req.url, "http://localhost");
  const train = (url.searchParams.get("train") || "").replace(/\D/g,"");
  if (!train) return res.status(400).json({error:"Train number is required"});
  const params = new URLSearchParams();
  for (const k of ["date","authoritative","haltsOnly","geometry","format","includeCoordinates"]) {
    const v = url.searchParams.get(k); if (v) params.set(k,v);
  }
  const upstream = `https://api.railradar.in/v1/trains/${train}/live${params.toString() ? "?"+params.toString() : ""}`;
  try {
    const r = await fetch(upstream, {headers:{Authorization:`Bearer ${key}`,Accept:"application/json"}});
    const text = await r.text();
    let body; try { body=JSON.parse(text) } catch { body={error:text} }
    return res.status(r.status).json(body);
  } catch(e) { return res.status(502).json({error:"RailRadar request failed", detail:e.message}); }
}
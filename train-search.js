export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({ error: "RAILRADAR_API_KEY is missing in Vercel Environment Variables" });

  const q = ((new URL(req.url, "http://localhost")).searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return res.json({ data: [] });

  try {
    const r = await fetch("https://api.railradar.in/v1/lookup/trains/ntes", {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const text = await r.text();
    let j;
    try { j = JSON.parse(text); }
    catch { return res.status(r.status || 502).json({ error: `RailRadar returned non-JSON (HTTP ${r.status})` }); }

    if (!r.ok) return res.status(r.status).json(j);

    const src = j?.data && typeof j.data === "object" && !Array.isArray(j.data)
      ? j.data
      : (j?.trains && typeof j.trains === "object" ? j.trains : {});

    const rows = Object.entries(src)
      .map(([number, name]) => ({ train_number: String(number), train_name: String(name || "") }))
      .filter(x => x.train_number.toLowerCase().includes(q) || x.train_name.toLowerCase().includes(q))
      .sort((a, b) => {
        const ae = a.train_number.toLowerCase() === q ? 0 : 1;
        const be = b.train_number.toLowerCase() === q ? 0 : 1;
        return ae - be || a.train_name.localeCompare(b.train_name);
      })
      .slice(0, 15);

    return res.json({ data: rows });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Train search failed" });
  }
}
export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({error:"RAILRADAR_API_KEY environment variable is missing"});
  const q = new URL(req.url, "http://localhost").searchParams.get("q") || "";
  if (q.trim().length < 2) return res.status(200).json({data:[]});
  const upstream = `https://api.railradar.in/v1/lookup/search/trains?q=${encodeURIComponent(q.trim())}&limit=10`;
  try {
    const r=await fetch(upstream,{headers:{Authorization:`Bearer ${key}`,Accept:"application/json"}});
    const text=await r.text(); let body; try{body=JSON.parse(text)}catch{body={error:text}};
    return res.status(r.status).json(body);
  }catch(e){return res.status(502).json({error:"RailRadar search failed",detail:e.message})}
}
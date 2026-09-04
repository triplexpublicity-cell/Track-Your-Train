export default async function handler(req, res) {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) return res.status(500).json({error:"RAILRADAR_API_KEY environment variable is missing"});
  const pnr = (new URL(req.url, "http://localhost").searchParams.get("pnr") || "").replace(/\D/g,"");
  if (!/^\d{10}$/.test(pnr)) return res.status(400).json({error:"Valid 10 digit PNR is required"});
  const upstream=`https://api.railradar.in/v1/pnr/${pnr}`;
  try{
    const r=await fetch(upstream,{headers:{Authorization:`Bearer ${key}`,Accept:"application/json"}});
    const text=await r.text(); let body; try{body=JSON.parse(text)}catch{body={error:text}};
    return res.status(r.status).json(body);
  }catch(e){return res.status(502).json({error:"RailRadar PNR request failed",detail:e.message})}
}
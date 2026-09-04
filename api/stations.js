export default async function handler(req,res){
  const key=process.env.RAILRADAR_API_KEY;
  if(!key) return res.status(500).json({error:'RAILRADAR_API_KEY is missing in Vercel Environment Variables'});
  const q=(new URL(req.url,'http://localhost').searchParams.get('q')||'').trim();
  if(q.length<2) return res.json({data:[]});
  try{
    const r=await fetch(`https://api.railradar.in/v1/lookup/search/stations?q=${encodeURIComponent(q)}&limit=10`,{headers:{Authorization:`Bearer ${key}`,Accept:'application/json'}});
    const text=await r.text(); let j; try{j=JSON.parse(text)}catch{j={error:`RailRadar returned non-JSON (${r.status})`}};
    if(!r.ok) return res.status(r.status).json(j);
    return res.json({data:j.data||[]});
  }catch(e){return res.status(502).json({error:e.message})}
}

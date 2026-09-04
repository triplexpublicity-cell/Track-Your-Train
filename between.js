export default async function handler(req,res){
  const key=process.env.RAILRADAR_API_KEY;
  if(!key) return res.status(500).json({error:'RAILRADAR_API_KEY is missing in Vercel Environment Variables'});
  const u=new URL(req.url,'http://localhost'),f=(u.searchParams.get('from')||'').toUpperCase(),t=(u.searchParams.get('to')||'').toUpperCase();
  if(!f||!t) return res.status(400).json({error:'From and To station codes required'});
  const p=new URLSearchParams(); ['date','type','category','byCity','live'].forEach(k=>{const v=u.searchParams.get(k);if(v)p.set(k,v)});
  try{
    const r=await fetch(`https://api.railradar.in/v1/trains/between/${encodeURIComponent(f)}/${encodeURIComponent(t)}${p.toString()?'?'+p:''}`,{headers:{Authorization:`Bearer ${key}`,Accept:'application/json'}});
    const text=await r.text(); let j; try{j=JSON.parse(text)}catch{j={error:`RailRadar returned non-JSON (${r.status})`}};
    if(!r.ok) return res.status(r.status).json(j);
    return res.json(j);
  }catch(e){return res.status(502).json({error:e.message})}
}

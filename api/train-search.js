export default async function handler(req,res){
  const key=process.env.RAILRADAR_API_KEY;
  if(!key) return res.status(500).json({error:'RAILRADAR_API_KEY is missing in Vercel Environment Variables'});
  const q=(new URL(req.url,'http://localhost').searchParams.get('q')||'').trim().toLowerCase();
  if(q.length<2) return res.json({data:[]});
  try{
    const r=await fetch('https://api.railradar.in/v1/lookup/trains/ntes',{headers:{Authorization:`Bearer ${key}`,Accept:'application/json'}});
    const text=await r.text();
    let j; try{j=JSON.parse(text)}catch{ return res.status(r.status||502).json({error:`RailRadar returned non-JSON (${r.status})`}) }
    if(!r.ok) return res.status(r.status).json(j);
    const src=j.data||{};
    const rows=Object.entries(src)
      .filter(([number,name])=>String(number).toLowerCase().includes(q)||String(name).toLowerCase().includes(q))
      .slice(0,15)
      .map(([train_number,train_name])=>({train_number,train_name}));
    return res.json({data:rows});
  }catch(e){return res.status(502).json({error:e.message})}
}

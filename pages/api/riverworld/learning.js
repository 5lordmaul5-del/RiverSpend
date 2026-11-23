const LANGS = new Set(['it','en','fr','de','es','pt']);
export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const q=typeof req.query.q==='string'?req.query.q.trim().slice(0,140):'';
  const subject=typeof req.query.subject==='string'?req.query.subject.slice(0,60):'';
  const level=typeof req.query.level==='string'?req.query.level.slice(0,30):'';
  const grade=typeof req.query.grade==='string'?req.query.grade.slice(0,20):'';
  const lang=typeof req.query.lang==='string'&&LANGS.has(req.query.lang)?req.query.lang:'it';
  if(!q)return res.status(400).json({error:'Inserisci un argomento da cercare.'});
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  try{
    const sources=[['Wikipedia',lang+'.wikipedia.org'],['Wikibooks',lang+'.wikibooks.org']];
    const responses=await Promise.all(sources.map(async([source,host])=>{
      const url=new URL('https://'+host+'/w/api.php');
      url.searchParams.set('action','query');url.searchParams.set('list','search');
      url.searchParams.set('srsearch',q);url.searchParams.set('srnamespace','0');
      url.searchParams.set('srlimit','5');url.searchParams.set('format','json');url.searchParams.set('origin','*');
      const response=await fetch(url.toString(),{headers:{Accept:'application/json','User-Agent':'RiverWorldSchool/1.0 (https://www.riverspend.com/)'}});
      if(!response.ok)return [];
      const data=await response.json();
      return (data.query?.search||[]).map(item=>({source,title:item.title,snippet:String(item.snippet||'').replace(/<[^>]*>/g,''),url:'https://'+host+'/wiki/'+encodeURIComponent(item.title.replace(/ /g,'_'))}));
    }));
    const results=responses.flat().slice(0,10);
    return res.status(200).json({provider:'Wikipedia + Wikibooks',subject,level,grade,updatedAt:new Date().toISOString(),count:results.length,results});
  }catch{return res.status(502).json({error:'Le fonti didattiche non sono raggiungibili in questo momento.'});}
}

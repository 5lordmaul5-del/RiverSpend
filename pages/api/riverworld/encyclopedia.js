const LANGS = new Set(['it','en','fr','de','es','pt','ja','zh','ar','ru']);
const CATEGORIES = new Set(['Tutti','Scienze','Storia','Geografia','Matematica','Tecnologia','Medicina','Arte e cultura','Natura','Economia','Diritto','Filosofia','Spazio']);
export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const q=typeof req.query.q==='string'?req.query.q.trim().slice(0,160):'';
  const lang=typeof req.query.lang==='string'&&LANGS.has(req.query.lang)?req.query.lang:'it';
  const domain=typeof req.query.domain==='string'&&CATEGORIES.has(req.query.domain)?req.query.domain:'Tutti';
  if(!q)return res.status(400).json({error:'Inserisci un termine da cercare.'});
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  try{
    const endpoint=new URL('https://'+lang+'.wikipedia.org/w/api.php');
    endpoint.searchParams.set('action','query');endpoint.searchParams.set('list','search');
    endpoint.searchParams.set('srsearch',q+(domain!=='Tutti'?' '+domain:''));endpoint.searchParams.set('srnamespace','0');
    endpoint.searchParams.set('srlimit','10');endpoint.searchParams.set('format','json');endpoint.searchParams.set('origin','*');
    const response=await fetch(endpoint.toString(),{headers:{Accept:'application/json','User-Agent':'RSEncyclopedia/1.0 (https://www.riverspend.com/)'}});
    if(!response.ok)return res.status(502).json({error:'La fonte enciclopedica non è disponibile in questo momento.'});
    const data=await response.json();
    const results=(data.query?.search||[]).map(item=>({
      title:item.title,
      snippet:String(item.snippet||'').replace(/<[^>]*>/g,''),
      url:'https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(item.title.replace(/ /g,'_')),
      thumbnail:null
    }));
    return res.status(200).json({provider:'Wikipedia',language:lang,domain,updatedAt:new Date().toISOString(),count:results.length,results});
  }catch{return res.status(502).json({error:'Errore di collegamento alla ricerca enciclopedica.'});}
}

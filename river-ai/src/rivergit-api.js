import { createLocalBareRepository, listLocalRepositories, validateLocalRepoName } from './rivergit-local.js';
const json=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(obj));};
export function createRiverGitApi({storageDir, token}={}){
 if(!storageDir) throw new Error('storageDir required');
 return async function riverGitApi(req,res){
  if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('allow','GET, POST');return json(res,405,{error:'method_not_allowed'});}
  if(token){const auth=req.headers.authorization||'';if(auth!==`Bearer ${token}`)return json(res,401,{error:'unauthorized'});}
  const url=new URL(req.url||'/', 'http://127.0.0.1');
  if(url.pathname==='/api/rivergit/repos'&&req.method==='GET'){
   try{return json(res,200,{repositories:await listLocalRepositories(storageDir)});}catch{return json(res,500,{error:'list_failed'});}
  }
  if(url.pathname==='/api/rivergit/repos'&&req.method==='POST'){
   let body=''; req.on('data',chunk=>{body+=chunk;if(body.length>8192){req.destroy();}});
   req.on('end',async()=>{try{
    const data=JSON.parse(body||'{}');const name=validateLocalRepoName(data.name);
    const result=await createLocalBareRepository(storageDir,name);return json(res,201,result);
   }catch(e){const status=e.message==='Repository already exists'?409:(e instanceof SyntaxError?400:400);return json(res,status,{error:e.message||'invalid_request'});}});
   return;
  }
  return json(res,404,{error:'not_found'});
 };
}

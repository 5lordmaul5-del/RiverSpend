import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {createServer} from 'node:http';import {createRiverGitApi} from '../src/rivergit-api.js';
async function request(server,method,url,body,token){const addr=server.address();return fetch(`http://127.0.0.1:${addr.port}${url}`,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});}
test('RiverGit API requires bearer token when configured and creates/list repos',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'rivergit-api-'));const server=createServer(createRiverGitApi({storageDir:dir,token:'secret'}));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  assert.equal((await request(server,'GET','/api/rivergit/repos',null)).status,401);
  const create=await request(server,'POST','/api/rivergit/repos',{name:'sample'},'secret');assert.equal(create.status,201);
  const list=await request(server,'GET','/api/rivergit/repos',null,'secret');assert.equal(list.status,200);assert.equal((await list.json()).repositories[0].name,'sample');
  assert.equal((await request(server,'POST','/api/rivergit/repos',{name:'../bad'},'secret')).status,400);
 }finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
});

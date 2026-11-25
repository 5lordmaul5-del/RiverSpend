import { createServer } from 'node:http';
import { createRiverGitApi } from './rivergit-api.js';
export function startRiverGitService({storageDir,token,host='127.0.0.1',port=3031}={}){
 if(host!=='127.0.0.1'&&host!=='::1') throw new Error('RiverGit service must bind to loopback until hardened');
 if(!storageDir)throw new Error('storageDir required');
 const server=createServer(createRiverGitApi({storageDir,token}));
 return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,()=>resolve({server,host,port:server.address().port,started:true}));});
}

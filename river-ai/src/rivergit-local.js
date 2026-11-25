import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const NAME=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
export function validateLocalRepoName(name){
 if(typeof name!=='string'||!NAME.test(name)||name==='.'||name==='..'||name.startsWith('-')) throw new Error('Invalid repository name');
 return name;
}
function confined(base,name){
 const root=path.resolve(base), dest=path.resolve(root,name);
 if(dest===root||!dest.startsWith(root+path.sep)) throw new Error('Repository path escapes storage root');
 return dest;
}
function gitInitBare(dest){
 return new Promise((resolve,reject)=>{
  const child=spawn('git',['init','--bare','--initial-branch=main',dest],{shell:false,stdio:['ignore','pipe','pipe']});
  let out='',err=''; child.stdout.on('data',d=>out+=d); child.stderr.on('data',d=>err+=d);
  child.on('error',reject); child.on('close',code=>code===0?resolve(out+err):reject(new Error(err||'git init failed')));
 });
}
export async function createLocalBareRepository(baseDir,name){
 validateLocalRepoName(name);
 const dest=confined(baseDir,name+'.git');
 await mkdir(baseDir,{recursive:true});
 try { await access(dest); throw new Error('Repository already exists'); } catch(e){ if(e.message==='Repository already exists') throw e; }
 await gitInitBare(dest);
 return {name, path:dest, type:'bare', branch:'main', created:true};
}
export async function listLocalRepositories(baseDir){
 await mkdir(baseDir,{recursive:true});
 const {readdir}=await import('node:fs/promises');
 const entries=await readdir(baseDir,{withFileTypes:true});
 return entries.filter(e=>e.isDirectory()&&e.name.endsWith('.git')).map(e=>({name:e.name.slice(0,-4),path:path.join(path.resolve(baseDir),e.name),type:'bare'}));
}

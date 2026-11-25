/**
 * RiverKnowledge — local, explicit, user-approved knowledge store.
 * No ingestion from the network and no implicit learning.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

async function load(path) {
  try {
    const data=JSON.parse(await readFile(path,'utf8'));
    return Array.isArray(data) ? data : [];
  } catch(e) {
    if(e.code==='ENOENT') return [];
    throw e;
  }
}
export async function listKnowledge(path='./data/knowledge.json') { return load(path); }
export async function addKnowledge(item,path='./data/knowledge.json') {
  if(!item || typeof item.title!=='string' || typeof item.content!=='string' || !item.title.trim() || !item.content.trim()) throw new Error('Title and content required.');
  if(item.title.length>200 || item.content.length>10000) throw new Error('Knowledge item exceeds size limits.');
  const items=await load(path);
  const entry={id:crypto.randomUUID(),title:item.title.trim(),content:item.content.trim(),tags:Array.isArray(item.tags)?item.tags.filter(x=>typeof x==='string').slice(0,20):[],createdAt:new Date().toISOString(),source:'user-provided'};
  items.push(entry);
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,JSON.stringify(items,null,2),{mode:0o600});
  return entry;
}
export async function removeKnowledge(id,path='./data/knowledge.json') {
  const items=await load(path), filtered=items.filter(x=>x.id!==id);
  if(filtered.length===items.length) return false;
  await writeFile(path,JSON.stringify(filtered,null,2),{mode:0o600});
  return true;
}

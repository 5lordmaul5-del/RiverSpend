/**
 * I.S.S.A. Sphere Audio Intelligence — source selection and movement target model.
 * Takes supplied source analysis metadata; does NOT analyze audio itself.
 */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>Number.isFinite(Number(v));
const wrap=v=>((v+180)%360+360)%360-180;
export function normalizeSphereSource(input={}){
 const id=String(input.id??"").trim();if(!id)throw new Error("Source id is required");
 return {id,label:String(input.label??id).slice(0,120),
  azimuth:wrap(finite(input.azimuth)?Number(input.azimuth):0),
  elevation:clamp(finite(input.elevation)?Number(input.elevation):0,-90,90),
  activity:clamp(finite(input.activity)?Number(input.activity):0,0,1),
  priority:clamp(finite(input.priority)?Number(input.priority):0,0,100),
  confidence:clamp(finite(input.confidence)?Number(input.confidence):0,0,1),
  timestamp:finite(input.timestamp)?Number(input.timestamp):0,
  enabled:input.enabled!==false};
}
export function normalizeSphereIntelSettings(input={}){
 return {mode:["auto-follow","manual","scene-focus","ambient-scan"].includes(input.mode)?input.mode:"auto-follow",
  activityThreshold:clamp(finite(input.activityThreshold)?Number(input.activityThreshold):0.15,0,1),
  confidenceThreshold:clamp(finite(input.confidenceThreshold)?Number(input.confidenceThreshold):0.25,0,1),
  priorityBias:clamp(finite(input.priorityBias)?Number(input.priorityBias):0,0,1),
  holdMs:clamp(finite(input.holdMs)?Number(input.holdMs):800,0,10000),
  smoothing:clamp(finite(input.smoothing)?Number(input.smoothing):0.7,0,0.98),
  maxAngularSpeed:clamp(finite(input.maxAngularSpeed)?Number(input.maxAngularSpeed):50,1,180)};
}
export function rankSphereSources(sources=[],settings={}){
 if(!Array.isArray(sources))throw new TypeError("sources must be an array");
 const cfg=normalizeSphereIntelSettings(settings);
 const normalized=sources.map(normalizeSphereSource).filter(s=>s.enabled&&s.activity>=cfg.activityThreshold&&s.confidence>=cfg.confidenceThreshold);
 return normalized.map(s=>({...s,score:s.activity*(1-cfg.priorityBias)+s.priority/100*cfg.priorityBias}))
  .sort((a,b)=>b.score-a.score||b.timestamp-a.timestamp);
}
export function chooseSphereFocus(sources=[],settings={},previousFocusId=null){
 const cfg=normalizeSphereIntelSettings(settings),ranked=rankSphereSources(sources,cfg);
 if(!ranked.length)return {focus:null,ranked,reason:"no-source-passed-thresholds"};
 const winner=ranked[0];
 if(previousFocusId){const prev=ranked.find(s=>s.id===previousFocusId);
  if(prev&&prev.score>=winner.score-0.08)return {focus:prev,ranked,reason:"focus-stability-hold"};}
 return {focus:winner,ranked,reason:"highest-ranked-source"};
}
export function sphereTargetFromIntel(sources=[],settings={},previousFocusId=null){
 const selection=chooseSphereFocus(sources,settings,previousFocusId);
 if(!selection.focus)return {focusId:null,target:{azimuth:0,elevation:0,active:false},selection};
 const s=selection.focus;
 return {focusId:s.id,target:{azimuth:s.azimuth,elevation:s.elevation,activity:s.activity,active:true},selection};
}
export function createSphereIntelSnapshot(sources=[],settings={},previousFocusId=null){
 const cfg=normalizeSphereIntelSettings(settings),result=sphereTargetFromIntel(sources,cfg,previousFocusId);
 return {schemaVersion:1,engine:"ISSA_SPHERE_AUDIO_INTELLIGENCE",settings:cfg,
  focusId:result.focusId,target:result.target,reason:result.selection.reason,
  ranked:result.selection.ranked.map(s=>({id:s.id,score:s.score,activity:s.activity,confidence:s.confidence,priority:s.priority}))};
}

/**
 * I.S.S.A. Headphone 3D Spatial Engine — validated configuration/model.
 * Configuration groundwork only; no live binaural DSP or head tracking.
 */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const finite = (v) => Number.isFinite(Number(v));
export const ISSA_HEADPHONE_MODES = Object.freeze(["music","cinema","gaming","ambient","accessibility"]);
export const ISSA_RENDER_TARGETS = Object.freeze(["headphones","stereo-speakers"]);
export const ISSA_TRACKING_STATES = Object.freeze(["off","sensor-ready","active"]);
export function normalizeSpatialSource(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new Error("Spatial source requires a non-empty id");
  return { id, label: String(input.label ?? id).trim().slice(0,120),
    azimuth: clamp(finite(input.azimuth)?Number(input.azimuth):0,-180,180),
    elevation: clamp(finite(input.elevation)?Number(input.elevation):0,-90,90),
    distance: clamp(finite(input.distance)?Number(input.distance):1,0.1,100),
    gain: clamp(finite(input.gain)?Number(input.gain):1,0,2), enabled: input.enabled !== false };
}
export function createHeadphone3DConfig(input = {}) {
  const mode=ISSA_HEADPHONE_MODES.includes(input.mode)?input.mode:"music";
  const target=ISSA_RENDER_TARGETS.includes(input.target)?input.target:"headphones";
  const tracking=ISSA_TRACKING_STATES.includes(input.tracking)?input.tracking:"off";
  const sources=Array.isArray(input.sources)?input.sources.map(normalizeSpatialSource):[];
  const ids=new Set(); for(const s of sources){if(ids.has(s.id))throw new Error("Duplicate spatial source id: "+s.id);ids.add(s.id);}
  return {schemaVersion:1,engine:"ISSA_HEADPHONE_3D",mode,target,tracking,
    hrtfProfile:String(input.hrtfProfile??"generic").slice(0,80),
    room:{preset:String(input.room?.preset??"neutral").slice(0,80),
      wet:clamp(finite(input.room?.wet)?Number(input.room.wet):0,0,1),
      earlyReflections:clamp(finite(input.room?.earlyReflections)?Number(input.room.earlyReflections):0,0,1)},
    headTracking:{enabled:tracking!=="off"&&input.headTracking?.enabled===true,
      smoothing:clamp(finite(input.headTracking?.smoothing)?Number(input.headTracking.smoothing):0.5,0,1),status:tracking},
    masterGain:clamp(finite(input.masterGain)?Number(input.masterGain):1,0,1.5),sources};
}
export function spatialSourceVector(source) {
  const s=normalizeSpatialSource(source),az=s.azimuth*Math.PI/180,el=s.elevation*Math.PI/180;
  return {x:Math.sin(az)*Math.cos(el),y:Math.sin(el),z:-Math.cos(az)*Math.cos(el),distance:s.distance,gain:s.gain};
}
export function updateSpatialSource(config,sourceId,patch={}) {
  const current=createHeadphone3DConfig(config),index=current.sources.findIndex(s=>s.id===sourceId);
  if(index<0)throw new Error("Unknown spatial source: "+sourceId);
  current.sources[index]=normalizeSpatialSource({...current.sources[index],...patch,id:sourceId});
  return createHeadphone3DConfig(current);
}
export function setHeadTracking(config,tracking,options={}) {
  if(!ISSA_TRACKING_STATES.includes(tracking))throw new Error("Unsupported tracking state");
  const current=createHeadphone3DConfig(config);current.tracking=tracking;
  current.headTracking={enabled:tracking==="active"&&options.enabled===true,
    smoothing:clamp(finite(options.smoothing)?Number(options.smoothing):current.headTracking.smoothing,0,1),status:tracking};
  return createHeadphone3DConfig(current);
}

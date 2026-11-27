/**
 * I.S.S.A. Binaural Renderer Prototype — lightweight stereo spatialization math.
 * Not a true HRTF/convolution renderer. Produces basic ITD/ILD-inspired stereo
 * gains for mono sources; elevation/pinna cues and sensor integration are absent.
 */
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const finite=v=>Number.isFinite(Number(v));
export function normalizeBinauralInput(input={}){
 const az=clamp(finite(input.azimuth)?Number(input.azimuth):0,-180,180);
 const elevation=clamp(finite(input.elevation)?Number(input.elevation):0,-90,90);
 const distance=clamp(finite(input.distance)?Number(input.distance):1,0.1,100);
 const gain=clamp(finite(input.gain)?Number(input.gain):1,0,2);
 return {azimuth:az,elevation,distance,gain};
}
/** Approximate equal-power pan, with a mild far-ear attenuation cue. */
export function calculateStereoSpatialGains(input={}){
 const s=normalizeBinauralInput(input);
 const pan=Math.sin(s.azimuth*Math.PI/180);
 const angle=(pan+1)*Math.PI/4;
 const left=Math.cos(angle),right=Math.sin(angle);
 const side=Math.abs(pan),farAttenuation=1-0.18*side;
 const near=pan>=0?right:left,far=pan>=0?left:right;
 const distanceAttenuation=1/(1+0.12*(s.distance-1));
 const leftGain=(pan>0?left*farAttenuation:left)*s.gain*distanceAttenuation;
 const rightGain=(pan<0?right*farAttenuation:right)*s.gain*distanceAttenuation;
 return {left:clamp(leftGain,0,2),right:clamp(rightGain,0,2),pan,
  distanceAttenuation,farEarAttenuation:farAttenuation,
  note:"Stereo gain approximation only; no HRTF, elevation cues, convolution, or head tracking."};
}
export function calculateSourceBatch(sources=[]){
 if(!Array.isArray(sources))throw new TypeError("sources must be an array");
 return sources.map(s=>({id:String(s?.id??""),...calculateStereoSpatialGains(s)}));
}
export function describeRendererCapabilities(){
 return Object.freeze({name:"ISSA_BINAURAL_STEREO_PROTOTYPE",input:"mono sources",
  output:"stereo gain values",trueHrtf:false,convolution:false,headTracking:false,
  elevationCueing:false,hardwareRouting:false});
}

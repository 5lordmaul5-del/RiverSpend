/**
 * I.S.S.A. Spatial Engine — validated source positioning and virtual speaker map.
 * This model generates normalized metadata only; audio rendering/routing is not connected.
 */
export const SPEAKER_ROLE_VECTORS = Object.freeze({
 'Front L':[-1,0,0], 'Front R':[1,0,0], Center:[0,0,0],
 'Front Wide L':[-0.65,0,-0.15], 'Front Wide R':[0.65,0,-0.15],
 'Side L':[-1,0,-0.5], 'Side R':[1,0,-0.5],
 'Rear L':[-0.75,0,-1], 'Rear R':[0.75,0,-1], 'Rear Center':[0,0,-1],
 'Height Front L':[-0.5,1,0.3], 'Height Front R':[0.5,1,0.3],
 'Height Rear L':[-0.5,1,-0.8], 'Height Rear R':[0.5,1,-0.8],
});
export const DEFAULT_SPATIAL_SOURCE = Object.freeze({ azimuth:0, elevation:0, distance:1, gain:1 });
export function validateSpatialSource(input={}) {
 const errors=[];
 const azimuth=Number(input.azimuth??0), elevation=Number(input.elevation??0), distance=Number(input.distance??1), gain=Number(input.gain??1);
 if(!Number.isFinite(azimuth)||azimuth < -180||azimuth>180) errors.push('Azimuth must be -180 to 180 degrees.');
 if(!Number.isFinite(elevation)||elevation < -90||elevation>90) errors.push('Elevation must be -90 to 90 degrees.');
 if(!Number.isFinite(distance)||distance<0.1||distance>100) errors.push('Distance must be 0.1 to 100 virtual units.');
 if(!Number.isFinite(gain)||gain<0||gain>2) errors.push('Gain must be 0 to 2.');
 return {valid:errors.length===0,errors,source:{azimuth:Number.isFinite(azimuth)?Math.max(-180,Math.min(180,azimuth)):0,elevation:Number.isFinite(elevation)?Math.max(-90,Math.min(90,elevation)):0,distance:Number.isFinite(distance)?Math.max(.1,Math.min(100,distance)):1,gain:Number.isFinite(gain)?Math.max(0,Math.min(2,gain)):1}};
}
export function createSpatialSource(input={}) {const result=validateSpatialSource(input);if(!result.valid)throw new Error(result.errors.join(' '));return Object.freeze(result.source);}
export function directionToUnitVector({azimuth=0,elevation=0}={}) {
 const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;
 return Object.freeze([Math.sin(a)*Math.cos(e),Math.sin(e),-Math.cos(a)*Math.cos(e)]);
}
export function virtualRoleMap(roles=[]) { return roles.filter(role=>typeof role==='string').map(role=>({role,position:SPEAKER_ROLE_VECTORS[role]||null,virtualOnly:true})); }

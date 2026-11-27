/** I.S.S.A. height-layer model. Metadata/configuration only, not active audio routing. */
export const HEIGHT_ROLES=Object.freeze(['Height Front L','Height Front R','Height Rear L','Height Rear R']);
export const HEIGHT_PRESETS=Object.freeze({
 none:{label:'None',roles:[]},
 '2-height-front':{label:'2 Height Front',roles:['Height Front L','Height Front R']},
 '2-height-rear':{label:'2 Height Rear',roles:['Height Rear L','Height Rear R']},
 '4-height':{label:'4 Height',roles:[...HEIGHT_ROLES]},
});
export function validateHeightLayer(input={}) {
 const preset=String(input.preset??'4-height');
 if(!Object.hasOwn(HEIGHT_PRESETS,preset))return {valid:false,errors:['Unknown height preset.'],config:null};
 const elevation=Number(input.elevation??45), enabled=!!input.enabled;
 const errors=[];
 if(!Number.isFinite(elevation)||elevation<0||elevation>90)errors.push('Height elevation must be between 0 and 90 degrees.');
 const roles=HEIGHT_PRESETS[preset].roles.slice();
 const assignments=input.assignments&&typeof input.assignments==='object'&&!Array.isArray(input.assignments)?input.assignments:{};
 for(const role of roles) if(assignments[role]!==undefined && typeof assignments[role]!=='string')errors.push('Assignment values must be virtual output labels.');
 return {valid:errors.length===0,errors,config:{enabled,preset,elevation:Number.isFinite(elevation)?Math.max(0,Math.min(90,elevation)):45,roles,assignments}};
}
export function createHeightLayer(input={}){const r=validateHeightLayer(input);if(!r.valid)throw new Error(r.errors.join(' '));return Object.freeze({...r.config,roles:Object.freeze(r.config.roles),assignments:Object.freeze({...r.config.assignments})});}

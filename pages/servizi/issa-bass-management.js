/** I.S.S.A. bass-management configuration model (configuration only, not DSP routing). */
export const DEFAULT_BASS_MANAGEMENT = Object.freeze({ enabled:false, crossoverHz:80, slopeDbPerOctave:24, subCount:2, redirectBass:false, channelOverrides:{} });
export const CROSSOVER_RANGE_HZ = Object.freeze({ min:40, max:200 });
export function validateBassManagement(input={}) {
 const errors=[], crossoverHz=Number(input.crossoverHz??80), slope=Number(input.slopeDbPerOctave??24), subs=Number(input.subCount??2);
 if(!Number.isFinite(crossoverHz)||crossoverHz<40||crossoverHz>200) errors.push('Crossover must be between 40 and 200 Hz.');
 if(![12,18,24,36,48].includes(slope)) errors.push('Slope must be 12, 18, 24, 36, or 48 dB/octave.');
 if(![0,1,2,4].includes(subs)) errors.push('Subwoofer count must be 0, 1, 2, or 4.');
 const overrides=input.channelOverrides&&typeof input.channelOverrides==='object'&&!Array.isArray(input.channelOverrides)?input.channelOverrides:{};
 for(const [role,mode] of Object.entries(overrides)){if(!role.trim())errors.push('Speaker-role names must be non-empty.');if(!['full-range','redirect-to-sub','high-pass'].includes(mode))errors.push('Unsupported routing mode for '+role+'.');}
 return {valid:errors.length===0,errors,config:{enabled:!!input.enabled,crossoverHz:Number.isFinite(crossoverHz)?crossoverHz:80,slopeDbPerOctave:slope,subCount:subs,redirectBass:!!input.redirectBass,channelOverrides:overrides}};
}
export function createBassManagementConfig(input={}) { const result=validateBassManagement(input);if(!result.valid)throw new Error(result.errors.join(' '));return Object.freeze({...result.config,channelOverrides:Object.freeze({...result.config.channelOverrides})}); }

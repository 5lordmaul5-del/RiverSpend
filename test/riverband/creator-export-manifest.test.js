import test from 'node:test';import assert from 'node:assert/strict';import {buildExportManifest,validateShopHandoff} from '../../lib/riverband/creator-export-manifest.js';
test('manifest rejects missing metadata on assets',()=>assert.equal(buildExportManifest({assets:[{name:'x'}]}).ready,false));
test('manifest accepts a populated asset manifest',()=>assert.equal(buildExportManifest({assets:[{name:'mix.wav',format:'wav',sizeBytes:1234}]}).ready,true));
test('shop handoff requires rights and terms gates',()=>assert.equal(validateShopHandoff({assets:[{}]},{rightsConfirmed:true,territories:['IT'],deliveryTermsReviewed:true}).ready,true));
test('shop handoff reports incomplete gates',()=>assert.deepEqual(validateShopHandoff({assets:[]},{}).ready,false));

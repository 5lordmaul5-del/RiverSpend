import test from "node:test";
import assert from "node:assert/strict";
import {validateRepositoryName,repositoryManifest,riverGitStatus} from "../src/rivergit.js";
test("validates repository names",()=>{assert.equal(validateRepositoryName("RiverSpend"),true);assert.equal(validateRepositoryName("my_repo-1"),true);assert.equal(validateRepositoryName(""),false);assert.equal(validateRepositoryName("../x"),false);assert.equal(validateRepositoryName("x/y"),false);});
test("creates descriptive manifest only",()=>{const m=repositoryManifest("RiverSpend","test");assert.equal(m.backend,"git");assert.equal(m.initialized,false);assert.equal(m.creationEnabled,false);});
test("status does not falsely claim hosting",()=>{const s=riverGitStatus();assert.equal(s.hostingImplemented,false);assert.equal(s.authenticationImplemented,false);assert.equal(s.backupImplemented,false);});

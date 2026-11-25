import test from "node:test"; import assert from "node:assert/strict";
import {createAuditEnvelope,buildSignedDelivery} from "./rc14-audit-sink.mjs";
test("redacts sensitive keys in envelope",()=>{const e=createAuditEnvelope({type:"auth_denied",data:{password:"x",token:"y",reason:"bad"}},{sinkId:"s",actor:"user"});assert.equal(e.data.password,"[redacted]");assert.equal(e.data.token,"[redacted]");assert.equal(e.data.reason,"bad");});
test("rejects unknown event type",()=>assert.throws(()=>createAuditEnvelope({type:"arbitrary"},{sinkId:"s",actor:"u"})));
test("rejects HTTP endpoint",()=>assert.throws(()=>buildSignedDelivery({x:1},{endpoint:"http://example.com",secret:"a".repeat(32)})));
test("rejects short secret",()=>assert.throws(()=>buildSignedDelivery({x:1},{endpoint:"https://example.com",secret:"short"})));
test("creates delivery descriptor but no network",()=>{const d=buildSignedDelivery({schema:"v1"},{endpoint:"https://audit.example",secret:"s".repeat(32),now:1});assert.equal(d.method,"POST");assert.ok(d.headers["x-rivercloud-audit-signature"].startsWith("sha256="));});

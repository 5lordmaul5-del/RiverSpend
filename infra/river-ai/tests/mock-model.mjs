import http from "node:http";
const MODEL = process.env.RIVER_AI_LOCAL_MODEL || "test-model";
const DELAY_MS = Math.max(0, Number(process.env.RIVER_AI_MOCK_DELAY_MS || 0));
const server = http.createServer((req,res)=>{
  if(req.url==="/api/tags"){res.writeHead(200,{"content-type":"application/json"});return res.end(JSON.stringify({models:[{name:MODEL}]}));}
  if(req.url==="/v1/chat/completions" && req.method==="POST"){let body="";req.on("data",c=>body+=c);req.on("end",()=>{setTimeout(()=>{res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({choices:[{message:{content:"E2E mock result: "+JSON.parse(body).messages.at(-1).content}}]}));},DELAY_MS);});return;}
  res.writeHead(404);res.end();
});
server.listen(11434,"127.0.0.1");

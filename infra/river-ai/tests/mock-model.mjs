import http from "node:http";
const MODEL = process.env.RIVER_AI_LOCAL_MODEL || "test-model";
const server = http.createServer((req,res)=>{
  if(req.url==="/api/tags"){res.writeHead(200,{"content-type":"application/json"});return res.end(JSON.stringify({models:[{name:MODEL}]}));}
  if(req.url==="/v1/chat/completions" && req.method==="POST"){let body="";req.on("data",c=>body+=c);req.on("end",()=>{res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({choices:[{message:{content:"E2E mock result: "+JSON.parse(body).messages.at(-1).content}}]}));});return;}
  res.writeHead(404);res.end();
});
server.listen(11434,"127.0.0.1");

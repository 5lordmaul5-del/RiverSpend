import http from "node:http";

const host = process.env.RIVERSSAI_HOST || "127.0.0.1";
const port = Number(process.env.RIVERSSAI_PORT || 3030);
const configuredProvider = process.env.RIVERSSAI_PROVIDER || "none";

function status() {
  return {
    name: "RiverSSAI 10.0",
    version: "0.1.0",
    state: "starter-core",
    provider: configuredProvider,
    modelConnected: false,
    toolsEnabled: false,
    mode: "safe-readonly",
    note: "Nucleo iniziale: nessun modello o tool operativo collegato."
  };
}
function send(res, code, body) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
export function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== "GET") return send(res, 405, { error: "method-not-allowed" });
    if (req.url === "/health") return send(res, 200, { ok: true });
    if (req.url === "/status") return send(res, 200, status());
    return send(res, 404, { error: "not-found" });
  });
}
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  createServer().listen(port, host, () => console.log(`RiverSSAI core: http://${host}:${port}`));
}
#!/usr/bin/env bash
# One consolidated, destructive-action-free acceptance gate for RiverSSAI V1.
# It may download model weights on first startup; no data/volume deletion.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
ROOT="$(cd "$HERE/../.." && pwd)"
echo "== Gate 0: static configuration safety audit =="\n"$HERE/audit-riverssai-config.sh"\necho "== Gate A: tool policy unit assertions =="
node "$ROOT/lib/riverSSAI/testToolPolicy.mjs"
echo "== Gate B: startup and local model readiness =="
"$HERE/start-riverssai.sh"
echo "== Gate B2: endpoint authentication and bounded memory listing =="\n"$HERE/test-api-guards.sh"\necho "== Gate C: authenticated request-response and memory write =="
"$HERE/test-riverssai-request.sh"
echo "== Gate D: full-stack restart and durable memory recovery =="
"$HERE/test-full-recovery.sh"
echo "== ACCEPTANCE GATE PASSED =="

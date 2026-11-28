#!/usr/bin/env bash
# Consolidated destructive-action-free RiverSSAI V1 acceptance gate.
# May download model weights; does not delete volumes/data.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$HERE"
echo "== Gate 0: static configuration safety audit =="
"$HERE/audit-riverssai-config.sh"
echo "== Gate A: tool policy unit assertions =="
node "$ROOT/lib/riverSSAI/testToolPolicy.mjs"
echo "== Gate B: startup and local model readiness =="
"$HERE/start-riverssai.sh"
echo "== Gate B2: endpoint authentication and bounded memory listing =="
"$HERE/test-api-guards.sh"
echo "== Gate C: authenticated request-response and memory write =="
"$HERE/test-riverssai-request.sh"
echo "== Gate D: full-stack restart and durable memory recovery =="
"$HERE/test-full-recovery.sh"
echo "== ACCEPTANCE GATE PASSED =="

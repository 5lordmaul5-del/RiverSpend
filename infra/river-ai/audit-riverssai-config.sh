#!/usr/bin/env bash
# Static configuration safety audit; no services started and no credentials read.
set -Eeuo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
COMPOSE="$HERE/docker-compose.yml"
fail(){ echo "FAIL: $*" >&2; exit 1; }
pass(){ echo "PASS: $*"; }
[[ -f "$COMPOSE" ]] || fail "compose file missing"
grep -Fq '127.0.0.1:8787:8787' "$COMPOSE" || fail "API must be loopback-bound"
pass "API binding is loopback-only"
if grep -Eq '(^|[[:space:]])ports:.*11434|11434:11434' "$COMPOSE"; then fail "Ollama port must not be published"; fi
pass "Ollama port not published"
grep -Fq 'riverdb_data:/var/lib/postgresql/data' "$COMPOSE" || fail "database named volume missing"
grep -Fq 'ollama_models:/root/.ollama' "$COMPOSE" || fail "model named volume missing"
pass "persistent volumes configured"
grep -Fq 'internal: true' "$COMPOSE" || fail "private internal network missing"
pass "internal network declaration present"
grep -Fq 'RIVER_AI_ADMIN_TOKEN' "$COMPOSE" || fail "admin token wiring missing"
grep -Fq 'RIVERDB_PASSWORD' "$COMPOSE" || fail "database password wiring missing"
pass "secret variables referenced (values are not checked by this static audit)"
grep -Fq 'health' "$COMPOSE" || fail "healthcheck missing"
pass "service healthcheck declaration present"
echo "STATIC CONFIG AUDIT PASS"

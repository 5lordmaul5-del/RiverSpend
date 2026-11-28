#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
# RC-408 preflight: fail before running anything if a required suite is absent.
SUITES=(
  test_rc161_sandbox_supervisor.py
  test_rc161_supervised_http.py
  test_river_ssai_local_http.py
  test_river_ssai_jwt.py
  test_rc181_authenticated_intake.py
  test_rc181_payload_ledger.py
  test_rc183_integrated_worker.py
  test_rc180_contract_bridge.py
)
for suite in "${SUITES[@]}"; do
  if [[ ! -f "$suite" ]]; then
    echo "ERROR: required regression suite missing: $suite" >&2
    exit 2
  fi
done
echo "Preflight passed: all ${#SUITES[@]} required suites present."
for suite in "${SUITES[@]}"; do
  echo "== RC-408: $suite =="
  python3 -m unittest discover -s . -p "$suite"
done
echo "RC-408 integrated regression gate passed."

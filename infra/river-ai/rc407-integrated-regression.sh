#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
# RC-407 integration gate: fail immediately on any suite failure.
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
  echo "== RC-407: $suite =="
  python3 -m unittest discover -s . -p "$suite"
done
echo "RC-407 integrated regression gate passed."

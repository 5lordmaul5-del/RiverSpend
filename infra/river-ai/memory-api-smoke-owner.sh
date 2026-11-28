#!/usr/bin/env bash
set -Eeuo pipefail
BASE_URL="${RIVER_AI_BASE_URL:-http://127.0.0.1:8787}"
TOKEN="${RIVER_AI_ADMIN_TOKEN:-}"
[[ -n "$TOKEN" ]] || { echo "RIVER_AI_ADMIN_TOKEN required" >&2; exit 2; }
command -v curl >/dev/null; command -v jq >/dev/null
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
auth=(-H "Authorization: Bearer $TOKEN")
json=(-H "Content-Type: application/json")
# Authentication negative test.
status="$(curl -sS -o "$tmp/unauth" -w '%{http_code}' "$BASE_URL/v1/memories")"
[[ "$status" == 401 ]] || { echo "Expected unauthenticated 401, got $status" >&2; exit 1; }
# Validation checks must reject malformed import requests before inserting records.
for invalid in '{"memories":[]}' '{"memories":[{"title":"missing content"}]}' '{"memories":[{"content":"missing title"}]}'; do
  status="$(curl -sS "${auth[@]}" "${json[@]}" -o "$tmp/invalid" -w '%{http_code}' -X POST --data "$invalid" "$BASE_URL/v1/memories/import")"
  [[ "$status" == 400 ]] || { echo "Expected validation 400, got $status" >&2; exit 1; }
done
oversized="$(jq -n '{memories: [range(0;101) | {title:("test-" + tostring),content:"test"}]}')"
status="$(curl -sS "${auth[@]}" "${json[@]}" -o "$tmp/oversized" -w '%{http_code}' -X POST --data "$oversized" "$BASE_URL/v1/memories/import")"
[[ "$status" == 400 ]] || { echo "Expected >100 batch rejection 400, got $status" >&2; exit 1; }
# Import a uniquely named synthetic memory. It is explicitly test data.
tag="river-ai-smoke-$(date +%s)-$$"
payload="$(jq -n --arg title "$tag" --arg content "Disposable API smoke test record" '{memories:[{title:$title,content:$content,category:"smoke-test",source:"smoke-test"}]}')"
status="$(curl -sS "${auth[@]}" "${json[@]}" -o "$tmp/import" -w '%{http_code}' -X POST --data "$payload" "$BASE_URL/v1/memories/import")"
[[ "$status" == 201 ]] && jq -e '.imported==1' "$tmp/import" >/dev/null
# Verify it appears in list and export.
curl -sS "${auth[@]}" "$BASE_URL/v1/memories" > "$tmp/list"
id="$(jq -r --arg t "$tag" '.memories[] | select(.title==$t) | .id' "$tmp/list" | head -n1)"
[[ -n "$id" && "$id" != null ]] || { echo "Test record not found in memory list" >&2; exit 1; }
curl -sS "${auth[@]}" "$BASE_URL/v1/memories/export" > "$tmp/export"
jq -e --arg t "$tag" '.memories[] | select(.title==$t)' "$tmp/export" >/dev/null
# Remove only the exact synthetic record and confirm deletion.
status="$(curl -sS "${auth[@]}" -o "$tmp/delete" -w '%{http_code}' -X DELETE "$BASE_URL/v1/memories/$id")"
[[ "$status" == 200 ]] && jq -e '.deleted==true' "$tmp/delete" >/dev/null
echo "PASS: auth rejection, import validation (empty/missing/>100), synthetic import, list, export and cleanup."

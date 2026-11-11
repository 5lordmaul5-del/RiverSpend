#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${SUPABASE_DB_URL:?Set the Supabase database connection string as a GitHub secret}"
: "${SUPABASE_URL:?Set the Supabase project URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set the Storage backup service-role key as a GitHub secret}"
: "${BACKUP_AGE_RECIPIENT:?Set the age public recipient}"
: "${RUNNER_TEMP:?This script is intended to run in an ephemeral CI runner}"

for command in supabase age node git tar sha256sum; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "Required backup utility is missing: $command" >&2
    exit 1
  }
done

WORK_DIR="$(mktemp -d "$RUNNER_TEMP/river-backup-work.XXXXXX")"
ARCHIVE="$RUNNER_TEMP/river-backup.tar.gz"
ENCRYPTED_ARCHIVE="$RUNNER_TEMP/river-backup.tar.gz.age"
trap 'rm -rf "$WORK_DIR" "$ARCHIVE"' EXIT

mkdir -p "$WORK_DIR/database" "$WORK_DIR/repository"

echo "Exporting Supabase application roles, schema and data."
supabase db dump --db-url "$SUPABASE_DB_URL" --role-only -f "$WORK_DIR/database/roles.sql"
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$WORK_DIR/database/schema.sql"
supabase db dump --db-url "$SUPABASE_DB_URL" --use-copy --data-only -f "$WORK_DIR/database/data.sql"

for name in roles schema data; do
  age -r "$BACKUP_AGE_RECIPIENT" -o "$WORK_DIR/database/$name.sql.age" "$WORK_DIR/database/$name.sql"
  rm -f "$WORK_DIR/database/$name.sql"
done

echo "Exporting and encrypting Supabase Storage objects."
BACKUP_STORAGE_DIR="$WORK_DIR/storage" node scripts/backup/export-supabase-storage.mjs

echo "Creating encrypted Git repository bundle."
git bundle create "$WORK_DIR/repository/riverspend.bundle" --all
age -r "$BACKUP_AGE_RECIPIENT" -o "$WORK_DIR/repository/riverspend.bundle.age" "$WORK_DIR/repository/riverspend.bundle"
rm -f "$WORK_DIR/repository/riverspend.bundle"

cat > "$WORK_DIR/manifest.json" <<EOF
{
  "format": "river-spend-offsite-backup-v1",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "repository": "5lordmaul5-del/RiverSpend",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git branch --show-current)",
  "database": {
    "format": "Supabase CLI logical SQL dumps encrypted individually",
    "files": ["database/roles.sql.age", "database/schema.sql.age", "database/data.sql.age"],
    "note": "Supabase-managed auth and storage schemas are excluded by the CLI. Storage objects are exported separately. Auth users, Auth provider settings, Edge Function deployment settings and project secrets require a separate recovery procedure."
  },
  "storage": {
    "manifest": "storage/manifest.json.age",
    "objects": "Encrypted individually with age"
  },
  "repositoryBundle": "repository/riverspend.bundle.age"
}
EOF
age -r "$BACKUP_AGE_RECIPIENT" -o "$WORK_DIR/manifest.json.age" "$WORK_DIR/manifest.json"
rm -f "$WORK_DIR/manifest.json"

tar -czf "$ARCHIVE" -C "$WORK_DIR" .
age -r "$BACKUP_AGE_RECIPIENT" -o "$ENCRYPTED_ARCHIVE" "$ARCHIVE"
sha256sum "$ENCRYPTED_ARCHIVE" > "$ENCRYPTED_ARCHIVE.sha256"

echo "Encrypted backup bundle created. Plaintext working files will be removed on exit."

CREATE TABLE IF NOT EXISTS river_ai_memories (
  id BIGSERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL DEFAULT 'owner',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'note',
  source TEXT NOT NULL DEFAULT 'river-ai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS river_ai_memories_owner_created_idx
  ON river_ai_memories (owner_id, created_at DESC);
CREATE TABLE IF NOT EXISTS river_ai_audit (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS river_ai_audit_created_idx ON river_ai_audit (created_at DESC);

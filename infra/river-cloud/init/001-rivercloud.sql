\connect rivercloud

CREATE SCHEMA IF NOT EXISTS rivercloud;
REVOKE ALL ON SCHEMA rivercloud FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rivercloud_api') THEN
    CREATE ROLE rivercloud_api LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

\getenv api_password RIVER_CLOUD_API_DB_PASSWORD
SELECT format('ALTER ROLE rivercloud_api WITH PASSWORD %L', :'api_password') \gexec

CREATE TABLE IF NOT EXISTS rivercloud.user_profiles (
  user_id uuid PRIMARY KEY,
  display_name varchar(80) NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rivercloud.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rivercloud.user_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rivercloud_profile_select_own ON rivercloud.user_profiles;
CREATE POLICY rivercloud_profile_select_own
  ON rivercloud.user_profiles FOR SELECT TO rivercloud_api
  USING (user_id = nullif(current_setting('rivercloud.user_id', true), '')::uuid);

DROP POLICY IF EXISTS rivercloud_profile_insert_own ON rivercloud.user_profiles;
CREATE POLICY rivercloud_profile_insert_own
  ON rivercloud.user_profiles FOR INSERT TO rivercloud_api
  WITH CHECK (user_id = nullif(current_setting('rivercloud.user_id', true), '')::uuid);

DROP POLICY IF EXISTS rivercloud_profile_update_own ON rivercloud.user_profiles;
CREATE POLICY rivercloud_profile_update_own
  ON rivercloud.user_profiles FOR UPDATE TO rivercloud_api
  USING (user_id = nullif(current_setting('rivercloud.user_id', true), '')::uuid)
  WITH CHECK (user_id = nullif(current_setting('rivercloud.user_id', true), '')::uuid);

REVOKE ALL ON ALL TABLES IN SCHEMA rivercloud FROM PUBLIC;
GRANT USAGE ON SCHEMA rivercloud TO rivercloud_api;
GRANT SELECT, INSERT, UPDATE ON rivercloud.user_profiles TO rivercloud_api;

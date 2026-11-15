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

CREATE TABLE IF NOT EXISTS rivercloud.user_profiles (
  user_id uuid PRIMARY KEY,
  display_name varchar(80) NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON ALL TABLES IN SCHEMA rivercloud FROM PUBLIC;
GRANT USAGE ON SCHEMA rivercloud TO rivercloud_api;
GRANT SELECT, INSERT, UPDATE ON rivercloud.user_profiles TO rivercloud_api;

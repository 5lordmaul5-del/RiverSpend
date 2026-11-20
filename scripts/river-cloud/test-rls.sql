\set ON_ERROR_STOP on

SET ROLE rivercloud_api;

BEGIN;
SELECT set_config('rivercloud.user_id', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO rivercloud.user_profiles (user_id, display_name)
VALUES ('11111111-1111-4111-8111-111111111111', 'owner-one')
ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name;
COMMIT;

BEGIN;
SELECT set_config('rivercloud.user_id', '22222222-2222-4222-8222-222222222222', true);
DO $$
DECLARE
  visible_rows integer;
  changed_rows integer;
BEGIN
  SELECT count(*) INTO visible_rows
  FROM rivercloud.user_profiles
  WHERE user_id = '11111111-1111-4111-8111-111111111111';

  IF visible_rows <> 0 THEN
    RAISE EXCEPTION 'RLS violation: second user can read first user profile';
  END IF;

  UPDATE rivercloud.user_profiles
  SET display_name = 'unauthorized-change'
  WHERE user_id = '11111111-1111-4111-8111-111111111111';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;

  IF changed_rows <> 0 THEN
    RAISE EXCEPTION 'RLS violation: second user changed first user profile';
  END IF;
END
$$;
COMMIT;

RESET ROLE;

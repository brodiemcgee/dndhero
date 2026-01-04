-- Fix RLS helper functions to use correct column names
-- The column renames in 20251214000001 broke these functions

-- Fix is_campaign_member: parameter shadowing issue + column rename
-- The parameter 'user_id' was shadowing the column name, causing incorrect matches
CREATE OR REPLACE FUNCTION is_campaign_member(check_user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = camp_id
    AND user_id = check_user_id
    AND active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fix is_campaign_host: column was renamed from host_player_id to host_id
CREATE OR REPLACE FUNCTION is_campaign_host(check_user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaigns
    WHERE id = camp_id
    AND host_id = check_user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fix was_removed_from_campaign: same parameter shadowing issue
CREATE OR REPLACE FUNCTION was_removed_from_campaign(check_user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_removed_users
    WHERE campaign_id = camp_id
    AND user_id = check_user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fix is_banned: same parameter shadowing issue
CREATE OR REPLACE FUNCTION is_banned(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM bans
    WHERE user_id = check_user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER;

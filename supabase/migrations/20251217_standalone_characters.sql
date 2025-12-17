-- =====================================================
-- Standalone Characters - Complete Migration
-- Enable characters to exist independently of campaigns
-- =====================================================

-- 1. Add is_admin column to profiles if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create bans table if it doesn't exist (required for is_banned function)
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  banned_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bans_user ON bans(user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = user_id), false);
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_campaign_member(check_user_id UUID, camp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = camp_id
    AND user_id = check_user_id
    AND active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_banned(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM bans
    WHERE user_id = check_user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- CHARACTERS TABLE MODIFICATIONS
-- =====================================================

-- Drop the unique constraint
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_campaign_id_user_id_key;

-- Make campaign_id nullable
ALTER TABLE characters ALTER COLUMN campaign_id DROP NOT NULL;

-- Create new partial unique index (one character per user per campaign, when assigned)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_char_per_player_per_campaign
ON characters(campaign_id, user_id)
WHERE campaign_id IS NOT NULL;

-- Index for user's standalone characters
CREATE INDEX IF NOT EXISTS idx_characters_user_standalone
ON characters(user_id)
WHERE campaign_id IS NULL;

-- Index for all user's characters
CREATE INDEX IF NOT EXISTS idx_characters_user_all
ON characters(user_id);

-- =====================================================
-- RLS POLICIES FOR CHARACTERS
-- =====================================================

DROP POLICY IF EXISTS characters_select ON characters;
DROP POLICY IF EXISTS characters_insert ON characters;
DROP POLICY IF EXISTS characters_update ON characters;
DROP POLICY IF EXISTS characters_delete ON characters;

CREATE POLICY characters_select ON characters
  FOR SELECT USING (
    auth.uid() = user_id
    OR (campaign_id IS NOT NULL AND is_campaign_member(auth.uid(), campaign_id))
    OR is_admin(auth.uid())
  );

CREATE POLICY characters_insert ON characters
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND NOT is_banned(auth.uid())
    AND (
      campaign_id IS NULL
      OR is_campaign_member(auth.uid(), campaign_id)
    )
  );

CREATE POLICY characters_update ON characters
  FOR UPDATE USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
  );

CREATE POLICY characters_delete ON characters
  FOR DELETE USING (
    (auth.uid() = user_id AND campaign_id IS NULL)
    OR is_admin(auth.uid())
  );

-- =====================================================
-- CHARACTER LIMIT SETTINGS
-- =====================================================

INSERT INTO admin_settings (key, value, description)
VALUES
  ('free_tier_max_characters', '3', 'Maximum characters for free tier'),
  ('standard_tier_max_characters', '10', 'Maximum characters for standard tier'),
  ('premium_tier_max_characters', '-1', 'Maximum characters for premium (-1 = unlimited)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =====================================================
-- CHARACTER LIMIT FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION can_create_character(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT := 'free';
  max_chars INTEGER := 3;
  current_count INTEGER;
BEGIN
  -- Get tier from subscriptions if exists
  SELECT COALESCE(tier::TEXT, 'free') INTO user_tier
  FROM subscriptions
  WHERE user_id = check_user_id AND status = 'active'
  LIMIT 1;

  -- Get max from settings
  SELECT value::INTEGER INTO max_chars
  FROM admin_settings
  WHERE key = user_tier || '_tier_max_characters';

  IF max_chars IS NULL THEN max_chars := 3; END IF;
  IF max_chars = -1 THEN RETURN TRUE; END IF;

  SELECT COUNT(*) INTO current_count FROM characters WHERE user_id = check_user_id;
  RETURN current_count < max_chars;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_character_limits(check_user_id UUID)
RETURNS TABLE (current_count INTEGER, max_characters INTEGER, tier TEXT) AS $$
DECLARE
  user_tier TEXT := 'free';
  max_chars INTEGER := 3;
  char_count INTEGER;
BEGIN
  SELECT COALESCE(s.tier::TEXT, 'free') INTO user_tier
  FROM subscriptions s
  WHERE s.user_id = check_user_id AND s.status = 'active'
  LIMIT 1;

  SELECT value::INTEGER INTO max_chars
  FROM admin_settings
  WHERE key = user_tier || '_tier_max_characters';

  IF max_chars IS NULL THEN max_chars := 3; END IF;

  SELECT COUNT(*)::INTEGER INTO char_count FROM characters WHERE user_id = check_user_id;
  RETURN QUERY SELECT char_count, max_chars, user_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION can_create_character(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_character_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_campaign_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_banned(UUID) TO authenticated;

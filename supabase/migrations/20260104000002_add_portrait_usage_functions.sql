-- Migration: Add Portrait Usage Functions
-- Creates the missing functions and table for character portrait generation limits

-- =====================================================
-- PORTRAIT USAGE TABLE
-- Monthly quota tracking for character portrait generation
-- =====================================================

CREATE TABLE IF NOT EXISTS portrait_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,  -- '2025-01' format
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_portrait_usage_lookup ON portrait_usage(user_id, month_year);

-- RLS for portrait usage
ALTER TABLE portrait_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portrait usage"
  ON portrait_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage portrait usage"
  ON portrait_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PORTRAIT LIMIT SETTINGS
-- =====================================================

INSERT INTO admin_settings (key, value, description)
VALUES
  ('free_tier_portrait_limit', '5', 'Monthly portrait generations for free tier'),
  ('standard_tier_portrait_limit', '15', 'Monthly portrait generations for standard tier'),
  ('premium_tier_portrait_limit', '25', 'Monthly portrait generations for premium tier')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- CHECK PORTRAIT LIMIT FUNCTION
-- Returns whether user can generate a portrait and usage stats
-- =====================================================

-- Drop existing function if it has different signature
DROP FUNCTION IF EXISTS check_portrait_limit(UUID);

CREATE OR REPLACE FUNCTION check_portrait_limit(check_user_id UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  current_usage INTEGER,
  max_allowed INTEGER,
  remaining INTEGER,
  tier TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
) AS $$
DECLARE
  user_tier TEXT := 'free';
  max_portraits INTEGER := 5;
  current_count INTEGER := 0;
  current_month TEXT;
  month_start TIMESTAMPTZ;
  month_end TIMESTAMPTZ;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(NOW(), 'YYYY-MM');
  month_start := date_trunc('month', NOW());
  month_end := date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second';

  -- Get tier from subscriptions if exists
  SELECT COALESCE(s.tier::TEXT, 'free') INTO user_tier
  FROM subscriptions s
  WHERE s.user_id = check_user_id AND s.status = 'active'
  LIMIT 1;

  -- Get max from settings
  SELECT value::INTEGER INTO max_portraits
  FROM admin_settings
  WHERE key = user_tier || '_tier_portrait_limit';

  IF max_portraits IS NULL THEN max_portraits := 5; END IF;

  -- Get current usage for this month
  SELECT COALESCE(pu.usage_count, 0) INTO current_count
  FROM portrait_usage pu
  WHERE pu.user_id = check_user_id AND pu.month_year = current_month;

  -- Return results
  RETURN QUERY SELECT
    (max_portraits = -1 OR current_count < max_portraits) AS can_generate,
    current_count AS current_usage,
    max_portraits AS max_allowed,
    CASE WHEN max_portraits = -1 THEN -1 ELSE GREATEST(0, max_portraits - current_count) END AS remaining,
    user_tier AS tier,
    month_start AS period_start,
    month_end AS period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INCREMENT PORTRAIT USAGE FUNCTION
-- Atomically increments the usage counter
-- =====================================================

-- Drop existing function if it has different signature
DROP FUNCTION IF EXISTS increment_portrait_usage(UUID);

CREATE OR REPLACE FUNCTION increment_portrait_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_month TEXT;
  new_count INTEGER;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');

  -- Upsert the usage record
  INSERT INTO portrait_usage (user_id, month_year, usage_count, updated_at)
  VALUES (p_user_id, current_month, 1, NOW())
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    usage_count = portrait_usage.usage_count + 1,
    updated_at = NOW()
  RETURNING usage_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_portrait_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_portrait_usage(UUID) TO authenticated;

-- =====================================================
-- PORTRAITS STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portraits',
  'portraits',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portraits bucket
CREATE POLICY "Anyone can view portraits"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portraits');

CREATE POLICY "Users can upload own portraits"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portraits'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own portraits"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portraits'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own portraits"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portraits'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Service role full access to portraits"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'portraits'
    AND auth.jwt()->>'role' = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'portraits'
    AND auth.jwt()->>'role' = 'service_role'
  );

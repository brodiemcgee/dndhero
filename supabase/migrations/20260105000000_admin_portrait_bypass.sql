-- Migration: Admin bypass for portrait generation limits
-- Admins get unlimited portrait generations for testing

-- =====================================================
-- UPDATE CHECK PORTRAIT LIMIT FUNCTION
-- Now returns unlimited (-1) for admin users
-- =====================================================

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
  user_is_admin BOOLEAN := FALSE;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(NOW(), 'YYYY-MM');
  month_start := date_trunc('month', NOW());
  month_end := date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second';

  -- Check if user is admin (bypass all limits)
  SELECT COALESCE(p.is_admin, FALSE) INTO user_is_admin
  FROM profiles p
  WHERE p.id = check_user_id;

  IF user_is_admin THEN
    -- Admins get unlimited portraits
    RETURN QUERY SELECT
      TRUE AS can_generate,
      0 AS current_usage,
      -1 AS max_allowed,
      -1 AS remaining,
      'admin'::TEXT AS tier,
      month_start AS period_start,
      month_end AS period_end;
    RETURN;
  END IF;

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
-- SET BRODIE AS ADMIN
-- =====================================================

UPDATE profiles SET is_admin = TRUE WHERE username = 'brodie';

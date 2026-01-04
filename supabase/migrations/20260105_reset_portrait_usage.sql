-- Reset portrait usage for January 2026
-- This is a one-time reset to allow portrait generation

DELETE FROM portrait_usage WHERE month_year = '2026-01';

-- Also ensure the admin_settings has portrait limits
INSERT INTO admin_settings (key, value, description)
VALUES
  ('free_tier_portrait_limit', '10', 'Monthly portrait generations for free tier'),
  ('standard_tier_portrait_limit', '25', 'Monthly portrait generations for standard tier'),
  ('premium_tier_portrait_limit', '50', 'Monthly portrait generations for premium tier')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

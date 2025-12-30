-- Add level requirements to campaigns
-- This allows campaigns to specify a level range for participating characters

-- Add min_level and max_level columns with defaults
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS min_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_level INTEGER DEFAULT 20;

-- Add constraints to ensure valid level ranges
-- First drop if they exist (for idempotency)
DO $$ BEGIN
  ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_min_level_range;
  ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_max_level_range;
  ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_level_order;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_min_level_range CHECK (min_level >= 1 AND min_level <= 20),
  ADD CONSTRAINT campaigns_max_level_range CHECK (max_level >= 1 AND max_level <= 20),
  ADD CONSTRAINT campaigns_level_order CHECK (min_level <= max_level);

-- Create index for efficient filtering by level requirements
CREATE INDEX IF NOT EXISTS idx_campaigns_level_range ON campaigns(min_level, max_level);

-- Add comment for documentation
COMMENT ON COLUMN campaigns.min_level IS 'Minimum character level required to join this campaign (1-20)';
COMMENT ON COLUMN campaigns.max_level IS 'Maximum character level allowed to join this campaign (1-20)';

-- Fix Critical Database Schema Issues
-- Priority 1 fixes to unblock campaign creation

-- 1. Fix profiles table - add missing columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Make username unique
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles(username);

-- 2. Fix campaigns table - add missing columns and rename host_player_id
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS setting TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Check if host_player_id exists, if so rename to host_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'host_player_id'
  ) THEN
    ALTER TABLE campaigns RENAME COLUMN host_player_id TO host_id;
  END IF;
END $$;

-- 3. Fix campaign_members table - rename is_active to active
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_members' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE campaign_members RENAME COLUMN is_active TO active;
  END IF;
END $$;

-- 4. Fix characters table - rename player_id to user_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'player_id'
  ) THEN
    ALTER TABLE characters RENAME COLUMN player_id TO user_id;
  END IF;
END $$;

-- Add missing character columns
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS alignment TEXT,
  ADD COLUMN IF NOT EXISTS personality_traits TEXT[],
  ADD COLUMN IF NOT EXISTS ideals TEXT[],
  ADD COLUMN IF NOT EXISTS bonds TEXT[],
  ADD COLUMN IF NOT EXISTS flaws TEXT[],
  ADD COLUMN IF NOT EXISTS spellcasting_ability TEXT;

-- 5. Fix campaign_invites table - rename and add columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_invites' AND column_name = 'token_hash'
  ) THEN
    ALTER TABLE campaign_invites RENAME COLUMN token_hash TO token;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaign_invites' AND column_name = 'uses_count'
  ) THEN
    ALTER TABLE campaign_invites RENAME COLUMN uses_count TO uses;
  END IF;
END $$;

-- Add missing columns
ALTER TABLE campaign_invites
  ADD COLUMN IF NOT EXISTS code TEXT;

-- 6. Update campaign_state ENUM to include 'setup' and 'active'
DO $$
BEGIN
  -- Check if the ENUM type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_state') THEN
    -- Add new values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'setup' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'campaign_state')) THEN
      ALTER TYPE campaign_state ADD VALUE 'setup';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'active' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'campaign_state')) THEN
      ALTER TYPE campaign_state ADD VALUE 'active';
    END IF;
  END IF;
END $$;

-- 7. Fix campaign mode ENUM mismatch
-- Drop the constraint and recreate with correct values
DO $$
BEGIN
  -- Check if we need to update the campaign mode column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'mode'
  ) THEN
    -- First, remove any constraints
    ALTER TABLE campaigns ALTER COLUMN mode DROP DEFAULT;

    -- Change column to TEXT temporarily to avoid ENUM issues
    ALTER TABLE campaigns ALTER COLUMN mode TYPE TEXT;

    -- Recreate as the correct ENUM type if it exists, otherwise keep as TEXT with check constraint
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turn_contract_mode') THEN
      ALTER TABLE campaigns ALTER COLUMN mode TYPE turn_contract_mode USING mode::turn_contract_mode;
    ELSE
      -- Add check constraint for valid values
      ALTER TABLE campaigns ADD CONSTRAINT campaigns_mode_check
        CHECK (mode IN ('single_player', 'vote', 'first_response_wins', 'freeform'));
    END IF;
  END IF;
END $$;

-- 8. Add missing columns to scenes table
ALTER TABLE scenes
  ADD COLUMN IF NOT EXISTS environment TEXT,
  ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS current_state TEXT;

-- 9. Add missing columns to turn_contracts table
ALTER TABLE turn_contracts
  ADD COLUMN IF NOT EXISTS turn_number INTEGER,
  ADD COLUMN IF NOT EXISTS ai_task TEXT;

-- 10. Add missing columns to usage_counters table
ALTER TABLE usage_counters
  ADD COLUMN IF NOT EXISTS dm_turns_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_turns_used_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_jobs_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0;

-- 11. Add missing columns to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- 12. Create dice_roll_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS dice_roll_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id UUID REFERENCES turns(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  roll_type TEXT NOT NULL,
  dice_notation TEXT NOT NULL,
  result INTEGER NOT NULL,
  modifier INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  success BOOLEAN,
  critical_hit BOOLEAN DEFAULT false,
  critical_fail BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS dice_roll_results_turn_id_idx ON dice_roll_results(turn_id);
CREATE INDEX IF NOT EXISTS dice_roll_results_character_id_idx ON dice_roll_results(character_id);

-- 13. Create credit_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS credit_purchases_user_id_idx ON credit_purchases(user_id);

-- Enable RLS on new tables
ALTER TABLE dice_roll_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for dice_roll_results
CREATE POLICY "Users can view dice rolls from their campaigns"
  ON dice_roll_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM turns t
      JOIN campaign_members cm ON cm.campaign_id = t.campaign_id
      WHERE t.id = dice_roll_results.turn_id
      AND cm.user_id = auth.uid()
      AND cm.active = true
    )
  );

CREATE POLICY "Users can insert dice rolls for their characters"
  ON dice_roll_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = dice_roll_results.character_id
      AND c.user_id = auth.uid()
    )
  );

-- Add RLS policies for credit_purchases
CREATE POLICY "Users can view their own credit purchases"
  ON credit_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert credit purchases"
  ON credit_purchases FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE dice_roll_results IS 'Stores individual dice roll results for combat and skill checks';
COMMENT ON TABLE credit_purchases IS 'Stores one-time credit purchase history';

-- =====================================================
-- DnDHero Quick Deploy Script
-- Run this in Supabase SQL Editor
-- =====================================================

-- Extensions (already done)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
DO $$ BEGIN
  CREATE TYPE campaign_mode AS ENUM ('live', 'async');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_state AS ENUM ('setup', 'active', 'paused', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE turn_contract_mode AS ENUM ('single_player', 'vote', 'first_response_wins', 'freeform');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE turn_phase AS ENUM ('awaiting_input', 'awaiting_rolls', 'resolving', 'complete');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invite_type AS ENUM ('magic_link', 'code', 'email');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE input_classification AS ENUM ('authoritative', 'ambient');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT,
  tier TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage counters
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  campaigns_created_this_month INTEGER DEFAULT 0,
  ai_turns_used_this_month INTEGER DEFAULT 0,
  content_jobs_this_month INTEGER DEFAULT 0,
  credit_balance INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit purchases
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  price_paid NUMERIC(10,2),
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entitlements view
CREATE OR REPLACE VIEW entitlements AS
SELECT
  p.id AS user_id,
  COALESCE(s.tier, 'free') AS tier,
  CASE
    WHEN COALESCE(s.tier, 'free') = 'free' THEN 2
    ELSE -1
  END AS max_campaigns_per_month,
  CASE
    WHEN COALESCE(s.tier, 'free') = 'free' THEN 150
    WHEN s.tier = 'standard' THEN 500
    WHEN s.tier = 'premium' THEN 1500
    ELSE 150
  END AS max_ai_turns_per_month,
  CASE
    WHEN COALESCE(s.tier, 'free') = 'free' THEN 0
    WHEN s.tier = 'standard' THEN 10
    WHEN s.tier = 'premium' THEN 50
    ELSE 0
  END AS max_content_jobs_per_month
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active';

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  setting TEXT,
  description TEXT,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode turn_contract_mode NOT NULL DEFAULT 'freeform',
  state campaign_state NOT NULL DEFAULT 'setup',
  dm_config JSONB DEFAULT '{}'::jsonb,
  strict_mode BOOLEAN DEFAULT FALSE,
  art_style TEXT,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign members
CREATE TABLE IF NOT EXISTS campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player',
  active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user ON campaign_members(user_id);

-- Campaign invites
CREATE TABLE IF NOT EXISTS campaign_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  type invite_type NOT NULL,
  token TEXT,
  code TEXT,
  email TEXT,
  max_uses INTEGER DEFAULT 10,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign removed users
CREATE TABLE IF NOT EXISTS campaign_removed_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  removed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  removed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Characters
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  race TEXT,
  class TEXT,
  level INTEGER DEFAULT 1,
  background TEXT,

  -- Ability scores
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,
  charisma INTEGER DEFAULT 10,

  -- Stats
  max_hp INTEGER DEFAULT 10,
  current_hp INTEGER DEFAULT 10,
  temp_hp INTEGER DEFAULT 0,
  armor_class INTEGER DEFAULT 10,
  proficiency_bonus INTEGER DEFAULT 2,

  -- Proficiencies
  skill_proficiencies TEXT[] DEFAULT '{}',
  saving_throw_proficiencies TEXT[] DEFAULT '{}',

  -- Spellcasting
  spellcasting_ability TEXT,
  spell_slots JSONB DEFAULT '{}'::jsonb,
  known_spells TEXT[] DEFAULT '{}',

  -- Conditions
  conditions TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_characters_campaign ON characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);

-- Scenes
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  location TEXT,
  environment TEXT,
  state TEXT DEFAULT 'active',
  current_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenes_campaign ON scenes(campaign_id);

-- Entities (NPCs, Monsters)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  stat_block JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_campaign ON entities(campaign_id);

-- Entity state (per scene)
CREATE TABLE IF NOT EXISTS entity_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  current_hp INTEGER,
  max_hp INTEGER,
  temp_hp INTEGER DEFAULT 0,
  armor_class INTEGER,
  initiative INTEGER,
  conditions TEXT[] DEFAULT '{}',
  position_x NUMERIC,
  position_y NUMERIC,
  UNIQUE(entity_id, scene_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_state_entity ON entity_state(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_state_scene ON entity_state(scene_id);

-- Turn contracts
CREATE TABLE IF NOT EXISTS turn_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  turn_number INTEGER DEFAULT 1,
  phase turn_phase NOT NULL DEFAULT 'awaiting_input',
  state_version INTEGER DEFAULT 1,
  ai_task TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_turn_contracts_scene ON turn_contracts(scene_id);

-- Player inputs
CREATE TABLE IF NOT EXISTS player_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_contract_id UUID NOT NULL REFERENCES turn_contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  character_id UUID REFERENCES characters(id),
  content TEXT NOT NULL,
  classification input_classification,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_inputs_turn ON player_inputs(turn_contract_id);

-- Dice roll results
CREATE TABLE IF NOT EXISTS dice_roll_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  character_id UUID REFERENCES characters(id),
  notation TEXT NOT NULL,
  total INTEGER NOT NULL,
  rolls JSONB,
  breakdown TEXT,
  critical BOOLEAN DEFAULT FALSE,
  fumble BOOLEAN DEFAULT FALSE,
  advantage BOOLEAN DEFAULT FALSE,
  disadvantage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event log
CREATE TABLE IF NOT EXISTS event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB,
  player_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_log_scene ON event_log(scene_id);
CREATE INDEX IF NOT EXISTS idx_event_log_created ON event_log(created_at DESC);

-- AI turn history
CREATE TABLE IF NOT EXISTS ai_turn_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_contract_id UUID NOT NULL REFERENCES turn_contracts(id) ON DELETE CASCADE,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost NUMERIC(10,4),
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;
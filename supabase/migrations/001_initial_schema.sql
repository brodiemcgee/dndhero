-- =====================================================
-- DnDHero Initial Database Schema
-- Full D&D 5e Production System
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE campaign_mode AS ENUM ('live', 'async');
CREATE TYPE campaign_state AS ENUM ('lobby', 'playing', 'combat', 'paused', 'ended');
CREATE TYPE turn_contract_mode AS ENUM ('single_player', 'vote', 'first_response_wins', 'freeform');
CREATE TYPE turn_phase AS ENUM ('awaiting_input', 'awaiting_rolls', 'resolving', 'complete');
CREATE TYPE invite_type AS ENUM ('magic_link', 'code', 'email');
CREATE TYPE content_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE asset_type AS ENUM ('map', 'portrait', 'item', 'monster');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE subscription_tier AS ENUM ('free', 'paid');
CREATE TYPE entity_type AS ENUM ('pc', 'npc', 'monster');
CREATE TYPE input_classification AS ENUM ('authoritative', 'ambient');

-- =====================================================
-- AUTH & USERS
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  interests TEXT[],  -- Optional content preferences
  adult_content_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_asset_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL,  -- References assets table
  campaign_id UUID,  -- Optional: track which campaign it was seen in
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  times_seen INTEGER DEFAULT 1,
  UNIQUE(user_id, asset_id)
);

CREATE INDEX idx_user_asset_history_user ON user_asset_history(user_id);
CREATE INDEX idx_user_asset_history_asset ON user_asset_history(asset_id);
CREATE INDEX idx_user_asset_history_last_seen ON user_asset_history(last_seen_at);

-- =====================================================
-- CAMPAIGNS & ACCESS
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  host_player_id UUID NOT NULL REFERENCES profiles(id),
  mode campaign_mode NOT NULL DEFAULT 'live',
  state campaign_state NOT NULL DEFAULT 'lobby',
  state_version INTEGER NOT NULL DEFAULT 0,  -- Optimistic concurrency control

  -- DM Configuration (JSON)
  dm_config JSONB NOT NULL DEFAULT '{
    "strictness": 5,
    "leniency": 5,
    "tone": "balanced",
    "pacing": "medium",
    "difficulty": "medium",
    "descriptiveness": 7,
    "humor": 5
  }'::jsonb,

  art_style TEXT NOT NULL DEFAULT 'classic fantasy',
  strict_mode BOOLEAN DEFAULT TRUE,
  leniency_policy JSONB DEFAULT '{}'::jsonb,

  -- Age rating & content
  minor_safe_mode BOOLEAN DEFAULT TRUE,  -- Auto-enforced if any member under 18
  adult_content_enabled BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player',  -- 'host' or 'player'
  is_active BOOLEAN DEFAULT TRUE,  -- Currently active in this campaign
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_campaign_members_active ON campaign_members(is_active);

CREATE TABLE campaign_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  type invite_type NOT NULL,
  token_hash TEXT,  -- Hashed token for magic links and codes
  email TEXT,  -- For email invites
  max_uses INTEGER NOT NULL DEFAULT 5,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_invites_campaign ON campaign_invites(campaign_id);
CREATE INDEX idx_campaign_invites_token ON campaign_invites(token_hash);
CREATE INDEX idx_campaign_invites_expires ON campaign_invites(expires_at);

CREATE TABLE campaign_removed_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  removed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  removed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_removed_users_campaign ON campaign_removed_users(campaign_id);
CREATE INDEX idx_removed_users_user ON campaign_removed_users(user_id);

-- =====================================================
-- CHARACTERS
-- =====================================================

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  background TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER DEFAULT 0,

  -- Core stats (D&D 5e)
  strength INTEGER NOT NULL DEFAULT 10,
  dexterity INTEGER NOT NULL DEFAULT 10,
  constitution INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  wisdom INTEGER NOT NULL DEFAULT 10,
  charisma INTEGER NOT NULL DEFAULT 10,

  -- Derived stats
  max_hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL,
  temp_hp INTEGER DEFAULT 0,
  armor_class INTEGER DEFAULT 10,
  speed INTEGER DEFAULT 30,
  initiative_bonus INTEGER DEFAULT 0,
  proficiency_bonus INTEGER DEFAULT 2,

  -- Skills & proficiencies (JSON arrays)
  skill_proficiencies TEXT[] DEFAULT '{}',
  saving_throw_proficiencies TEXT[] DEFAULT '{}',
  tool_proficiencies TEXT[] DEFAULT '{}',
  language_proficiencies TEXT[] DEFAULT '{}',
  armor_proficiencies TEXT[] DEFAULT '{}',
  weapon_proficiencies TEXT[] DEFAULT '{}',

  -- Resources
  hit_dice JSONB DEFAULT '{}'::jsonb,  -- {d6: 3, d8: 0, etc}
  spell_slots JSONB DEFAULT '{}'::jsonb,  -- {1: {max: 2, used: 0}, etc}
  class_resources JSONB DEFAULT '{}'::jsonb,  -- Ki points, rage uses, etc

  -- Inventory & equipment
  inventory JSONB DEFAULT '[]'::jsonb,
  equipment JSONB DEFAULT '{}'::jsonb,  -- Equipped items
  gold INTEGER DEFAULT 0,

  -- Spells (for casters)
  cantrips TEXT[] DEFAULT '{}',
  known_spells TEXT[] DEFAULT '{}',
  prepared_spells TEXT[] DEFAULT '{}',

  -- Features & traits
  features JSONB DEFAULT '[]'::jsonb,
  traits JSONB DEFAULT '[]'::jsonb,

  -- Portrait
  portrait_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, player_id)  -- One character per player per campaign
);

CREATE INDEX idx_characters_campaign ON characters(campaign_id);
CREATE INDEX idx_characters_player ON characters(player_id);

CREATE TABLE character_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  class TEXT NOT NULL,

  -- Choices made at this level
  hp_gained INTEGER,
  feat_selected TEXT,
  asi_choices JSONB,  -- Ability score improvements
  spells_learned TEXT[],
  features_gained JSONB,

  leveled_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_character_progression_character ON character_progression(character_id);

-- =====================================================
-- GAME STATE
-- =====================================================

CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  state_version INTEGER NOT NULL DEFAULT 0,  -- For optimistic concurrency
  summary TEXT,  -- AI-generated scene summary
  objectives TEXT[],
  active_entities UUID[],  -- Array of entity IDs
  map_asset_id UUID,  -- Reference to assets table
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenes_campaign ON scenes(campaign_id);
CREATE INDEX idx_scenes_active ON scenes(is_active);

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id),  -- NULL for NPCs/monsters
  type entity_type NOT NULL,
  name TEXT NOT NULL,

  -- 5e stats (monsters/NPCs)
  stat_block JSONB,  -- Full 5e stat block for monsters/NPCs

  -- Portrait
  portrait_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entities_campaign ON entities(campaign_id);
CREATE INDEX idx_entities_character ON entities(character_id);

CREATE TABLE entity_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,

  -- Current state
  current_hp INTEGER,
  temp_hp INTEGER DEFAULT 0,
  conditions TEXT[] DEFAULT '{}',  -- blinded, charmed, etc
  concentrating_on TEXT,  -- Spell being concentrated on
  position JSONB,  -- Optional positional data {x, y} for grid

  -- Resources (updated during scene)
  spell_slots_used JSONB DEFAULT '{}'::jsonb,
  resources_used JSONB DEFAULT '{}'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, scene_id)
);

CREATE INDEX idx_entity_state_entity ON entity_state(entity_id);
CREATE INDEX idx_entity_state_scene ON entity_state(scene_id);

CREATE TABLE turn_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,

  -- Contract details
  mode turn_contract_mode NOT NULL,
  phase turn_phase NOT NULL DEFAULT 'awaiting_input',
  addressed_player_id UUID REFERENCES profiles(id),  -- NULL for group responses
  prompt TEXT NOT NULL,
  window_seconds INTEGER,  -- Timeout window
  required_responses INTEGER DEFAULT 1,

  -- State version this contract expects
  expected_state_version INTEGER NOT NULL,

  -- Responses collected
  responses_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Only one active turn contract per campaign
  UNIQUE(campaign_id, scene_id, phase) WHERE phase != 'complete'
);

CREATE INDEX idx_turn_contracts_campaign ON turn_contracts(campaign_id);
CREATE INDEX idx_turn_contracts_scene ON turn_contracts(scene_id);
CREATE INDEX idx_turn_contracts_phase ON turn_contracts(phase);

CREATE TABLE player_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_contract_id UUID NOT NULL REFERENCES turn_contracts(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id),
  character_id UUID REFERENCES characters(id),

  classification input_classification NOT NULL,  -- authoritative or ambient
  content TEXT NOT NULL,
  state_version INTEGER NOT NULL,  -- State version when input was submitted

  -- Voice-to-text metadata
  was_voice_input BOOLEAN DEFAULT FALSE,
  transcript_confidence REAL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_inputs_contract ON player_inputs(turn_contract_id);
CREATE INDEX idx_player_inputs_campaign ON player_inputs(campaign_id);
CREATE INDEX idx_player_inputs_player ON player_inputs(player_id);
CREATE INDEX idx_player_inputs_created ON player_inputs(created_at);

CREATE TABLE dice_roll_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_contract_id UUID NOT NULL REFERENCES turn_contracts(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id),  -- NULL for DM rolls
  character_id UUID REFERENCES characters(id),

  roll_type TEXT NOT NULL,  -- 'attack', 'save', 'check', 'damage', etc
  dice_notation TEXT NOT NULL,  -- '1d20+5', '8d6', etc
  modifiers JSONB DEFAULT '{}'::jsonb,
  advantage BOOLEAN DEFAULT FALSE,
  disadvantage BOOLEAN DEFAULT FALSE,

  -- Result (filled when rolled)
  result INTEGER,
  rolls JSONB,  -- Detailed roll breakdown

  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_dice_rolls_contract ON dice_roll_requests(turn_contract_id);
CREATE INDEX idx_dice_rolls_player ON dice_roll_requests(player_id);

CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  turn_contract_id UUID REFERENCES turn_contracts(id),

  event_type TEXT NOT NULL,  -- 'narration', 'action', 'roll', 'state_change', etc
  content TEXT NOT NULL,

  -- Related entities
  character_id UUID REFERENCES characters(id),
  player_id UUID REFERENCES profiles(id),

  -- Structured data
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_log_campaign ON event_log(campaign_id);
CREATE INDEX idx_event_log_scene ON event_log(scene_id);
CREATE INDEX idx_event_log_created ON event_log(created_at DESC);
CREATE INDEX idx_event_log_type ON event_log(event_type);

-- To be continued in next file (character limit reached)

-- =====================================================
-- Character Sheet Enhancements Migration
-- Adds missing D&D 5E character sheet fields
-- =====================================================

-- =====================================================
-- APPEARANCE FIELDS
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS build TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skin_tone TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hair_style TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS distinguishing_features TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS clothing_style TEXT;

-- =====================================================
-- PERSONALITY FIELDS (ensure they exist as TEXT)
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS alignment TEXT DEFAULT 'True Neutral';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS personality_traits TEXT[];
ALTER TABLE characters ADD COLUMN IF NOT EXISTS ideals TEXT[];
ALTER TABLE characters ADD COLUMN IF NOT EXISTS bonds TEXT[];
ALTER TABLE characters ADD COLUMN IF NOT EXISTS flaws TEXT[];

-- =====================================================
-- COMBAT & SURVIVAL FIELDS
-- =====================================================

-- Death saves tracking
ALTER TABLE characters ADD COLUMN IF NOT EXISTS death_save_successes INTEGER DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS death_save_failures INTEGER DEFAULT 0;

-- Hit dice tracking (remaining uses)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hit_dice_remaining INTEGER;

-- Passive perception (calculated from Wisdom + proficiency if proficient)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS passive_perception INTEGER DEFAULT 10;

-- Inspiration
ALTER TABLE characters ADD COLUMN IF NOT EXISTS inspiration BOOLEAN DEFAULT FALSE;

-- =====================================================
-- SPELLCASTING FIELDS
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS spellcasting_class TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spellcasting_ability TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spell_save_dc INTEGER;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spell_attack_bonus INTEGER;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spell_slots_used JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- BACKSTORY & NARRATIVE
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS backstory TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS allies_and_organizations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS treasure JSONB DEFAULT '[]'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS additional_features TEXT;

-- =====================================================
-- CURRENCY (detailed breakdown)
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS currency JSONB DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}'::jsonb;

-- =====================================================
-- ATTACKS TABLE
-- =====================================================

ALTER TABLE characters ADD COLUMN IF NOT EXISTS attacks JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- UPDATE FUNCTIONS FOR CALCULATED FIELDS
-- =====================================================

-- Function to calculate ability modifier
CREATE OR REPLACE FUNCTION calculate_modifier(score INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR((score - 10) / 2.0)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate passive perception
CREATE OR REPLACE FUNCTION calculate_passive_perception(
  wisdom_score INTEGER,
  proficiency_bonus INTEGER,
  is_proficient BOOLEAN
)
RETURNS INTEGER AS $$
BEGIN
  RETURN 10 + calculate_modifier(wisdom_score) +
    CASE WHEN is_proficient THEN proficiency_bonus ELSE 0 END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate spell save DC
CREATE OR REPLACE FUNCTION calculate_spell_save_dc(
  ability_score INTEGER,
  proficiency_bonus INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN 8 + calculate_modifier(ability_score) + proficiency_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate spell attack bonus
CREATE OR REPLACE FUNCTION calculate_spell_attack_bonus(
  ability_score INTEGER,
  proficiency_bonus INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN calculate_modifier(ability_score) + proficiency_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_modifier(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_passive_perception(INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_spell_save_dc(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_spell_attack_bonus(INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- SET DEFAULT HIT DICE REMAINING = LEVEL
-- =====================================================

-- Update existing characters to have hit_dice_remaining = level if not set
UPDATE characters
SET hit_dice_remaining = level
WHERE hit_dice_remaining IS NULL;

-- Set default for new characters
ALTER TABLE characters ALTER COLUMN hit_dice_remaining SET DEFAULT 1;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN characters.currency IS 'Currency breakdown: {cp, sp, ep, gp, pp}';
COMMENT ON COLUMN characters.attacks IS 'Array of attack objects: [{name, attack_bonus, damage, damage_type}]';
COMMENT ON COLUMN characters.allies_and_organizations IS 'Array of ally objects: [{name, description, symbol_url}]';
COMMENT ON COLUMN characters.treasure IS 'Array of treasure items separate from equipment';
COMMENT ON COLUMN characters.spell_slots_used IS 'Tracks used spell slots: {1: 0, 2: 1, ...}';
COMMENT ON COLUMN characters.death_save_successes IS 'Death save successes (0-3)';
COMMENT ON COLUMN characters.death_save_failures IS 'Death save failures (0-3)';

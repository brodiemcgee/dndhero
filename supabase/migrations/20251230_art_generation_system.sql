-- Migration: Art Generation System
-- Adds scene images, entity portrait tracking, and artwork library for caching/reuse

-- =============================================
-- SCENE IMAGES TABLE
-- Stores generated scene artwork
-- =============================================

CREATE TABLE IF NOT EXISTS scene_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Image data
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  location_name TEXT NOT NULL,
  mood TEXT,
  art_style TEXT NOT NULL,

  -- Generation status
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,

  -- Display tracking
  is_current BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scene images
CREATE INDEX IF NOT EXISTS idx_scene_images_scene ON scene_images(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_images_campaign ON scene_images(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scene_images_current ON scene_images(is_current) WHERE is_current = TRUE;

-- Add current_scene_image_id to scenes table for quick lookup
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS current_scene_image_id UUID REFERENCES scene_images(id);

-- =============================================
-- ENTITY PORTRAIT COLUMNS
-- Add portrait tracking to entities table
-- =============================================

ALTER TABLE entities ADD COLUMN IF NOT EXISTS portrait_url TEXT;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS portrait_asset_id UUID REFERENCES assets(id);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS portrait_generation_status TEXT
  CHECK (portrait_generation_status IN ('pending', 'generating', 'completed', 'failed'));

-- =============================================
-- ARTWORK LIBRARY TABLE
-- Global cache of generated artwork for reuse
-- =============================================

CREATE TABLE IF NOT EXISTS artwork_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Image data
  image_url TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('npc_portrait', 'monster_portrait', 'scene', 'location')),
  art_style TEXT NOT NULL,

  -- Rich tagging for matching
  tags JSONB NOT NULL DEFAULT '[]',
  creature_type TEXT,          -- "humanoid", "beast", "dragon", etc.
  creature_subtype TEXT,       -- "elf", "orc", "wolf", etc.
  environment_type TEXT,       -- "forest", "dungeon", "tavern", etc.
  mood TEXT,                   -- "tense", "peaceful", "mysterious"

  -- Original generation data
  original_prompt TEXT NOT NULL,
  original_description TEXT,

  -- Full-text search
  description_vector tsvector,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes for fast artwork matching
CREATE INDEX IF NOT EXISTS idx_artwork_library_tags ON artwork_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_artwork_library_type ON artwork_library(asset_type, art_style);
CREATE INDEX IF NOT EXISTS idx_artwork_library_creature ON artwork_library(creature_type, creature_subtype);
CREATE INDEX IF NOT EXISTS idx_artwork_library_env ON artwork_library(environment_type, mood);
CREATE INDEX IF NOT EXISTS idx_artwork_library_search ON artwork_library USING gin(description_vector);

-- Function to update description vector on insert/update
CREATE OR REPLACE FUNCTION update_artwork_description_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.description_vector := to_tsvector('english', COALESCE(NEW.original_description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update description vector
DROP TRIGGER IF EXISTS artwork_description_vector_trigger ON artwork_library;
CREATE TRIGGER artwork_description_vector_trigger
  BEFORE INSERT OR UPDATE OF original_description ON artwork_library
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_description_vector();

-- =============================================
-- SCENE ART USAGE TRACKING
-- Monthly quota tracking for scene art generation
-- =============================================

CREATE TABLE IF NOT EXISTS scene_art_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  month_year TEXT NOT NULL,  -- '2025-01' format
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, campaign_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_scene_art_usage_lookup ON scene_art_usage(user_id, campaign_id, month_year);

-- =============================================
-- NPC PORTRAIT USAGE TRACKING
-- Monthly quota tracking for NPC portrait generation
-- =============================================

CREATE TABLE IF NOT EXISTS npc_portrait_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  month_year TEXT NOT NULL,  -- '2025-01' format
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, campaign_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_npc_portrait_usage_lookup ON npc_portrait_usage(user_id, campaign_id, month_year);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Scene images: Users can view if they're in the campaign
ALTER TABLE scene_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scene images in their campaigns"
  ON scene_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_players cp
      WHERE cp.campaign_id = scene_images.campaign_id
      AND cp.player_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage scene images"
  ON scene_images FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Artwork library: Everyone can read, only service role can write
ALTER TABLE artwork_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artwork library"
  ON artwork_library FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage artwork library"
  ON artwork_library FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Scene art usage: Users can view their own usage
ALTER TABLE scene_art_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scene art usage"
  ON scene_art_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage scene art usage"
  ON scene_art_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- NPC portrait usage: Users can view their own usage
ALTER TABLE npc_portrait_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own npc portrait usage"
  ON npc_portrait_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage npc portrait usage"
  ON npc_portrait_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

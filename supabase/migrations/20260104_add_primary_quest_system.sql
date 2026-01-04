-- Primary Quest System
-- Adds support for auto-generated primary quests with revelation mechanics and pacing

-- Add quest type and revelation tracking to quests table
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS quest_type TEXT DEFAULT 'side' CHECK (quest_type IN ('primary', 'side')),
  ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_turns INTEGER,
  ADD COLUMN IF NOT EXISTS turn_started INTEGER,
  ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  ADD COLUMN IF NOT EXISTS hidden_title TEXT,
  ADD COLUMN IF NOT EXISTS hidden_description TEXT,
  ADD COLUMN IF NOT EXISTS revelation_hook TEXT;

-- Ensure only one active primary quest per campaign
CREATE UNIQUE INDEX IF NOT EXISTS idx_quests_primary_per_campaign
  ON quests(campaign_id)
  WHERE quest_type = 'primary' AND status = 'active';

-- Index for efficient quest type filtering
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_quests_revealed ON quests(is_revealed);

-- Add turn counter to campaigns for tracking progression
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS current_turn INTEGER DEFAULT 0;

-- Function to increment campaign turn counter
CREATE OR REPLACE FUNCTION increment_campaign_turn()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment on DM messages (not player messages)
  IF NEW.sender_type = 'dm' THEN
    UPDATE campaigns
    SET current_turn = COALESCE(current_turn, 0) + 1
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to increment turn on DM messages
DROP TRIGGER IF EXISTS chat_messages_increment_turn ON chat_messages;
CREATE TRIGGER chat_messages_increment_turn
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_campaign_turn();

-- Comments for documentation
COMMENT ON COLUMN quests.quest_type IS 'Type of quest: primary (main story) or side (optional)';
COMMENT ON COLUMN quests.is_revealed IS 'Whether quest details are visible to players (false = shows as ???)';
COMMENT ON COLUMN quests.revealed_at IS 'Timestamp when quest was revealed to players';
COMMENT ON COLUMN quests.hidden_title IS 'Full title stored before revelation';
COMMENT ON COLUMN quests.hidden_description IS 'Full description stored before revelation';
COMMENT ON COLUMN quests.revelation_hook IS 'Hint for AI DM on how to reveal the quest';
COMMENT ON COLUMN quests.estimated_turns IS 'Expected number of turns to complete (20-30 for primary)';
COMMENT ON COLUMN quests.turn_started IS 'Turn number when quest was revealed/started';
COMMENT ON COLUMN quests.progress_percentage IS 'AI-estimated completion progress (0-100)';
COMMENT ON COLUMN campaigns.current_turn IS 'Total DM turns/responses in this campaign';

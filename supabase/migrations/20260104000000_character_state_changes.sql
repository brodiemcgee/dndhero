-- Character State Changes Table
-- Tracks all AI DM modifications to character state for undo functionality

CREATE TABLE IF NOT EXISTS character_state_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  dm_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_character_state_changes_character ON character_state_changes(character_id);
CREATE INDEX idx_character_state_changes_campaign ON character_state_changes(campaign_id);
CREATE INDEX idx_character_state_changes_created ON character_state_changes(created_at DESC);
CREATE INDEX idx_character_state_changes_not_reversed ON character_state_changes(character_id, is_reversed) WHERE is_reversed = FALSE;

-- Enable RLS
ALTER TABLE character_state_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Campaign members can view changes for characters in their campaigns
CREATE POLICY "Campaign members can view character changes"
  ON character_state_changes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_members.campaign_id = character_state_changes.campaign_id
        AND campaign_members.user_id = auth.uid()
        AND campaign_members.active = TRUE
    )
  );

-- Only hosts can undo changes (update is_reversed)
CREATE POLICY "Campaign hosts can undo changes"
  ON character_state_changes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_members.campaign_id = character_state_changes.campaign_id
        AND campaign_members.user_id = auth.uid()
        AND campaign_members.role = 'host'
        AND campaign_members.active = TRUE
    )
  );

-- Service role can insert (from AI DM processing)
CREATE POLICY "Service role can insert changes"
  ON character_state_changes
  FOR INSERT
  WITH CHECK (TRUE);

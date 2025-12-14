-- Add missing equipment column to characters table
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN characters.equipment IS 'Equipped items';

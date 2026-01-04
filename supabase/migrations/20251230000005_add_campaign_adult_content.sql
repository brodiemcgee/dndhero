-- Add adult content setting to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS adult_content_enabled BOOLEAN DEFAULT FALSE;

-- Add auto-play preference for TTS narration
-- When enabled, DM messages will automatically play audio when generated
ALTER TABLE profiles ADD COLUMN tts_auto_play BOOLEAN DEFAULT false;

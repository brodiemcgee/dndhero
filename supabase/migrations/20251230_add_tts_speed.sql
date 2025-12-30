-- Add speed preference for TTS playback
-- Default 1.0x, range 0.5x to 1.5x
ALTER TABLE profiles ADD COLUMN tts_speed DECIMAL(2,1) DEFAULT 1.0;

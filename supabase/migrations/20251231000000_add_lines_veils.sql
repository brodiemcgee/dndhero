-- Add Lines and Veils safety settings to profiles
-- Lines = hard limits (content never appears)
-- Veils = soft limits (content handled off-screen/fade-to-black)

-- Add lines_veils column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lines_veils JSONB DEFAULT '{
  "topics": {},
  "custom_lines": [],
  "custom_veils": []
}'::jsonb;

-- Create GIN index for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_profiles_lines_veils ON profiles USING GIN(lines_veils);

-- Add comment explaining the structure
COMMENT ON COLUMN profiles.lines_veils IS 'Lines and Veils safety settings. Structure:
{
  "topics": {
    "topic_id": "line" | "veil" | "ok"  -- User setting for predefined topics
  },
  "custom_lines": ["custom topic 1", ...],  -- User-defined hard limits (max 20)
  "custom_veils": ["custom topic 2", ...]   -- User-defined soft limits (max 20)
}

Predefined topic IDs:
- graphic_violence: Detailed gore, dismemberment, extreme violence
- harm_to_children: Violence or danger directed at minors
- sexual_assault: Non-consensual sexual content
- torture: Scenes depicting torture or prolonged suffering
- suicide_self_harm: References to or depictions of self-harm or suicide
';

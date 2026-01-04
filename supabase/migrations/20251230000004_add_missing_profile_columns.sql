-- Add missing columns to profiles table

-- Name field for display name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Birthdate for age verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate DATE;

-- Interests array for content preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Adult content opt-in flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adult_content_opt_in BOOLEAN DEFAULT FALSE;

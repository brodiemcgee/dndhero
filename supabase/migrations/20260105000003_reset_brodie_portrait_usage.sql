-- Reset portrait usage for brodie and ensure admin flag is set

-- First ensure brodie is admin
UPDATE profiles SET is_admin = TRUE WHERE LOWER(username) = 'brodie';

-- Delete their portrait usage records to reset the count
DELETE FROM portrait_usage
WHERE user_id IN (SELECT id FROM profiles WHERE LOWER(username) = 'brodie');

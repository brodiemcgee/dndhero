-- Fix: Set brodie as admin with case-insensitive matching
UPDATE profiles SET is_admin = TRUE WHERE LOWER(username) = 'brodie';

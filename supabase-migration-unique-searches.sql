-- Migration: Add unique constraint to searches.channel_id to prevent duplicates
-- Run this in Supabase SQL Editor if you already have an existing searches table

-- Step 1: Remove duplicate entries, keeping only the most recent one for each channel_id
DELETE FROM searches a
USING searches b
WHERE a.id < b.id
  AND a.channel_id = b.channel_id;

-- Step 2: Add unique constraint to channel_id column
ALTER TABLE searches
ADD CONSTRAINT searches_channel_id_unique UNIQUE (channel_id);

-- Success message
SELECT 'Migration completed! Duplicates removed and unique constraint added.' AS status;

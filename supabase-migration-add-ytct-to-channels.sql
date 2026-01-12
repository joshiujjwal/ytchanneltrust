-- Migration: Add YTCT score columns to channels table for comprehensive storage
-- Run this in Supabase SQL Editor

BEGIN;

-- Add new columns to channels table
ALTER TABLE channels
ADD COLUMN IF NOT EXISTS ytct_score NUMERIC(3, 1),
ADD COLUMN IF NOT EXISTS ytct_rating TEXT,
ADD COLUMN IF NOT EXISTS ytct_components JSONB;

-- Add index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_channels_ytct_score ON channels(ytct_score DESC);

-- Success message
SELECT 'Migration completed: Added YTCT score columns to channels table' AS status;

COMMIT;

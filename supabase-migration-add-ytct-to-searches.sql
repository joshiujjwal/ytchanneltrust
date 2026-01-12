-- Migration: Add YTCT score and metrics to searches table for sortable display
-- Run this in Supabase SQL Editor

BEGIN;

-- Add new columns to searches table
ALTER TABLE searches
ADD COLUMN IF NOT EXISTS ytct_score NUMERIC(3, 1),
ADD COLUMN IF NOT EXISTS ytct_rating TEXT,
ADD COLUMN IF NOT EXISTS subscriber_count BIGINT,
ADD COLUMN IF NOT EXISTS video_count INTEGER;

-- Add indexes for efficient sorting
CREATE INDEX IF NOT EXISTS idx_searches_ytct_score ON searches(ytct_score DESC);
CREATE INDEX IF NOT EXISTS idx_searches_subscriber_count ON searches(subscriber_count DESC);

-- Success message
SELECT 'Migration completed: Added YTCT score columns to searches table' AS status;

COMMIT;

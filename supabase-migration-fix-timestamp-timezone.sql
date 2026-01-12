-- Migration: Fix timestamp column to use timezone-aware timestamps
-- This fixes the "4 hours ago" issue by properly storing timestamps with timezone info

BEGIN;

-- Convert timestamp column to TIMESTAMPTZ (timestamp with timezone)
ALTER TABLE searches
ALTER COLUMN timestamp TYPE TIMESTAMPTZ USING timestamp AT TIME ZONE 'UTC';

-- Set default to NOW() which will use UTC
ALTER TABLE searches
ALTER COLUMN timestamp SET DEFAULT NOW();

-- Success message
SELECT 'Migration completed! Timestamp column now uses timezone-aware timestamps (TIMESTAMPTZ).' AS status;

COMMIT;

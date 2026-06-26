-- Migration: Add editorial and ai_analysis
-- Date: 2026-06-25

ALTER TABLE problems ADD COLUMN IF NOT EXISTS editorial TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS is_editorial_visible BOOLEAN DEFAULT true;

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

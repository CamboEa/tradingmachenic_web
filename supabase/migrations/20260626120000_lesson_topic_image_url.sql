-- Add cover image support to lesson topics
ALTER TABLE lesson_topics ADD COLUMN IF NOT EXISTS image_url TEXT;

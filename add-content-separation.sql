-- Add new columns to articles table for content separation
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS image_urls JSONB;

-- Update existing articles to populate new fields
UPDATE articles 
SET 
  text_content = regexp_replace(content, '<img[^>]*>', '', 'g'),
  image_urls = (
    SELECT json_agg(match[1])
    FROM regexp_matches(content, '<img[^>]+src="([^"]+)"[^>]*>', 'g') AS match
  )
WHERE text_content IS NULL OR image_urls IS NULL;
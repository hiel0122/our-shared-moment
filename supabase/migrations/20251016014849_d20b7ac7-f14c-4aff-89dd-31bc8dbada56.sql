-- Add likes_count column to media_assets table
ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Update existing rows to have 0 likes
UPDATE public.media_assets 
SET likes_count = 0 
WHERE likes_count IS NULL;
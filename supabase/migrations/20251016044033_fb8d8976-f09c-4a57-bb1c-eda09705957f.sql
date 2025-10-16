-- Create media_likes table for tracking individual likes
CREATE TABLE IF NOT EXISTS public.media_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  actor_id text NOT NULL, -- userId for authenticated users, visitorId for anonymous
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(media_id, actor_id)
);

-- Enable RLS
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Media likes viewable by everyone"
ON public.media_likes
FOR SELECT
USING (true);

-- Anyone can insert their own likes
CREATE POLICY "Anyone can like media"
ON public.media_likes
FOR INSERT
WITH CHECK (true);

-- Users can delete their own likes
CREATE POLICY "Users can unlike media"
ON public.media_likes
FOR DELETE
USING (true);

-- Enable realtime for media_likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_likes;

-- Enable realtime for media_assets (for like count updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_assets;
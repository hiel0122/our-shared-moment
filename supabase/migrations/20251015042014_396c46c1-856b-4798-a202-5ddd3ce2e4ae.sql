-- Create comments table for media assets
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id uuid REFERENCES public.media_assets(id) ON DELETE CASCADE,
  writer text NOT NULL,
  password_hash text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Comments viewable by everyone"
ON public.comments
FOR SELECT
USING (true);

-- Anyone can insert comments
CREATE POLICY "Anyone can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (true);

-- Only admins can delete comments
CREATE POLICY "Only admins can delete comments"
ON public.comments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_comments_media_id ON public.comments(media_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
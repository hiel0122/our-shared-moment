-- Add author_role to media_assets
DO $$ BEGIN
  CREATE TYPE public.author_role AS ENUM ('bride', 'groom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS author_role public.author_role DEFAULT 'bride';

-- Update existing media_assets to have bride role
UPDATE public.media_assets 
SET author_role = 'bride' 
WHERE author_role IS NULL;

-- Make author_role NOT NULL
ALTER TABLE public.media_assets 
ALTER COLUMN author_role SET NOT NULL;

-- Add commenter_id to comments for anonymous user tracking
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS commenter_id text;

-- Make password_hash nullable (comments without password)
ALTER TABLE public.comments 
ALTER COLUMN password_hash DROP NOT NULL;

-- Update RLS policy for comment deletion (user can delete own comments)
DROP POLICY IF EXISTS "Only admins can delete comments" ON public.comments;

CREATE POLICY "Users can delete own comments or admins can delete all"
ON public.comments
FOR DELETE
USING (
  commenter_id = current_setting('request.headers', true)::json->>'x-commenter-id'
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Update handle_new_user function to support new admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Guest'),
    CASE
      WHEN NEW.email IN ('sinrang@sinrang.com', 'sinboo@sinboo.com') THEN 'admin'::public.app_role
      ELSE 'guest'::public.app_role
    END
  );
  RETURN NEW;
END;
$function$;
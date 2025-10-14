-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'guest');

-- Create enum for message target
CREATE TYPE public.message_target AS ENUM ('groom', 'bride');

-- Create enum for media type
CREATE TYPE public.media_type AS ENUM ('video', 'image', 'text');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'guest',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create invitation table
CREATE TABLE public.invitation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_groom TEXT NOT NULL DEFAULT '김철수',
  couple_bride TEXT NOT NULL DEFAULT '이영희',
  wedding_at TIMESTAMPTZ NOT NULL DEFAULT '2026-12-05 14:00:00+09',
  hero_line1 TEXT NOT NULL DEFAULT '우리, 마주서다.',
  hero_line2 TEXT NOT NULL DEFAULT '2026년 12월 5일, 우리가 마주보는 시간',
  hero_line3 TEXT NOT NULL DEFAULT '6년의 만남, 그리고 새로운 시작',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create media_assets table
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.media_type NOT NULL,
  url TEXT,
  content TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create venue table
CREATE TABLE public.venue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '웨딩홀',
  address TEXT NOT NULL DEFAULT '서울시 강남구',
  lat NUMERIC NOT NULL DEFAULT 37.4979,
  lng NUMERIC NOT NULL DEFAULT 127.0276,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  target public.message_target NOT NULL,
  writer TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for messages
CREATE INDEX idx_messages_target_created ON public.messages(target, created_at DESC);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for invitation
CREATE POLICY "Invitation viewable by everyone"
  ON public.invitation FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update invitation"
  ON public.invitation FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for media_assets
CREATE POLICY "Media assets viewable by everyone"
  ON public.media_assets FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage media assets"
  ON public.media_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for venue
CREATE POLICY "Venue viewable by everyone"
  ON public.venue FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update venue"
  ON public.venue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for messages
CREATE POLICY "Messages viewable by everyone"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can delete messages"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default data
INSERT INTO public.invitation (id) VALUES (gen_random_uuid());
INSERT INTO public.venue (id) VALUES (gen_random_uuid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitation_updated_at
  BEFORE UPDATE ON public.invitation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Guest'),
    CASE
      WHEN NEW.email = 'admin@admin.com' THEN 'admin'::public.app_role
      ELSE 'guest'::public.app_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
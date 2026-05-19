
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SUBSCRIBERS
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscribers viewable by owner" ON public.subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Subscribers insertable by owner" ON public.subscribers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Subscribers updatable by owner" ON public.subscribers FOR UPDATE USING (auth.uid() = user_id);

-- VIDEO PROGRESS
CREATE TABLE public.video_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  progress_seconds NUMERIC NOT NULL DEFAULT 0,
  total_duration_seconds NUMERIC NOT NULL DEFAULT 0,
  title TEXT,
  thumbnail_url TEXT,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Video progress viewable by owner" ON public.video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Video progress insertable by owner" ON public.video_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Video progress updatable by owner" ON public.video_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Video progress deletable by owner" ON public.video_progress FOR DELETE USING (auth.uid() = user_id);

-- WATCHLISTS
CREATE TABLE public.watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('video','article')),
  title TEXT,
  thumbnail_url TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id, item_type)
);
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Watchlists viewable by owner" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Watchlists insertable by owner" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Watchlists updatable by owner" ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Watchlists deletable by owner" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

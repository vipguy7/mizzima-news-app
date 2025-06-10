
-- Create video_progress table to track user's video watching progress
CREATE TABLE public.video_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  thumbnail_url TEXT,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Create watchlists table to store user's saved videos and articles
CREATE TABLE public.watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('video', 'article')),
  title TEXT,
  thumbnail_url TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- Enable Row Level Security
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_progress
CREATE POLICY "Users can view their own video progress" ON public.video_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress" ON public.video_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" ON public.video_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video progress" ON public.video_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for watchlists
CREATE POLICY "Users can view their own watchlist" ON public.watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist" ON public.watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist" ON public.watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist" ON public.watchlists
  FOR DELETE USING (auth.uid() = user_id);

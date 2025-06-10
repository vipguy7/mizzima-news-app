
import { supabase } from './client';

export interface VideoProgress {
  id?: number;
  user_id: string;
  video_id: string;
  progress_seconds: number;
  total_duration_seconds: number;
  title?: string;
  thumbnail_url?: string;
  last_watched_at?: string;
  created_at?: string;
}

export interface NewVideoProgress {
  video_id: string;
  progress_seconds: number;
  total_duration_seconds: number;
  title?: string;
  thumbnail_url?: string;
}

/**
 * Saves or updates video progress for the current user.
 * Uses upsert on (user_id, video_id). Updates last_watched_at automatically.
 */
export const saveVideoProgress = async (item: NewVideoProgress): Promise<VideoProgress | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('saveVideoProgress: No user logged in.');
    throw new Error('User must be logged in to save video progress.');
  }

  const progressEntry = {
    user_id: user.id,
    video_id: item.video_id,
    progress_seconds: item.progress_seconds,
    total_duration_seconds: item.total_duration_seconds,
    title: item.title,
    thumbnail_url: item.thumbnail_url,
    last_watched_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('video_progress')
    .upsert(progressEntry, { onConflict: 'user_id, video_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving video progress:', error);
    throw error;
  }
  return data;
};

/**
 * Fetches progress for a specific video for the current user.
 */
export const getVideoProgress = async (video_id: string): Promise<VideoProgress | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('video_id', video_id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching progress for video ${video_id}:`, error);
    return null;
  }
  return data;
};

/**
 * Fetches a list of videos the user has made progress on, ordered by last_watched_at DESC.
 */
export const getContinueWatchingList = async (limit: number = 5): Promise<VideoProgress[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('getContinueWatchingList: No user logged in.');
    return [];
  }

  const { data, error } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('last_watched_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching continue watching list:', error);
    throw error;
  }
  return data || [];
};

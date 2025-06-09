import { supabase } from './client';

export interface VideoProgress {
  id?: number;
  user_id: string;
  video_id: string;
  progress_seconds: number;
  total_duration_seconds: number;
  last_watched_at?: string;
}

export interface NewVideoProgress {
  video_id: string;
  progress_seconds: number;
  total_duration_seconds: number;
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

  const progressEntry: Omit<VideoProgress, 'id' | 'last_watched_at'> & { last_watched_at?: string } = {
    user_id: user.id,
    video_id: item.video_id,
    progress_seconds: item.progress_seconds,
    total_duration_seconds: item.total_duration_seconds,
    last_watched_at: new Date().toISOString(), // Explicitly set for upsert
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
    // console.log('getVideoProgress: No user logged in.');
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
    // Don't throw, just return null as progress might not exist
    return null;
  }
  return data;
};

/**
 * Fetches a list of videos the user has made progress on, ordered by last_watched_at DESC.
 * This version will just return progress data. We'd need video metadata separately.
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

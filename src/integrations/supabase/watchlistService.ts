
import { supabase } from './client';

export interface WatchlistItem {
  id?: number;
  user_id: string;
  item_id: string;
  item_type: 'video' | 'article';
  title?: string;
  thumbnail_url?: string;
  source_url?: string;
  created_at?: string;
}

export interface NewWatchlistItem {
  item_id: string;
  item_type: 'video' | 'article';
  title?: string;
  thumbnail_url?: string;
  source_url?: string;
}

/**
 * Fetches all watchlist items for the currently authenticated user.
 */
export const getWatchlistItems = async (): Promise<WatchlistItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('getWatchlistItems: No user logged in.');
    return [];
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching watchlist items:', error);
    throw error;
  }
  return data || [];
};

/**
 * Adds an item to the current user's watchlist.
 */
export const addToWatchlist = async (item: NewWatchlistItem): Promise<WatchlistItem | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('addToWatchlist: No user logged in.');
    throw new Error('User must be logged in to add items to watchlist.');
  }

  const newItem = {
    user_id: user.id,
    item_id: item.item_id,
    item_type: item.item_type,
    title: item.title,
    thumbnail_url: item.thumbnail_url,
    source_url: item.source_url,
  };

  const { data, error } = await supabase
    .from('watchlists')
    .insert([newItem])
    .select()
    .single();

  if (error) {
    console.error('Error adding to watchlist:', error);
    if (error.code === '23505') {
      console.warn('Item already in watchlist.');
      const existingItems = await getWatchlistItem(item.item_id, item.item_type);
      return existingItems;
    }
    throw error;
  }
  return data;
};

/**
 * Removes an item from the current user's watchlist.
 */
export const removeFromWatchlist = async (item_id: string, item_type: 'video' | 'article'): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('removeFromWatchlist: No user logged in.');
    throw new Error('User must be logged in to remove items from watchlist.');
  }

  const { error } = await supabase
    .from('watchlists')
    .delete()
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .eq('item_type', item_type);

  if (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
  console.log(`Item ${item_id} (${item_type}) removed from watchlist.`);
};

/**
 * Checks if a specific item is in the current user's watchlist.
 * Returns the watchlist item if found, otherwise null.
 */
export const getWatchlistItem = async (item_id: string, item_type: 'video' | 'article'): Promise<WatchlistItem | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .eq('item_type', item_type)
    .maybeSingle();

  if (error) {
    console.error('Error checking watchlist item:', error);
    return null;
  }
  return data;
};

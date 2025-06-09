import { supabase } from './client';
import { AuthUser } from './types'; // Assuming AuthUser might be defined here or useAuth hook provides it

export interface WatchlistItem {
  id?: number; // Supabase ID, optional for new items
  user_id: string;
  item_id: string; // e.g., YouTube video ID or NewsArticle URL/ID
  item_type: 'video' | 'article';
  title?: string;
  thumbnail_url?: string;
  source_url?: string; // Link to the original video or article page
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

  const newItem: Omit<WatchlistItem, 'id' | 'created_at'> = {
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
    .single(); // Assuming you want the inserted item back and it's just one

  if (error) {
    console.error('Error adding to watchlist:', error);
    // Handle potential unique constraint violation gracefully (item already exists)
    if (error.code === '23505') { // Unique violation
      console.warn('Item already in watchlist.');
      // Optionally, fetch and return the existing item
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
    // console.log('isItemInWatchlist: No user logged in.');
    return null;
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .eq('item_type', item_type)
    .maybeSingle(); // Returns one row or null, doesn't error if not found

  if (error) {
    console.error('Error checking watchlist item:', error);
    // Don't throw, just return null as item is not confirmed to be in watchlist
    return null;
  }
  return data;
};

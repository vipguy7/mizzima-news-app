
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react'; // Added Bookmark icons and Loader
import { useAuth } from '@/hooks/useAuth';
import {
  WatchlistItem,
  NewWatchlistItem,
  // getWatchlistItems, // Not used directly here
  addToWatchlist,
  removeFromWatchlist,
  getWatchlistItem
} from '@/integrations/supabase/watchlistService';
import {
  VideoProgress, // For type hint
  getVideoProgress,
  // saveVideoProgress, // Not saving progress from here in this subtask
} from '@/integrations/supabase/videoProgressService';
import { useToast } from '@/hooks/use-toast';


interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string; // Made optional
  publishedAt: string;
  viewCount?: string; // Already optional
}

interface YouTubePlayerProps {
  playlistId: string; // Keep for default playlist loading
  title: string;
  maxResults?: number;
  externalVideoId?: string | null; // New prop to play a specific video
  externalStartSeconds?: number;   // New prop for starting time
  onVideoSelect?: (videoId: string) => void; // Optional: To notify parent about internal selection
}

const YouTubePlayer = ({
  playlistId,
  title,
  maxResults = 5,
  externalVideoId = null,
  externalStartSeconds = 0,
  onVideoSelect
}: YouTubePlayerProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [watchlistStatus, setWatchlistStatus] = useState<Map<string, WatchlistItem | null>>(new Map());
  const [itemLoading, setItemLoading] = useState<Record<string, boolean>>({});
  const [videoStartSeconds, setVideoStartSeconds] = useState(0); // For continue watching

  const VITE_YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  // Fetch video data from playlist
  useEffect(() => {
    // Only fetch playlist if no external video is initially provided
    if (externalVideoId) {
      setSelectedVideoId(externalVideoId);
      setVideoStartSeconds(externalStartSeconds);
      setApiLoading(false); // No playlist to load
      setVideos([]); // Clear any playlist videos
      return;
    }

    if (!VITE_YOUTUBE_API_KEY) {
      setError('YouTube API key is missing. Please set VITE_YOUTUBE_API_KEY environment variable.');
      setApiLoading(false);
      return;
    }
    if (!playlistId) {
      setError('YouTube Playlist ID is missing for default playback.');
      setApiLoading(false);
      return;
    }

    const fetchVideos = async () => {
      setApiLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${VITE_YOUTUBE_API_KEY}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error('YouTube API Error:', errorData);
          throw new Error(
            errorData.error?.message || `Failed to fetch playlist data (status: ${response.status})`
          );
        }
        const data = await response.json();

        if (!data.items) {
          console.warn('No items found in playlist:', data);
          setVideos([]);
          setApiLoading(false);
          return;
        }

        const fetchedVideos: YouTubeVideo[] = data.items
          .map((item: any) => {
            if (!item.snippet?.resourceId?.videoId || !item.snippet?.thumbnails) {
              console.warn('Skipping item due to missing videoId or thumbnails:', item);
              return null;
            }
            return {
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || 'https://via.placeholder.com/120x90.png?text=No+Thumbnail',
              publishedAt: item.snippet.publishedAt || item.contentDetails?.videoPublishedAt, // Fallback to contentDetails if snippet.publishedAt is missing
              // duration and viewCount are omitted as per requirements
            };
          })
          .filter((video: YouTubeVideo | null): video is YouTubeVideo => video !== null); // Filter out nulls

        setVideos(fetchedVideos);
      } catch (err: any) {
        console.error('Error fetching YouTube videos:', err);
        setError(err.message || 'An unknown error occurred while fetching videos.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchVideos();
  }, [playlistId, maxResults, VITE_YOUTUBE_API_KEY, externalVideoId]); // Re-run if externalVideoId changes and was initially null

  // Effect to handle external video ID changes
  useEffect(() => {
    if (externalVideoId) {
      setSelectedVideoId(externalVideoId);
      setVideoStartSeconds(externalStartSeconds);
       // If externalVideoId is set, we might not need playlist videos,
      // or we might want to load them in background. For now, it prioritizes external.
      // Consider if playlist videos should still be shown or fetched.
      // For simplicity here, if externalVideoId is provided, playlist is ignored.
      // If you want to show playlist AND play external, more logic is needed.
      setVideos([]); // Clear playlist videos if an external one is forced
      setApiLoading(false); // Assume we don't need to load playlist
    }
    // If externalVideoId becomes null, the playlist fetch effect should take over if playlistId is present.
  }, [externalVideoId, externalStartSeconds]);

  // Effect to fetch watchlist status for all loaded videos
  useEffect(() => {
    if (user && videos.length > 0) {
      const newStatusMap = new Map<string, WatchlistItem | null>();
      const promises = videos.map(video =>
        getWatchlistItem(video.id, 'video').then(item => {
          newStatusMap.set(video.id, item);
        }).catch(err => {
          console.error(`Failed to get watchlist status for ${video.id}:`, err);
          newStatusMap.set(video.id, null); // Assume not in watchlist on error
        })
      );
      Promise.all(promises).then(() => {
        setWatchlistStatus(new Map(newStatusMap)); // Create new map instance to trigger re-render
      });
    } else if (!user) {
      setWatchlistStatus(new Map()); // Clear status if user logs out
    }
  }, [videos, user]);

  // Effect to fetch video progress when a video is selected (either internal or external)
  useEffect(() => {
    if (selectedVideoId && user) {
      getVideoProgress(selectedVideoId)
        .then(progress => {
          // Only set start seconds if it's not an externally forced start time
          // or if the external start time is 0 (meaning, try to use saved progress)
          if (!externalVideoId || (externalVideoId === selectedVideoId && externalStartSeconds === 0)) {
            if (progress && progress.progress_seconds > 0) {
              setVideoStartSeconds(Math.round(progress.progress_seconds));
            } else {
              setVideoStartSeconds(0);
            }
          } else if (externalVideoId === selectedVideoId) {
             setVideoStartSeconds(externalStartSeconds); // respect external start time
          } else {
            setVideoStartSeconds(0); // Default for other cases
          }
        })
        .catch(err => {
          console.error(`Error fetching progress for ${selectedVideoId}:`, err);
          setVideoStartSeconds(externalVideoId === selectedVideoId ? externalStartSeconds : 0);
        });
    } else if (selectedVideoId && externalVideoId === selectedVideoId) {
      // No user, but external start time is provided
      setVideoStartSeconds(externalStartSeconds);
    }
     else {
      setVideoStartSeconds(0);
    }
  }, [selectedVideoId, user, externalVideoId, externalStartSeconds]);

  const handleInternalVideoSelect = (video: YouTubeVideo) => {
    setVideoStartSeconds(0); // Reset start time before fetching progress for new video
    setSelectedVideoId(video.id);
    if (onVideoSelect) {
      onVideoSelect(video.id);
    }
  };

  const handleToggleWatchlist = async (video: YouTubeVideo) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to manage your watchlist.", variant: "destructive" });
      return;
    }

    setItemLoading(prev => ({ ...prev, [video.id]: true }));
    const existingItem = watchlistStatus.get(video.id);

    try {
      if (existingItem) {
        await removeFromWatchlist(video.id, 'video');
        setWatchlistStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(video.id, null);
          return newMap;
        });
        toast({ title: "Removed from Watchlist", description: `"${video.title}" removed.` });
      } else {
        const newItemData: NewWatchlistItem = {
          item_id: video.id,
          item_type: 'video',
          title: video.title,
          thumbnail_url: video.thumbnail,
          source_url: `https://www.youtube.com/watch?v=${video.id}`,
        };
        const addedItem = await addToWatchlist(newItemData);
        setWatchlistStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(video.id, addedItem);
          return newMap;
        });
        toast({ title: "Added to Watchlist", description: `"${video.title}" added.` });
      }
    } catch (error: any) {
      console.error("Failed to update watchlist:", error);
      toast({ title: "Error", description: error.message || "Could not update watchlist.", variant: "destructive" });
    } finally {
      setItemLoading(prev => ({ ...prev, [video.id]: false }));
    }
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return ''; // Handle optional duration
    return duration;
  };

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const selectedVideoDetails = selectedVideoId ? videos.find(v => v.id === selectedVideoId) : null;
  const iframeSrc = selectedVideoId
    ? `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1${videoStartSeconds > 0 ? `&start=${videoStartSeconds}` : ''}`
    : "";

  if (apiLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(maxResults)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-16 w-28 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Badge variant="outline">YouTube</Badge>
          </div>
          <div className="text-destructive text-center py-4">
            <p>Error: {error}</p>
            {error.includes("API key") && <p>Please ensure the VITE_YOUTUBE_API_KEY is correctly configured.</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0 && !apiLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Badge variant="outline">YouTube</Badge>
          </div>
          <p className="text-muted-foreground text-center py-4">No videos found in this playlist or the playlist is empty.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="outline">YouTube</Badge>
        </div>

        {selectedVideoId && (
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                key={selectedVideoId} // Force re-render of iframe when videoId changes, so `start` param applies
                width="100%"
                height="100%"
                src={iframeSrc}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* The stray </div> that was here has been removed. */}
          {user && selectedVideoDetails && (
            <div className="flex justify-center mb-2"> {/* Centering the button */}
              <Button
                onClick={() => handleToggleWatchlist(selectedVideoDetails)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={authLoading || itemLoading[selectedVideoDetails.id]}
                >
                  {itemLoading[selectedVideoDetails.id] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : watchlistStatus.get(selectedVideoDetails.id) ? (
                    <BookmarkCheck className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                  )}
                  {watchlistStatus.get(selectedVideoDetails.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
            </div>
          )}
          {/* This is the correct start of the video list mapping */}
          {videos.slice(0, maxResults).map((video) => (
            <div key={video.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <div
                  className="relative flex-shrink-0 w-28 h-16 rounded overflow-hidden cursor-pointer"
                  onClick={() => handleInternalVideoSelect(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium text-foreground line-clamp-2 text-sm cursor-pointer"
                    onClick={() => handleInternalVideoSelect(video)}
                  >
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatPublishedDate(video.publishedAt)}
                      </span>
                      {video.viewCount && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {video.viewCount} views
                          </span>
                        </>
                      )}
                    </div>
                    {user && (
                      <Button
                        onClick={() => handleToggleWatchlist(video)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        disabled={authLoading || itemLoading[video.id]}
                        title={watchlistStatus.get(video.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        {itemLoading[video.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : watchlistStatus.get(video.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <BookmarkPlus className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Videos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;

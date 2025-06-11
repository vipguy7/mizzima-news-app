
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, BookmarkPlus, BookmarkCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  WatchlistItem,
  NewWatchlistItem,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlistItem
} from '@/integrations/supabase/watchlistService';
import {
  getVideoProgress,
} from '@/integrations/supabase/videoProgressService';
import { useToast } from '@/hooks/use-toast';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  publishedAt: string;
  viewCount?: string;
}

interface YouTubePlayerProps {
  playlistId: string;
  title: string;
  maxResults?: number;
  externalVideoId?: string | null;
  externalStartSeconds?: number;
  onVideoSelect?: (videoId: string) => void;
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
  const [videoStartSeconds, setVideoStartSeconds] = useState(0);

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  // Fetch video data from playlist
  useEffect(() => {
    if (externalVideoId) {
      setSelectedVideoId(externalVideoId);
      setVideoStartSeconds(externalStartSeconds);
      setApiLoading(false);
      setVideos([]);
      return;
    }

    if (!YOUTUBE_API_KEY) {
      setError('YouTube API key is missing. Please configure VITE_YOUTUBE_API_KEY.');
      setApiLoading(false);
      return;
    }
    if (!playlistId) {
      setError('YouTube Playlist ID is missing.');
      setApiLoading(false);
      return;
    }

    const fetchVideos = async () => {
      setApiLoading(true);
      setError(null);
      try {
        console.log(`Fetching YouTube playlist: ${playlistId}`);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('YouTube API Error:', errorData);
          
          if (response.status === 403) {
            throw new Error('YouTube API quota exceeded or invalid API key. Please check your API key.');
          } else if (response.status === 404) {
            throw new Error('Playlist not found. Please check the playlist ID.');
          } else {
            throw new Error(errorData.error?.message || `Failed to fetch playlist data (status: ${response.status})`);
          }
        }
        
        const data = await response.json();
        console.log('YouTube API Response:', data);

        if (!data.items || data.items.length === 0) {
          console.warn('No items found in playlist:', data);
          setVideos([]);
          setApiLoading(false);
          return;
        }

        const fetchedVideos: YouTubeVideo[] = data.items
          .map((item: any) => {
            if (!item.snippet?.resourceId?.videoId) {
              console.warn('Skipping item due to missing videoId:', item);
              return null;
            }
            return {
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title || 'Untitled Video',
              thumbnail: item.snippet.thumbnails?.medium?.url || 
                        item.snippet.thumbnails?.default?.url || 
                        'https://via.placeholder.com/320x180.png?text=No+Thumbnail',
              publishedAt: item.snippet.publishedAt || item.contentDetails?.videoPublishedAt || new Date().toISOString(),
            };
          })
          .filter((video: YouTubeVideo | null): video is YouTubeVideo => video !== null);

        console.log('Processed videos:', fetchedVideos);
        setVideos(fetchedVideos);
        
        // Auto-select first video if none selected
        if (fetchedVideos.length > 0 && !selectedVideoId) {
          setSelectedVideoId(fetchedVideos[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching YouTube videos:', err);
        setError(err.message || 'An unknown error occurred while fetching videos.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchVideos();
  }, [playlistId, maxResults, YOUTUBE_API_KEY, externalVideoId]);

  // Effect to handle external video ID changes
  useEffect(() => {
    if (externalVideoId) {
      setSelectedVideoId(externalVideoId);
      setVideoStartSeconds(externalStartSeconds);
      setVideos([]);
      setApiLoading(false);
    }
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
          newStatusMap.set(video.id, null);
        })
      );
      Promise.all(promises).then(() => {
        setWatchlistStatus(new Map(newStatusMap));
      });
    } else if (!user) {
      setWatchlistStatus(new Map());
    }
  }, [videos, user]);

  // Effect to fetch video progress when a video is selected
  useEffect(() => {
    if (selectedVideoId && user) {
      getVideoProgress(selectedVideoId)
        .then(progress => {
          if (!externalVideoId || (externalVideoId === selectedVideoId && externalStartSeconds === 0)) {
            if (progress && progress.progress_seconds > 0) {
              setVideoStartSeconds(Math.round(progress.progress_seconds));
            } else {
              setVideoStartSeconds(0);
            }
          } else if (externalVideoId === selectedVideoId) {
             setVideoStartSeconds(externalStartSeconds);
          } else {
            setVideoStartSeconds(0);
          }
        })
        .catch(err => {
          console.error(`Error fetching progress for ${selectedVideoId}:`, err);
          setVideoStartSeconds(externalVideoId === selectedVideoId ? externalStartSeconds : 0);
        });
    } else if (selectedVideoId && externalVideoId === selectedVideoId) {
      setVideoStartSeconds(externalStartSeconds);
    } else {
      setVideoStartSeconds(0);
    }
  }, [selectedVideoId, user, externalVideoId, externalStartSeconds]);

  const handleInternalVideoSelect = (video: YouTubeVideo) => {
    setVideoStartSeconds(0);
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

  const retryFetch = () => {
    setError(null);
    setApiLoading(true);
    // This will trigger the useEffect to refetch
    window.location.reload();
  };

  const selectedVideoDetails = selectedVideoId ? videos.find(v => v.id === selectedVideoId) : null;
  const iframeSrc = selectedVideoId
    ? `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1${videoStartSeconds > 0 ? `&start=${videoStartSeconds}` : ''}`
    : "";

  if (apiLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Badge variant="outline">YouTube</Badge>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading videos...</p>
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
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={retryFetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
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
          <p className="text-muted-foreground text-center py-4">No videos found in this playlist.</p>
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
                key={`${selectedVideoId}-${videoStartSeconds}`}
                width="100%"
                height="100%"
                src={iframeSrc}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {user && selectedVideoDetails && (
            <div className="flex justify-center mb-2">
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

          {videos.slice(0, maxResults).map((video) => (
            <div key={video.id} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start space-x-3">
                <div
                  className="relative flex-shrink-0 w-28 h-16 rounded overflow-hidden cursor-pointer group"
                  onClick={() => handleInternalVideoSelect(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium text-foreground line-clamp-2 text-sm cursor-pointer hover:text-primary transition-colors"
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


import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount?: string;
}

interface YouTubePlayerProps {
  playlistId: string;
  title: string;
  maxResults?: number;
}

const YouTubePlayer = ({ playlistId, title, maxResults = 5 }: YouTubePlayerProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - in production, you'd use YouTube Data API
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Breaking News: Myanmar Political Update',
        thumbnail: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=225&fit=crop',
        duration: '12:34',
        publishedAt: '2024-01-15T10:00:00Z',
        viewCount: '15,420'
      },
      {
        id: 'abc123xyz',
        title: 'Editorial Talk: Economic Analysis',
        thumbnail: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=225&fit=crop',
        duration: '24:15',
        publishedAt: '2024-01-14T14:30:00Z',
        viewCount: '8,532'
      },
      {
        id: 'def456uvw',
        title: 'Exclusive Interview with Opposition Leader',
        thumbnail: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=225&fit=crop',
        duration: '45:22',
        publishedAt: '2024-01-13T16:45:00Z',
        viewCount: '25,891'
      }
    ];

    setTimeout(() => {
      setVideos(mockVideos);
      setLoading(false);
    }, 1000);
  }, [playlistId]);

  const formatDuration = (duration: string) => {
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

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
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

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="outline">YouTube</Badge>
        </div>

        {selectedVideo && (
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {videos.slice(0, maxResults).map((video) => (
            <div
              key={video.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="relative flex-shrink-0 w-28 h-16 rounded overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                  {video.title}
                </h4>
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

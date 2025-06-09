import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { VideoProgress, getContinueWatchingList, saveVideoProgress, NewVideoProgress } from '@/integrations/supabase/videoProgressService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }
from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; // For progress bar
import { useToast } from '@/hooks/use-toast';

interface ContinueWatchingListProps {
  onVideoSelect: (videoId: string, startSeconds: number) => void; // Callback to parent to play the video
  maxItems?: number;
}

const ContinueWatchingList: React.FC<ContinueWatchingListProps> = ({ onVideoSelect, maxItems = 5 }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VideoProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoading(true);
      getContinueWatchingList(maxItems)
        .then(data => {
          setItems(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching continue watching list:", err);
          setError("Could not load continue watching list.");
        })
        .finally(() => setLoading(false));
    } else {
      setItems([]); // Clear if no user
      setLoading(false);
    }
  }, [user, maxItems]);

  const handlePlayVideo = async (item: VideoProgress) => {
    onVideoSelect(item.video_id, item.progress_seconds);

    // Update last_watched_at by re-saving the progress
    // We need total_duration_seconds. If it's not present or 0, it means it wasn't fully captured.
    // For simplicity, if total_duration_seconds is 0, we might not be able to accurately save progress here
    // unless we fetch it first. For now, we just update if we have it.
    // A better approach might be for YouTubePlayer to be responsible for the initial saveVideoProgress
    // with full duration once it starts playing.
    if (item.total_duration_seconds > 0) {
      try {
        const progressData: NewVideoProgress = {
          video_id: item.video_id,
          progress_seconds: item.progress_seconds,
          total_duration_seconds: item.total_duration_seconds,
        };
        await saveVideoProgress(progressData); // This updates last_watched_at
      } catch (saveError) {
        console.error("Error updating last_watched_at for continue watching item:", saveError);
        toast({
          title: "Could not update video progress",
          description: (saveError as Error).message,
          variant: "destructive",
        });
      }
    } else {
        // If no duration, we can't properly save progress.
        // Optionally, could just save with progress 0 and total_duration 0 to bump last_watched_at.
        // Or, the YouTubePlayer should be responsible for creating the initial record with duration.
        // For now, we'll log a warning if we can't update properly.
        console.warn(`Cannot update last_watched_at for ${item.video_id} without total_duration_seconds.`);
    }
  };

  if (authLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Continue Watching</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null; // Don't show if not logged in
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Continue Watching</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Continue Watching</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No videos in your continue watching list yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Watching</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map(item => {
            const progressPercent = item.total_duration_seconds > 0
              ? (item.progress_seconds / item.total_duration_seconds) * 100
              : 0;
            return (
              <div key={item.video_id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title || item.video_id}
                    className="w-24 h-14 object-cover rounded-md flex-shrink-0"
                  />
                )}
                {!item.thumbnail_url && <div className="w-24 h-14 bg-muted rounded-md flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate" title={item.title || item.video_id}>
                    {item.title || item.video_id}
                  </h4>
                  {item.total_duration_seconds > 0 && (
                    <div className="mt-1">
                       <Progress value={progressPercent} className="h-1.5" />
                       <p className="text-xs text-muted-foreground mt-0.5">
                         {Math.round(item.progress_seconds / 60)}m / {Math.round(item.total_duration_seconds / 60)}m
                       </p>
                    </div>
                  )}
                   {item.total_duration_seconds === 0 && (
                     <p className="text-xs text-muted-foreground mt-1">Progress not fully tracked</p>
                   )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handlePlayVideo(item)}>
                  <PlayCircle className="w-6 h-6 text-primary" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContinueWatchingList;

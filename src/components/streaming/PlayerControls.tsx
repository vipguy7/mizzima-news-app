
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  isLive: boolean;
  title: string;
  onPlay: () => void;
  onMute: () => void;
  onFullscreen: () => void;
}

const PlayerControls = ({
  isPlaying,
  isMuted,
  isLoading,
  isLive,
  title,
  onPlay,
  onMute,
  onFullscreen
}: PlayerControlsProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              LIVE
            </Badge>
          )}
          <Badge variant="secondary">{title}</Badge>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onPlay} disabled={isLoading}>
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={onMute}>
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </Button>
        </div>
        
        <Button size="sm" variant="ghost" onClick={onFullscreen}>
          <Maximize className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;

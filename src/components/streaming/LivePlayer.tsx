
import { Card } from '@/components/ui/card';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import PlayerControls from './PlayerControls';
import PlayerOverlays from './PlayerOverlays';
import StreamInfo from './StreamInfo';
import StreamPlaceholder from './StreamPlaceholder';

interface LivePlayerProps {
  streamUrl?: string;
  title: string;
  isLive?: boolean;
}

const LivePlayer = ({ 
  streamUrl,
  title,
  isLive = true 
}: LivePlayerProps) => {
  const hasValidStream = streamUrl && !streamUrl.includes('googlevideo.com');
  
  const {
    videoRef,
    isPlaying,
    isMuted,
    isFullscreen,
    streamError,
    isLoading,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    retryStream
  } = useHlsPlayer({ streamUrl, title, hasValidStream });

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="relative aspect-video bg-black">
        {hasValidStream ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            controls={false}
            autoPlay={false}
            muted={isMuted}
          />
        ) : (
          <StreamPlaceholder title={title} />
        )}
        
        <PlayerOverlays
          isLoading={isLoading}
          streamError={streamError}
          hasValidStream={hasValidStream}
          onRetry={retryStream}
        />
        
        {!streamError && hasValidStream && (
          <PlayerControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            isLoading={isLoading}
            isLive={isLive}
            title={title}
            onPlay={togglePlay}
            onMute={toggleMute}
            onFullscreen={toggleFullscreen}
          />
        )}
      </div>
      
      <StreamInfo
        title={title}
        streamError={streamError}
        hasValidStream={hasValidStream}
        isLive={isLive}
      />
    </Card>
  );
};

export default LivePlayer;

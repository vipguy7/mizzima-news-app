
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface LivePlayerProps {
  streamUrl?: string;
  title: string;
  isLive?: boolean;
}

const LivePlayer = ({ 
  streamUrl = "https://hls-stream.mizzima.com/live/Mizzima-Live2/index.m3u8", // Placeholder HLS URL - needs RTMP to HLS conversion
  title,
  isLive = true 
}: LivePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setupHlsPlayer = () => {
      // For now, we'll show a placeholder since RTMP needs server-side conversion
      // In production, you'd need to set up RTMP to HLS conversion
      console.log("Setting up Mizzima TV Live stream...");
      console.log("Note: RTMP stream rtmp://52.77.246.163/live/Mizzima-Live2 requires server-side HLS conversion");
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: true,
        });
        hlsRef.current = hls;
        
        // Try to load the stream URL
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed successfully");
          setStreamError(null);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error(`HLS error (${data.type}):`, data.details, data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error - attempting recovery...');
                setStreamError('Network connection issue. Retrying...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error - attempting recovery...');
                setStreamError('Media playback issue. Retrying...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Unrecoverable HLS error');
                setStreamError('Stream temporarily unavailable. Please try again later.');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Using native HLS playback");
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log("Native HLS metadata loaded");
          setStreamError(null);
        });
        video.addEventListener('error', () => {
          setStreamError('Stream temporarily unavailable. Please try again later.');
        });
      } else {
        console.error('HLS is not supported in this browser');
        setStreamError('Your browser does not support live streaming. Please use a modern browser.');
      }
    };

    if (streamUrl && (isLive || streamUrl.endsWith('.m3u8'))) {
      setupHlsPlayer();
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      if (hlsRef.current) {
        console.log("Destroying HLS instance on cleanup");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl, isLive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error("Error attempting to play video:", error);
        setStreamError('Unable to start playback. Please try again.');
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          controls={false}
          autoPlay={false}
        />
        
        {/* Error Overlay */}
        {streamError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <div className="text-red-500 mb-2">⚠️ Stream Error</div>
              <p className="text-sm">{streamError}</p>
              <p className="text-xs mt-2 opacity-75">
                Note: RTMP stream requires server-side HLS conversion for web playback
              </p>
            </div>
          </div>
        )}
        
        {/* Overlay Controls */}
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
              <Button size="sm" variant="ghost" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>
            
            <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
              <Maximize className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stream Info */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {streamError ? 'Stream offline' : 'Broadcasting live from Myanmar'}
            </p>
          </div>
          {isLive && !streamError && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">LIVE</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePlayer;

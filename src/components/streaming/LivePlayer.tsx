
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, we'll show a placeholder when no valid stream URL is provided
  const hasValidStream = streamUrl && !streamUrl.includes('googlevideo.com');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasValidStream) {
      setStreamError('No valid stream URL configured. Please configure a proper HLS stream URL.');
      setIsLoading(false);
      return;
    }

    const setupHlsPlayer = () => {
      setIsLoading(true);
      setStreamError(null);
      
      console.log("Setting up live stream player for:", title);
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: true,
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: function(xhr, url) {
            // Add any custom headers if needed for CORS
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
          }
        });
        hlsRef.current = hls;
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed successfully");
          setStreamError(null);
          setIsLoading(false);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error(`HLS error (${data.type}):`, data.details, data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error - attempting recovery...');
                setStreamError('Network connection issue. Please check the stream URL or try again later.');
                setIsLoading(false);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error - attempting recovery...');
                setStreamError('Media playback issue. Retrying...');
                setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.recoverMediaError();
                  }
                }, 3000);
                break;
              default:
                console.error('Unrecoverable HLS error');
                setStreamError('Stream temporarily unavailable. Please try again later.');
                setIsLoading(false);
                break;
            }
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          setIsLoading(false);
        });
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Using native HLS playback");
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log("Native HLS metadata loaded");
          setStreamError(null);
          setIsLoading(false);
        });
        video.addEventListener('error', () => {
          setStreamError('Stream temporarily unavailable. Please try again later.');
          setIsLoading(false);
        });
      } else {
        console.error('HLS is not supported in this browser');
        setStreamError('Your browser does not support live streaming. Please use a modern browser.');
        setIsLoading(false);
      }
    };

    setupHlsPlayer();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      if (hlsRef.current) {
        console.log("Destroying HLS instance on cleanup");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl, title, hasValidStream]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !hasValidStream) return;

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

  const retryStream = () => {
    const video = videoRef.current;
    if (!video || !hasValidStream) return;
    
    setStreamError(null);
    setIsLoading(true);
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Reload the component by forcing a re-render
    video.load();
  };

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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center text-white p-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-300 mb-4">Live stream will be available soon</p>
              <Badge className="bg-yellow-600 text-yellow-100">Coming Soon</Badge>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isLoading && !streamError && hasValidStream && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {streamError && hasValidStream && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <div className="text-red-500 mb-2">Stream Error</div>
              <p className="text-sm mb-4">{streamError}</p>
              <Button onClick={retryStream} variant="outline" size="sm">
                Retry Stream
              </Button>
            </div>
          </div>
        )}
        
        {/* Overlay Controls - only show for valid streams */}
        {!streamError && hasValidStream && (
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
                <Button size="sm" variant="ghost" onClick={togglePlay} disabled={isLoading}>
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
        )}
      </div>
      
      {/* Stream Info */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {streamError ? 'Stream offline' : hasValidStream ? 
                (isLive ? 'Broadcasting live from Myanmar' : 'Video content') : 
                'Stream configuration needed'
              }
            </p>
          </div>
          {isLive && !streamError && hasValidStream && (
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

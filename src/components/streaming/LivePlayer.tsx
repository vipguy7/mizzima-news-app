
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
  streamUrl = "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1640995200/ei/dQnJYZiCOoaIhwbH6ZHQBA/ip/0.0.0.0/id/jfKfPfyJRdk.1/itag/96/aitags/140%2C298%2C299%2C140/source/yt_live_broadcast/requiressl/yes/ratebypass/yes/live/1/sgoap/gir%3Dyes%3Bitag%3D140/sgovp/gir%3Dyes%3Bitag%3D298/hls_chunk_host/rr2---sn-4g5e6nsr.googlevideo.com/playlist_duration/30/manifest_duration/30/gcr/us/vprv/1/playlist_type/DVR/initcwndbps/2050000/mh/7L/mm/44/mn/sn-4g5e6nsr/ms/lva/mv/m/mvi/2/pl/26/dover/11/keepalive/yes/fexp/24001373%2C24007246/beids/9466585/mt/1640973490/sparams/expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cratebypass%2Clive%2Csgoap%2Csgovp%2Cplaylist_duration%2Cmanifest_duration%2Cgcr%2Cvprv%2Cplaylist_type/lsparams/hls_chunk_host%2Cinitcwndbps%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Clsig/lsig/AG3C_xAwRQIhALOqnrr_8xPjr8m7jC5GkJNWkQjFcr_2G8DZyUGH9t6TAiAT0kO_J6J2SkQK0K-xVFfwl_VHa2eEoGfVBg-1BfXSBw%3D%3D/playlist/index.m3u8",
  title,
  isLive = true 
}: LivePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
                setStreamError('Network connection issue. Retrying...');
                setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.startLoad();
                  }
                }, 3000);
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
  }, [streamUrl, title]);

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

  const retryStream = () => {
    const video = videoRef.current;
    if (!video) return;
    
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
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          controls={false}
          autoPlay={false}
          muted={isMuted}
        />
        
        {/* Loading Overlay */}
        {isLoading && !streamError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {streamError && (
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
        
        {/* Overlay Controls */}
        {!streamError && (
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
              {streamError ? 'Stream offline' : isLive ? 'Broadcasting live from Myanmar' : 'Video content'}
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

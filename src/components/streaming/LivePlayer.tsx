
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
  streamUrl = "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1640995200/ei/abc123/ip/0.0.0.0/id/abc123.1/source/yt_live_broadcast/requiressl/yes/hfr/1/playlist_duration/30/manifest_duration/30/gcr/us/vprv/1/go/1/keepalive/yes/c/WEB/txp/5532432/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Chfr%2Cplaylist_duration%2Cmanifest_duration%2Cgcr%2Cvprv%2Cgo%2Ckeepalive/lsparams/hls_chunk_host%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Clsig/lsig/AG3C_xAwRQIhAKL8/playlist/index.m3u8",
  title,
  isLive = true 
}: LivePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setupHlsPlayer = () => {
      if (Hls.isSupported()) {
        console.log("HLS.js is supported, setting up player for URL:", streamUrl);
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: true,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
          // Don't auto-play here, let user click play or manage via props
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error(`HLS fatal error (${data.type}):`, data.details, data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Attempting to recover network error...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Attempting to recover media error...');
                hls.recoverMediaError();
                break;
              default:
                // Cannot recover, destroy HLS instance
                console.error('Unrecoverable HLS error, destroying instance.');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          } else {
            console.warn(`HLS non-fatal error (${data.type}):`, data.details, data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Native HLS playback is supported, setting src directly for URL:", streamUrl);
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log("Native HLS metadata loaded");
        });
      } else {
        console.error('HLS is not supported in this browser.');
        // Potentially display an error message to the user
      }
    };

    if (streamUrl && (isLive || streamUrl.endsWith('.m3u8'))) {
      setupHlsPlayer();
    } else if (streamUrl) {
      // For non-HLS, direct playback (e.g., MP4 VOD)
      console.log("Setting up direct video source for:", streamUrl);
      video.src = streamUrl;
    }

    // Event listeners for play/pause state, primarily for UI updates
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
        video.removeAttribute('src'); // Clean up src
        video.load(); // Reset video element state
      }
    };
  }, [streamUrl, isLive]); // videoRef is stable

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error("Error attempting to play video:", error);
        // Handle play error, e.g., browser blocked autoplay
        setIsPlaying(false); // Ensure UI reflects that playback didn't start
      });
    }
    // setIsPlaying will be set by the 'play'/'pause' event listeners
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
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
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
    </Card>
  );
};

export default LivePlayer;

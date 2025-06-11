
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface UseHlsPlayerProps {
  streamUrl?: string;
  title: string;
  hasValidStream: boolean;
}

export const useHlsPlayer = ({ streamUrl, title, hasValidStream }: UseHlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
          }
        });
        hlsRef.current = hls;
        
        hls.loadSource(streamUrl!);
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
        video.src = streamUrl!;
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
    
    video.load();
  };

  return {
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
  };
};

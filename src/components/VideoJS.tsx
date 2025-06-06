import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/city/index.css';

interface VideoPlayerProps {
  options: any;
  onReady?: (player: any) => void;
}

export const VideoJS = ({ options, onReady }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-theme-city', 'vjs-big-play-centered');
      videoRef.current?.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options, () => {
        onReady && onReady(playerRef.current);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, videoRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};
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
    // Initialisiere den Player nur einmal
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-theme-city', 'vjs-big-play-centered');
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        onReady && onReady(player);
      });
    } else {
      // Wenn der Player bereits existiert, aktualisiere die Quelle, wenn sich die Optionen ändern
      const player = playerRef.current;
      if (options.sources && options.sources.length > 0) {
        // Überprüfe, ob die aktuelle Quelle des Players anders ist als die neue Quelle
        // Dies verhindert unnötiges Neuladen, wenn sich nur andere Optionen ändern
        const currentSource = player.currentSrc();
        const newSource = options.sources[0].src; // Annahme: nur eine Quelle

        if (currentSource !== newSource) {
           player.src(options.sources);
           // Optional: player.play(); // Automatische Wiedergabe nach dem Laden der neuen Quelle
        }
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, videoRef, onReady]); // Füge onReady zu den Abhängigkeiten hinzu, falls es sich ändert (unwahrscheinlich, aber gute Praxis)

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};
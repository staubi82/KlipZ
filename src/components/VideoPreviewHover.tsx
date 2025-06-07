import React, { useState, useRef } from 'react';

interface VideoPreviewHoverProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  createdAt?: string;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const VideoPreviewHover: React.FC<VideoPreviewHoverProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  duration,
  createdAt,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.warn('Video play prevented:', e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative aspect-video rounded-xl border border-cyber-primary/20 bg-cyber-muted/30 backdrop-blur-xl overflow-hidden transition-all duration-500 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      />
      {!videoError && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          muted
          loop
          playsInline
          preload="metadata"
          onError={(e) => {
            console.warn('Video konnte nicht geladen werden:', videoUrl);
            setVideoError(true);
          }}
          onLoadedData={() => console.log('Video erfolgreich geladen')}
        />
      )}
      {!isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-500"></div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-lg font-semibold text-white truncate hover:text-cyber-primary transition-colors">{title}</h3>
      </div>
      <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
        {formatDuration(duration)}
      </span>
    </div>
  );
};
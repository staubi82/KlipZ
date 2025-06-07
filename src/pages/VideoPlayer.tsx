import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VideoJS } from '../components/VideoJS';
import { ThumbsUp, ThumbsDown, Share2, Download, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVideoStore } from '../hooks/useVideoStore';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import '../components/VideoPlayerCustom.css';

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const API_BASE = 'http://localhost:3301';
export function VideoPlayer() {
  const { id } = useParams();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toggleLike, toggleDislike, toggleFavorite, isLiked, isDisliked, isFavorite } = useVideoStore();
  const videoId = parseInt(id || '0');

  const [video, setVideo] = useState<any>(null);
  const [recommendedVideos, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/videos`)
      .then(res => res.json())
      .then((all) => {
        const current = all.find((v: any) => v.id === videoId);
        setVideo(current);
        setRecommended(all.filter((v: any) => v.id !== videoId));
      })
      .then(() => {
        // Scroll to the top of the page after video data is loaded
        window.scrollTo(0, 0);
      })
      .catch(err => console.error('Fehler beim Laden', err));
  }, [videoId]);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: video ? [{ src: `${API_BASE}/api/videos/${video.id}`, type: 'video/mp4' }] : []
  };

  const handlePlayerReady = (player: any) => {
    player.on('timeupdate', () => {
      const progress = (player.currentTime() / player.duration()) * 100;
      setProgress(progress);
    });
    player.on('error', (e: any) => {
      console.error('VideoJS Player error:', player.error());
      console.error('VideoJS Player error details:', e);
    });
  };

  const shareUrl = window.location.href;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Video Player */}
      <div className="relative group video-player-container">
        <div className="aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-cyber-primary/20 hover-lift">
          {video && (
            <video
              controls
              autoPlay
              src={`${API_BASE}/api/videos/${video.id}`}
              className="w-full h-full rounded-2xl"
              poster={`${API_BASE}${video.thumbnail}`}
            >
              Ihr Browser unterstützt das Video-Tag nicht.
            </video>
          )}
          
          {/* Loading State */}
          {!video && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-cyber-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-medium">Video wird geladen...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Video Progress Bar (Custom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="h-full bg-gradient-to-r from-cyber-primary to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
      </div>

      <div className="space-y-6">
        {/* Video Titel und Action Buttons */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-cyber-text-light dark:text-white mb-2">
              {video?.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{video?.uploadDate ? new Date(video.uploadDate).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Like/Dislike Buttons */}
            <div className="flex items-center bg-blue-500/10 rounded-xl overflow-hidden border border-blue-500/20">
              <button
                onClick={() => {
                  toggleLike(videoId);
                  // Add pulse animation
                  const btn = document.activeElement;
                  btn?.classList.add('pulse-like');
                  setTimeout(() => btn?.classList.remove('pulse-like'), 300);
                }}
                className={`px-4 py-3 transition-all flex items-center gap-2 hover:bg-blue-500/20 min-w-[100px] justify-center ${
                  isLiked(videoId) ? 'bg-blue-500 text-white' : 'text-blue-600 dark:text-blue-400'
                }`}
                title="Gefällt mir"
              >
                <ThumbsUp className={`w-5 h-5 transition-all ${isLiked(videoId) ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{video?.likes || (video?.views ? Math.floor(video.views * 0.05) : '')}</span>
              </button>
              <div className="w-px h-6 bg-blue-500/20"></div>
              <button
                onClick={() => toggleDislike(videoId)}
                className={`px-4 py-3 transition-all flex items-center gap-2 hover:bg-blue-500/20 min-w-[80px] justify-center ${
                  isDisliked(videoId) ? 'bg-blue-500 text-white' : 'text-blue-600 dark:text-blue-400'
                }`}
                title="Gefällt mir nicht"
              >
                <ThumbsDown className={`w-5 h-5 transition-all ${isDisliked(videoId) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Favoriten Button */}
            <button
              onClick={() => toggleFavorite(videoId)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center border ${
                isFavorite(videoId)
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
              }`}
              title={isFavorite(videoId) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Star className={`w-5 h-5 transition-transform ${isFavorite(videoId) ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Favorit</span>
            </button>
            
            {/* Download Button */}
            <button
              onClick={async () => {
                try {
                  // Construct the video URL using the video ID
                  const videoId = video?.id;
                  if (!videoId) {
                    console.error('Video ID is not available.');
                    alert('Das Video konnte nicht heruntergeladen werden: Video-ID nicht verfügbar.');
                    return;
                  }
                  const videoUrl = `${API_BASE}/api/videos/${videoId}`;

                  // Fetch the video as blob for proper download
                  const response = await fetch(videoUrl);
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const blob = await response.blob();

                  // Create download link
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${video?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'video'}.mp4`;
                  document.body.appendChild(link);
                  link.click();

                  // Cleanup
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Download failed:', error);
                  // Optionally, provide user feedback about the failure
                  alert('Das Video konnte nicht heruntergeladen werden.');
                }
              }}
              className="px-4 py-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center border border-blue-500/20"
              title="Video herunterladen"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Download</span>
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="px-4 py-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-2 min-w-[100px] justify-center border border-blue-500/20"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Teilen</span>
              </button>
              {isShareOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-blue-500/20 p-4 space-y-3 z-10">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Video teilen</h4>
                  <div className="flex space-x-3">
                    <FacebookShareButton url={shareUrl} quote={video?.title}>
                      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <FacebookIcon size={32} round />
                      </div>
                    </FacebookShareButton>
                    <TwitterShareButton url={shareUrl} title={video?.title}>
                      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TwitterIcon size={32} round />
                      </div>
                    </TwitterShareButton>
                    <WhatsappShareButton url={shareUrl} title={video?.title}>
                      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <WhatsappIcon size={32} round />
                      </div>
                    </WhatsappShareButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Ähnliche Videos Sektion */}
      <div className="border-t border-blue-500/20 pt-8">
        <div className="flex items-center justify-between mb-8">
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedVideos.slice(0, 8).map((video) => (
            <Link
              to={`/video/${video.id}`}
              key={video.id}
              className="group relative overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-video rounded-xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-blue-500/60 group-hover:shadow-2xl group-hover:shadow-blue-500/20 video-thumbnail">
                {/* Thumbnail */}
                <img
                  src={`${API_BASE}${video.thumbnail}`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-tight">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>{video.uploader || ''}</span>
                  </div>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium border border-white/20">
                  {formatDuration(video.duration)}
                </div>
                
              </div>
              
              {/* Video Stats unter dem Thumbnail */}
              <div className="mt-3 px-1">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{video.uploadDate ? new Date(video.uploadDate).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="flex justify-center mt-8">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-500/80 hover:to-blue-600/80 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/20">
            Mehr Videos laden
          </button>
        </div>
      </div>

    </div>
  );
}
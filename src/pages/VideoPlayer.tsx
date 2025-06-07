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
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {video && (
          <video
            controls
            autoPlay
            src={`${API_BASE}/api/videos/${video.id}`}
            className="w-full h-full"
          >
            Ihr Browser unterstützt das Video-Tag nicht.
          </video>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text-light dark:text-white">
              {video?.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Favoriten Button */}
            <button
              onClick={() => toggleFavorite(videoId)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                isFavorite(videoId)
                  ? 'bg-cyber-primary text-white'
                  : 'bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20'
              }`}
              title={isFavorite(videoId) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Star className={`w-5 h-5 ${isFavorite(videoId) ? 'fill-current' : ''}`} />
              {isFavorite(videoId) ? 'Favorit' : 'Favorit'}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="p-3 rounded-xl bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20 transition-all"
              >
                Teilen
              </button>
              {isShareOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg p-4 space-y-2">
                  <FacebookShareButton url={shareUrl} quote={video?.title}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={video?.title}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <WhatsappShareButton url={shareUrl} title={video?.title}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weitere Inhalte wie Beschreibung, Likes, Kommentare etc. */}
      </div>

      <div className="border-t border-cyber-primary/20 pt-8">
        <h3 className="text-xl font-bold text-cyber-text-light dark:text-white mb-6">
          Ähnliche Videos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedVideos.slice(0, 8).map((video) => (
            <Link
              to={`/video/${video.id}`}
              key={video.id}
              className="group relative overflow-hidden"
            >
              <div className="relative aspect-video rounded-xl border border-cyber-primary/20 bg-cyber-muted/30 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:border-cyber-primary/40">
                <img
                  src={`${API_BASE}${video.thumbnail}`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {video.title}
                  </h4>
                </div>
                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
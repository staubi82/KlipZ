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

export function VideoPlayer() {
  const { id } = useParams();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toggleLike, toggleDislike, toggleFavorite, isLiked, isDisliked, isFavorite } = useVideoStore();
  const videoId = parseInt(id || '0');

  const video = {
    title: "Cyberpunk 2077 Gameplay Walkthrough",
    description: "Ein ausführlicher Walkthrough durch Night City mit allen wichtigen Spots und versteckten Geheimnissen.",
    views: 12500,
    likes: 1200,
    uploadDate: "2024-02-10",
    creator: "CyberGamer",
    preview: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
  };

  const recommendedVideos = [
    {
      id: "1",
      title: "Night City Underground Tour",
      thumbnail: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
      views: "8.5K",
      creator: "CyberExplorer",
      duration: "15:30"
    },
    {
      id: "2",
      title: "Cyberpunk Hacking Guide",
      thumbnail: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg",
      views: "12K",
      creator: "NetRunner",
      duration: "22:15"
    },
    {
      id: "3",
      title: "Best Weapons in Night City",
      thumbnail: "https://images.pexels.com/photos/595804/pexels-photo-595804.jpeg",
      views: "15K",
      creator: "WeaponMaster",
      duration: "18:45"
    },
    {
      id: "4",
      title: "Secret Locations Guide",
      thumbnail: "https://images.pexels.com/photos/1634278/pexels-photo-1634278.jpeg",
      views: "10K",
      creator: "NightCityHunter",
      duration: "20:00"
    },
    {
      id: "5",
      title: "Stealth Gameplay Tips",
      thumbnail: "https://images.pexels.com/photos/2510067/pexels-photo-2510067.jpeg",
      views: "7.8K",
      creator: "ShadowRunner",
      duration: "12:30"
    },
    {
      id: "6",
      title: "Character Build Guide",
      thumbnail: "https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg",
      views: "11K",
      creator: "RPGMaster",
      duration: "25:15"
    },
    {
      id: "7",
      title: "Vehicle Customization",
      thumbnail: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
      views: "9.2K",
      creator: "StreetRacer",
      duration: "16:45"
    },
    {
      id: "8",
      title: "Combat System Tutorial",
      thumbnail: "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg",
      views: "13.5K",
      creator: "CombatPro",
      duration: "19:20"
    }
  ];

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: video.preview,
      type: 'video/mp4'
    }]
  };

  const handlePlayerReady = (player: any) => {
    player.on('timeupdate', () => {
      const progress = (player.currentTime() / player.duration()) * 100;
      setProgress(progress);
    });
  };

  const shareUrl = window.location.href;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text-light dark:text-white">
              {video.title}
            </h1>
            <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">
              {video.views.toLocaleString()} Views • {video.uploadDate}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleLike(videoId)}
              className={`p-3 rounded-xl flex items-center space-x-2 transition-all ${
                isLiked(videoId)
                  ? 'bg-cyber-primary text-white'
                  : 'bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{video.likes}</span>
            </button>
            
            <button
              onClick={() => toggleDislike(videoId)}
              className={`p-3 rounded-xl transition-all ${
                isDisliked(videoId)
                  ? 'bg-cyber-primary text-white'
                  : 'bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => toggleFavorite(videoId)}
              className={`p-3 rounded-xl transition-all ${
                isFavorite(videoId)
                  ? 'bg-cyber-primary text-white'
                  : 'bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20'
              }`}
            >
              <Star className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="p-3 rounded-xl bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {isShareOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-cyber-primary/20 overflow-hidden">
                  <div className="p-2 space-y-2">
                    <FacebookShareButton url={shareUrl} className="w-full">
                      <div className="flex items-center space-x-2 p-2 hover:bg-cyber-primary/10 rounded-lg transition-all">
                        <FacebookIcon size={24} round />
                        <span className="text-cyber-text-light dark:text-white">Facebook</span>
                      </div>
                    </FacebookShareButton>
                    
                    <TwitterShareButton url={shareUrl} className="w-full">
                      <div className="flex items-center space-x-2 p-2 hover:bg-cyber-primary/10 rounded-lg transition-all">
                        <TwitterIcon size={24} round />
                        <span className="text-cyber-text-light dark:text-white">Twitter</span>
                      </div>
                    </TwitterShareButton>
                    
                    <WhatsappShareButton url={shareUrl} className="w-full">
                      <div className="flex items-center space-x-2 p-2 hover:bg-cyber-primary/10 rounded-lg transition-all">
                        <WhatsappIcon size={24} round />
                        <span className="text-cyber-text-light dark:text-white">WhatsApp</span>
                      </div>
                    </WhatsappShareButton>
                  </div>
                </div>
              )}
            </div>

            <a
              href={video.preview}
              download
              className="p-3 rounded-xl bg-cyber-primary/10 text-cyber-text-light dark:text-white hover:bg-cyber-primary/20 transition-all"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-cyber-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-cyber-primary">
              {video.creator[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-cyber-text-light dark:text-white">
              {video.creator}
            </h3>
            <p className="text-cyber-text-light/60 dark:text-white/60 mt-2 whitespace-pre-line">
              {video.description}
            </p>
          </div>
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
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {video.title}
                    </h4>
                    <p className="text-xs text-white/80 mt-1">
                      {video.creator} • {video.views} Views
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
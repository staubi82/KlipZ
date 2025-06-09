import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useVideoStore } from '../hooks/useVideoStore';
import { API_BASE } from '../config';

interface VideoItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  created_at?: string;
  category?: string;
}

export function Favorites() {
  const { favorites } = useVideoStore();
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [favoriteVideos, setFavoriteVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    // Videos vom Server laden
    fetch(`${API_BASE}/api/videos`)
      .then(res => res.json())
      .then((videos) => {
        setAllVideos(videos);
      })
      .catch(err => console.error('Fehler beim Laden der Videos:', err));
  }, []);

  useEffect(() => {
    // Favoriten-Videos filtern
    const filteredFavorites = allVideos.filter(video => favorites.includes(video.id));
    setFavoriteVideos(filteredFavorites);
  }, [allVideos, favorites]);

  return (
    <div className="space-y-8 relative">
      <div className="relative">
        <h1 className="text-4xl font-black text-cyber-primary tracking-wider flex items-center gap-3">
          <Star className="w-8 h-8" />
          Deine Favoriten ⭐
        </h1>
      </div>

      {favoriteVideos.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-cyber-primary/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cyber-primary mb-2">Noch keine Favoriten</h2>
          <p className="text-cyber-primary/60">
            Markiere Videos als Favoriten, um sie hier wiederzufinden!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteVideos.map((video) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-white/80">
                    {video.created_at ? new Date(video.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
                    {video.category && ` • ${video.category}`}
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 text-cyber-primary fill-cyber-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
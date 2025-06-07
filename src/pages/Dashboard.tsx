import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Siren as Fire, Star, Gamepad2, Music, Tv2, Rocket } from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  created_at?: string;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const API_BASE = 'http://localhost:3301';

  useEffect(() => {
    fetch(`${API_BASE}/api/videos`)
      .then(res => res.json())
      .then(setVideos)
      .catch(err => console.error('Fehler beim Laden der Videos', err));
  }, []);
  
  const categories = [
    {
      icon: Fire,
      label: 'Hot',
      count: 42,
      link: '/trending'
    },
    {
      icon: Clock,
      label: 'Neu',
      count: 13,
      link: '/new'
    },
    {
      icon: Star,
      label: 'Favoriten',
      count: 7,
      link: '/favorites'
    },
    {
      icon: Gamepad2,
      label: 'Gaming',
      count: 5,
      link: '/gaming'
    },
    {
      icon: Music,
      label: 'Musik',
      count: 8,
      link: '/music'
    },
    {
      icon: Tv2,
      label: 'TV',
      count: 3,
      link: '/tv'
    },
    {
      icon: Rocket,
      label: 'Neuheiten',
      count: 10,
      link: '/new'
    }
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <button className="px-4 py-2 rounded-full bg-cyber-primary/5 hover:bg-cyber-primary/10 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-cyber-primary/20 hover:border-cyber-primary transition-all duration-300 text-cyber-text-light dark:text-white">
          Alle Kategorien
        </button>
      </div>
      
      {/* Video Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-primary to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group relative overflow-hidden">
              <Link to={`/video/${video.id}`}>
                <div className="relative aspect-video rounded-xl border border-cyber-primary/20 bg-cyber-muted/30 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-cyber-primary group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                  <img
                    src={`${API_BASE}${video.thumbnail}`}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyber-primary transition-colors">{video.title}</h3>
                    <p className="text-sm text-white/80">{new Date(video.created_at || '').toLocaleDateString()}</p>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Play className="w-6 h-6 text-cyber-primary" />
                  </div>
                </div>
              </Link>
              <button
                onClick={async () => {
                  if (window.confirm(`Video "${video.title}" wirklich löschen?`)) {
                    try {
                      const response = await fetch(`${API_BASE}/api/videos/${video.id}`, { method: 'DELETE' });
                      if (response.ok) {
                        alert('Video gelöscht');
                        window.location.reload();
                      } else {
                        alert('Fehler beim Löschen des Videos');
                      }
                    } catch (error) {
                      alert('Fehler beim Löschen des Videos');
                    }
                  }
                }}
                className="mt-2 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
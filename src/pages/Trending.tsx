import React from 'react';
import { Link } from 'react-router-dom';
import { Siren as Fire } from 'lucide-react';
import { sampleVideos } from '../data/sampleVideos';

export function Trending() {
  // Simuliere Trending-Videos durch Sortierung nach Views
  const trendingVideos = [...sampleVideos].sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-8 relative">
      <div className="relative">
        <h1 className="text-4xl font-black text-cyber-primary tracking-wider flex items-center gap-3">
          <Fire className="w-8 h-8" />
          Trending Videos 🔥
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingVideos.map((video) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white truncate">
                  {video.title}
                </h3>
                <p className="text-sm text-white/80">
                  {video.views.toLocaleString()} Views • {video.uploadDate}
                </p>
              </div>
              <div className="absolute top-2 right-2">
                <Fire className="w-5 h-5 text-cyber-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
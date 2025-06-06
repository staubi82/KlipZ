import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Siren as Fire, Star, Gamepad2, Music, Tv2, Rocket } from 'lucide-react';
import { sampleVideos } from '../data/sampleVideos';
import { useState } from 'react';

export const videoGrid = [
  {
    id: 1,
    title: 'Neon City Vibes',
    thumbnail: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
    preview: 'https://player.vimeo.com/external/452244307.sd.mp4?s=ff4f611ab57966065d9bd6f8a709ed456ad6c900&profile_id=164&oauth2_token_id=57447761',
    time: 'Vor 3 Stunden'
  },
  {
    id: 2,
    title: 'Cyberpunk Dreams',
    thumbnail: 'https://images.pexels.com/photos/1634278/pexels-photo-1634278.jpeg',
    preview: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761',
    time: 'Vor 5 Stunden'
  },
  {
    id: 3,
    title: 'Night City Explorer',
    thumbnail: 'https://images.pexels.com/photos/2510067/pexels-photo-2510067.jpeg',
    time: 'Vor 8 Stunden'
  },
  {
    id: 4,
    title: 'Digital Sunset',
    thumbnail: 'https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg',
    time: 'Vor 12 Stunden'
  },
  {
    id: 5,
    title: 'Future Bass Mix',
    thumbnail: 'https://images.pexels.com/photos/1293269/pexels-photo-1293269.jpeg',
    time: 'Vor 1 Tag'
  },
  {
    id: 6,
    title: 'Retro Wave Session',
    thumbnail: 'https://images.pexels.com/photos/1809644/pexels-photo-1809644.jpeg',
    time: 'Vor 2 Tagen'
  },
  {
    id: 7,
    title: 'Synthwave Dreams',
    thumbnail: 'https://images.pexels.com/photos/1420709/pexels-photo-1420709.jpeg',
    time: 'Vor 3 Tagen'
  },
  {
    id: 8,
    title: 'Cyber Aesthetics',
    thumbnail: 'https://images.pexels.com/photos/2014773/pexels-photo-2014773.jpeg',
    time: 'Vor 3 Tagen'
  },
  {
    id: 9,
    title: 'Digital Art Collection',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    time: 'Vor 4 Tagen'
  },
  {
    id: 10,
    title: 'Future Technology',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    time: 'Vor 5 Tagen'
  },
  {
    id: 11,
    title: 'Urban Nights',
    thumbnail: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
    time: 'Vor 6 Tagen'
  },
  {
    id: 12,
    title: 'Neon Lights',
    thumbnail: 'https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg',
    time: 'Vor 1 Woche'
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  
  const categories = [
    {
      icon: Fire,
      label: 'Hot',
      count: 42,
      link: '/trending',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Clock,
      label: 'Neu',
      count: 13,
      link: '/new',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Star,
      label: 'Favs',
      count: 7,
      link: '/favorites',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Gamepad2,
      label: 'Gaming',
      count: 156,
      link: '/gaming',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Music,
      label: 'Musik',
      count: 89,
      link: '/music',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Tv2,
      label: 'Shows',
      count: 45,
      link: '/shows',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    },
    {
      icon: Rocket,
      label: 'Tech',
      count: 78,
      link: '/tech',
      bg: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].thumbnail
    }
  ];

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-wrap items-center gap-3">
        {categories.map(({ icon: Icon, label, count, link, bg }) => (
          <div
            key={label}
            className="group relative cursor-pointer"
            onClick={() => navigate(link)}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-primary/5 hover:bg-cyber-primary/10 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-cyber-primary/20 hover:border-cyber-primary transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <div className="flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyber-primary" />
              </div>
              <span className="font-medium text-cyber-text-light dark:text-white group-hover:text-cyber-primary transition-colors duration-300">
                {label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyber-primary/10 text-cyber-primary text-sm font-semibold">
                {count.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        <div className="h-8 w-px bg-cyber-primary/20 mx-2"></div>
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
          {videoGrid.map((video) => (
            <Link to={`/video/${video.id}`} key={video.id} className="group relative overflow-hidden">
              <div className="relative aspect-video rounded-xl border border-cyber-primary/20 bg-cyber-muted/30 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-cyber-primary group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                {video.preview ? (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                    />
                    <video
                      src={video.preview}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </>
                ) : (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyber-primary transition-colors">{video.title}</h3>
                  <p className="text-sm text-white/80">{video.time}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Play className="w-6 h-6 text-cyber-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
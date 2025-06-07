import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Siren as Fire, Star, Gamepad2, Music, Tv2, Rocket, Plus } from 'lucide-react';
import { VideoPreviewHover } from '../components/VideoPreviewHover';
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

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<Array<{name: string, count: number}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const API_BASE = 'http://localhost:3301';

  useEffect(() => {
    // Load categories with counts
    fetch(`${API_BASE}/api/categories/counts`)
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.log('Keine Kategorien gefunden oder Fehler beim Laden'));
  }, []);

  // Filter videos by category
  useEffect(() => {
    const fetchFilteredVideos = async () => {
      try {
        let url = `${API_BASE}/api/videos`;
        if (selectedCategory !== 'Alle') {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Fehler beim Laden der gefilterten Videos:', error);
      }
    };

    fetchFilteredVideos();
  }, [selectedCategory]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Kategorie-Buttons */}
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                selectedCategory === category.name
                  ? 'bg-cyber-primary text-white border-cyber-primary'
                  : 'bg-cyber-primary/5 hover:bg-cyber-primary/10 dark:bg-gray-800/50 dark:hover:bg-gray-800 border-cyber-primary/20 hover:border-cyber-primary text-cyber-text-light dark:text-white'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}

          {/* Link zur Profil-Seite zum Hinzufügen neuer Kategorien */}
          <Link
            to="/profile"
            className="px-4 py-2 rounded-full bg-cyber-primary/5 hover:bg-cyber-primary/10 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-dashed border-cyber-primary/40 hover:border-cyber-primary transition-all duration-300 text-cyber-text-light dark:text-white flex items-center gap-2"
            title="Neue Kategorie hinzufügen"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Kategorie hinzufügen</span>
          </Link>
        </div>

        {/* Aktuelle Kategorie Anzeige */}
        <div className="mt-4 text-sm text-cyber-text-light/60 dark:text-white/60">
          {selectedCategory === 'Alle'
            ? `Zeige alle ${videos.length} Videos`
            : `Zeige ${videos.length} Videos in "${selectedCategory}"`
          }
        </div>
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
                <div>
                  <VideoPreviewHover
                    videoUrl={`${API_BASE}${video.videoUrl || ''}`}
                    thumbnailUrl={`${API_BASE}${video.thumbnail}`}
                    title={video.title}
                    duration={video.duration}
                    createdAt={video.created_at}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
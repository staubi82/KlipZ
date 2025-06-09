import React, { useState, useEffect } from 'react';
import { Camera, Mail, User as UserIcon, Save, Film, Eye, Lock, Activity, Pencil, Trash2, Plus, Tag } from 'lucide-react';
import { API_BASE } from '../config';
export function Profile() {
  const [username, setUsername] = useState('CyberCreator');
  const [email, setEmail] = useState('cybercreator@example.com');
  const [bio, setBio] = useState('');
  interface Video {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    duration: number;
    views: number;
    created_at?: string;
    category?: string; // Kategorie hinzugefügt
    tags?: string[]; // Tags als Array hinzugefügt
  }
 
  const [videos, setVideos] = useState<Video[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState(''); // State für Lösch-Nachrichten
  const [saveMessage, setSaveMessage] = useState(''); // State für Speicher-Nachrichten
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null); // State für das zu bearbeitende Video
  const [editFormData, setEditFormData] = useState({ // State für die Formulardaten beim Editieren
    title: '',
    description: '',
    category: '', // Kategorie hinzugefügt
    tags: '', // Tags als String für das Eingabefeld hinzugefügt
  });

  // State für Kategorie-Management
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState('');

  useEffect(() => {
    // Load profile data from API on mount
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        setAvatar(data.avatar || '');
      })
      .catch(() => {
        setMessage('Fehler beim Laden des Profils');
      });

    // Load videos from API
    fetch('/api/videos')
      .then((res) => res.json())
      .then(setVideos)
      .catch(() => {
        setMessage('Fehler beim Laden der Videos');
      });

    // Load categories from API
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        // Extract names from category objects
        const categoryNames = data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      })
      .catch(() => {
        console.log('Keine Kategorien gefunden oder Fehler beim Laden');
      });
  }, []);

  const totalUploads = videos.length;
  // Entferne doppelte Deklaration von videos und Video-Interface

  const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
  const totalLengthMinutes = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
  const avgLengthMinutes = totalUploads > 0 ? Math.round(totalLengthMinutes / totalUploads) : 0;

  const handleDeleteVideo = (id: number) => {
    setDeleteMessage(''); // Nachricht zurücksetzen
    if (window.confirm('Bist du sicher, dass du dieses Video löschen möchtest?')) {
      fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (res.ok) {
            setVideos((prev) => prev.filter((video) => video.id !== id));
            setDeleteMessage('Video erfolgreich gelöscht.');
          } else {
            setDeleteMessage('Fehler beim Löschen des Videos.');
          }
        })
        .catch(() => {
          setDeleteMessage('Fehler beim Löschen des Videos.');
        });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, bio, avatar }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('Profil erfolgreich gespeichert');
        } else {
          setMessage('Fehler beim Speichern des Profils');
        }
      })
      .catch(() => {
        setMessage('Fehler beim Speichern des Profils');
      });
  };

  const handleSaveVideo = (id: number) => {
    setSaveMessage(''); // Nachricht zurücksetzen
    fetch(`/api/videos/${id}`, {
      method: 'PUT', // Oder PATCH, je nach API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editFormData,
        tags: editFormData.tags.split(',').map(tag => tag.trim()), // Tags als Array senden
      }),
    })
      .then((res) => {
        if (res.ok) {
          // Video im State aktualisieren
          setVideos((prev) =>
            prev.map((video) =>
              video.id === id ? {
                ...video,
                ...editFormData,
                tags: editFormData.tags.split(',').map(tag => tag.trim()), // Tags als Array speichern
              } : video
            )
          );
          setSaveMessage('Video erfolgreich gespeichert.');
          setEditingVideoId(null); // Formular schließen
        } else {
          setSaveMessage('Fehler beim Speichern des Videos.');
        }
      })
      .catch(() => {
        setSaveMessage('Fehler beim Speichern des Videos.');
      });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setCategoryMessage('');
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      if (response.ok) {
        const newCat = await response.json();
        setCategories([...categories, newCat.name]);
        setNewCategory('');
        setIsAddingCategory(false);
        setCategoryMessage('Kategorie erfolgreich hinzugefügt');
      } else {
        setCategoryMessage('Fehler beim Hinzufügen der Kategorie');
      }
    } catch (error) {
      setCategoryMessage('Fehler beim Hinzufügen der Kategorie');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (window.confirm(`Bist du sicher, dass du die Kategorie "${categoryName}" löschen möchtest?`)) {
      setCategoryMessage('');
      try {
        const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat !== categoryName));
          setCategoryMessage('Kategorie erfolgreich gelöscht');
        } else {
          setCategoryMessage('Fehler beim Löschen der Kategorie');
        }
      } catch (error) {
        setCategoryMessage('Fehler beim Löschen der Kategorie');
      }
    }
  };

  const [avatar, setAvatar] = React.useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="relative">
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte - Profil & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profilkarte */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-8 space-y-8">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-cyber-primary/10 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Profilbild" className="w-32 h-32 object-cover rounded-xl border-4 border-cyber-primary" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-cyber-primary" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-cyber-primary text-white hover:bg-cyber-primary/80 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-cyber-text-light dark:text-white">{username}</h2>
                <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">Mitglied seit März 2024</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyber-primary">{totalUploads}</p>
                    <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Videos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyber-primary">1.2K</p>
                    <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Follower</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyber-primary">890</p>
                    <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Following</p>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSaveProfile}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Dein Username"
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    E-Mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="deine@email.de"
                      className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 pl-10 pr-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-primary/60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Bio
                  </label>
                  <textarea
                    placeholder="Erzähl etwas über dich..."
                    rows={4}
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-cyber-primary text-white rounded-lg hover:bg-cyber-primary/80 transition-colors"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">Profil speichern 💾</span>
              </button>
            </form>
            {message && (
              <p className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-400">
                {message}
              </p>
            )}
          </div>

          {/* Statistiken */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-lg bg-cyber-primary/10">
                  <Film className="w-6 h-6 text-cyber-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">Video Stats</h3>
                  <p className="text-cyber-text-light/60 dark:text-white/60">Deine Upload-Statistiken</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Uploads</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">{totalUploads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Gesamtlänge</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">{(totalLengthMinutes / 60).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Durchschnitt/Video</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">{avgLengthMinutes}min</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-lg bg-cyber-primary/10">
                  <Eye className="w-6 h-6 text-cyber-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">View Stats</h3>
                  <p className="text-cyber-text-light/60 dark:text-white/60">Deine Zuschauer-Statistiken</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Gesamt Views</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">{totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Ø Views/Video</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">{(totalViews / totalUploads).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Watch Time</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Spalte - Sicherheit & Aktivität */}
        <div className="space-y-8">
          {/* Sicherheitseinstellungen */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-lg bg-cyber-primary/10">
                <Lock className="w-6 h-6 text-cyber-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">Sicherheit</h3>
                <p className="text-cyber-text-light/60 dark:text-white/60">Passwort & Zugangsdaten</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-cyber-primary/10 text-cyber-primary dark:text-white rounded-lg hover:bg-cyber-primary/20 transition-colors mb-4"
            >
              <Lock className="w-5 h-5" />
              <span>Passwort ändern</span>
            </button>

            {isChangingPassword && (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-2">
                    Aktuelles Passwort
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-2">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-2">
                    Neues Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-cyber-primary text-white rounded-lg hover:bg-cyber-primary/80 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Passwort speichern</span>
                </button>
              </form>
            )}
          </div>

          {/* Aktivität */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-lg bg-cyber-primary/10">
                <Activity className="w-6 h-6 text-cyber-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">Aktivität</h3>
                <p className="text-cyber-text-light/60 dark:text-white/60">Letzte Aktionen</p>
              </div>
            </div>
            <p className="text-cyber-text-light/60 dark:text-white/60">Keine Aktivitäten vorhanden.</p>
          </div>

          {/* Kategorie-Management */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-lg bg-cyber-primary/10">
                <Tag className="w-6 h-6 text-cyber-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">Kategorien</h3>
                <p className="text-cyber-text-light/60 dark:text-white/60">Eigene Kategorien verwalten</p>
              </div>
            </div>

            {/* Kategorie hinzufügen Button */}
            {!isAddingCategory && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-cyber-primary/10 text-cyber-primary dark:text-white rounded-lg hover:bg-cyber-primary/20 transition-colors mb-4"
              >
                <Plus className="w-5 h-5" />
                <span>Neue Kategorie hinzufügen</span>
              </button>
            )}

            {/* Kategorie hinzufügen Form */}
            {isAddingCategory && (
              <form onSubmit={handleAddCategory} className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-2">
                    Kategorie-Name
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="z.B. Gaming, Tutorials, Musik..."
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-cyber-primary text-white rounded-lg hover:bg-cyber-primary/80 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Speichern</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory('');
                    }}
                    className="flex-1 py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            {/* Kategorien Liste */}
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-cyber-text-light/60 dark:text-white/60 text-sm">
                  Noch keine Kategorien erstellt.
                </p>
              ) : (
                categories.map((category) => {
                  const categoryVideos = videos.filter(video => video.category === category);
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 rounded-lg bg-cyber-primary/5 hover:bg-cyber-primary/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-cyber-primary"></div>
                        <span className="text-cyber-text-light dark:text-white font-medium">
                          {category}
                        </span>
                        <span className="text-cyber-text-light/60 dark:text-white/60 text-sm">
                          ({categoryVideos.length} Video{categoryVideos.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Kategorie löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Kategorie-Nachrichten */}
            {categoryMessage && (
              <p className={`mt-4 text-center text-sm font-medium ${
                categoryMessage.includes('erfolgreich')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {categoryMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Video Liste */}
      <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-8 mt-8">
        <h2 className="text-2xl font-bold text-cyber-text-light dark:text-white mb-6">Deine Videos</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-cyber-primary/20">
              <th className="text-left py-2 px-4 text-cyber-text-light dark:text-white">Bild</th>
              <th className="text-left py-2 px-4 text-cyber-text-light dark:text-white">Titel</th>
              <th className="text-left py-2 px-4 text-cyber-text-light dark:text-white">Beschreibung</th>
              <th className="text-left py-2 px-4 text-cyber-text-light dark:text-white">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <React.Fragment key={video.id}>
                <tr className="border-b border-cyber-primary/10 hover:bg-cyber-primary/5 transition-colors">
                  <td className="py-2 px-4">
                    <img src={video.thumbnail.startsWith('http') ? video.thumbnail : `${API_BASE}${video.thumbnail}`} alt={video.title} className="w-20 h-12 object-cover rounded border border-cyber-primary/30 dark:border-cyber-primary/60" />
                  </td>
                  <td className="py-2 px-4 font-semibold text-cyber-text-light dark:text-white">{video.title.length > 30 ? video.title.substring(0, 20) + '...' : video.title}</td>
                  <td className="py-2 px-4 text-cyber-text-light dark:text-white">{video.description.length > 50 ? video.description.substring(0, 50) + '...' : video.description}</td>
                  <td className="py-2 px-4 space-x-4 flex items-center">
                    <button
                      className="text-cyber-primary hover:text-cyber-primary/80 transition-colors"
                      onClick={() => {
                        setEditingVideoId(video.id);
                        setEditFormData({
                          title: video.title,
                          description: video.description,
                          category: video.category || '', // Kategorie laden
                          tags: video.tags ? video.tags.join(', ') : '', // Tags als String laden
                        });
                      }}
                      title="Video bearbeiten"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <span className="text-cyber-text-light/60 dark:text-white/60">|</span>
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => handleDeleteVideo(video.id)}
                      title="Video löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                {editingVideoId === video.id && (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 bg-cyber-primary/5 dark:bg-gray-700/50">
                      {/* Editierformular kommt hier rein */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-1">Titel</label>
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-1 px-3 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-1">Beschreibung</label>
                          <textarea
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            rows={2}
                            className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-1 px-3 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-1">Kategorie</label>
                          <select
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-1 px-3 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                          >
                            <option value="alle">alle</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80 mb-1">Tags (Komma-getrennt)</label>
                          <input
                            type="text"
                            value={editFormData.tags}
                            onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                            className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-1 px-3 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            className="py-2 px-4 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            onClick={() => setEditingVideoId(null)} // Abbrechen
                          >
                            Abbrechen
                          </button>
                          <button
                            className="py-2 px-4 rounded-lg bg-cyber-primary text-white hover:bg-cyber-primary/80 transition-colors"
                            onClick={() => handleSaveVideo(video.id)}
                          >
                            Speichern
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {deleteMessage && (
          <p className={`mt-4 text-center text-sm font-medium ${deleteMessage.includes('erfolgreich') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {deleteMessage}
          </p>
        )}
        {saveMessage && (
          <p className={`mt-2 text-center text-sm font-medium ${saveMessage.includes('erfolgreich') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );
}
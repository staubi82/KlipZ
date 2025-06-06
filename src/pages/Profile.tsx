import React from 'react';
import { Camera, Mail, User as UserIcon, Save, Lock, Clock, Film, Eye, Star, BarChart3, Activity, Upload } from 'lucide-react';
import { useState } from 'react';

export function Profile() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="relative">
        <h1 className="text-4xl font-black text-cyber-text-light dark:text-white tracking-wider">
          Mein Space 🎭
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linke Spalte - Profil & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profilkarte */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-8 space-y-8">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-cyber-primary/10 flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-16 h-16 text-cyber-primary" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-cyber-primary text-white hover:bg-cyber-primary/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-cyber-text-light dark:text-white">CyberCreator</h2>
                <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">Mitglied seit März 2024</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyber-primary">42</p>
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

            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Dein Username"
                    className="w-full bg-white dark:bg-gray-700 border border-cyber-primary/30 rounded-lg py-2 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all"
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
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Gesamtlänge</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">8.5h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Durchschnitt/Video</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">12min</span>
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
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">128K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Ø Views/Video</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">3.2K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-text-light/60 dark:text-white/60">Watch Time</span>
                  <span className="text-xl font-bold text-cyber-text-light dark:text-white">520h</span>
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
                    Passwort bestätigen
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

          {/* Letzte Aktivitäten */}
          <div className="rounded-xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-lg bg-cyber-primary/10">
                <Activity className="w-6 h-6 text-cyber-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">Aktivität</h3>
                <p className="text-cyber-text-light/60 dark:text-white/60">Deine letzten Aktionen</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-cyber-primary" />
                <div>
                  <p className="text-cyber-text-light dark:text-white">Neues Video hochgeladen</p>
                  <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Vor 2 Stunden</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-cyber-primary" />
                <div>
                  <p className="text-cyber-text-light dark:text-white">Video favorisiert</p>
                  <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Vor 5 Stunden</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-cyber-primary" />
                <div>
                  <p className="text-cyber-text-light dark:text-white">1000 Views erreicht!</p>
                  <p className="text-sm text-cyber-text-light/60 dark:text-white/60">Vor 1 Tag</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
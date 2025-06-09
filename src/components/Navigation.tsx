import React from 'react';
import { Link } from 'react-router-dom';
import { Video, User, Sun, Moon, Search, Upload, Menu, X, Home, Star, Clock, History, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ENABLE_REGISTRATION } from '../config';

export function Navigation() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const mainNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Clock, label: 'Neuste', path: '/new' },
    { icon: Star, label: 'Favoriten', path: '/favorites' },
    { icon: History, label: 'Verlauf', path: '/history' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-primary to-cyber-primary/50 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Video className="w-6 h-6 text-white transform -rotate-3 transition-transform group-hover:rotate-0" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
              </div>
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyber-primary to-cyber-primary/70 transition-all duration-300 group-hover:tracking-wider">
              KLIPZ
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 ml-12">
            {mainNavItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-cyber-primary dark:hover:text-cyber-primary transition-colors group"
              >
                <Icon className="w-5 h-5 transform transition-transform group-hover:scale-110" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
          
          <div className="hidden md:block flex-1 max-w-md px-8">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <input
                type="text"
                placeholder="Suchen..."
                className="w-full bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500/70 dark:placeholder-gray-300/70 focus:outline-none focus:border-cyber-primary/50 focus:ring-2 focus:ring-cyber-primary/20 transition-all"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                isSearchFocused ? 'text-cyber-primary' : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                to="/upload"
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary transition-all"
              >
                <Upload className="w-5 h-5 transform transition-transform group-hover:scale-110" />
                <span className="font-medium">Upload</span>
              </Link>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-cyber-primary/10 hover:text-cyber-primary text-gray-600 dark:text-gray-200 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5 transform transition-transform hover:scale-110" /> :
                           <Moon className="w-5 h-5 transform transition-transform hover:scale-110" />}
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group flex items-center space-x-2 p-2 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-cyber-primary/10 hover:text-cyber-primary text-gray-600 dark:text-gray-200 transition-all"
                >
                  <User className="w-5 h-5 transform transition-transform group-hover:scale-110" />
                  <span className="font-medium text-sm">{user?.username}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profil</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Abmelden</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-cyber-primary transition-colors"
                >
                  Anmelden
                </Link>
                {ENABLE_REGISTRATION && (
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary transition-all"
                  >
                    Registrieren
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-cyber-primary/10 hover:text-cyber-primary transition-all"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
            <div className="px-4">
              <input
                type="text"
                placeholder="Suchen..."
                className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500/70 dark:placeholder-gray-300/70 focus:outline-none focus:border-cyber-primary/50 focus:ring-2 focus:ring-cyber-primary/20 transition-all"
              />
              <Search className="absolute left-7 top-[5.5rem] transform -translate-y-1/2 w-4 h-4 text-gray-400/70 dark:text-gray-500/70" />
            </div>
            
            <div className="space-y-1 px-4">
              {mainNavItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-cyber-primary/10 text-gray-600 dark:text-gray-300 hover:text-cyber-primary transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              {isAuthenticated && (
                <Link
                  to="/upload"
                  className="flex items-center space-x-3 w-full p-3 rounded-xl bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload</span>
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-cyber-primary/10 text-gray-600 dark:text-gray-300 hover:text-cyber-primary transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profil ({user?.username})</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Abmelden</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-cyber-primary/10 text-gray-600 dark:text-gray-300 hover:text-cyber-primary transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Anmelden</span>
                  </Link>
                  
                  {ENABLE_REGISTRATION && (
                    <Link
                      to="/register"
                      className="flex items-center space-x-3 w-full p-3 rounded-xl bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Registrieren</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
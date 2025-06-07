import React from 'react';
import { Link } from 'react-router-dom';
import { Video, User, Sun, Moon, Search, Upload, Menu, X, LogOut } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const { isDark, toggle } = useTheme();
  const { logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="relative z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Video className="w-8 h-8 text-cyber-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyber-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyber-primary dark:group-hover:text-cyber-primary transition-colors">
              KLIPZ
            </span>
          </Link>
          
          <div className="hidden md:block flex-1 max-w-xl px-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all group-hover:border-cyber-primary/50"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-cyber-primary transition-colors" />
              <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/upload"
              className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cyber-primary transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-cyber-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Upload className="w-5 h-5 text-gray-600 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors" />
              <span className="text-gray-700 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors">Upload</span>
            </Link>
            
            <Link
              to="/profile"
              className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cyber-primary transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-cyber-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <User className="w-5 h-5 text-gray-600 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors" />
              <span className="text-gray-700 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors">Mein Space</span>
            </Link>
            
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cyber-primary transition-all"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-200 hover:text-cyber-primary transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-200 hover:text-cyber-primary transition-colors" />
              )}
            </button>
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cyber-primary transition-all overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-cyber-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors" />
                <span className="text-gray-700 dark:text-gray-200 relative z-10 group-hover:text-cyber-primary transition-colors">Abmelden</span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-200" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-200" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="px-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary"
              />
              <Search className="absolute left-7 top-[5.5rem] transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="space-y-2 px-4">
              <Link
                to="/upload"
                className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                <span className="text-gray-700 dark:text-gray-200">Upload</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                <span className="text-gray-700 dark:text-gray-200">Mein Space</span>
              </Link>
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200">Abmelden</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
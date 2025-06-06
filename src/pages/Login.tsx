import React, { useState, FormEvent } from 'react';
import { Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Wenn der Benutzer bereits angemeldet ist, zur Startseite umleiten
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      // Nach erfolgreicher Anmeldung zur Startseite navigieren
      navigate('/');
    } catch (err) {
      // Fehler werden bereits im AuthContext verarbeitet
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-surface py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(0,246,255,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(112,0,255,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 246, 255, 0.1) 50%)',
          backgroundSize: '100% 4px'
        }}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center">
          <div className="relative animate-float">
            <div className="absolute inset-0 animate-glow">
              <Video className="mx-auto h-16 w-16 text-cyber-primary opacity-50" />
            </div>
            <Video className="relative mx-auto h-16 w-16 text-cyber-primary" />
          </div>
          <h2 className="mt-6 text-4xl font-black text-cyber-primary tracking-wider">
            Willkommen bei Klipz! 🚀
          </h2>
          <p className="mt-2 text-cyber-primary/60">
            Dein Portal in die Zukunft des Video-Sharings
          </p>
        </div>
        
        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="rounded-xl bg-cyber-muted/30 backdrop-blur-xl p-8 border border-cyber-primary/20 space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="email" className="sr-only">E-Mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-cyber-surface border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="relative group">
                <label htmlFor="password" className="sr-only">Passwort</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-cyber-surface border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyber-primary focus:ring-cyber-primary border-cyber-primary/30 rounded bg-cyber-surface"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-cyber-primary/80">
                  Stay connected bleiben
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex justify-center py-3 px-6 text-lg font-bold rounded-xl text-white bg-cyber-primary/20 border border-cyber-primary hover:bg-cyber-primary/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyber-primary/50 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-cyber-primary/10 transform group-hover:translate-y-full transition-transform duration-300"></div>
              <span className="relative">
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Anmelden...
                  </>
                ) : (
                  "Let's go! 🎯"
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
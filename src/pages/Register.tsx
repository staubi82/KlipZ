import React, { useState, FormEvent } from 'react';
import { Video, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { API_BASE, ENABLE_REGISTRATION } from '../config';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Wenn der Benutzer bereits angemeldet ist, zur Startseite umleiten
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Wenn Registrierung deaktiviert ist, zur Login-Seite umleiten
  if (!ENABLE_REGISTRATION) {
    return <Navigate to="/login" replace />;
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registrierung fehlgeschlagen');
      }
      
      // Nach erfolgreicher Registrierung zur Login-Seite navigieren
      navigate('/login', { 
        state: { message: 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-surface dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              <Video className="mx-auto h-16 w-16 text-cyber-primary dark:text-blue-400 opacity-50" />
            </div>
            <Video className="relative mx-auto h-16 w-16 text-cyber-primary dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-4xl font-black text-cyber-primary dark:text-blue-400 tracking-wider">
            Werde Teil von Klipz! 🚀
          </h2>
          <p className="mt-2 text-cyber-primary dark:text-blue-400/60">
            Erstelle deinen Account und starte deine Video-Journey
          </p>
        </div>
        
        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="rounded-xl bg-cyber-muted/30 dark:bg-gray-800/30 backdrop-blur-xl p-8 border border-cyber-primary/20 space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="username" className="sr-only">Benutzername</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyber-primary dark:text-blue-400/50" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 bg-cyber-surface dark:bg-gray-900 border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary dark:text-blue-400 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                    placeholder="Benutzername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              <div className="relative group">
                <label htmlFor="email" className="sr-only">E-Mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyber-primary dark:text-blue-400/50" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 bg-cyber-surface dark:bg-gray-900 border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary dark:text-blue-400 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                    placeholder="E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              <div className="relative group">
                <label htmlFor="password" className="sr-only">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyber-primary dark:text-blue-400/50" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 bg-cyber-surface dark:bg-gray-900 border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary dark:text-blue-400 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                    placeholder="Passwort (min. 6 Zeichen)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              <div className="relative group">
                <label htmlFor="confirmPassword" className="sr-only">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyber-primary dark:text-blue-400/50" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 bg-cyber-surface dark:bg-gray-900 border border-cyber-primary/30 placeholder-cyber-primary/50 text-cyber-primary dark:text-blue-400 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all duration-300 group-hover:border-cyber-primary/50"
                    placeholder="Passwort bestätigen"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="absolute inset-0 bg-cyber-primary/5 rounded-lg filter blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                    Registrierung...
                  </>
                ) : (
                  "Account erstellen! 🎯"
                )}
              </span>
            </button>
            
            <div className="text-center">
              <p className="text-cyber-primary dark:text-blue-400/60">
                Bereits ein Account?{' '}
                <Link 
                  to="/login" 
                  className="text-cyber-primary dark:text-blue-400 hover:text-cyber-primary dark:text-blue-400/80 transition-colors duration-300 font-semibold"
                >
                  Hier anmelden
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
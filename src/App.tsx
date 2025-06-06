import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { VideoPlayer } from './pages/VideoPlayer';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { Trending } from './pages/Trending';
import { NewDrops } from './pages/NewDrops';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Öffentliche Routen */}
          <Route path="/login" element={<Login />} />
          
          {/* Geschützte Routen */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/new" element={<NewDrops />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          
          {/* Umleitung für alle anderen Pfade */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

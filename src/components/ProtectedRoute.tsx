import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Anzeige einer Ladeanzeige während der Authentifizierungsstatus geprüft wird
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-cyber-surface">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-l-2 border-cyber-primary"></div>
      </div>
    );
  }

  // Umleitung zur Login-Seite, wenn nicht authentifiziert
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wenn authentifiziert, Outlet anzeigen (geschützte Komponenten)
  return <Outlet />;
}
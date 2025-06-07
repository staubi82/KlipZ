import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
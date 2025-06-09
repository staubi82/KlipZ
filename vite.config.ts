import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_FRONTEND_PORT) || 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || `http://localhost:${env.VITE_BACKEND_PORT || 3000}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

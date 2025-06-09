import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3300,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || 'http://localhost:3301',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Backend server
        changeOrigin: true,
        secure: false,
        // Optional: only needed if your backend expects no '/api' prefix
        // rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  }
});
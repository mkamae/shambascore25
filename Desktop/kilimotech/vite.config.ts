import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // Ensure environment variables are properly exposed
  define: {
    // Vite automatically exposes VITE_ prefixed vars via import.meta.env
    // This config ensures they're available at build time
  }
});

// /Users/jayeshdantha/Desktop/NovelVerse/client/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // string shorthand: http://localhost:5173/foo -> http://localhost:4567/foo
      // '/foo': 'http://localhost:4567',
      // with options
      '/api': {
        target: 'http://localhost:3001', // Your backend server
        changeOrigin: true,
      },
    },
  },
});

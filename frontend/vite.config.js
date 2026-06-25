import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // En dev (npm run dev sur :5173), on relaie les appels /api vers l'API Express locale.
  // En production (Netlify), /api est servi par la fonction serverless sur le meme domaine.
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});

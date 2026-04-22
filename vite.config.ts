import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('html-data-uri')) {
                return 'vendor-pdf';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-ai';
              }
              if (id.includes('lucide-react') || id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              return 'vendor-core';
            }
          }
        }
      }
    }
  };
});

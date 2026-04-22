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
      // Set a very high limit to silence the warning completely
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split the largest heavyweight library into its own chunk
              if (id.includes('jspdf')) {
                return 'vendor-pdf-engine';
              }
              if (id.includes('html2canvas')) {
                return 'vendor-canvas';
              }
              // Other common libs
              if (id.includes('react') || id.includes('react-dom') || id.includes('lucide-react')) {
                return 'vendor-core';
              }
              // Defaults to a generic vendor chunk
              return 'vendor-others';
            }
          }
        }
      }
    }
  };
});

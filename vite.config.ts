import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    // Gunakan konstanta global untuk versi aplikasi
    '__APP_VERSION__': JSON.stringify(packageJson.version)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Naikkan limit warning sedikit
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Pisahkan library besar ke chunk terpisah
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            return 'vendor'; // Sisa node_modules
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true 
  }
});
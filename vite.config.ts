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
  },
  server: {
    port: 3000,
    host: true 
  }
});
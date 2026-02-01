import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Baca versi dari package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

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
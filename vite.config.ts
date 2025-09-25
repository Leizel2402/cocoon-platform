import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['leaflet', 'react-leaflet'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          leaflet: ['leaflet', 'react-leaflet'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
          ],
          icons: ['lucide-react'], // 👈 added
        },
      },
    },
    chunkSizeWarningLimit: 2000, // 👈 increased
  },
});

import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      // Resolve to shared's TS source directly so Vite/Rollup can bundle it as
      // ESM in dev and production builds without going through the CommonJS
      // dist output (which Rollup's cjs interop can't statically re-export).
      '@sera/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/logo.png'],
      manifest: {
        name: 'Southeastern Rewilding Assistant',
        short_name: 'SERA',
        description: 'AI-powered native habitat restoration tool for the Southeastern US',
        theme_color: '#2E4A2E',
        background_color: '#FBF3DD',
        display: 'standalone',
        icons: [
          {
            src: 'assets/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});

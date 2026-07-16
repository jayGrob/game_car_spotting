import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Must match the GitHub Pages project path: https://jaygrob.github.io/game_car_spotting/
const base = '/game_car_spotting/';

export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Car Spotting',
        short_name: 'Car Spotting',
        description: 'The ultimate road trip game for kids.',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Strict offline-first: precache the entire app shell, fonts and audio.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,m4a}'],
        navigateFallback: `${base}index.html`,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true
      }
    })
  ]
});

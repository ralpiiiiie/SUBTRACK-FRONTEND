import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';


// https://vite.dev/config/
export default defineConfig({
 plugins: [
   react(),
   tailwindcss(),
   VitePWA({
     registerType: 'autoUpdate',
     injectRegister: 'auto',
     includeAssets: ['favicon.svg', 'robots.txt'],
     manifest: {
       id: '/',
       name: 'Personal Subscription Tracker',
       short_name: 'Subscription Tracker',
       description:
         'Track your recurring subscriptions, renewal dates, spending, free trials, and alerts in one place so you never miss a renewal or pay for services you no longer use.',
       theme_color: '#6d4eff',
       background_color: '#f8fafc',
       display: 'standalone',
       start_url: '/',
       scope: '/',
       lang: 'en',
       icons: [
         {
           src: '/pwa-192x192.png',
           sizes: '192x192',
           type: 'image/png',
           purpose: 'any',
         },
         {
           src: '/pwa-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'any',
         },
         {
           src: '/pwa-maskable-192x192.png',
           sizes: '192x192',
           type: 'image/png',
           purpose: 'maskable',
         },
         {
           src: '/pwa-maskable-512x512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'maskable',
         },
       ],
     },
     workbox: {
       globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
       navigateFallback: '/index.html',
       navigateFallbackDenylist: [/^\/api\//],
       cleanupOutdatedCaches: true,
       maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
     },
     devOptions: {
       enabled: false,
     },
   }),
 ],
 resolve: {
   alias: {
     '@': path.resolve(import.meta.dirname, './src'),
   },
 },
})

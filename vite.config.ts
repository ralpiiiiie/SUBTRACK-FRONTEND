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
     includeAssets: [
       'favicon.svg',
       'favicon.ico',
       'favicon-16x16.png',
       'favicon-32x32.png',
       'favicon-48x48.png',
       'robots.txt',
       'apple-touch-icon.png',
     ],
     manifest: {
       id: '/',
       name: 'Personal Subscription Tracker',
       short_name: 'SubTrack',
       description:
         'Track your recurring subscriptions, renewal dates, spending, free trials, and alerts in one place so you never miss a renewal or pay for services you no longer use.',
       theme_color: '#0B1211',
       background_color: '#0B1211',
       display: 'standalone',
       orientation: 'portrait',
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
       navigateFallbackDenylist: [/^\/api\//, /\.onrender\.com/],
       cleanupOutdatedCaches: true,
       maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
       runtimeCaching: [
         {
           urlPattern: ({ url }) => {
             // VITE_API_URL is injected at build time
             const apiUrl = "VITE_API_URL" as unknown as string;
             return apiUrl ? url.href.startsWith(apiUrl) : url.pathname.startsWith('/api/');
           },
           handler: 'NetworkOnly',
         },
       ],
       skipWaiting: true,
       clientsClaim: true,
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

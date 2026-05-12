import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Academic Platform',
        short_name: 'AcademicApp',
        description: 'Plataforma académica para seguimiento y recomendaciones',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',

       icons: [
  {
    src: '/icon-192.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: '/icon-512.png',
    sizes: '512x512',
    type: 'image/png',
  },
],
      },
       devOptions: {
    enabled: true,
  },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

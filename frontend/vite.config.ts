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
            src: '/icons.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
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
    host: true, // Listen on all network interfaces
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

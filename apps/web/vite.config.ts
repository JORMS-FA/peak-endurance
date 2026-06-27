import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 4173,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    // Manual chunk strategy — splits heavy third-party libs out of the
    // main bundle so the initial route downloads only what it needs.
    rolldownOptions: {
      output: {
        // Keep the warning threshold where Vite recommends it (500 kB);
        // we want loud feedback if a chunk grows unexpectedly.
        chunkSizeWarningLimit: 500,
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          // Recharts — only used by a couple of pages (Dashboard, Analysis)
          if (id.includes('recharts')) return 'vendor-recharts'
          // Leaflet — used only by the polyline map (ActivityDetail, Segments)
          if (id.includes('leaflet')) return 'vendor-leaflet'
          // Framer Motion — used across many pages
          if (id.includes('framer-motion')) return 'vendor-framer'
          // Supabase — shared infra
          if (id.includes('@supabase')) return 'vendor-supabase'
          // Lucide icons
          if (id.includes('lucide-react')) return 'vendor-icons'
          // React + react-dom + react-router
          if (id.match(/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/)) {
            return 'vendor-react'
          }
          return 'vendor'
        },
      },
    },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('cytoscape') || id.includes('fcose') || id.includes('cose-base') || id.includes('layout-base')) {
            return 'cytoscape-vendor'
          }
        },
      },
    },
  },
})

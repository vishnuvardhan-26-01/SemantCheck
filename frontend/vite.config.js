import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api calls to the FastAPI backend so no CORS pain in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

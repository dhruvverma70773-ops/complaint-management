import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest configuration for React Testing Library
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
  server: {
    port: 5173,
    // Proxy API calls to the backend during development
    // This way /api/... gets forwarded to http://localhost:5000/api/...
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

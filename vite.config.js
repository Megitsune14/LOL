import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['lol-mx10.onrender.com'],
  },
  preview: {
    allowedHosts: ['lol-mx10.onrender.com'],
  },
})
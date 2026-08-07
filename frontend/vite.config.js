import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // Add this line
  ],
  build: {
    outDir: 'dist', // Specify the output directory for the build
  },
})
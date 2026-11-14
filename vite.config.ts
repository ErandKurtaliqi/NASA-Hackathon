import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localStoryMedia } from './scripts/localStoryMedia.mjs'

export default defineConfig({
  plugins: [react(), localStoryMedia()],
  build: { target: 'es2020', sourcemap: true },
})

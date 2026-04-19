import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  define: {
    '__ANTHROPIC_KEY__': JSON.stringify(process.env.VITE_ANTHROPIC_KEY || '')
  }
})

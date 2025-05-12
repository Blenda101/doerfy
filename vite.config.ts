import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from 'tailwindcss'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr(),
    react()
  ],
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  optimizeDeps: {
    include: ['@xyflow/react'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  }
})
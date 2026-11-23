import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Library build configuration for embedding into external websites
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/lib',
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/embed.tsx'),
      name: 'CardCatcher3D',
      fileName: (format) => `cardcatcher-3d.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Keep external to minimize bundle size if host site provides them
      external: [],
    },
  },
})

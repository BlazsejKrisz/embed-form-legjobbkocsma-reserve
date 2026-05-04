import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/embed.ts',
      name: 'LKBooking',
      fileName: () => 'embed.js',
      formats: ['iife'],
    },
    outDir: 'dist-embed',
    emptyOutDir: true,
  },
})

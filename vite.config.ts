import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        legal: 'legal/index.html',
        privacy: 'privacy/index.html',
        disclaimer: 'disclaimer/index.html',
      },
    },
  },
})
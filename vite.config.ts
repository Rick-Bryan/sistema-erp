import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: path.join(__dirname, 'src/backend/electron/main.ts'),
      },
      preload: {
        input: path.join(__dirname, 'src/backend/electron/preload.ts'),
      },
      renderer: {},
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      external: ['bcryptjs'],
    },
  },
})

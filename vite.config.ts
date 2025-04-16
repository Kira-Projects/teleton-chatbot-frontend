/// <reference types="vitest/config" />

import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    //globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'], // reportes que deseas generar
      include: ['src/**/*.{ts,tsx}'], // Archivos a incluir
      exclude: [
          'src/vite-env.d.ts',
          'src/main.tsx',
        'src/store/hook.ts', // Ignorar otro archivo específico
        'src/**/*.test.{ts,tsx}', // Ignorar archivos de test
        //'src/some-folder/**', // Ignorar carpeta específica
      ],
    },
  },

})

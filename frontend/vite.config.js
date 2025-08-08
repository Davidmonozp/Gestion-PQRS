import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  // 🔹 Configuración para producción
  base: '/', // Para que cargue correctamente los assets
  build: {
    outDir: '../backend/public/dist', // Ruta donde Laravel pueda servir React
    emptyOutDir: true
  }
})

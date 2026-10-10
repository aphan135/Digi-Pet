import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built index.html loads over file:// in Electron
export default defineConfig({ plugins: [react()], base: './', server: { port: 5173, strictPort: true } })

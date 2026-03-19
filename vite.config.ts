import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://10.153.94.123:8000',
        changeOrigin: true,
        secure: false,
        autoRewrite: true,
        protocolRewrite: 'http',
      }
      // media is served directly from http://10.153.94.123:8003 — no proxy needed
    }
  }
})
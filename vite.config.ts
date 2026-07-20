import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 部署在 /resume/ 子路径，显式指定 base 让所有资源正确解析
  base: '/resume/',
  plugins: [react(), tailwindcss()],
})

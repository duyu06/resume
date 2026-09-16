import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 部署在 /resume/ 子路径；国内镜像（WorkBuddy 发布等）部署在根路径。
// 用 VITE_BASE 覆盖，默认保持 GitHub Pages 的 /resume/ 行为不变。
const base = process.env.VITE_BASE || '/resume/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})

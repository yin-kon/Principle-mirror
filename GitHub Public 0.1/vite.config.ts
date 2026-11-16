import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 原理镜 ConceptLens · 构建配置
// S0 阶段仅提供骨架：业务代码自 S1 起按模块逐次提交，本文件不引用尚不存在的入口。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 评审/CI 环境不自动弹浏览器，便于后台启动与预览
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // mathjs 是有意的数值计算依赖，单 chunk 约 800KB；不因此阻断构建
    chunkSizeWarningLimit: 900,
  },
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/** 测试单独配置：单 fork 运行。
 * 原因：部分 Windows 受限环境不允许向系统临时目录写入 Vitest 的 SSR 缓存，
 * 多 worker 并行时会抛 EPERM 并漏收集测试文件。单 fork 可稳定跑全量用例，
 * 对 CI（Linux）同样安全。 */
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.ts'],
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
})

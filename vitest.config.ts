import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'jsdom',
    // 测试文件匹配规则
    include: ['src/**/*.{test,spec}.{js,ts}'],
    // 别名
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
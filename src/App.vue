<template>
  <main class="playground">
    <section class="playground__hero">
      <div>
        <p class="playground__eyebrow">本地调试</p>
        <h1>ssq-ui 本地调试入口</h1>
        <p class="playground__summary">
          这里只保留最小化的 smoke playground，正式说明和完整示例请查看文档站。
        </p>
      </div>

      <MySpace wrap size="sm">
        <MyButton type="primary" @click="dialogOpen = true">打开对话框</MyButton>
        <MyButton @click="toggleMode">
          {{ isDark ? '切换到浅色模式' : '切换到深色模式' }}
        </MyButton>
      </MySpace>
    </section>

    <section class="playground__card">
      <MySpace direction="vertical" size="lg">
        <MyInput v-model="keyword" clearable placeholder="输入关键字预览输入框状态" />

        <div class="playground__select">
          <MySelect
            v-model="selectedValue"
            :options="options"
            filterable
            clearable
            placeholder="选择一个组件"
          />
        </div>

        <p class="playground__text">
          当前模式：{{ isDark ? '深色' : '浅色' }}，当前选择：{{ selectedValue || '未选择' }}
        </p>
      </MySpace>
    </section>

    <MyDialog v-model:open="dialogOpen" title="本地调试">
      <p class="playground__dialog-text">
        当前输入内容：{{ keyword || '空' }}，当前选中值：{{ selectedValue || '未选择' }}。
      </p>
      <template #footer>
        <MyButton @click="dialogOpen = false">关闭</MyButton>
        <MyButton type="primary" @click="dialogOpen = false">确认</MyButton>
      </template>
    </MyDialog>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SelectValue } from './components/select'
import { useTheme } from './theme'

const { resolvedMode, setMode } = useTheme()

const dialogOpen = ref(false)
const keyword = ref('')
const selectedValue = ref<SelectValue>('button')
const options = [
  { label: 'Button', value: 'button' },
  { label: 'Input', value: 'input' },
  { label: 'Dialog', value: 'dialog' },
  { label: 'Select', value: 'select' }
]

const isDark = computed(() => resolvedMode.value === 'dark')

function toggleMode() {
  setMode(isDark.value ? 'light' : 'dark')
}
</script>

<style scoped>
.playground {
  min-height: 100vh;
  padding: 40px 20px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--my-color-primary) 12%, white) 0, transparent 32%),
    linear-gradient(180deg, var(--my-bg-color-page) 0, color-mix(in srgb, var(--my-bg-color-page) 96%, white) 100%);
}

.playground__hero,
.playground__card {
  max-width: 880px;
  margin: 0 auto 20px;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 16%, transparent);
  border-radius: 24px;
  background: color-mix(in srgb, var(--my-bg-color-container) 94%, white);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.playground__hero {
  display: grid;
  gap: 16px;
}

.playground__eyebrow {
  margin: 0 0 8px;
  color: var(--my-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.playground h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
}

.playground__summary,
.playground__text,
.playground__dialog-text {
  margin: 0;
  line-height: 1.7;
  color: var(--my-text-color-secondary);
}

.playground__select {
  max-width: 360px;
}
</style>

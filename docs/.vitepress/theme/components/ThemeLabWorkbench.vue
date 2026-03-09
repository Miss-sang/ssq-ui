<template>
  <div class="theme-lab">
    <section class="theme-lab-hero">
      <div class="theme-lab-hero__copy">
        <p class="theme-lab-hero__eyebrow">主题系统</p>
        <h1>主题定制</h1>
        <p class="theme-lab-hero__summary">
          基于全局 CSS 变量、ConfigProvider 与 useTheme 的运行时主题能力，支持预设主题、
          主色覆盖、圆角策略、动效模式和弹层继承。
        </p>
      </div>
      <div class="theme-lab-hero__status">
        <div>
          <span>当前模式</span>
          <strong>{{ resolvedModeLabel }}</strong>
        </div>
        <div>
          <span>当前预设</span>
          <strong>{{ presetLabel }}</strong>
        </div>
        <div>
          <span>动效策略</span>
          <strong>{{ motionLabel }}</strong>
        </div>
      </div>
    </section>

    <section class="theme-lab-section">
      <div class="theme-lab-section__header">
        <div>
          <h2>主题控制面板</h2>
          <p>所有设置都直接写入根节点，页面主体和 Teleport 弹层使用同一份主题状态。</p>
        </div>
        <MyButton type="default" @click="reset">重置</MyButton>
      </div>

      <div class="theme-lab-controls">
        <article class="theme-lab-control-card">
          <header>
            <h3>模式</h3>
            <span>light / dark / system</span>
          </header>
          <div class="theme-lab-chip-row">
            <button
              v-for="option in modeOptions"
              :key="option.value"
              class="theme-lab-chip"
              :class="{ 'is-active': theme.mode === option.value }"
              type="button"
              @click="setMode(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </article>

        <article class="theme-lab-control-card">
          <header>
            <h3>预设</h3>
            <span>default / ocean / forest / sunset</span>
          </header>
          <div class="theme-lab-chip-row">
            <button
              v-for="option in presetOptions"
              :key="option.value"
              class="theme-lab-chip theme-lab-chip--tone"
              :class="{ 'is-active': theme.preset === option.value }"
              :style="{ '--theme-lab-chip-color': option.color }"
              type="button"
              @click="setPreset(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </article>

        <article class="theme-lab-control-card">
          <header>
            <h3>主色</h3>
            <span>自定义品牌主色</span>
          </header>
          <label class="theme-lab-color-field">
            <input type="color" :value="theme.primary" @input="handlePrimaryInput" />
            <span>{{ theme.primary }}</span>
          </label>
        </article>

        <article class="theme-lab-control-card">
          <header>
            <h3>圆角</h3>
            <span>default / rounded / pill</span>
          </header>
          <div class="theme-lab-chip-row">
            <button
              v-for="option in radiusOptions"
              :key="option.value"
              class="theme-lab-chip"
              :class="{ 'is-active': theme.radius === option.value }"
              type="button"
              @click="setRadius(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </article>

        <article class="theme-lab-control-card">
          <header>
            <h3>动效</h3>
            <span>system / normal / reduced</span>
          </header>
          <div class="theme-lab-chip-row">
            <button
              v-for="option in motionOptions"
              :key="option.value"
              class="theme-lab-chip"
              :class="{ 'is-active': theme.motion === option.value }"
              type="button"
              @click="setMotion(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="theme-lab-section">
      <div class="theme-lab-section__header">
        <div>
          <h2>实时预览</h2>
          <p>当前 token 会立即影响基础组件和弹层内容，方便确认视觉与交互是否一致。</p>
        </div>
      </div>

      <div class="theme-lab-preview">
        <div class="theme-lab-preview__panel">
          <MySpace direction="vertical" size="lg">
            <MySpace wrap size="sm">
              <MyButton type="primary">主要按钮</MyButton>
              <MyButton type="default">次要按钮</MyButton>
              <MyButton type="dashed">虚线按钮</MyButton>
              <MyButton type="link">链接按钮</MyButton>
            </MySpace>

            <MyInput
              v-model="previewInputValue"
              clearable
              show-password
              placeholder="输入一段预览内容"
            />

            <MySelect
              v-model="previewSelectValue"
              :options="previewOptions"
              filterable
              clearable
              :teleport="false"
              placeholder="选择当前关注的能力"
            />

            <MySpace wrap size="sm" class="theme-lab-preview__actions">
              <MyButton type="primary" @click="previewDialogOpen = true">打开对话框</MyButton>
              <span class="theme-lab-preview__hint">
                实时预览中的浮层会约束在当前卡片内部，避免打断文档页面滚动和布局。
              </span>
            </MySpace>
          </MySpace>

          <div class="theme-lab-dialog-preview">
            <MyDialog
              v-model:open="previewDialogOpen"
              title="主题预览"
              :teleport="false"
              :lock-scroll="false"
            >
              <p>
                实时预览中的 Dialog 和 Select 共用同一套主题
                token，同时把遮罩和弹层限制在卡片内部，避免覆盖整页文档。
              </p>
              <template #footer>
                <MyButton type="default" @click="previewDialogOpen = false">取消</MyButton>
                <MyButton type="primary">确认</MyButton>
              </template>
            </MyDialog>
          </div>
        </div>
      </div>
    </section>

    <ThemeLabStateBoard />

    <section class="theme-lab-section">
      <div class="theme-lab-section__header">
        <div>
          <h2>导出结果</h2>
          <p>可以直接复制当前主题配置，或导出对应的 CSS 变量覆盖片段。</p>
        </div>
      </div>

      <div class="theme-lab-export-grid">
        <article class="theme-lab-export-card">
          <header>
            <h3>ThemeConfig JSON</h3>
            <MyButton
              type="default"
              :disabled="!copyAvailable"
              @click="copyPayload('json', themeConfigText)"
            >
              {{ jsonCopyLabel }}
            </MyButton>
          </header>
          <pre>{{ themeConfigText }}</pre>
        </article>

        <article class="theme-lab-export-card">
          <header>
            <h3>CSS Variables</h3>
            <MyButton
              type="default"
              :disabled="!copyAvailable"
              @click="copyPayload('css', cssTokenText)"
            >
              {{ cssCopyLabel }}
            </MyButton>
          </header>
          <pre>{{ cssTokenText }}</pre>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useTheme,
  type ThemeMode,
  type ThemeMotion,
  type ThemePreset,
  type ThemeRadius
} from '../../../../src/theme'
import type { SelectValue } from '../../../../src/components/select'
import ThemeLabStateBoard from './ThemeLabStateBoard.vue'

const {
  theme,
  resolvedMode,
  setMode,
  setPreset,
  setPrimary,
  setRadius,
  setMotion,
  reset,
  exportTokens
} = useTheme()

const modeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

const presetOptions: Array<{ label: string; value: ThemePreset; color: string }> = [
  { label: '默认', value: 'default', color: '#1890ff' },
  { label: '海洋', value: 'ocean', color: '#0f766e' },
  { label: '森林', value: 'forest', color: '#2f9e44' },
  { label: '日落', value: 'sunset', color: '#f97316' }
]

const radiusOptions: Array<{ label: string; value: ThemeRadius }> = [
  { label: '默认', value: 'default' },
  { label: '圆润', value: 'rounded' },
  { label: '胶囊', value: 'pill' }
]

const motionOptions: Array<{ label: string; value: ThemeMotion }> = [
  { label: '跟随系统', value: 'system' },
  { label: '标准', value: 'normal' },
  { label: '减少动效', value: 'reduced' }
]

const previewOptions = [
  { label: 'ConfigProvider', value: 'provider' },
  { label: 'useTheme Hook', value: 'hook' },
  { label: '全局弹层继承', value: 'overlay' }
]

const previewInputValue = ref('主题驱动的输入体验')
const previewSelectValue = ref<SelectValue>('provider')
const previewDialogOpen = ref(false)
const copiedState = ref<'json' | 'css' | null>(null)

const copyAvailable = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'
)

const resolvedModeLabel = computed(() => findLabel(modeOptions, resolvedMode.value))
const presetLabel = computed(() => findLabel(presetOptions, theme.preset))
const motionLabel = computed(() => findLabel(motionOptions, theme.motion))

const jsonCopyLabel = computed(() => {
  if (!copyAvailable.value) {
    return '当前环境不支持复制'
  }

  return copiedState.value === 'json' ? '已复制' : '复制 JSON'
})

const cssCopyLabel = computed(() => {
  if (!copyAvailable.value) {
    return '当前环境不支持复制'
  }

  return copiedState.value === 'css' ? '已复制' : '复制 CSS'
})

const themeConfigText = computed(() =>
  JSON.stringify(
    {
      mode: theme.mode,
      preset: theme.preset,
      primary: theme.primary,
      radius: theme.radius,
      motion: theme.motion
    },
    null,
    2
  )
)

const cssTokenText = computed(() => {
  const lines = Object.entries(exportTokens()).map(([token, value]) => `  ${token}: ${value};`)
  return `:root {\n${lines.join('\n')}\n}`
})

function findLabel<T extends { label: string; value: string }>(options: T[], value: string) {
  return options.find(option => option.value === value)?.label ?? value
}

function handlePrimaryInput(event: Event) {
  const nextValue = (event.target as HTMLInputElement | null)?.value

  if (nextValue) {
    setPrimary(nextValue)
  }
}

async function copyPayload(type: 'json' | 'css', text: string) {
  if (!copyAvailable.value) {
    return
  }

  await navigator.clipboard.writeText(text)
  copiedState.value = type

  window.setTimeout(() => {
    if (copiedState.value === type) {
      copiedState.value = null
    }
  }, 1200)
}
</script>

<style scoped>
.theme-lab {
  display: grid;
  gap: 28px;
  font-family: var(--my-font-family-base);
  line-height: 1.6;
}

.theme-lab-hero {
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--my-color-primary) 18%, white) 0,
      transparent 34%
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--my-surface-elevated) 92%, white) 0,
      color-mix(in srgb, var(--my-bg-color-page) 88%, white) 100%
    );
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 20%, transparent);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.1);
}

.theme-lab-hero__eyebrow {
  margin: 0 0 12px;
  color: var(--my-color-primary);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.theme-lab-hero h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1;
}

.theme-lab-hero__summary {
  max-width: 680px;
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
  font-size: 17px;
}

.theme-lab-hero__status {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.theme-lab-hero__status div {
  padding: 16px 18px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--my-bg-color-container) 82%, white);
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 14%, transparent);
}

.theme-lab-hero__status span {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.theme-lab-hero__status strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.theme-lab-section {
  display: grid;
  gap: 20px;
}

.theme-lab-section__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}

.theme-lab-section__header h2 {
  margin: 0;
  font-size: 24px;
}

.theme-lab-section__header p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.theme-lab-controls {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.theme-lab-preview {
  position: relative;
}

.theme-lab-control-card,
.theme-lab-preview__panel,
.theme-lab-export-card {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 16%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--my-surface-elevated) 94%, white) 0,
    var(--my-surface-elevated) 100%
  );
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.08);
}

.theme-lab-preview__panel {
  position: relative;
  isolation: isolate;
  overflow: visible;
}

.theme-lab-control-card header,
.theme-lab-export-card header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.theme-lab-control-card h3,
.theme-lab-export-card h3 {
  margin: 0;
  font-size: 17px;
}

.theme-lab-control-card span {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.theme-lab-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.theme-lab-chip {
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--my-border-color-base) 80%, white);
  border-radius: 999px;
  background: color-mix(in srgb, var(--my-bg-color-container) 85%, white);
  color: var(--my-text-color-primary);
  cursor: pointer;
  transition:
    transform var(--my-transition-duration-base) var(--my-transition-timing-function-base),
    border-color var(--my-transition-duration-base) var(--my-transition-timing-function-base),
    background-color var(--my-transition-duration-base) var(--my-transition-timing-function-base);
}

.theme-lab-chip:hover {
  transform: translateY(-1px);
  border-color: var(--my-color-primary-light-1);
}

.theme-lab-chip.is-active {
  border-color: var(--my-color-primary);
  background: color-mix(in srgb, var(--my-color-primary) 16%, white);
  color: var(--my-color-primary-dark-1);
}

.theme-lab-chip--tone {
  position: relative;
  padding-left: 28px;
}

.theme-lab-chip--tone::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--theme-lab-chip-color);
  transform: translateY(-50%);
}

.theme-lab-color-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 18%, transparent);
  background: color-mix(in srgb, var(--my-bg-color-page) 84%, white);
}

.theme-lab-color-field input {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.theme-lab-color-field span {
  font-family: var(--my-font-family-mono);
  font-size: 13px;
}

.theme-lab-preview__actions {
  align-items: flex-start;
}

.theme-lab-preview__hint {
  display: inline-flex;
  max-width: 420px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.theme-lab-preview__panel :deep(.my-select) {
  position: relative;
  z-index: 2;
}

.theme-lab-preview__panel :deep(.my-select__dropdown) {
  z-index: calc(var(--my-z-index-popup) + 8);
}

.theme-lab-dialog-preview {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 16%, transparent);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--my-color-primary) 10%, white) 0,
      transparent 48%
    ),
    color-mix(in srgb, var(--my-bg-color-page) 78%, white);
}

.theme-lab-dialog-preview :deep(.my-dialog__overlay) {
  border-radius: inherit;
}

.theme-lab-dialog-preview :deep(.my-dialog) {
  width: min(var(--my-dialog-width), calc(100% - 40px));
  max-width: calc(100% - 40px);
  max-height: calc(100% - 40px);
}

.theme-lab-dialog-preview :deep(.my-dialog__body) {
  overscroll-behavior: contain;
}

.theme-lab-export-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.theme-lab-export-card {
  display: grid;
  gap: 16px;
}

.theme-lab-export-card pre {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: 16px;
  background: color-mix(in srgb, var(--my-color-black) 88%, var(--my-color-primary));
  color: #f8fafc;
  font-family: var(--my-font-family-mono);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .theme-lab-hero,
  .theme-lab-control-card,
  .theme-lab-preview__panel,
  .theme-lab-export-card {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>

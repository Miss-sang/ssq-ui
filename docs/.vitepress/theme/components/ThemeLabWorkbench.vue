<template>
  <div class="theme-editor">
    <section class="theme-editor__hero">
      <div>
        <p class="theme-editor__eyebrow">主题编辑器</p>
        <h1>运行时 Token 实验台</h1>
        <p class="theme-editor__summary">
          在这里可以实时调整主色、圆角和间距等主题令牌。下方预览区与组件库正式发布时使
          用的是同一套运行时主题控制器，所以即使是 Teleport 到页面外层的浮层，也会和文档一起同步更新。
        </p>
      </div>

      <div class="theme-editor__hero-actions">
        <MyButton type="primary" @click="resetThemeState">重置主题</MyButton>
        <MyButton type="default" @click="resetOnlyOverrides">仅清除覆盖值</MyButton>
      </div>
    </section>

    <section class="theme-editor__panel">
      <article class="theme-editor__card">
        <header>
          <h2>主题模式</h2>
          <span>{{ resolvedModeLabel }}</span>
        </header>
        <div class="theme-editor__chip-row">
          <button
            v-for="option in modeOptions"
            :key="option.value"
            class="theme-editor__chip"
            :class="{ 'is-active': theme.mode === option.value }"
            type="button"
            @click="setMode(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </article>

      <article class="theme-editor__card">
        <header>
          <h2>主题预设</h2>
          <span>{{ currentPresetLabel }}</span>
        </header>
        <div class="theme-editor__chip-row">
          <button
            v-for="option in presetOptions"
            :key="option.value"
            class="theme-editor__chip theme-editor__chip--swatch"
            :class="{ 'is-active': theme.preset === option.value }"
            :style="{ '--theme-editor-chip': option.color }"
            type="button"
            @click="setPreset(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </article>

      <article class="theme-editor__card">
        <header>
          <h2>动效偏好</h2>
          <span>{{ currentMotionLabel }}</span>
        </header>
        <div class="theme-editor__chip-row">
          <button
            v-for="option in motionOptions"
            :key="option.value"
            class="theme-editor__chip"
            :class="{ 'is-active': theme.motion === option.value }"
            type="button"
            @click="setMotion(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </article>

      <article class="theme-editor__card">
        <header>
          <h2>主色</h2>
          <span>{{ activePrimary }}</span>
        </header>
        <label class="theme-editor__color-field">
          <input type="color" :value="activePrimary" @input="handlePrimaryInput" />
          <input type="text" :value="activePrimary" @input="handlePrimaryTextInput" />
        </label>
      </article>

      <article class="theme-editor__card theme-editor__card--wide">
        <header>
          <h2>圆角令牌</h2>
          <span>拖动滑杆微调</span>
        </header>
        <div class="theme-editor__control-grid">
          <div v-for="control in radiusControls" :key="control.key" class="theme-editor__control">
            <label :for="control.key">{{ control.label }}</label>
            <input
              :id="control.key"
              type="range"
              min="0"
              max="40"
              step="1"
              :value="resolveLengthValue(control.token)"
              @input="updateLengthToken(control.override, $event)"
            />
            <input
              type="number"
              min="0"
              max="40"
              step="1"
              :value="resolveLengthValue(control.token)"
              @input="updateLengthToken(control.override, $event)"
            />
          </div>
        </div>
      </article>

      <article class="theme-editor__card theme-editor__card--wide">
        <header>
          <h2>间距令牌</h2>
          <span>全局节奏</span>
        </header>
        <div class="theme-editor__control-grid">
          <div v-for="control in spacingControls" :key="control.key" class="theme-editor__control">
            <label :for="control.key">{{ control.label }}</label>
            <input
              :id="control.key"
              type="range"
              min="0"
              max="48"
              step="1"
              :value="resolveLengthValue(control.token)"
              @input="updateLengthToken(control.override, $event)"
            />
            <input
              type="number"
              min="0"
              max="48"
              step="1"
              :value="resolveLengthValue(control.token)"
              @input="updateLengthToken(control.override, $event)"
            />
          </div>
        </div>
      </article>
    </section>

    <section class="theme-editor__preview-grid">
      <article class="theme-editor__preview-card">
        <header>
          <h2>组件预览</h2>
          <p>按钮、选择器、提示和对话框会同步响应同一套主题令牌变化。</p>
        </header>

        <MySpace direction="vertical" size="lg">
          <MySpace wrap size="sm">
            <MyTooltip content="这里可以预览实时换肤后的提示样式。">
              <MyButton type="primary">主要按钮</MyButton>
            </MyTooltip>
            <MyButton type="default">默认按钮</MyButton>
            <MyButton type="dashed">虚线按钮</MyButton>
          </MySpace>

          <MyInput
            v-model="inputValue"
            clearable
            placeholder="输入内容，预览当前主题下的间距和圆角变化"
          />

          <div class="theme-editor__contained-select">
            <MySelect
              v-model="selectedValue"
              :options="selectOptions"
              filterable
              clearable
              :teleport="false"
              placeholder="选择一个预览场景"
            />
          </div>

          <MyButton type="primary" @click="dialogOpen = true">打开对话框预览</MyButton>

          <div class="theme-editor__dialog-sandbox">
            <div v-if="!dialogOpen" class="theme-editor__dialog-placeholder">
              点击上方按钮后，对话框会在这个局部区域里展开，方便直接观察弹层样式。
            </div>
            <MyDialog
              v-model:open="dialogOpen"
              title="主题预览对话框"
              :teleport="false"
              :lock-scroll="false"
            >
              <p>
                这个示例会直接渲染在文档页面内部，不会打断当前浏览流程，适合检查弹层的
                配色、圆角和按钮排版。
              </p>

              <template #footer>
                <MyButton type="default" @click="dialogOpen = false">取消</MyButton>
                <MyButton type="primary" @click="dialogOpen = false">确认</MyButton>
              </template>
            </MyDialog>
          </div>
        </MySpace>
      </article>

      <article class="theme-editor__preview-card">
        <header>
          <h2>表格预览</h2>
          <p>这里集中演示排序、筛选和整表横向滚动时的表现，方便直接检查布局是否协调。</p>
        </header>

        <div class="theme-editor__table-scroll">
          <MyTable
            class="theme-editor__preview-table"
            :columns="tableColumns"
            :data="tableData"
            height="280"
          />
        </div>
        <p class="theme-editor__preview-hint">
          这个预览不会固定首列，横向滚动时整张表会一起移动；固定列能力放在 Table 文档里单独演示。
        </p>
      </article>
    </section>

    <section class="theme-editor__export-grid">
      <article class="theme-editor__export-card">
        <header>
          <h2>主题配置 JSON</h2>
          <MyButton type="default" :disabled="!copyAvailable" @click="copyText(themeConfigText)">
            复制 JSON
          </MyButton>
        </header>
        <pre>{{ themeConfigText }}</pre>
      </article>

      <article class="theme-editor__export-card">
        <header>
          <h2>CSS 变量</h2>
          <MyButton type="default" :disabled="!copyAvailable" @click="copyText(cssText)">
            复制 CSS
          </MyButton>
        </header>
        <pre>{{ cssText }}</pre>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme, type ThemeMode, type ThemeMotion, type ThemePreset } from '../../../../src/theme'
import type { SelectValue } from '../../../../src/components/select'

const {
  theme,
  resolvedMode,
  setMode,
  setPreset,
  setMotion,
  setOverrides,
  resetOverrides,
  reset,
  exportTokens,
  exportThemeConfig
} = useTheme()

const dialogOpen = ref(false)
const inputValue = ref('实时主题预览')
const selectedValue = ref<SelectValue>('runtime')
const copyAvailable = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'
)

const modeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

const presetOptions: Array<{ label: string; value: ThemePreset; color: string }> = [
  { label: '默认', value: 'default', color: '#1890ff' },
  { label: '海洋', value: 'ocean', color: '#0f766e' },
  { label: '森林', value: 'forest', color: '#2f9e44' },
  { label: '落日', value: 'sunset', color: '#f97316' }
]

const motionOptions: Array<{ label: string; value: ThemeMotion }> = [
  { label: '跟随系统', value: 'system' },
  { label: '标准', value: 'normal' },
  { label: '减少动效', value: 'reduced' }
]

const radiusControls = [
  { key: 'radius-xs', label: '圆角 XS', token: '--my-border-radius-xs', override: 'radiusXs' },
  { key: 'radius-sm', label: '圆角 SM', token: '--my-border-radius-sm', override: 'radiusSm' },
  { key: 'radius-md', label: '圆角 MD', token: '--my-border-radius-md', override: 'radiusMd' },
  { key: 'radius-lg', label: '圆角 LG', token: '--my-border-radius-lg', override: 'radiusLg' }
] as const

const spacingControls = [
  { key: 'spacing-xs', label: '间距 XS', token: '--my-spacing-xs', override: 'spacingXs' },
  { key: 'spacing-sm', label: '间距 SM', token: '--my-spacing-sm', override: 'spacingSm' },
  { key: 'spacing-md', label: '间距 MD', token: '--my-spacing-md', override: 'spacingMd' },
  { key: 'spacing-lg', label: '间距 LG', token: '--my-spacing-lg', override: 'spacingLg' },
  { key: 'spacing-xl', label: '间距 XL', token: '--my-spacing-xl', override: 'spacingXl' }
] as const

const selectOptions = [
  { label: '运行时换肤', value: 'runtime' },
  { label: '浮层无障碍', value: 'overlay' },
  { label: '数据展示', value: 'data' }
]

const tableColumns = [
  {
    key: 'name',
    title: '名称',
    dataIndex: 'name',
    width: 180,
    sortable: true,
    filter: { type: 'text', placeholder: '搜索名称' }
  },
  {
    key: 'team',
    title: '团队',
    dataIndex: 'team',
    width: 160,
    filter: {
      type: 'multiple',
      options: [
        { label: '核心', value: '核心' },
        { label: '增长', value: '增长' }
      ]
    }
  },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const tableData = [
  { id: '1', name: '阿尔法', team: '核心', score: 72 },
  { id: '2', name: '布拉沃', team: '增长', score: 88 },
  { id: '3', name: '查理', team: '核心', score: 64 },
  { id: '4', name: '德尔塔', team: '增长', score: 91 }
]

const activePrimary = computed(() => theme.overrides.primary ?? theme.primary)
const exportedTokens = computed(() => exportTokens())
const resolvedModeLabel = computed(
  () => modeOptions.find(option => option.value === resolvedMode.value)?.label ?? resolvedMode.value
)
const currentPresetLabel = computed(
  () => presetOptions.find(option => option.value === theme.preset)?.label ?? theme.preset
)
const currentMotionLabel = computed(
  () => motionOptions.find(option => option.value === theme.motion)?.label ?? theme.motion
)

const themeConfigText = computed(() => JSON.stringify(exportThemeConfig(), null, 2))
const cssText = computed(() => {
  const lines = Object.entries(exportedTokens.value).map(
    ([token, value]) => `  ${token}: ${value};`
  )
  return `:root {\n${lines.join('\n')}\n}`
})

function resolveLengthValue(tokenName: keyof typeof exportedTokens.value) {
  return Number.parseInt(exportedTokens.value[tokenName], 10)
}

function updateLengthToken(overrideKey: string, event: Event) {
  const nextValue = (event.target as HTMLInputElement | null)?.value ?? '0'
  setOverrides({
    [overrideKey]: `${nextValue}px`
  })
}

function handlePrimaryInput(event: Event) {
  const value = (event.target as HTMLInputElement | null)?.value

  if (value) {
    setOverrides({ primary: value })
  }
}

function handlePrimaryTextInput(event: Event) {
  const value = (event.target as HTMLInputElement | null)?.value?.trim()

  if (value) {
    setOverrides({ primary: value })
  }
}

function resetThemeState() {
  reset()
}

function resetOnlyOverrides() {
  resetOverrides()
}

async function copyText(value: string) {
  if (!copyAvailable.value) {
    return
  }

  await navigator.clipboard.writeText(value)
}
</script>

<style scoped>
.theme-editor {
  display: grid;
  gap: 24px;
  font-family: var(--my-font-family-base);
}

.theme-editor__hero,
.theme-editor__card,
.theme-editor__preview-card,
.theme-editor__export-card {
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 16%, transparent);
  border-radius: 24px;
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--my-color-primary) 12%, white) 0,
      transparent 36%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--my-surface-elevated) 94%, white) 0,
      var(--my-surface-elevated) 100%
    );
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.theme-editor__hero {
  display: grid;
  gap: 18px;
  padding: 28px;
}

.theme-editor__eyebrow {
  margin: 0 0 8px;
  color: var(--my-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.theme-editor h1,
.theme-editor h2 {
  margin: 0;
}

.theme-editor__summary {
  max-width: 720px;
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.theme-editor__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.theme-editor__panel {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.theme-editor__card,
.theme-editor__preview-card,
.theme-editor__export-card {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.theme-editor__card header,
.theme-editor__preview-card header,
.theme-editor__export-card header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.theme-editor__card header span,
.theme-editor__preview-card p {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.theme-editor__card--wide {
  grid-column: 1 / -1;
}

.theme-editor__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.theme-editor__chip {
  padding: 10px 14px;
  border: 1px solid var(--my-border-color-base);
  border-radius: 999px;
  background: var(--my-bg-color-container);
  color: var(--my-text-color-primary);
  cursor: pointer;
}

.theme-editor__chip.is-active {
  border-color: var(--my-color-primary);
  background: var(--my-color-primary-light-5);
  color: var(--my-color-primary-dark-1);
}

.theme-editor__chip--swatch {
  position: relative;
  padding-left: 30px;
}

.theme-editor__chip--swatch::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--theme-editor-chip);
  transform: translateY(-50%);
}

.theme-editor__color-field {
  display: grid;
  gap: 12px;
}

.theme-editor__color-field input[type='color'] {
  width: 100%;
  height: 48px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.theme-editor__color-field input[type='text'],
.theme-editor__control input[type='number'] {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--my-border-color-base);
  border-radius: var(--my-border-radius-sm);
  background: var(--my-bg-color-container);
  color: var(--my-text-color-primary);
  box-sizing: border-box;
}

.theme-editor__control-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.theme-editor__control {
  display: grid;
  gap: 8px;
}

.theme-editor__control label {
  font-size: 13px;
  font-weight: 600;
}

.theme-editor__preview-grid,
.theme-editor__export-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.theme-editor__contained-select {
  max-width: 320px;
}

.theme-editor__dialog-sandbox {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 220px;
  overflow: hidden;
  border: 1px dashed color-mix(in srgb, var(--my-color-primary) 24%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--my-bg-color-page) 82%, white);
}

.theme-editor__dialog-placeholder {
  max-width: 320px;
  padding: 20px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}

.theme-editor__dialog-sandbox :deep(.my-dialog__overlay) {
  border-radius: inherit;
}

.theme-editor__table-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.theme-editor__preview-table {
  min-width: 520px;
}

.theme-editor__preview-hint {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.6;
}

.theme-editor__export-card pre {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: 16px;
  background: color-mix(in srgb, var(--my-color-black) 88%, var(--my-color-primary));
  color: #f8fafc;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .theme-editor__hero,
  .theme-editor__card,
  .theme-editor__preview-card,
  .theme-editor__export-card {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>

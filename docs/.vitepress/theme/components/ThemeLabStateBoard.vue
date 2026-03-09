<template>
  <section class="theme-lab-section">
    <div class="theme-lab-section__header">
      <div>
        <h2>组件状态看板</h2>
        <p>仅用于文档展示组件状态，不会自动抢占焦点，也不会干扰页面滚动。</p>
      </div>
    </div>

    <div class="theme-lab-state-grid">
      <article class="theme-lab-state-card">
        <header>
          <h3>Button</h3>
          <span>default / loading / disabled</span>
        </header>

        <div class="theme-lab-state-stack">
          <div class="theme-lab-state-row">
            <strong>默认</strong>
            <MyButton>默认操作</MyButton>
          </div>
          <div class="theme-lab-state-row">
            <strong>加载中</strong>
            <MyButton :loading="true">提交中</MyButton>
          </div>
          <div class="theme-lab-state-row">
            <strong>禁用</strong>
            <MyButton :disabled="true">不可操作</MyButton>
          </div>
        </div>
      </article>

      <article class="theme-lab-state-card">
        <header>
          <h3>Input</h3>
          <span>default / focus / disabled / password</span>
        </header>

        <div class="theme-lab-state-stack">
          <div class="theme-lab-state-row">
            <strong>默认</strong>
            <MyInput v-model="defaultInputValue" placeholder="请输入内容" />
          </div>

          <div class="theme-lab-state-row theme-lab-state-row--visualized-focus">
            <strong>聚焦态预览</strong>
            <MyInput v-model="focusedInputValue" placeholder="聚焦边框样式预览" />
            <small>仅展示焦点视觉状态，不会在页面加载时主动抢占真实焦点。</small>
          </div>

          <div class="theme-lab-state-row">
            <strong>禁用</strong>
            <MyInput v-model="disabledInputValue" placeholder="禁用输入框" :disabled="true" />
          </div>

          <div class="theme-lab-state-row">
            <strong>密码框</strong>
            <MyInput
              v-model="passwordInputValue"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </div>
        </div>
      </article>

      <article class="theme-lab-state-card theme-lab-state-card--wide">
        <header>
          <h3>Select</h3>
          <span>default / open / filterable / empty / disabled</span>
        </header>

        <div class="theme-lab-wide-layout">
          <div class="theme-lab-state-stack">
            <div class="theme-lab-state-row">
              <strong>默认</strong>
              <MySelect
                v-model="defaultSelectValue"
                :options="selectOptions"
                placeholder="请选择框架"
              />
            </div>

            <div class="theme-lab-state-row">
              <strong>可搜索</strong>
              <MySelect
                v-model="filterSelectValue"
                :options="selectOptions"
                filterable
                clearable
                :teleport="false"
                placeholder="输入关键字过滤"
              />
            </div>

            <div class="theme-lab-state-row">
              <strong>空状态</strong>
              <MySelect
                v-model="emptySelectValue"
                :options="[]"
                filterable
                :teleport="false"
                empty-text="当前没有可选项"
                placeholder="空状态预览"
              />
            </div>

            <div class="theme-lab-state-row">
              <strong>禁用</strong>
              <MySelect
                v-model="disabledSelectValue"
                :options="selectOptions"
                :disabled="true"
                placeholder="禁用选择器"
              />
            </div>
          </div>

          <div class="theme-lab-preview-sandbox theme-lab-preview-sandbox--select">
            <div class="theme-lab-preview-sandbox__header">
              <div>
                <strong>展开态预览</strong>
                <p>按需打开下拉面板，不做自动重开，也不会把页面焦点锁死在示例区域。</p>
              </div>
              <MyButton type="dashed" @click="openSelectPreview">打开下拉面板</MyButton>
            </div>

            <MySelect
              ref="openSelectRef"
              v-model="openSelectValue"
              :options="selectOptions"
              :teleport="false"
              placeholder="展开状态预览"
            />
          </div>
        </div>
      </article>

      <article class="theme-lab-state-card theme-lab-state-card--wide">
        <header>
          <h3>Dialog</h3>
          <span>closed preview / open with footer</span>
        </header>

        <div class="theme-lab-wide-layout theme-lab-wide-layout--dialog">
          <div class="theme-lab-dialog-panel">
            <strong>默认关闭</strong>
            <p>对话框预览只会在手动点击后打开，不会在页面挂载时自动打断浏览流程。</p>
            <MyButton type="dashed" @click="openDialogPreview">预览打开态</MyButton>
          </div>

          <div class="theme-lab-preview-sandbox theme-lab-preview-sandbox--dialog">
            <div class="theme-lab-preview-sandbox__header">
              <div>
                <strong>打开态预览</strong>
                <p>示例被约束在当前容器内，且不锁定整页滚动，方便在文档中安全展示弹层。</p>
              </div>
              <MyButton type="default" @click="openDialogPreview">打开对话框</MyButton>
            </div>

            <div class="theme-lab-dialog-preview">
              <MyDialog
                v-model:open="dialogPreviewOpen"
                title="打开态预览"
                :teleport="false"
                :lock-scroll="false"
              >
                <p>这个示例会把对话框限制在局部预览区域中，便于观察弹层样式和 footer 布局。</p>
                <template #footer>
                  <MyButton type="default" @click="dialogPreviewOpen = false">取消</MyButton>
                  <MyButton type="primary" @click="dialogPreviewOpen = false">确认</MyButton>
                </template>
              </MyDialog>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SelectExposes, SelectValue } from '../../../../src/components/select'

const selectOptions = [
  { label: 'Vue 3', value: 'vue' },
  { label: 'React 19', value: 'react' },
  { label: 'Solid', value: 'solid' },
  { label: 'Svelte', value: 'svelte', disabled: true }
]

const defaultInputValue = ref('基础输入体验')
const focusedInputValue = ref('聚焦边框预览')
const disabledInputValue = ref('禁用状态')
const passwordInputValue = ref('ssq-theme-lab')

const defaultSelectValue = ref<SelectValue>('vue')
const openSelectValue = ref<SelectValue>('react')
const filterSelectValue = ref<SelectValue>(null)
const emptySelectValue = ref<SelectValue>(null)
const disabledSelectValue = ref<SelectValue>('solid')
const openSelectRef = ref<SelectExposes>()

const dialogPreviewOpen = ref(false)

async function openSelectPreview() {
  await openSelectRef.value?.open()
}

function openDialogPreview() {
  dialogPreviewOpen.value = true
}
</script>

<style scoped>
.theme-lab-section {
  display: grid;
  gap: 20px;
  font-family: var(--my-font-family-base);
  line-height: 1.6;
}

.theme-lab-section__header h2 {
  margin: 0;
  font-size: 24px;
}

.theme-lab-section__header p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.theme-lab-state-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.theme-lab-state-card {
  display: grid;
  gap: 18px;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 18%, transparent);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--my-color-primary) 14%, white) 0,
      transparent 42%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--my-surface-elevated) 92%, white) 0,
      var(--my-surface-elevated) 100%
    );
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.theme-lab-state-card,
.theme-lab-preview-sandbox,
.theme-lab-dialog-panel {
  font-family: inherit;
}

.theme-lab-state-card header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.theme-lab-state-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.theme-lab-state-card span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.theme-lab-state-card--wide {
  grid-column: 1 / -1;
}

.theme-lab-state-stack {
  display: grid;
  gap: 12px;
}

.theme-lab-state-row {
  display: grid;
  gap: 8px;
}

.theme-lab-state-row strong {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.theme-lab-state-row small {
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.5;
}

.theme-lab-state-row--visualized-focus :deep(.my-input) {
  border-color: var(--my-color-primary);
  box-shadow: 0 0 0 2px var(--my-color-primary-light-5);
}

.theme-lab-wide-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.2fr);
}

.theme-lab-wide-layout--dialog {
  grid-template-columns: minmax(240px, 280px) minmax(320px, 1fr);
}

.theme-lab-preview-sandbox,
.theme-lab-dialog-panel {
  position: relative;
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 18px;
  border: 1px dashed color-mix(in srgb, var(--my-color-primary) 24%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, var(--my-bg-color-page) 76%, white);
}

.theme-lab-preview-sandbox {
  isolation: isolate;
}

.theme-lab-preview-sandbox__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.theme-lab-preview-sandbox__header strong,
.theme-lab-dialog-panel strong {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.theme-lab-preview-sandbox__header p,
.theme-lab-dialog-panel p {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.theme-lab-preview-sandbox--select {
  min-height: 280px;
  overflow: visible;
}

.theme-lab-preview-sandbox--dialog {
  min-height: 320px;
  overflow: hidden;
}

.theme-lab-dialog-preview {
  position: relative;
  min-height: 204px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--my-color-primary) 16%, transparent);
  border-radius: 18px;
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
  width: min(var(--my-dialog-width), calc(100% - 32px));
  max-width: calc(100% - 32px);
  max-height: calc(100% - 32px);
}

.theme-lab-dialog-preview :deep(.my-dialog__body) {
  overscroll-behavior: contain;
}

@media (max-width: 860px) {
  .theme-lab-wide-layout,
  .theme-lab-wide-layout--dialog {
    grid-template-columns: 1fr;
  }
}
</style>

# Input 输入框

用于文本录入、密码输入和轻量搜索场景，支持尺寸切换、清空按钮、密码显隐、前后置图标和防抖搜索事件，样式完全复用现有主题 CSS 变量。

## 基础用法

通过 `v-model` 受控输入值，默认类型为 `text`。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput v-model="value" placeholder="请输入内容" />
    </div>
    <p class="input-demo-text">当前输入：{{ value || '未输入' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}

.input-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

## 尺寸与类型

组件提供 `large`、`default`、`small` 三种尺寸，并支持 `text`、`password`、`number` 三种原生输入类型。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput v-model="largeValue" size="large" placeholder="大尺寸输入框" />
    </div>
    <div class="input-demo-box">
      <MyInput v-model="defaultValue" placeholder="默认尺寸输入框" />
    </div>
    <div class="input-demo-box">
      <MyInput v-model="smallValue" size="small" placeholder="小尺寸输入框" />
    </div>
    <div class="input-demo-box">
      <MyInput v-model="passwordValue" type="password" show-password placeholder="输入密码" />
    </div>
    <div class="input-demo-box">
      <MyInput v-model="numberValue" type="number" placeholder="输入数字字符串" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const largeValue = ref('')
const defaultValue = ref('')
const smallValue = ref('')
const passwordValue = ref('')
const numberValue = ref('')
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}
</style>
```

:::

## 禁用与只读

`disabled` 会完全禁用交互，`readonly` 保留聚焦和选中文本能力，但不允许修改内容。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput v-model="disabledValue" disabled placeholder="禁用状态" />
    </div>
    <div class="input-demo-box">
      <MyInput v-model="readonlyValue" readonly clearable />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const disabledValue = ref('当前不可编辑')
const readonlyValue = ref('当前为只读内容')
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}
</style>
```

:::

## 一键清空

开启 `clearable` 后，输入框有值且处于可交互状态时会显示清空按钮。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput
        v-model="keyword"
        clearable
        placeholder="输入后可一键清空"
        @clear="clearCount += 1"
      />
    </div>
    <p class="input-demo-text">clear 触发次数：{{ clearCount }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('SSQ UI')
const clearCount = ref(0)
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}

.input-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

## 密码显隐

当 `type="password"` 且开启 `show-password` 时，组件会在后置区域显示密码显隐按钮。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput v-model="account" placeholder="请输入账号" />
    </div>
    <div class="input-demo-box">
      <MyInput
        v-model="password"
        type="password"
        show-password
        clearable
        placeholder="请输入登录密码"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const account = ref('frontend@ssq-ui.dev')
const password = ref('123456')
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}
</style>
```

:::

## 前置 / 后置图标

通过 `prefix` 和 `suffix` 插槽复用 `MyIcon` 组件，可以快速构建搜索、筛选、状态提示等输入场景。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput v-model="search" clearable placeholder="搜索组件文档">
        <template #prefix>
          <MyIcon mode="svg" color="var(--my-text-color-placeholder)" label="搜索">
            <path
              d="M447.8 85.3a362.7 362.7 0 1 0 226.5 646l188.4 188.3a42.7 42.7 0 1 0 60.3-60.3L734.6 671a362.7 362.7 0 0 0-286.8-585.7zm0 85.4a277.3 277.3 0 1 1 0 554.6 277.3 277.3 0 0 1 0-554.6z"
            />
          </MyIcon>
        </template>
      </MyInput>
    </div>

    <div class="input-demo-box">
      <MyInput v-model="status" placeholder="后置状态图标">
        <template #suffix>
          <MyIcon mode="svg" color="var(--my-color-success)" label="校验通过">
            <path
              d="M391.7 748.6 170.1 527a42.7 42.7 0 1 1 60.4-60.4l161.2 161.2 401.8-401.8A42.7 42.7 0 1 1 854 286.4L391.7 748.6z"
            />
          </MyIcon>
        </template>
      </MyInput>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')
const status = ref('校验通过')
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 360px;
}
</style>
```

:::

## 防抖搜索

监听 `search` 事件即可获得防抖后的输入值，`debounce` 用于控制触发间隔。

:::demo

```vue
<template>
  <div class="input-demo-stack">
    <div class="input-demo-box">
      <MyInput
        v-model="keyword"
        clearable
        :debounce="500"
        placeholder="输入内容，500ms 后触发 search"
        @search="handleSearch"
      >
        <template #prefix>
          <MyIcon mode="svg" color="var(--my-text-color-placeholder)" label="搜索">
            <path
              d="M447.8 85.3a362.7 362.7 0 1 0 226.5 646l188.4 188.3a42.7 42.7 0 1 0 60.3-60.3L734.6 671a362.7 362.7 0 0 0-286.8-585.7zm0 85.4a277.3 277.3 0 1 1 0 554.6 277.3 277.3 0 0 1 0-554.6z"
            />
          </MyIcon>
        </template>
      </MyInput>
    </div>
    <p class="input-demo-text">最后一次 search：{{ lastSearch || '未触发' }}</p>
    <p class="input-demo-text">search 触发次数：{{ searchCount }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
const lastSearch = ref('')
const searchCount = ref(0)

const handleSearch = value => {
  lastSearch.value = value
  searchCount.value += 1
}
</script>

<style scoped>
.input-demo-stack {
  display: grid;
  gap: 12px;
}

.input-demo-box {
  max-width: 420px;
}

.input-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

## 结合 Button 使用

输入框和按钮组合后，可以快速构建常见的搜索栏布局。

:::demo

```vue
<template>
  <div class="search-demo-stack">
    <div class="search-demo-bar">
      <MyInput
        v-model="keyword"
        clearable
        :debounce="400"
        placeholder="搜索组件、文档或关键字"
        @search="lastSearch = $event"
      >
        <template #prefix>
          <MyIcon mode="svg" color="var(--my-text-color-placeholder)" label="搜索">
            <path
              d="M447.8 85.3a362.7 362.7 0 1 0 226.5 646l188.4 188.3a42.7 42.7 0 1 0 60.3-60.3L734.6 671a362.7 362.7 0 0 0-286.8-585.7zm0 85.4a277.3 277.3 0 1 1 0 554.6 277.3 277.3 0 0 1 0-554.6z"
            />
          </MyIcon>
        </template>
      </MyInput>
      <MyButton type="primary" @click="submitted = keyword">搜索</MyButton>
    </div>
    <p class="search-demo-text">按钮提交值：{{ submitted || '未提交' }}</p>
    <p class="search-demo-text">防抖搜索值：{{ lastSearch || '未触发' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
const submitted = ref('')
const lastSearch = ref('')
</script>

<style scoped>
.search-demo-stack {
  display: grid;
  gap: 12px;
}

.search-demo-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 520px;
}

.search-demo-bar :deep(.my-input) {
  flex: 1;
}

.search-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

## 接口说明

### 属性

| 名称           | 类型                               | 默认值      | 说明                                                         |
| -------------- | ---------------------------------- | ----------- | ------------------------------------------------------------ |
| `modelValue`   | `string`                           | `''`        | 受控输入值，推荐通过 `v-model` 使用。                        |
| `size`         | `'large' \| 'default' \| 'small'`  | `'default'` | 输入框尺寸。                                                 |
| `type`         | `'text' \| 'password' \| 'number'` | `'text'`    | 原生输入类型，`number` 仍保持字符串值语义。                  |
| `disabled`     | `boolean`                          | `false`     | 是否禁用输入框及后置操作按钮。                               |
| `readonly`     | `boolean`                          | `false`     | 是否只读；只读时不会显示清空按钮。                           |
| `placeholder`  | `string`                           | `''`        | 原生占位文本。                                               |
| `clearable`    | `boolean`                          | `false`     | 是否在有值时显示一键清空按钮。                               |
| `showPassword` | `boolean`                          | `false`     | 是否在 `type='password'` 时显示密码显隐按钮。                |
| `debounce`     | `number`                           | `300`       | `search` 事件的防抖时间，单位毫秒；小于等于 `0` 时立即触发。 |

### 事件

| 名称                | 类型                          | 默认值 | 说明                                   |
| ------------------- | ----------------------------- | ------ | -------------------------------------- |
| `update:modelValue` | `(value: string) => void`     | `-`    | 输入值变化时触发，用于驱动 `v-model`。 |
| `input`             | `(value: string) => void`     | `-`    | 用户输入时触发，包含最新字符串值。     |
| `change`            | `(value: string) => void`     | `-`    | 原生 `change` 事件触发时回传最新值。   |
| `focus`             | `(event: FocusEvent) => void` | `-`    | 获取焦点时触发。                       |
| `blur`              | `(event: FocusEvent) => void` | `-`    | 失去焦点时触发。                       |
| `clear`             | `(event: MouseEvent) => void` | `-`    | 点击清空按钮时触发。                   |
| `search`            | `(value: string) => void`     | `-`    | 输入变更后按 `debounce` 节流触发。     |

### 插槽

| 名称     | 类型            | 默认值 | 说明                                                     |
| -------- | --------------- | ------ | -------------------------------------------------------- |
| `prefix` | `() => VNode[]` | `-`    | 前置区域内容，通常用于放置 `MyIcon`。                    |
| `suffix` | `() => VNode[]` | `-`    | 后置自定义内容，会渲染在内建 clear / password 操作之前。 |

### 暴露方法

| 名称     | 类型                            | 默认值 | 说明                          |
| -------- | ------------------------------- | ------ | ----------------------------- |
| `focus`  | `() => void`                    | `-`    | 使原生输入框获得焦点。        |
| `blur`   | `() => void`                    | `-`    | 使原生输入框失去焦点。        |
| `select` | `() => void`                    | `-`    | 选中当前输入值。              |
| `ref`    | `HTMLInputElement \| undefined` | `-`    | 暴露的原生 `input` 元素引用。 |

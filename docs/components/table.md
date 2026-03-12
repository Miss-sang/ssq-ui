# Table 表格

`Table` 是 `ssq-ui` 里的核心数据展示组件，支持单列和多列排序、文本筛选、多选筛选、吸顶表头、固定列、键盘行导航，以及大数据量场景下的自动虚拟滚动。

## 基础用法

:::demo

```vue
<template>
  <div class="table-demo-stack">
    <div class="table-demo-scroll">
      <MyTable class="table-demo-table" :columns="columns" :data="data" height="280" />
    </div>
    <p class="table-demo-hint">当列宽总和超过容器宽度时，可以左右滚动查看完整内容。</p>
  </div>
</template>

<script setup>
const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 180 },
  { key: 'role', title: '岗位', dataIndex: 'role', width: 160 },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const data = [
  { id: '1', name: '阿尔法', role: '工程师', score: 80 },
  { id: '2', name: '布拉沃', role: '设计师', score: 64 },
  { id: '3', name: '查理', role: '工程师', score: 91 }
]
</script>

<style scoped>
.table-demo-stack {
  display: grid;
  gap: 12px;
}

.table-demo-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.table-demo-table {
  min-width: 520px;
}

.table-demo-hint {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.6;
}
</style>
```

:::

## 排序、筛选与插槽

:::demo

```vue
<template>
  <div class="table-demo-stack">
    <div class="table-demo-scroll">
      <MyTable
        class="table-demo-table"
        :columns="columns"
        :data="data"
        height="320"
        @sort-change="sortState = $event"
        @filter-change="filterState = $event"
      >
        <template #cell="{ column, value }">
          <strong v-if="column.key === 'score'">{{ value }}</strong>
          <span v-else>{{ value }}</span>
        </template>
      </MyTable>
    </div>

    <p class="table-demo-meta">
      排序：{{ sortState ? `${sortState.columnKey}:${sortState.order}` : '无' }} | 筛选：{{
        JSON.stringify(filterState)
      }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sortState = ref(null)
const filterState = ref({})

const columns = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 180,
    sortable: true,
    filter: { type: 'text', placeholder: '搜索姓名' }
  },
  {
    key: 'role',
    title: '岗位',
    dataIndex: 'role',
    width: 160,
    filter: {
      type: 'multiple',
      options: [
        { label: '工程师', value: '工程师' },
        { label: '设计师', value: '设计师' }
      ]
    }
  },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const data = [
  { id: '1', name: '阿尔法', role: '工程师', score: 40 },
  { id: '2', name: '布拉沃', role: '设计师', score: 64 },
  { id: '3', name: '查理', role: '工程师', score: 91 },
  { id: '4', name: '德尔塔', role: '工程师', score: 78 }
]
</script>

<style scoped>
.table-demo-stack {
  display: grid;
  gap: 12px;
}

.table-demo-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.table-demo-table {
  min-width: 520px;
}

.table-demo-meta {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}
</style>
```

:::

## 宽表横向滚动

当列数较多或列宽较大时，可以通过外层容器的横向滚动完整查看整张表。下面这个示例里，所有列都会一起滚动，不会单独固定在左侧或右侧。

:::demo

```vue
<template>
  <div class="table-demo-stack">
    <div class="table-demo-scroll">
      <MyTable
        class="table-demo-table table-demo-table--wide"
        :columns="columns"
        :data="data"
        height="280"
      />
    </div>
    <p class="table-demo-hint">左右拖动滚动条时，整张表会一起移动，适合检查宽表布局。</p>
  </div>
</template>

<script setup>
const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 160 },
  { key: 'role', title: '岗位', dataIndex: 'role', width: 160 },
  { key: 'team', title: '团队', dataIndex: 'team', width: 160 },
  { key: 'city', title: '城市', dataIndex: 'city', width: 160 },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const data = [
  { id: '1', name: '阿尔法', role: '工程师', team: '平台', city: '上海', score: 80 },
  { id: '2', name: '布拉沃', role: '设计师', team: '增长', city: '杭州', score: 64 },
  { id: '3', name: '查理', role: '产品经理', team: '核心', city: '深圳', score: 91 }
]
</script>

<style scoped>
.table-demo-stack {
  display: grid;
  gap: 12px;
}

.table-demo-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.table-demo-table {
  min-width: 520px;
}

.table-demo-table--wide {
  min-width: 760px;
}

.table-demo-hint {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.6;
}
</style>
```

:::

## 多列排序

启用 `multipleSort` 后，可以维护一条有序的排序链。普通点击会重置为单列排序，按住 `Shift` 再点击其他表头时，会追加或更新次级排序规则。

:::demo

```vue
<template>
  <div class="table-demo-stack">
    <div class="table-demo-scroll">
      <MyTable
        class="table-demo-table"
        :columns="columns"
        :data="data"
        height="280"
        multiple-sort
        @sort-change="sortState = $event"
      />
    </div>

    <p class="table-demo-meta">当前排序链：{{ JSON.stringify(sortState) }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sortState = ref([])

const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 180, sortable: true },
  { key: 'role', title: '岗位', dataIndex: 'role', width: 160 },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const data = [
  { id: '1', name: '布拉沃', role: '工程师', score: 10 },
  { id: '2', name: '阿尔法', role: '工程师', score: 10 },
  { id: '3', name: '祖鲁', role: '设计师', score: 5 },
  { id: '4', name: '查理', role: '工程师', score: 10 }
]
</script>

<style scoped>
.table-demo-stack {
  display: grid;
  gap: 12px;
}

.table-demo-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.table-demo-table {
  min-width: 520px;
}

.table-demo-meta {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}
</style>
```

:::

## 大数据量

当数据长度超过 `virtualThreshold` 时，`Table` 会只渲染可视区域附近的行，并附带一定的 overscan 以保证滚动观感。

:::demo

```vue
<template>
  <div class="table-demo-stack">
    <div class="table-demo-scroll">
      <MyTable
        class="table-demo-table"
        :columns="columns"
        :data="data"
        height="320"
        :virtual-threshold="100"
      />
    </div>
    <p class="table-demo-hint">示例数据较多时，组件会自动进入虚拟滚动模式。</p>
  </div>
</template>

<script setup>
const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 180 },
  { key: 'role', title: '岗位', dataIndex: 'role', width: 160 },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120 }
]

const data = Array.from({ length: 1000 }, (_, index) => ({
  id: `${index + 1}`,
  name: `第 ${index + 1} 行`,
  role: index % 2 === 0 ? '工程师' : '设计师',
  score: index
}))
</script>

<style scoped>
.table-demo-stack {
  display: grid;
  gap: 12px;
}

.table-demo-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.table-demo-table {
  min-width: 520px;
}

.table-demo-hint {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.6;
}
</style>
```

:::

## 接口说明

### 属性

| 名称                 | 类型                                              | 默认值       | 说明                                                                                    |
| -------------------- | ------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------- |
| `columns`            | `TableColumn[]`                                   | `[]`         | 列配置，支持宽度、固定列、排序和筛选。                                                  |
| `data`               | `Record<string, unknown>[]`                       | `[]`         | 表格数据源。                                                                            |
| `rowKey`             | `string \| ((row, rowIndex) => string \| number)` | `'id'`       | 行唯一标识读取方式。                                                                    |
| `height`             | `number \| string`                                | `undefined`  | 固定可视高度。                                                                          |
| `maxHeight`          | `number \| string`                                | `undefined`  | 最大可视高度。                                                                          |
| `virtualThreshold`   | `number`                                          | `500`        | 超过该数据量阈值后自动启用虚拟滚动。                                                    |
| `estimatedRowHeight` | `number`                                          | `44`         | 未测量行高时使用的估算值。                                                              |
| `overscan`           | `number`                                          | `6`          | 视口上下额外渲染的缓冲行数。                                                            |
| `stickyHeader`       | `boolean`                                         | `true`       | 是否将表头吸附在表格容器顶部。                                                          |
| `multipleSort`       | `boolean`                                         | `false`      | 是否启用多列排序。普通点击重置为单列，`Shift + click` 追加或更新排序链。                |
| `sortState`          | `TableSortState \| null`                          | `undefined`  | 受控排序状态。单列模式会发出 `{ columnKey, order }`，多列模式会发出 `TableSortRule[]`。 |
| `filterState`        | `TableFilterState`                                | `undefined`  | 受控筛选状态。                                                                          |
| `emptyText`          | `string`                                          | `'暂无数据'` | 空状态文案。                                                                            |

### 事件

| 名称                 | 签名                                      | 说明                                                |
| -------------------- | ----------------------------------------- | --------------------------------------------------- |
| `update:sortState`   | `(state: TableSortState \| null) => void` | 排序状态变化时触发。                                |
| `sort-change`        | `(state: TableSortState \| null) => void` | `update:sortState` 的镜像事件，适合做副作用处理。   |
| `update:filterState` | `(state: TableFilterState) => void`       | 筛选应用或清空时触发。                              |
| `filter-change`      | `(state: TableFilterState) => void`       | `update:filterState` 的镜像事件，适合做副作用处理。 |

### 插槽

| 名称     | 签名                                                                                 | 说明               |
| -------- | ------------------------------------------------------------------------------------ | ------------------ |
| `header` | `({ column, columnIndex, sortState, filterState }) => VNode[]`                       | 自定义表头内容。   |
| `cell`   | `({ column, row, value, rowIndex, columnIndex, sortState, filterState }) => VNode[]` | 自定义单元格内容。 |
| `empty`  | `() => VNode[]`                                                                      | 自定义空状态。     |

## 性能说明

`ssq-ui` 内置了一个 `10,000` 行基准测试脚本，可通过 `npm run perf:smoke` 触发。脚本会记录表格的首次渲染耗时和虚拟滚动更新成本，并把结果输出到 `node_modules/.tmp/perf-smoke/table-benchmark.json`。

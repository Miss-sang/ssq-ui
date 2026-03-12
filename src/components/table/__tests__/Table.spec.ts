import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Table from '../src/Table.vue'
import type { TableColumn, TableFilterState, TableSortRule, TableSortState } from '../types'

const baseColumns = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    width: 180,
    fixed: 'left' as const,
    sortable: true,
    filter: {
      type: 'text' as const,
      placeholder: 'Search names'
    }
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    width: 160,
    filter: {
      type: 'multiple' as const,
      options: [
        { label: 'Engineer', value: 'Engineer' },
        { label: 'Designer', value: 'Designer' }
      ]
    }
  },
  {
    key: 'score',
    title: 'Score',
    dataIndex: 'score',
    width: 120,
    sortable: true
  }
]

const baseData = [
  { id: '1', name: 'Alpha', role: 'Engineer', score: 40 },
  { id: '2', name: 'Bravo', role: 'Designer', score: 65 },
  { id: '3', name: 'Charlie', role: 'Engineer', score: 90 }
]

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = []
  callback: ResizeObserverCallback
  elements = new Set<Element>()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    ResizeObserverMock.instances.push(this)
  }

  observe(element: Element) {
    this.elements.add(element)
  }

  disconnect() {
    this.elements.clear()
  }

  flush(element: Element) {
    this.callback(
      [
        {
          target: element
        } as ResizeObserverEntry
      ],
      this as unknown as ResizeObserver
    )
  }
}

describe('MyTable', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    ResizeObserverMock.instances = []
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders rows and supports header/cell slots', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      },
      slots: {
        header: ({ column }: { column: { key: string } }) => `header-${column.key}`,
        cell: ({ column, value }: { column: { key: string }; value: unknown }) =>
          `${column.key}:${String(value)}`
      }
    })

    await nextTick()

    expect(wrapper.text()).toContain('header-name')
    expect(wrapper.text()).toContain('name:Alpha')
    expect(wrapper.findAll('.my-table__row').length).toBeGreaterThan(1)
  })

  it('cycles single-column sorting and emits updates', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      }
    })

    const sortButtons = wrapper.findAll('.my-table__header-button')
    await sortButtons[2]?.trigger('click')
    await nextTick()
    await sortButtons[2]?.trigger('click')
    await nextTick()
    await sortButtons[2]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:sortState')).toEqual([
      [{ columnKey: 'score', order: 'asc' }],
      [{ columnKey: 'score', order: 'desc' }],
      [null]
    ])
  })

  it('supports multi-column sorting with shift-click priority', async () => {
    const data = [
      { id: '1', name: 'Bravo', role: 'Engineer', score: 10 },
      { id: '2', name: 'Alpha', role: 'Engineer', score: 10 },
      { id: '3', name: 'Zulu', role: 'Designer', score: 5 },
      { id: '4', name: 'Charlie', role: 'Engineer', score: 10 }
    ]

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data,
        multipleSort: true
      }
    })

    const sortButtons = wrapper.findAll('.my-table__header-button')
    await sortButtons[2]?.trigger('click')
    await nextTick()
    await sortButtons[0]?.trigger('click', { shiftKey: true })
    await nextTick()

    const emittedStates = wrapper.emitted('update:sortState') as Array<[TableSortRule[]]>
    expect(emittedStates[0]?.[0]).toEqual([{ columnKey: 'score', order: 'asc' }])
    expect(emittedStates[1]?.[0]).toEqual([
      { columnKey: 'score', order: 'asc' },
      { columnKey: 'name', order: 'asc' }
    ])

    const bodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(bodyRows[0]?.text()).toContain('Zulu')
    expect(bodyRows[1]?.text()).toContain('Alpha')
    expect(bodyRows[2]?.text()).toContain('Bravo')
    expect(bodyRows[3]?.text()).toContain('Charlie')

    const indicators = wrapper.findAll('.my-table__sort-indicator').map(node => node.text())
    expect(indicators[0]).toBe('^2')
    expect(indicators[1]).toBe('^1')
    expect(wrapper.findAll('[role="columnheader"]')[0]?.attributes('aria-sort')).toBe('other')
    expect(wrapper.findAll('[role="columnheader"]')[2]?.attributes('aria-sort')).toBe('ascending')
  })

  it('applies text and multiple filters', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      }
    })

    const filterButtons = wrapper.findAll('.my-table__filter-trigger')

    await filterButtons[0]?.trigger('click')
    await nextTick()

    const textInput = wrapper.get('.my-table__filter-panel .my-input__inner')
    await textInput.setValue('br')
    await wrapper.get('.my-table__filter-actions .my-button--primary').trigger('click')
    await nextTick()

    expect(wrapper.emitted('filter-change')?.[0]?.[0]).toEqual({ name: 'br' })
    expect(wrapper.text()).toContain('Bravo')
    expect(wrapper.text()).not.toContain('Alpha')

    await filterButtons[1]?.trigger('click')
    await nextTick()
    await wrapper.get('.my-table__filter-option').trigger('click')
    await wrapper.get('.my-table__filter-actions .my-button--primary').trigger('click')
    await nextTick()

    const latestFilterState = wrapper.emitted('filter-change')?.[1]?.[0] as TableFilterState
    expect(latestFilterState.role).toEqual(['Engineer'])
  })

  it('supports controlled sorting and filtering', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData,
        sortState: {
          columnKey: 'score',
          order: 'desc'
        } satisfies TableSortState,
        filterState: {
          role: ['Engineer']
        } satisfies TableFilterState
      }
    })

    await nextTick()

    expect(wrapper.text()).toContain('Charlie')
    expect(wrapper.text()).not.toContain('Bravo')

    await wrapper.setProps({
      sortState: {
        columnKey: 'score',
        order: 'asc'
      }
    })
    await nextTick()

    const bodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(bodyRows[0]?.text()).toContain('Alpha')
  })

  it('supports controlled multi-column sorting arrays', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: [
          { id: '1', name: 'Charlie', role: 'Engineer', score: 20 },
          { id: '2', name: 'Alpha', role: 'Engineer', score: 20 },
          { id: '3', name: 'Bravo', role: 'Engineer', score: 10 }
        ],
        multipleSort: true,
        sortState: [
          { columnKey: 'score', order: 'asc' },
          { columnKey: 'name', order: 'asc' }
        ] satisfies TableSortRule[]
      }
    })

    await nextTick()

    let bodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(bodyRows[0]?.text()).toContain('Bravo')
    expect(bodyRows[1]?.text()).toContain('Alpha')
    expect(bodyRows[2]?.text()).toContain('Charlie')

    await wrapper.setProps({
      sortState: [
        { columnKey: 'score', order: 'desc' },
        { columnKey: 'name', order: 'desc' }
      ] satisfies TableSortRule[]
    })
    await nextTick()

    bodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(bodyRows[0]?.text()).toContain('Charlie')
    expect(bodyRows[1]?.text()).toContain('Alpha')
    expect(bodyRows[2]?.text()).toContain('Bravo')
  })

  it('renders the empty slot and ignores keyboard navigation without rows', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: []
      },
      slots: {
        empty: () => 'Nothing to render'
      }
    })

    const body = wrapper.get('.my-table__body').element as HTMLDivElement
    body.scrollTop = 24

    await wrapper.get('.my-table__body').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.text()).toContain('Nothing to render')
    expect(body.scrollTop).toBe(24)
  })

  it('virtualizes large datasets', async () => {
    const data = Array.from({ length: 1000 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Row ${index + 1}`,
      role: index % 2 === 0 ? 'Engineer' : 'Designer',
      score: index
    }))

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data,
        virtualThreshold: 100,
        height: 320
      }
    })

    await nextTick()

    expect(wrapper.findAll('.my-table__row').length).toBeLessThan(80)
    expect(wrapper.find('.my-table__spacer').attributes('style')).toContain('height')
  })

  it('updates height cache with ResizeObserver callbacks', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      }
    })

    await nextTick()

    const firstBodyRow = wrapper.findAll('.my-table__row')[1]?.element as HTMLDivElement

    Object.defineProperty(firstBodyRow, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        height: 72
      })
    })

    ResizeObserverMock.instances[0]?.flush(firstBodyRow)
    await nextTick()

    expect(wrapper.find('.my-table__spacer').attributes('style')).toContain('height: 160px')
  })

  it('supports nested and numeric data indices, right-fixed cells, and empty values', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        rowKey: (row: Record<string, unknown>) => Number(row.order),
        columns: [
          {
            key: 'status',
            title: 'Status',
            dataIndex: 'meta.status',
            minWidth: '180px'
          },
          {
            key: 'score',
            title: 'Score',
            dataIndex: 0 as never,
            fixed: 'right',
            align: 'right'
          },
          {
            key: 'notes',
            title: 'Notes',
            dataIndex: 'notes'
          }
        ],
        data: [
          {
            id: '1',
            order: 1,
            meta: {
              status: 'Ready'
            },
            0: '42',
            notes: null
          }
        ] as Array<Record<string, unknown>>
      }
    })

    await nextTick()

    const bodyRows = wrapper.findAll('.my-table__row')
    const bodyCells = bodyRows[1]?.findAll('.my-table__cell') ?? []

    expect(wrapper.text()).toContain('Ready')
    expect(bodyCells[1]?.attributes('style')).toContain('right: 0px')
    expect(bodyCells[1]?.attributes('style')).toContain('text-align: right')
    expect(bodyCells[2]?.text()).toBe('')
  })

  it('keeps keyboard navigation inside the visible area', async () => {
    const data = Array.from({ length: 60 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Row ${index + 1}`,
      role: 'Engineer',
      score: index
    }))

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data,
        height: 240,
        virtualThreshold: 20
      }
    })

    const body = wrapper.get('.my-table__body').element as HTMLDivElement

    Object.defineProperty(body, 'clientHeight', {
      configurable: true,
      value: 240
    })

    for (let index = 0; index < 12; index += 1) {
      await wrapper.get('.my-table__body').trigger('keydown', { key: 'ArrowDown' })
    }

    expect(body.scrollTop).toBeGreaterThan(0)
    expect(wrapper.find('.my-table__row.is-active').text()).toContain('Row 13')
  })

  it('updates scroll position when navigating upward and on manual body scroll', async () => {
    const data = Array.from({ length: 60 }, (_, index) => ({
      id: `${index + 1}`,
      name: `Row ${index + 1}`,
      role: 'Engineer',
      score: index
    }))

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data,
        height: 240,
        virtualThreshold: 20
      }
    })

    const body = wrapper.get('.my-table__body').element as HTMLDivElement

    Object.defineProperty(body, 'clientHeight', {
      configurable: true,
      value: 240
    })

    for (let index = 0; index < 12; index += 1) {
      await wrapper.get('.my-table__body').trigger('keydown', { key: 'ArrowDown' })
    }

    body.scrollTop = 500
    await wrapper.get('.my-table__body').trigger('scroll')
    await wrapper.get('.my-table__body').trigger('keydown', { key: 'ArrowUp' })

    expect(body.scrollTop).toBe(484)
    expect(wrapper.find('.my-table__row.is-active').text()).toContain('Row 12')
  })

  it('applies sticky header and fixed column styles', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData,
        stickyHeader: true
      }
    })

    await nextTick()

    expect(wrapper.get('.my-table__header').classes()).toContain('is-sticky')
    const firstHeaderCell = wrapper.find('.my-table__cell--header')
    expect(firstHeaderCell.attributes('style')).toContain('left: 0px')
  })

  it('closes filter panels on repeated toggles or outside clicks and clears empty drafts', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      }
    })

    const filterButtons = wrapper.findAll('.my-table__filter-trigger')

    await filterButtons[1]?.trigger('click')
    await nextTick()
    await wrapper.get('.my-table__filter-option').trigger('click')
    await wrapper.get('.my-table__filter-option').trigger('click')
    await wrapper.get('.my-table__filter-actions .my-button--primary').trigger('click')
    await nextTick()

    expect(wrapper.emitted('filter-change')?.[0]?.[0]).toEqual({})

    await filterButtons[0]?.trigger('click')
    await nextTick()
    expect(wrapper.find('.my-table__filter-panel').exists()).toBe(true)

    await filterButtons[0]?.trigger('click')
    await nextTick()
    expect(wrapper.find('.my-table__filter-panel').exists()).toBe(false)

    await filterButtons[0]?.trigger('click')
    await nextTick()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()

    expect(wrapper.find('.my-table__filter-panel').exists()).toBe(false)
  })

  it('keeps filter panels inside table bounds when positioned near the edges', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: [
          {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            width: 180,
            filter: { type: 'text', placeholder: 'Search names' }
          },
          {
            key: 'team',
            title: 'Team',
            dataIndex: 'team',
            width: 160,
            filter: {
              type: 'multiple',
              options: [
                { label: 'Core', value: 'Core' },
                { label: 'Growth', value: 'Growth' }
              ]
            }
          }
        ],
        data: [
          { id: '1', name: 'Alpha', team: 'Core' },
          { id: '2', name: 'Bravo', team: 'Growth' }
        ]
      }
    })

    await nextTick()

    const root = wrapper.get('.my-table').element as HTMLDivElement
    const headerCells = wrapper.findAll('.my-table__cell--header').map(item => item.element as HTMLDivElement)

    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 100,
        top: 40,
        right: 420,
        bottom: 280,
        width: 320,
        height: 240
      })
    })

    Object.defineProperty(headerCells[0], 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 102,
        top: 40,
        right: 282,
        bottom: 88,
        width: 180,
        height: 48
      })
    })

    Object.defineProperty(headerCells[1], 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 284,
        top: 40,
        right: 444,
        bottom: 88,
        width: 160,
        height: 48
      })
    })

    const filterButtons = wrapper.findAll('.my-table__filter-trigger')

    await filterButtons[0]?.trigger('click')
    await nextTick()

    let filterPanel = wrapper.get('.my-table__filter-panel').element as HTMLDivElement

    Object.defineProperty(filterPanel, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 220,
        bottom: 120,
        width: 220,
        height: 120
      })
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.get('.my-table__filter-panel').attributes('style')).toContain('left: 8px')
    expect(wrapper.get('.my-table__filter-panel').attributes('style')).toContain('top: 56px')

    await filterButtons[1]?.trigger('click')
    await nextTick()

    filterPanel = wrapper.get('.my-table__filter-panel').element as HTMLDivElement

    Object.defineProperty(filterPanel, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 220,
        bottom: 120,
        width: 220,
        height: 120
      })
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.get('.my-table__filter-panel').attributes('style')).toContain('left: 92px')
  })

  it('supports custom filter matchers, stable custom sorts, and missing sort columns', async () => {
    const textMatch = vi.fn(
      ({ row, query }: { value: unknown; query: string; row: Record<string, unknown> }) =>
        String(row.name ?? '').toLowerCase().endsWith(query)
    )
    const multipleMatch = vi.fn(
      ({ row, selectedValues }: { value: unknown; selectedValues: string[]; row: Record<string, unknown> }) =>
        selectedValues.includes(String(row.role ?? '').toUpperCase())
    )
    const columns: Array<TableColumn<Record<string, unknown>>> = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sortable: true,
        sorter: () => 0,
        filter: {
          type: 'text' as const,
          match: textMatch
        }
      },
      {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        filter: {
          type: 'multiple' as const,
          options: [
            { label: 'ENGINEER', value: 'ENGINEER' },
            { label: 'DESIGNER', value: 'DESIGNER' }
          ],
          match: multipleMatch
        }
      },
      {
        key: 'status',
        title: 'Status'
      }
    ]

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns,
        data: [
          { id: '1', name: 'Alpha', role: 'ENGINEER' },
          { id: '2', name: 'Beta', role: 'DESIGNER' },
          { id: '3', name: 'Gamma', role: 'ENGINEER' }
        ] as Array<Record<string, unknown>>,
        sortState: {
          columnKey: 'missing',
          order: 'asc'
        }
      }
    })

    await nextTick()

    const initialBodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(initialBodyRows[0]?.text()).toContain('Alpha')

    await wrapper.findAll('.my-table__header-button')[2]?.trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:sortState')).toBeUndefined()

    await wrapper.findAll('.my-table__header-button')[0]?.trigger('click')
    await nextTick()

    const sortedBodyRows = wrapper.findAll('.my-table__row').slice(1)
    expect(sortedBodyRows[0]?.text()).toContain('Alpha')

    await wrapper.findAll('.my-table__filter-trigger')[0]?.trigger('click')
    await nextTick()
    await wrapper.get('.my-table__filter-panel .my-input__inner').setValue('ma')
    await wrapper.get('.my-table__filter-actions .my-button--primary').trigger('click')
    await nextTick()

    expect(textMatch).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Gamma')
    expect(wrapper.text()).not.toContain('Alpha')

    await wrapper.findAll('.my-table__filter-trigger')[1]?.trigger('click')
    await nextTick()
    const multiOptions = wrapper.findAll('.my-table__filter-option')
    await multiOptions[0]?.trigger('click')
    await wrapper.get('.my-table__filter-actions .my-button--primary').trigger('click')
    await nextTick()

    expect(multipleMatch).toHaveBeenCalled()
  })

  it('works without ResizeObserver and cleans up row observers on unmount', async () => {
    vi.stubGlobal('ResizeObserver', undefined)

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: baseColumns,
        data: baseData
      }
    })

    await nextTick()

    expect(wrapper.findAll('.my-table__row').length).toBeGreaterThan(1)

    wrapper.unmount()
  })
})

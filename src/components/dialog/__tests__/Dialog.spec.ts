import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetBodyScrollLock, resetOverlayRegistry } from '../../../hooks/overlay'
import Dialog from '../src/Dialog.vue'
import type { DialogCloseReason, DialogExposes } from '../types'

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('MyDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    resetBodyScrollLock()
    resetOverlayRegistry()
    vi.restoreAllMocks()
  })

  it('teleports to body when open', async () => {
    mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Dialog title'
      }
    })

    await nextTick()

    const root = document.body.querySelector('.my-dialog-root') as HTMLElement | null
    expect(document.body.querySelector('.my-dialog')).not.toBeNull()
    expect(document.body.querySelector('.my-dialog__overlay')).not.toBeNull()
    expect(root?.dataset.renderMode).toBe('global')
  })

  it('renders inside the host when teleport is false', async () => {
    const Host = defineComponent({
      components: { Dialog },
      template: `
        <div
          class="inline-host"
          style="position: relative; width: 360px; min-height: 240px;"
        >
          <Dialog
            :open="true"
            title="Contained dialog"
            :teleport="false"
            :lock-scroll="false"
          />
        </div>
      `
    })

    const wrapper = mount(Host, {
      attachTo: document.body
    })

    await nextTick()

    const host = wrapper.find('.inline-host').element as HTMLElement
    const root = host.querySelector('.my-dialog-root') as HTMLElement | null

    expect(root).not.toBeNull()
    expect(root?.dataset.renderMode).toBe('contained')
    expect(document.body.style.overflow).toBe('')
  })

  it('emits update:open when overlay is clicked', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true }
    })

    const overlay = document.body.querySelector('.my-dialog__overlay') as HTMLElement | null
    overlay?.click()
    await nextTick()

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('does not emit update:open when overlay click close is disabled', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        closeOnClickOverlay: false
      }
    })

    const overlay = document.body.querySelector('.my-dialog__overlay') as HTMLElement | null
    overlay?.click()
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('closes when Escape is pressed', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true }
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('does not close on Escape when disabled', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        closeOnPressEscape: false
      }
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('passes the correct reason to beforeClose for close button clicks', async () => {
    const beforeClose = vi.fn(() => true)
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        beforeClose
      }
    })

    const closeButton = document.body.querySelector('.my-dialog__close') as HTMLElement | null
    closeButton?.click()
    await nextTick()

    expect(beforeClose).toHaveBeenCalledWith('close-button')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('blocks close when beforeClose returns false', async () => {
    const beforeClose = vi.fn((reason: DialogCloseReason) => reason !== 'overlay')
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        beforeClose
      }
    })

    const overlay = document.body.querySelector('.my-dialog__overlay') as HTMLElement | null
    overlay?.click()
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('waits for async beforeClose before emitting update:open', async () => {
    const deferred = createDeferred<boolean>()
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        beforeClose: () => deferred.promise
      }
    })

    const closeButton = document.body.querySelector('.my-dialog__close') as HTMLElement | null
    closeButton?.click()
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()

    deferred.resolve(true)
    await deferred.promise
    await nextTick()

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('restores focus to the trigger when the dialog closes', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true, title: 'Focus dialog' }
    })

    const closeButton = document.body.querySelector('.my-dialog__close') as HTMLElement | null
    await nextTick()
    expect(document.activeElement).toBe(closeButton)

    await wrapper.setProps({ open: false })
    await nextTick()

    expect(document.activeElement).toBe(trigger)
  })

  it('removes body scroll lock after close', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true }
    })

    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    await nextTick()
    const transition = wrapper.findComponent({ name: 'Transition' })
    transition.vm.$emit('after-leave')
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('increments root z-index variables for stacked dialogs', async () => {
    const Host = defineComponent({
      components: { Dialog },
      template: `
        <div>
          <Dialog :open="true" title="First dialog" />
          <Dialog :open="true" title="Second dialog" />
        </div>
      `
    })

    mount(Host, {
      attachTo: document.body
    })

    await nextTick()

    const roots = Array.from(document.body.querySelectorAll('.my-dialog-root')) as HTMLElement[]

    expect(roots).toHaveLength(2)
    expect(roots[0]?.style.getPropertyValue('--my-dialog-root-z-index')).toBe(
      'calc(var(--my-z-index-modal) + 0)'
    )
    expect(roots[1]?.style.getPropertyValue('--my-dialog-root-z-index')).toBe(
      'calc(var(--my-z-index-modal) + 2)'
    )
  })

  it('destroys content after leaving when destroyOnClose is enabled', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        destroyOnClose: true
      },
      slots: {
        default: '<div class="dialog-content">Dialog body</div>'
      }
    })

    expect(document.body.querySelector('.dialog-content')).not.toBeNull()

    await wrapper.setProps({ open: false })
    await wrapper.getComponent(Dialog).trigger('transitionend')
    await nextTick()

    const transition = wrapper.findComponent({ name: 'Transition' })
    transition.vm.$emit('after-leave')
    await nextTick()

    expect(document.body.querySelector('.dialog-content')).toBeNull()
  })

  it('emits open and close from transition hooks', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true }
    })

    const transition = wrapper.findComponent({ name: 'Transition' })
    transition.vm.$emit('after-enter')
    await nextTick()

    expect(wrapper.emitted('open')).toHaveLength(1)

    await wrapper.setProps({ open: false })
    transition.vm.$emit('after-leave')
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('exposes focus, blur, and close methods', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { open: true }
    })
    const vm = wrapper.vm as unknown as DialogExposes

    await nextTick()
    vm.focus()
    await nextTick()
    expect(document.activeElement).toBe(document.body.querySelector('.my-dialog'))

    vm.blur()
    await nextTick()
    expect(document.activeElement).not.toBe(document.body.querySelector('.my-dialog'))

    await vm.close()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('adds the required aria attributes', () => {
    mount(Dialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Accessible title'
      }
    })

    const dialog = document.body.querySelector('.my-dialog') as HTMLElement | null

    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-labelledby')).toContain('dialog-')
  })
})

import { createApp, h, ref } from 'vue'
import MyUI, { Button, Dialog, Select } from 'ssq-ui'

const options = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo' }
]

const Root = {
  setup() {
    const open = ref(false)
    const value = ref<string | null>('alpha')

    return () =>
      h('div', { class: 'full-import-app' }, [
        h(Button, { type: 'primary', onClick: () => { open.value = !open.value } }, () => 'Full Import Smoke'),
        h(Select, {
          modelValue: value.value,
          options,
          'onUpdate:modelValue': (nextValue: string | null) => {
            value.value = nextValue
          }
        }),
        h(Dialog, { open: open.value, title: 'Smoke dialog' }, () => 'Dialog content')
      ])
  }
}

const app = createApp(Root)
app.use(MyUI)
app.mount('#app')

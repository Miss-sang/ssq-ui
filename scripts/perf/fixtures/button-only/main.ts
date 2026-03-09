import { createApp, h } from 'vue'
import Button from 'ssq-ui/button'

createApp({
  render() {
    return h('div', { class: 'button-only-app' }, [
      h(Button, { type: 'primary' }, () => 'Button Only Smoke')
    ])
  }
}).mount('#app')

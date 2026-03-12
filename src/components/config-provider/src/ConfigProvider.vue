<template>
  <slot />
</template>

<script setup lang="ts">
import { onBeforeUnmount, provide, watch } from 'vue'
import {
  configureThemeManager,
  getThemeController,
  subscribeThemeChanges,
  themeContextKey
} from '../../../utils/theme'
import {
  configProviderDefaults,
  type ConfigProviderEmits,
  type ConfigProviderProps,
  type ConfigProviderSlots
} from '../types'

const props = withDefaults(defineProps<ConfigProviderProps>(), configProviderDefaults)
const emit = defineEmits<ConfigProviderEmits>()
defineSlots<ConfigProviderSlots>()

const controller = getThemeController()
provide(themeContextKey, controller)

const stopSubscribe = subscribeThemeChanges((resolvedTheme) => {
  emit('update:theme', {
    mode: resolvedTheme.mode,
    preset: resolvedTheme.preset,
    primary: resolvedTheme.primary,
    radius: resolvedTheme.radius,
    motion: resolvedTheme.motion,
    overrides: resolvedTheme.overrides
  })
  emit('theme-change', resolvedTheme)
})

watch(
  () => [props.persist, props.storageKey] as const,
  ([persist, storageKey]) => {
    configureThemeManager({ persist, storageKey })
  },
  { immediate: true }
)

watch(
  () => props.theme,
  nextTheme => {
    if (!nextTheme) {
      return
    }

    controller.setTheme(nextTheme)
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  stopSubscribe()
})
</script>

<script lang="ts">
export default {
  name: 'MyConfigProvider'
}
</script>

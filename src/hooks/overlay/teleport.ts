import { computed, type Ref } from 'vue'

export type OverlayTeleportTarget = string | HTMLElement | false

export function useTeleportTarget(teleport: Ref<OverlayTeleportTarget | undefined>) {
  const teleportDisabled = computed(() => teleport.value === false)
  const teleportTarget = computed(() => {
    if (teleport.value === false) {
      return 'body'
    }

    return teleport.value ?? 'body'
  })

  return {
    teleportDisabled,
    teleportTarget
  }
}

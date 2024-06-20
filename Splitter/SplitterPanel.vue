<script setup lang="ts">
// Components
import Splitter from '~/components/Splitter/Splitter.vue'

// Types
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

// Injections
import { registerPanelPropsKey } from '~/components/Splitter/provide/splitter.provide'

const props = withDefaults(defineProps<ISplitterPanelProps>(), {
  collapsedSize: 2,
})

defineExpose({
  getElement: () => component.value,
})

// Injections
const registerPanelProps = injectStrict(registerPanelPropsKey)

// Layout
const component = ref<HTMLElement>()
const slots = useSlots()

const nestedState = ref<boolean | null>(null)
const isNested = computed(() => {
  return slots.default?.().some(child => {
    nestedState.value = child.type === Splitter ? true : null
    return nestedState.value
  })
})
const splitterPanelClass = computed(() => {
  return [
    'splitter-panel',
    {
      'splitter-panel-nested': isNested.value,
    },
  ]
})

// Lifecycle
onMounted(() => {
  registerPanelProps(props)
})
</script>

<template>
  <div
    ref="component"
    :class="splitterPanelClass"
    .getPanelProps="() => props"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
.splitter-panel {
  @apply flex flex-grow;
}

.splitter-panel:not(.splitter-panel-nested) {
  @apply bg-ca;
}

.splitter-panel-nested {
  @apply flex flex-col;
}

.splitter-panel .splitter {
  @apply flex-grow border-0;
}
</style>

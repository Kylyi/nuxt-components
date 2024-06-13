<script setup lang="ts">
// Types
import type { IInputRangeDot } from '~/components/Inputs/InputRange/types/input-range-dot.type'

defineProps<{
  mark: IInputRangeDot
  markClasses?: string
  firstOrLast: boolean
  railHeight: string | number
}>()
</script>

<template>
  <div class="absolute h-full top-1/2 -translate-y-1/2 z-[3]">
    <div
      class="range-mark"
      :class="markClasses"
    >
      {{ mark.value }}
    </div>

    <div
      v-if="!firstOrLast"
      class="range-mark-dot"
      :style="`height: 100%; width: ${railHeight}px;`"
    />
  </div>
</template>

<style scoped lang="scss">
.range-mark {
  --apply: absolute mt-3 bh-black -translate-x-1/2 text-xs;

  &-dot {
    --apply: absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 -z-1 rounded-[50%]
      pointer-events-none;
    background-color: darken(#f3f4f6, 25%);
    content: '';
  }
}
</style>

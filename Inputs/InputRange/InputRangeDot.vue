<script setup lang="ts">
// Types
import type { IInputRangeDot } from '~/components/Inputs/InputRange/types/input-range-dot.type'

const props = defineProps<{
  dot: IInputRangeDot
  dotColor: string
  dotClasses?: string

  /** CSS property name for positioning */
  positionStart: 'left' | 'right'
  progressColor: string

  /** Is dot in focus */
  isInFocus: boolean
  /** Is dot in draging */
  isDragging: boolean

  showTooltip: boolean
  tooltipClasses?: string
}>()

const emits = defineEmits<{
  (e: 'drag-start'): void
}>()

// Layout
const dotPosition = computed(
  () =>
    `${props.positionStart}: ${props.dot.position}%; ${
      props.positionStart === 'left'
        ? 'transform: translateY(-50%) translateX(-50%)'
        : 'transform: translateY(-50%) translateX(50%)'
    }`
)

const tooltipOpacity = computed(() => {
  if (props.isInFocus && props.isDragging) {
    return 'opacity-100'
  }

  if (props.isInFocus && !props.isDragging) {
    return 'opacity-70'
  }

  return 'opacity-0'
})
</script>

<template>
  <div
    class="range-dot"
    :class="[`bg-${dotColor}`, dotClasses]"
    :style="[dotPosition]"
    @mousedown.stop="emits('drag-start')"
    @touchstart.stop.passive="emits('drag-start')"
  >
    <!-- Tooltip -->
    <slot name="tooltip">
      <div
        v-if="showTooltip"
        class="range-dot__tooltip"
        :class="[`bg-${progressColor}`, tooltipClasses, tooltipOpacity]"
      >
        {{ dot.value }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.range-dot {
  --apply: absolute top-1/2 w-3 h-3 rounded-1/2 border border-gray z-100 shadow;

  transition-property: left, right;
  transition-duration: 0.1s;
  transition-timing-function: ease;

  &__tooltip {
    --apply: absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 py-1 px-2
      pointer-events-none text-xs rounded;

    // Disable text selection in tooltip
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;

    transition: opacity 0.2s ease;

    &::before {
      --apply: absolute w-2 h-2 bg-inherit bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
        rotate-45;

      content: '';
    }
  }
}
</style>

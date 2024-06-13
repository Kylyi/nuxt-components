<script setup lang="ts">
// Types
import type { IInputRangeProps } from '~/components/Inputs/InputRange/types/input-range-props.type'

// Utils
import { useInputRangeLayout } from '~/components/Inputs/InputRange/functions/useInputRangeLayout'
import { useInputRangeUtils } from '~/components/Inputs/InputRange/functions/useInputRangeUtils'

const props = withDefaults(defineProps<IInputRangeProps>(), {
  modelValue: 50,
  step: 1, // config.inputRange.defaultStep
  min: 0, // config.inputRange.min
  max: 100, // config.inputRange.max
  direction: 'rtl', // config.inputRange.defaultDirection
  railHeight: 4, // config.inputRange.railHeight
  progressColor: 'primary', // config.inputRange.progressColor
  dotColor: 'white', // config.inputRange.dotColor
  showTooltip: true, // config.inputRange.showTooltip
})

const emits = defineEmits<{
  (e: 'drag-start', dotIndex: number): void
}>()

// Utils
const {
  marks,
  dots,
  progressPosition,
  progressWidth,
  positionStart,
  getValueByPosition,
  getClosestDotIndex,
} = useInputRangeLayout(props)

const { getPos } = useInputRangeUtils()

// Layout
const model = defineModel<number | number[]>({ required: true })

/** Rail HTML element */
const railEl = ref<HTMLDivElement>()

/** Focus of the dot that is in focus now, -1 means no one dot */
const focusDotIndex = ref<number>(-1)

const isDragging = ref(false)
const isFocus = ref(false)

// Functions
/** Get position of event */
function getPosOfEvent(e: MouseEvent | TouchEvent) {
  const { width } = railEl.value!.getBoundingClientRect()
  const { x } = getPos(e, railEl.value!, props.direction === 'ltr')

  return Math.round((x / width) * 100)
}

/** Set value by click on the rail */
function clickHandler(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  isFocus.value = true

  const clickPos = getPosOfEvent(e)

  focusDotIndex.value = getClosestDotIndex(clickPos)

  dragMove(e)
  moveEnd()
}

function dragStart(index: number) {
  focusDotIndex.value = index
  isDragging.value = true
  isFocus.value = true

  emits('drag-start', focusDotIndex.value)
}

function dragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) {
    return false
  }

  e.preventDefault()

  const pos = getPosOfEvent(e)
  const value = getValueByPosition(pos)

  // If event is out of the rail (min side)
  if (value <= props.min) {
    if (Array.isArray(model.value)) {
      model.value[focusDotIndex.value] = props.min
      return
    }

    model.value = props.min
    return
  }

  // If event is out of the rail (max side)
  if (value >= props.max) {
    if (Array.isArray(model.value)) {
      model.value[focusDotIndex.value] = props.max
      return
    }

    model.value = props.max
    return
  }

  // If we have more than 1 dot
  if (Array.isArray(model.value)) {
    model.value[focusDotIndex.value] = value
    return
  }

  model.value = value
}

function moveEnd() {
  isDragging.value = false
}

function blur() {
  isDragging.value = false
  isFocus.value = false
  focusDotIndex.value = -1
}

/** Binding and unbinding all events */
function bindEvents() {
  document.addEventListener('touchmove', dragMove, { passive: false })
  document.addEventListener('touchend', blur, { passive: false })
  document.addEventListener('mousemove', dragMove, { passive: false })
  document.addEventListener('mouseup', moveEnd)
  document.addEventListener('mousedown', blur)
}

function unbindEvent() {
  document.removeEventListener('touchmove', dragMove)
  document.removeEventListener('touchend', blur)
  document.removeEventListener('mousemove', dragMove)
  document.removeEventListener('mouseup', moveEnd)
  document.removeEventListener('mousedown', blur)
}

// Lifecycle
onMounted(() => {
  bindEvents()

  // Validation on init values
  if (typeof model.value === 'number') {
    if (model.value < props.min!) {
      model.value = props.min
    }

    if (model.value > props.max) {
      model.value = props.max
    }
  } else {
    for (let i = 0; i < model.value.length; i++) {
      if (model.value[i] < props.min) {
        model.value[i] = props.min
      }

      if (model.value[i] > props.max) {
        model.value[i] = props.max
      }
    }
  }
})

onUnmounted(unbindEvent)
</script>

<template>
  <div
    relative
    w-full
    :style="[`height: ${+railHeight + 14}px`]"
  >
    <!-- Main rail -->
    <div
      ref="railEl"
      class="rail"
      :class="[railClasses]"
      :style="[`height: ${railHeight}px`]"
      @click.stop.self="clickHandler"
    >
      <!-- Progress bar -->
      <div
        class="progress"
        :class="[progressClasses, `bg-${progressColor}`]"
        :style="[progressPosition, progressWidth]"
      ></div>

      <template
        v-for="(dot, index) in dots"
        :key="index"
      >
        <!-- Dots of values -->
        <div>
          <slot
            name="dot"
            :dot="dot"
            :index="index"
          >
            <InputRangeDot
              :dot="dot"
              :dot-color="dotColor"
              :dot-classes="dotClasses"
              :position-start="positionStart"
              :progress-color="progressColor"
              :is-in-focus="focusDotIndex === index"
              :is-dragging="isDragging"
              :tooltip-classes="tooltipClasses"
              :show-tooltip="showTooltip"
              @drag-start="dragStart(index)"
            />
          </slot>

          <!-- Input for semantic -->
          <input
            :id="`input-range_id_${index}`"
            :value="dot.value"
            type="range"
            class="hidden"
          />
        </div>
      </template>

      <!-- Each step mark -->
      <div class="h-full pointer-events-none">
        <template v-if="marks?.length && showMarks">
          <div
            v-for="(mark, index) in marks"
            :key="mark.position"
            class="h-full absolute"
            :style="`left: ${mark.position}%`"
          >
            <slot
              name="mark"
              :mark="mark"
            >
              <InputRangeMark
                :mark="mark"
                :mark-classes="markClasses"
                :first-or-last="index === 0 || index === marks.length - 1"
                :rail-height="railHeight"
              />
            </slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rail {
  --apply: relative w-full cursor-pointer rounded-full bg-gray-200
    overflow-visible z-[2];

  .progress {
    --apply: absolute h-full rounded-full pointer-events-none z-[3];

    transition-property: width;
    transition-duration: 0.1s;
    transition-timing-function: ease;
  }
}
</style>

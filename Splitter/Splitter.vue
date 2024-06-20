<script setup lang="ts">
// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'

// Utils
import { useSplitterLayout } from '~/components/Splitter/functions/useSplitterLayout'
import { useSplitterMultidirectionResizeLayout } from '~/components/Splitter/functions/useSplitterMultidirectionResizeLayout'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'

const props = withDefaults(defineProps<ISplitterProps>(), {
  gutterSize: 4,
  step: 5,
  layout: 'horizontal',
  ui: () => ({
    noResizeArrowHint: true,
  }),
})

const emits = defineEmits<ISplitterEmit>()

// Utils
const {
  splitterEl,
  gutterEls,
  panels,
  horizontal,
  panelSizes,
  prevSize,
  onResizeStart,
  onResize,
  onResizeEnd,
  clearResizingState,
  splitterClasses,
  gutterStyle,
  gutterHandlerCollapseNextClasses,
  gutterHandlerCollapsePreviousClasses,
} = useSplitterLayout(props, emits)

const {
  isMultidirectionalResizing,
  hasIntersectingBottomGutter,
  hasIntersectingTopGutter,
  onMultiDirectionResizeStart,
  onMultidirectionResize,
  onMultidirectionResizeEnd,
  isIntersectionArea,
  clearMultidirectionalResizingState,
  gutterHandlerTopInterSectionClasses,
  gutterHandlerBottomInterSectionClasses,
} = useSplitterMultidirectionResizeLayout({
  props,
  activeSplitter: splitterEl,
  isHorizontalLayout: horizontal,
  emits,
})

const { getNewPanelFlexBasisSize } = useSplitterUtils(props)

// Listeners
const mouseMoveListener = ref<(event: MouseEvent) => void>()
const mouseUpListener = ref<(event: MouseEvent) => void>()
const touchMoveListener = ref<(event: TouchEvent) => void>()
const touchEndListener = ref<(event: TouchEvent) => void>()

// Functions
function onGutterMouseDown(event: MouseEvent, index: number) {
  // Normal resizing - start
  onResizeStart(event, index)

  // Multidirectional resizing - start
  if (event instanceof MouseEvent) {
    if (isIntersectionArea(event)) {
      isMultidirectionalResizing.value = true
      onMultiDirectionResizeStart(event)
    } else {
      isMultidirectionalResizing.value = false
    }
  }

  bindMouseListeners()
}

function onGutterTouchStart(event: TouchEvent, index: number) {
  onResizeStart(event, index)
  bindTouchListeners()
  event.preventDefault()
}

function onGutterTouchMove(event: TouchEvent) {
  onResize(event)
  event.preventDefault()
}

function onGutterTouchEnd(event: TouchEvent) {
  onResizeEnd(event)
  unbindTouchListeners()
  event.preventDefault()
}

function bindMouseListeners() {
  if (!mouseMoveListener.value) {
    mouseMoveListener.value = (event: MouseEvent) => {
      // Normal resizing
      onResize(event)

      // Multidirectional resizing
      if (isMultidirectionalResizing.value) {
        onMultidirectionResize(event)
      }
    }

    document.addEventListener('mousemove', mouseMoveListener.value)
  }

  if (!mouseUpListener.value) {
    mouseUpListener.value = (event: MouseEvent) => {
      // Normal resizing
      onResizeEnd(event)

      // Multidirectional resizing
      if (isMultidirectionalResizing.value) {
        onMultidirectionResizeEnd()
      }

      unbindMouseListeners()
    }

    document.addEventListener('mouseup', mouseUpListener.value)
  }
}

function unbindMouseListeners() {
  if (mouseMoveListener.value) {
    document.removeEventListener('mousemove', mouseMoveListener.value)
    mouseMoveListener.value = undefined
  }

  if (mouseUpListener.value) {
    document.removeEventListener('mouseup', mouseUpListener.value)
    mouseUpListener.value = undefined
  }
}

function bindTouchListeners() {
  if (!touchMoveListener.value) {
    touchMoveListener.value = (event: TouchEvent) => onResize(event)
    document.addEventListener('touchmove', touchMoveListener.value)
  }

  if (!touchEndListener.value) {
    touchEndListener.value = (event: TouchEvent) => {
      onResizeEnd(event)
      unbindTouchListeners()
    }

    document.addEventListener('touchend', touchEndListener.value)
  }
}

function unbindTouchListeners() {
  if (touchMoveListener.value) {
    document.removeEventListener('touchmove', touchMoveListener.value)
    touchMoveListener.value = undefined
  }

  if (touchEndListener.value) {
    document.removeEventListener('touchend', touchEndListener.value)
    touchEndListener.value = undefined
  }
}

// Lifecycle
onMounted(() => {
  if (panels.value && panels.value.length) {
    if (splitterEl.value) {
      const children = [...splitterEl.value.children].filter(child =>
        (child as HTMLElement).classList.contains('splitter-panel')
      ) as HTMLElement[]

      const _panelSizes: number[] = []
      /**
       * - Setting the size of each panel
       * - If the panel has a size prop, we use it
       * - Otherwise, we set the size of each panel to 100 / number of panels, because we want to make them equal
       */
      panels.value.forEach((panel, i) => {
        const panelInitialSize =
          panel.props && panel.props.size ? panel.props.size : null

        const panelSize = panelInitialSize || 100 / panels.value.length

        _panelSizes[i] = panelSize
        children[i].style.flexBasis = getNewPanelFlexBasisSize(
          panelSize,
          panels.value.length
        )
      })

      panelSizes.value = _panelSizes
      prevSize.value = Number.parseFloat(_panelSizes[0].toString()).toFixed(4)
    }
  }
})

onBeforeUnmount(() => {
  clearResizingState()
  clearMultidirectionalResizingState()
  unbindMouseListeners()
})
</script>

<template>
  <div
    ref="splitterEl"
    :class="splitterClasses"
    :data-p-resizing="false"
  >
    <template
      v-for="(panel, i) of panels"
      :key="i"
    >
      <!-- Pannel -->
      <component
        :is="panel"
        tabindex="-1"
      />

      <!-- Gutter (the handler to resise) -->
      <div
        v-if="i !== panels.length - 1"
        ref="gutterEls"
        role="separator"
        tabindex="-1"
        class="splitter-gutter"
        :data-p-gutter-resizing="false"
        @mousedown="onGutterMouseDown($event, i)"
        @touchstart="onGutterTouchStart($event, i)"
        @touchmove="onGutterTouchMove"
        @touchcancel="onGutterTouchEnd"
      >
        <!-- Intersection points [Top and bottom] (multi-directional resizing) -->
        <div
          v-if="hasIntersectingTopGutter"
          :class="gutterHandlerTopInterSectionClasses"
        />

        <div
          v-if="hasIntersectingBottomGutter"
          :class="gutterHandlerBottomInterSectionClasses"
        />

        <!-- Gutter hnadler -->
        <div
          class="splitter-gutter-handle"
          tabindex="0"
          :style="[gutterStyle]"
        >
          <!-- Gutter hover arrows hint -->
          <template v-if="!ui?.noResizeArrowHint">
            <div :class="gutterHandlerCollapsePreviousClasses" />

            <div :class="gutterHandlerCollapseNextClasses" />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.splitter {
  @apply flex flex-row flex-nowrap;
}

.splitter-vertical {
  @apply flex flex-col;
}

.splitter-gutter {
  @apply relative flex shrink-0 flex-grow-0 items-center justify-center
    cursor-col-resize transition-all duration-0.25s pointer-events-auto;

  &:hover {
    @apply;
  }
}

.splitter-gutter-handle {
  @apply relative;
}

.splitter-horizontal.splitter-resizing {
  @apply cursor-col-resize select-none;
}

.splitter-horizontal > .splitter-gutter > .splitter-gutter-handle {
  @apply w-full h-6;
}

.splitter-horizontal > .splitter-gutter {
  @apply cursor-col-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    @apply invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      @apply absolute top-0.5 left-2;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      @apply absolute bottom-0.5 right-2;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-vertical > .splitter-gutter {
  @apply cursor-row-resize;

  .splitter-gutter-handle-previous,
  .splitter-gutter-handle-next {
    @apply invisible opacity-0;
    transition: visibility 0s, opacity 0.5s linear;
  }

  &:hover {
    .splitter-gutter-handle-previous {
      @apply absolute top-2 left-0.5;
      visibility: visible;
      opacity: 0.7;
    }

    .splitter-gutter-handle-next {
      @apply absolute bottom-2 right-0.5;
      visibility: visible;
      opacity: 0.7;
    }
  }
}

.splitter-gutter-intersection {
  @apply absolute w-3 h-3 z-2 cursor-move;
}

.splitter-vertical.splitter-resizing {
  @apply cursor-row-resize select-none;
}

.splitter-vertical > .splitter-gutter {
  @apply cursor-row-resize w-full;
}

.splitter-vertical > .splitter-gutter > .splitter-gutter-handle {
  @apply h-full w-6;
}
</style>

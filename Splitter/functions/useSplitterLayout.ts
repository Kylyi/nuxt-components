// @unocss-include
// Types
import { type CSSProperties } from 'vue'
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

// Injections
import { registerPanelPropsKey } from '~/components/Splitter/provide/splitter.provide'

// Utils
import { useSplitterDomUtils } from '~/components/Splitter/functions/useSplitterDomUtils'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'

export function useSplitterLayout(props: ISplitterProps, emits: ISplitterEmit) {
  // Utils
  const slots = useSlots()
  const {
    getOuterWidth,
    getOuterHeight,
    getHeight,
    getWidth,
    getNewInnerMouseOrTouchPosition,
  } = useSplitterDomUtils()
  const {
    validatePanelReszie,
    checkAndUpdateCollapsiblePanels,
    getNewPanelFlexBasisSize,
  } = useSplitterUtils(props, emits)

  // Layout
  provide(registerPanelPropsKey, (props: ISplitterPanelProps) =>
    panelsProps.value.push(props)
  )

  const panelsProps = ref<ISplitterPanelProps[]>([])
  const panels = computed(() => {
    const panels: VNode[] = []

    slots.default?.().forEach((child: VNode) => {
      if (isSplitterPanel(child)) {
        panels.push(child)
      } else if (Array.isArray(child.children)) {
        child.children.forEach((child: any) => {
          if (isSplitterPanel(child)) {
            panels.push(child)
          }
        })
      }
    })

    return panels
  })

  const horizontal = computed(() => props.layout === 'horizontal')

  const gutterEls = ref<HTMLElement[]>()
  const gutterElement = ref<HTMLElement>()

  const splitterEl = ref<HTMLElement>()

  const size = ref<number>(0)
  const prevSize = ref<string>('0')
  const prevPanelEl = ref<HTMLElement>()
  const nextPanelEl = ref<HTMLElement>()
  const prevPanelSize = ref<number>(0)
  const nextPanelSize = ref<number>(0)
  const prevPanelIndex = ref<number>(0)
  const panelSizes = ref<number[]>([])
  const startPos = ref<number>(0)
  const dragging = ref(false)

  // Functions
  function onResizeStart(
    event: TouchEvent | MouseEvent,
    index: number,
    isKeyDown?: boolean
  ) {
    // Get the gutter element
    const eventCurrentTarget = event.currentTarget as HTMLElement
    const eventTarget = event.target as HTMLElement

    gutterElement.value = eventCurrentTarget || eventTarget.parentElement

    // Set the size of the splitter (that have panels inside it) - according to the layout
    if (splitterEl.value) {
      size.value = horizontal.value
        ? getWidth(splitterEl.value)
        : getHeight(splitterEl.value)
    }

    // Set the start position and dragging state
    if (!isKeyDown) {
      dragging.value = true

      if (event instanceof MouseEvent) {
        startPos.value = horizontal.value ? event.pageX : event.pageY
      } else if (event instanceof TouchEvent) {
        startPos.value = horizontal.value
          ? event.changedTouches[0].pageX
          : event.changedTouches[0].pageY
      }
    }

    // Set the previous and next panel elements [because we need to resize them]
    prevPanelEl.value = gutterElement.value
      ?.previousElementSibling as HTMLElement
    nextPanelEl.value = gutterElement.value?.nextElementSibling as HTMLElement

    // Set the previous and next panel size [because we need to resize them]
    // If key is down means we are resizing with the keyboard, otherwise we are resizing with the mouse or touch
    if (isKeyDown) {
      prevPanelSize.value = horizontal.value
        ? getOuterWidth(prevPanelEl.value, true)
        : getOuterHeight(prevPanelEl.value, true)

      nextPanelSize.value = horizontal.value
        ? getOuterWidth(nextPanelEl.value, true)
        : getOuterHeight(nextPanelEl.value, true)
    } else {
      prevPanelSize.value =
        (100 *
          (horizontal.value
            ? getOuterWidth(prevPanelEl.value, true)
            : getOuterHeight(prevPanelEl.value, true))) /
        size.value

      nextPanelSize.value =
        (100 *
          (horizontal.value
            ? getOuterWidth(nextPanelEl.value, true)
            : getOuterHeight(nextPanelEl.value, true))) /
        size.value
    }

    // Set the previous panel index
    prevPanelIndex.value = index

    // Emit event
    emits('resizestart', { originalEvent: event })

    if (gutterEls.value) {
      gutterEls.value[index].setAttribute('data-p-gutter-resizing', 'true')
    }

    // Set the resizing state
    splitterEl.value?.setAttribute('data-p-resizing', 'true')
  }

  function onResize(event: TouchEvent | MouseEvent, isKeyDown?: boolean) {
    let newPrevPanelSize, newNextPanelSize

    // Keybord resizing
    if (isKeyDown) {
      if (horizontal.value) {
        newPrevPanelSize =
          (100 * (prevPanelSize?.value + props.step!)) / size.value
        newNextPanelSize =
          (100 * (nextPanelSize?.value - props.step!)) / size.value
      } else {
        newPrevPanelSize =
          (100 * (prevPanelSize?.value - props.step!)) / size.value
        newNextPanelSize =
          (100 * (nextPanelSize?.value + props.step!)) / size.value
      }
    } else {
      // Mouse and touch resizing
      if (event instanceof MouseEvent || event instanceof TouchEvent) {
        const newPos = getNewInnerMouseOrTouchPosition(
          event,
          startPos.value,
          size.value,
          horizontal.value
        )

        if (!isNil(newPos)) {
          newPrevPanelSize = prevPanelSize.value + newPos
          newNextPanelSize = nextPanelSize.value - newPos
        }
      }
    }

    // Start of resizing/collapsing
    if (
      prevPanelEl.value &&
      nextPanelEl.value &&
      newPrevPanelSize &&
      newNextPanelSize
    ) {
      const prevPanelProps = panelsProps.value[prevPanelIndex.value]
      const nextPanelProps = panelsProps.value[prevPanelIndex.value + 1]

      const isValidResize = validatePanelReszie(
        newPrevPanelSize,
        newNextPanelSize,
        prevPanelProps.minSize,
        nextPanelProps.minSize
      )

      if (isValidResize) {
        // Resize the panels
        prevPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
          newPrevPanelSize as number,
          panels.value.length
        )
        nextPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
          newNextPanelSize as number,
          panels.value.length
        )

        panelSizes.value[prevPanelIndex.value] = newPrevPanelSize
        panelSizes.value[prevPanelIndex.value + 1] = newNextPanelSize
        prevSize.value = Number.parseFloat(newPrevPanelSize.toString()).toFixed(
          4
        )

        emits('resize', { originalEvent: event })
      } else {
        // Check and update collapsible panels only if the resizing is not valid
        checkAndUpdateCollapsiblePanels(
          event,
          panels.value.length,
          {
            newPrevPanelSize,
            prevPanelProps,
            element: prevPanelEl.value,
          },
          {
            newNextPanelSize,
            nextPanelProps,
            element: nextPanelEl.value,
          }
        )
      }
    }
  }

  function onResizeEnd(event: TouchEvent | MouseEvent) {
    emits('resizeend', { originalEvent: event })

    gutterEls.value?.forEach(gutter =>
      gutter.setAttribute('data-p-gutter-resizing', 'false')
    )

    splitterEl.value?.setAttribute('data-p-resizing', 'false')

    clearResizingState()
  }

  function isSplitterPanel(child: VNode) {
    return (child.type as any).__name === 'SplitterPanel'
  }

  function clearResizingState() {
    // Clear dragging state
    dragging.value = false

    // Clear size
    size.value = 0
    prevSize.value = '0'

    // Clear start position
    startPos.value = 0

    // Clear [previous, next] panel
    prevPanelEl.value = undefined
    nextPanelEl.value = undefined

    // Clear [previous, next] panel size
    prevPanelSize.value = 0
    nextPanelSize.value = 0

    // Clear gutter element
    gutterElement.value = undefined

    // Clear previous panel index
    prevPanelIndex.value = 0
  }

  // Styling and classes
  const splitterClasses = computed(() => {
    return ['splitter', `splitter-${props.layout}`]
  })

  const gutterStyle = computed<CSSProperties>(() => ({
    [horizontal.value ? 'width' : 'height']: `${props.gutterSize}px`,
  }))

  const gutterHandlerCollapsePreviousClasses = computed(() => [
    'splitter-gutter-handle-previous color-ca',
    { 'i-mdi:arrow-down ': !horizontal.value },
    {
      'i-material-symbols:arrow-forward-rounded': horizontal.value,
    },
  ])

  const gutterHandlerCollapseNextClasses = computed(() => [
    'splitter-gutter-handle-next color-ca',
    { 'i-mdi:arrow-up': !horizontal.value },
    {
      'i-material-symbols:arrow-back-rounded': horizontal.value,
    },
  ])

  return {
    // Layout
    horizontal,
    splitterEl,
    prevSize,
    prevPanelIndex,
    panelSizes,
    gutterEls,
    panels,

    // Functions
    getNewPanelFlexBasisSize,
    onResizeStart,
    onResize,
    onResizeEnd,
    clearResizingState,

    // Styling and classes
    splitterClasses,
    gutterStyle,
    gutterHandlerCollapsePreviousClasses,
    gutterHandlerCollapseNextClasses,
  }
}

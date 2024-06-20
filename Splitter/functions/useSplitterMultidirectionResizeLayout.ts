// @unocss-include
// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'

// Utils
import { useSplitterDomUtils } from '~/components/Splitter/functions/useSplitterDomUtils'
import { useSplitterUtils } from '~/components/Splitter/functions/useSplitterUtils'
import { useSplitterPanelUtils } from '~/components/Splitter/functions/useSplitterPanelUtils'

export function useSplitterMultidirectionResizeLayout(options: {
  props: ISplitterProps
  activeSplitter: Ref<HTMLElement | undefined>
  isHorizontalLayout: Ref<boolean>
  emits: ISplitterEmit
}) {
  const { props, activeSplitter, isHorizontalLayout, emits } = options

  // Utils
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
  const { getPanelPropsFromDom } = useSplitterPanelUtils()

  // Layout
  const multidirectionalParentPanels = ref<Element[]>([])

  const intersectHorizontal = computed(() => !isHorizontalLayout.value)
  const multidirectionalParentSplitter = ref<HTMLElement>()
  const multidirectionParentSplitterSize = ref<number>(0)
  const parentPanelEl = ref<HTMLElement>()
  const prevParentPanelEl = ref<HTMLElement>()
  const prevParentPanelSize = ref<number>(0)
  const nextParentPanelEl = ref<HTMLElement>()
  const nextParentPanelSize = ref<number>(0)
  const intersectStartPos = ref<number>(0)
  const intersectionParentPanelSize = ref<number>(0)
  const isMultidirectionalResizing = ref(false)

  const hasIntersectingTopGutter = computed(() => {
    const mainParentOfSplitter = activeSplitter?.value?.parentElement
    const previousSibiling = mainParentOfSplitter?.previousElementSibling

    if (previousSibiling?.classList.contains('splitter-gutter')) {
      return true
    }

    return false
  })

  const hasIntersectingBottomGutter = computed(() => {
    const mainParentOfSplitter = activeSplitter?.value?.parentElement
    const nextSibiling = mainParentOfSplitter?.nextElementSibling

    if (nextSibiling?.classList.contains('splitter-gutter')) {
      return true
    }

    return false
  })

  // Functions
  function onMultiDirectionResizeStart(event: MouseEvent) {
    const { pageX, pageY } = event
    const elementFromPoint = document.elementFromPoint(pageX, pageY)
    const isIntersectingTop = elementFromPoint?.classList.contains('top')

    // Set the previous and next panel elements [because we need to resize them]
    if (
      activeSplitter.value?.parentElement?.classList.contains('splitter-panel')
    ) {
      parentPanelEl.value = activeSplitter.value?.parentElement

      // Identify previous parent panel respect to the intersection
      prevParentPanelEl.value =
        parentPanelEl.value?.previousElementSibling?.previousElementSibling?.classList.contains(
          'splitter-panel'
        )
          ? (parentPanelEl.value?.previousElementSibling
              .previousElementSibling as HTMLElement)
          : parentPanelEl.value

      // Identify next parent panel respect to the intersection
      nextParentPanelEl.value =
        parentPanelEl.value?.nextElementSibling?.nextElementSibling?.classList.contains(
          'splitter-panel'
        )
          ? (parentPanelEl.value?.nextElementSibling
              .nextElementSibling as HTMLElement)
          : parentPanelEl.value

      /**
       * If both previous and next parent panels exists, we need to check which one is intersecting
       *  according to the intersection point
       */
      if (prevParentPanelEl.value && nextParentPanelEl.value) {
        if (isIntersectingTop) {
          nextParentPanelEl.value = parentPanelEl.value
        } else {
          prevParentPanelEl.value = parentPanelEl.value
        }
      }

      // Setting the parent splitter that holds the panels for multidirectional resizing
      if (prevParentPanelEl.value?.parentElement) {
        multidirectionalParentSplitter.value =
          prevParentPanelEl.value.parentElement
      } else if (nextParentPanelEl.value?.parentElement) {
        multidirectionalParentSplitter.value =
          nextParentPanelEl.value.parentElement
      }
    }

    // Setting the pannels of the parent splitter
    if (multidirectionalParentSplitter.value) {
      multidirectionalParentPanels.value = [
        ...multidirectionalParentSplitter.value?.children,
      ].filter(child => child.classList.contains('splitter-panel'))
    }

    // Set the size of the splitter (that have panels inside it) - according to the layout
    if (multidirectionalParentSplitter.value) {
      multidirectionParentSplitterSize.value = intersectHorizontal.value
        ? getWidth(multidirectionalParentSplitter.value)
        : getHeight(multidirectionalParentSplitter.value)
    }

    // Set the start position according to the intersection point
    if (intersectHorizontal.value) {
      intersectStartPos.value = pageX
    } else {
      intersectStartPos.value = pageY
    }

    // Set the previous and next panel size [because we need to resize them]
    prevParentPanelSize.value =
      (100 *
        (intersectHorizontal.value
          ? getOuterWidth(prevParentPanelEl.value, true)
          : getOuterHeight(prevParentPanelEl.value, true))) /
      multidirectionParentSplitterSize.value

    // For the parent panel
    intersectionParentPanelSize.value =
      (100 *
        (intersectHorizontal.value
          ? getOuterWidth(parentPanelEl.value, true)
          : getOuterHeight(parentPanelEl.value, true))) /
      multidirectionParentSplitterSize.value

    // For the next panel
    nextParentPanelSize.value =
      (100 *
        (intersectHorizontal.value
          ? getOuterWidth(nextParentPanelEl.value, true)
          : getOuterHeight(nextParentPanelEl.value, true))) /
      multidirectionParentSplitterSize.value

    // Set the resizing state
    multidirectionalParentSplitter.value?.setAttribute(
      'data-p-resizing',
      'true'
    )
  }

  function onMultidirectionResize(event: MouseEvent) {
    let newPrevParentPanelSize, newNextParentPanelSize

    // Setting panels sizes and intersection points
    const newIntersectPos = getNewInnerMouseOrTouchPosition(
      event,
      intersectStartPos.value,
      multidirectionParentSplitterSize.value,
      intersectHorizontal.value
    )

    if (!isNil(newIntersectPos)) {
      newPrevParentPanelSize = prevParentPanelSize.value + newIntersectPos
      newNextParentPanelSize = nextParentPanelSize.value - newIntersectPos
    }

    // Start of resizing/collapsing
    if (
      prevParentPanelEl.value &&
      nextParentPanelEl.value &&
      newPrevParentPanelSize &&
      newNextParentPanelSize
    ) {
      const prevParentPanelProps = getPanelPropsFromDom(prevParentPanelEl.value)
      const nextParentPanelProps = getPanelPropsFromDom(nextParentPanelEl.value)

      const isValidResize = validatePanelReszie(
        newPrevParentPanelSize,
        newNextParentPanelSize,
        prevParentPanelProps.minSize,
        nextParentPanelProps.minSize
      )

      if (isValidResize) {
        // Resize the panels
        prevParentPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
          newPrevParentPanelSize,
          multidirectionalParentPanels.value.length
        )

        nextParentPanelEl.value.style.flexBasis = getNewPanelFlexBasisSize(
          newNextParentPanelSize,
          multidirectionalParentPanels.value.length
        )
      } else {
        // Check and update collapsible panels
        checkAndUpdateCollapsiblePanels(
          event,
          multidirectionalParentPanels.value.length,
          {
            newPrevPanelSize: newPrevParentPanelSize,
            prevPanelProps: prevParentPanelProps,
            element: prevParentPanelEl.value!,
          },
          {
            newNextPanelSize: newNextParentPanelSize,
            nextPanelProps: nextParentPanelProps,
            element: nextParentPanelEl.value!,
          }
        )
      }
    }
  }

  function onMultidirectionResizeEnd() {
    multidirectionalParentSplitter.value?.setAttribute(
      'data-p-resizing',
      'false'
    )
    isMultidirectionalResizing.value = false
    clearMultidirectionalResizingState()
  }

  function isIntersectionArea(event: MouseEvent) {
    const elementFromPoint = document.elementFromPoint(event.pageX, event.pageY)
    const isIntersectionEl = elementFromPoint?.classList.contains(
      'splitter-gutter-intersection'
    )

    if (isIntersectionEl) {
      return true
    }

    return false
  }

  function clearMultidirectionalResizingState() {
    // Clear size
    multidirectionParentSplitterSize.value = 0

    // Clear start position
    intersectStartPos.value = 0

    // Clear [previous, next] panel
    prevParentPanelEl.value = undefined

    // Clear [previous, next] panel size
    prevParentPanelSize.value = 0

    // Clear pannels of the parent splitter
    multidirectionalParentPanels.value = []
  }

  // Styling and classes
  const gutterHandlerTopInterSectionClasses = computed(() => [
    'splitter-gutter-intersection top',
    { 'top-[-7px]': isHorizontalLayout.value },
    { 'left-[-7px]': !isHorizontalLayout.value },
  ])

  const gutterHandlerBottomInterSectionClasses = computed(() => [
    'splitter-gutter-intersection bottom',
    { 'bottom-[-7px]': isHorizontalLayout.value },
    { 'left-[-7px]': !isHorizontalLayout.value },
  ])

  return {
    // Layout
    isMultidirectionalResizing,
    hasIntersectingTopGutter,
    hasIntersectingBottomGutter,
    intersectHorizontal,

    // Functions
    isIntersectionArea,
    onMultiDirectionResizeStart,
    onMultidirectionResize,
    onMultidirectionResizeEnd,
    clearMultidirectionalResizingState,

    // Styling and classes
    gutterHandlerTopInterSectionClasses,
    gutterHandlerBottomInterSectionClasses,
  }
}

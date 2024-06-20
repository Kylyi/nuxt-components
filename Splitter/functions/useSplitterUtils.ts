// Types
import type {
  ISplitterEmit,
  ISplitterProps,
} from '~/components/Splitter/types/splitter.type'
import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

export function useSplitterUtils(props: ISplitterProps, emits?: ISplitterEmit) {
  // Functions
  function validatePanelReszie(
    newPrevPanelSize: number,
    newNextPanelSize: number,
    prevPanelMinSize?: number,
    nextPanelMinSize?: number
  ) {
    if (newPrevPanelSize > 100 || newPrevPanelSize < 0) {
      return false
    }

    if (newNextPanelSize > 100 || newNextPanelSize < 0) {
      return false
    }

    if (prevPanelMinSize && prevPanelMinSize > newPrevPanelSize) {
      return false
    }

    if (nextPanelMinSize && nextPanelMinSize > newNextPanelSize) {
      return false
    }

    return true
  }

  function checkAndUpdateCollapsiblePanels(
    event: MouseEvent | TouchEvent,
    panelsLength: number,
    prevPanelOptions: {
      newPrevPanelSize: number
      prevPanelProps: ISplitterPanelProps
      element: HTMLElement
    },
    nextPanelOptions: {
      newNextPanelSize: number
      nextPanelProps: ISplitterPanelProps
      element: HTMLElement
    }
  ) {
    const {
      newPrevPanelSize,
      prevPanelProps,
      element: prevPanelEl,
    } = prevPanelOptions

    const {
      newNextPanelSize,
      nextPanelProps,
      element: nextPanelEl,
    } = nextPanelOptions

    // Previous panel
    if (
      prevPanelProps.collapsible &&
      prevPanelProps.minSize &&
      newPrevPanelSize < prevPanelProps.minSize
    ) {
      if (prevPanelEl) {
        prevPanelEl.style.flexBasis = getNewPanelFlexBasisSize(
          prevPanelProps.collapsedSize!,
          panelsLength
        )

        emits!('collapse', { originalEvent: event })
      }
    }

    // Next panel
    if (
      nextPanelProps.collapsible &&
      nextPanelProps.minSize &&
      newNextPanelSize < nextPanelProps.minSize
    ) {
      if (nextPanelEl) {
        nextPanelEl.style.flexBasis = getNewPanelFlexBasisSize(
          nextPanelProps.collapsedSize!,
          panelsLength
        )

        emits!('collapse', { originalEvent: event })
      }
    }
  }

  function getNewPanelFlexBasisSize(
    newPanelSize: number,
    panelsLength: number
  ) {
    return `calc(${newPanelSize}% - ${
      (panelsLength - 1) * (props.gutterSize as number)
    }px)`
  }

  return {
    // Functions
    validatePanelReszie,
    checkAndUpdateCollapsiblePanels,
    getNewPanelFlexBasisSize,
  }
}

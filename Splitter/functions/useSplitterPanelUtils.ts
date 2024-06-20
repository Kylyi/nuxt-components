import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

export function useSplitterPanelUtils() {
  function getPanelPropsFromDom(panel: HTMLElement): ISplitterPanelProps {
    // @ts-expect-error DOM attribute
    return panel.getPanelProps()
  }

  return {
    getPanelPropsFromDom,
  }
}

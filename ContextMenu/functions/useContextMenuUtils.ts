export function useContextMenuUtils() {
  // Event coordinates
  const { x, y } = useMouse()

  /** Get X and Y coordinates depending on `ContextMenu` open trigger position */
  function getCoordsForMenu(list: HTMLUListElement, rootDiv?: HTMLDivElement) {
    const { width: listWidth, height: listHeight } =
      list.getBoundingClientRect()

    const { innerWidth, innerHeight } = window

    // Calculations for the main context menu by event coordinates
    if (!rootDiv) {
      return {
        x:
          listWidth + x.value > innerWidth
            ? ((x.value - listWidth) / innerWidth) * 100
            : (x.value / innerWidth) * 100,
        y: listHeight + y.value > innerHeight ? y.value - listHeight : y.value,
      }
    }

    // Calculations for sub-menus
    const {
      x: rootX,
      y: rootY,
      width: rootWidth,
      height: rootHeight,
    } = rootDiv.getBoundingClientRect()

    // Check if there is one more list in parents
    const rootUl = rootDiv.closest('.context-menu-list')
    const rootUlParent = rootUl?.parentElement

    // If there is one more list in parents, then check if it's shifted by axes
    const isShiftedParentX =
      Number(rootUlParent?.getBoundingClientRect()?.x) > rootX
    const isShiftedParentY =
      Number(rootUlParent?.getBoundingClientRect()?.y) > rootY

    // Coordinates to shift by axes
    const toLeft = ((rootX - listWidth) / innerWidth) * 100
    const toBottom = ((rootY - listHeight + rootHeight) / innerHeight) * 100

    // Conditions for shifting by axes
    const needShiftByX =
      rootWidth + listWidth + rootX > innerWidth || isShiftedParentX
    const needShiftByY =
      rootHeight + listHeight + rootY > innerHeight || isShiftedParentY

    return {
      x: needShiftByX ? toLeft : ((rootX + rootWidth) / innerWidth) * 100,
      y: needShiftByY ? toBottom : rootY,
    }
  }

  function getScrollableListHeight(
    list: HTMLUListElement,
    y: number
  ): number | false {
    if (y < 0) {
      const { height: listHeight } = list.getBoundingClientRect()
      return listHeight - Math.abs(y) - 5
    }

    return false
  }

  return {
    getCoordsForMenu,
    getScrollableListHeight,
  }
}

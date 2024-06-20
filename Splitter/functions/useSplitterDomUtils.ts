export function useSplitterDomUtils() {
  function getOuterWidth(el?: HTMLElement, includeMargin?: boolean) {
    if (el) {
      let width = el.offsetWidth

      if (includeMargin) {
        const style = getComputedStyle(el)

        width +=
          Number.parseFloat(style.marginLeft) +
          Number.parseFloat(style.marginRight)
      }

      return width
    }

    return 0
  }

  function getOuterHeight(el?: HTMLElement, includeMargin?: boolean) {
    if (el) {
      let height = el.offsetHeight

      if (includeMargin) {
        const style = getComputedStyle(el)

        height +=
          Number.parseFloat(style.marginTop) +
          Number.parseFloat(style.marginBottom)
      }

      return height
    }

    return 0
  }

  /**
   * Get the height of an element excluding padding and border but including margin
   * @param el
   * @returns The height of the element
   */
  function getHeight(el: HTMLElement) {
    if (el) {
      let height = el.offsetHeight
      const style = getComputedStyle(el)

      height -=
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom) +
        Number.parseFloat(style.borderTopWidth) +
        Number.parseFloat(style.borderBottomWidth)

      return height
    }

    return 0
  }

  /**
   * Get the width of an element excluding padding and border but including margin
   * @param el
   * @returns The width of the element
   */
  function getWidth(el: HTMLElement) {
    if (el) {
      let width = el.offsetWidth
      const style = getComputedStyle(el)

      width -=
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight) +
        Number.parseFloat(style.borderLeftWidth) +
        Number.parseFloat(style.borderRightWidth)

      return width
    }

    return 0
  }

  /**
   * The function returns the change in mouse/touch position as a percentage of the container size
   * @param event - The mouse or touch event
   * @param startPos - The initial position of the mouse or touch event
   * @param containerSize - The size of the container within which the mouse is moving
   * @param horizontal - A boolean indicating if the container is horizontal
   * @returns delta - The change in mouse/touch position as a percentage of the container size
   */
  function getNewInnerMouseOrTouchPosition(
    event: MouseEvent | TouchEvent,
    startPos: number,
    containerSize: number,
    horizontal: boolean
  ): number {
    let innerPosition

    if (event instanceof MouseEvent) {
      innerPosition = horizontal
        ? (event.pageX * 100) / containerSize
        : (event.pageY * 100) / containerSize
    } else {
      innerPosition = horizontal
        ? (event.touches[0].pageX * 100) / containerSize
        : (event.touches[0].pageY * 100) / containerSize
    }

    const mouseInnerStartPos = (startPos * 100) / containerSize
    const delta = innerPosition - mouseInnerStartPos

    return delta
  }

  return {
    getOuterWidth,
    getOuterHeight,
    getHeight,
    getWidth,
    getNewInnerMouseOrTouchPosition,
  }
}

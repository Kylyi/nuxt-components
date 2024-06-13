// Types
type IPosObject = {
  x: number
  y: number
}

export function useInputRangeUtils() {
  function getOffset(elem: HTMLDivElement): IPosObject {
    const doc = document.documentElement as HTMLElement
    const body = document.body as HTMLElement
    const { top, left } = elem.getBoundingClientRect()

    return {
      y:
        top +
        (window.pageYOffset || doc.scrollTop) -
        (doc.clientTop || body.clientTop || 0),
      x:
        left +
        (window.pageXOffset || doc.scrollLeft) -
        (doc.clientLeft || body.clientLeft || 0),
    }
  }

  /** Get event position relative to HTML element */

  function getPos(
    e: MouseEvent | TouchEvent,
    elem: HTMLDivElement,
    isReverse: boolean
  ) {
    const event = 'targetTouches' in e ? e.targetTouches[0] : e
    const offset = getOffset(elem)

    const posObj = {
      x: event.pageX - offset.x,
      y: event.pageY - offset.y,
    }

    return {
      x: isReverse ? elem.offsetWidth - posObj.x : posObj.x,
      y: isReverse ? elem.offsetHeight - posObj.y : posObj.y,
    }
  }

  /** Get size of a fraction */
  function getZeroesAmount(num: number): number {
    return num.toString().includes('.')
      ? num.toString().split('.')?.pop()?.length || 0
      : 0
  }

  return {
    getPos,
    getZeroesAmount,
  }
}

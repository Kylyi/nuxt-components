export type IDraggedItem<T = IItem> = {
  ref: T
  pos: { x: number, y: number }
}

const draggedItemKey = Symbol('draggedItem')
const onDragStartKey = Symbol('onDragStart')
const onDragEndKey = Symbol('onDragEnd')

type DragEndFnc<T> = (payload: {
  /**
   * The dragged item
   */
  item: IDraggedItem<T>

  /**
   * The item that is preceeding the dragged item (in the DOM)
   */
  previousItem?: T

  /**
   * The container the item was dragged from
   */
  from: IItem

  /**
   * The container the item was dragged to
   */
  to: IItem

  /**
   * The index the item was dragged to
   */
  toIdx: number
}) => void

// Helpers
function getDraggableEl(el: HTMLElement) {
  return el?.getAttribute('data-draggable-item')
    ? el
    : el?.closest('[data-draggable-item]') as HTMLElement
}

function getDraggableContainerEl(el: HTMLElement) {
  return el?.getAttribute('data-draggable-container')
    ? el
    : el?.closest('[data-draggable-container]') as HTMLElement
}

export function useDragAndDrop<T = IItem>(
  options?: {
    direction?: 'vertical' | 'horizontal'
    onDragStartFnc?: (item: IDraggedItem<T>) => void
    canDrop?: (item: IDraggedItem<T>) => boolean

    onDragEndFnc?: DragEndFnc<T>
  },
) {
  const {
    direction = 'vertical',
    onDragStartFnc = () => {},
    onDragEndFnc = () => {},
  } = options ?? {}

  // Provide/Inject
  const draggedItem = injectStrict<Ref<IDraggedItem<T> | undefined>>(draggedItemKey, ref(undefined))
  const onDragStart = injectStrict<(item: IDraggedItem<T>) => void>(onDragStartKey, onDragStartFnc)
  const onDragEnd = injectStrict<DragEndFnc<T>>(onDragEndKey, onDragEndFnc)

  // We only want to provide if we get the values from the options
  provide(draggedItemKey, draggedItem)

  if (options?.onDragStartFnc) {
    provide(onDragStartKey, onDragStart)
  }

  if (options?.onDragEndFnc) {
    provide(onDragEndKey, onDragEnd)
  }

  // Layout
  let lastEv: MouseEvent | TouchEvent | null = null
  let startMousePosition = { x: 0, y: 0 }
  let hasMoved = false

  // Scrolling
  let scrollContainerEl: HTMLElement | null = null
  const scrollBy = ref({ speedX: 0, speedY: 0 })

  const { pause, resume, isActive } = useIntervalFn(
    () => {
      const { speedX, speedY } = scrollBy.value

      scrollContainerEl?.scrollBy(speedX, speedY)
    },
    5,
    { immediate: false },
  )

  const {
    pause: pauseRaf,
    resume: resumeRaf,
  } = useRafFn(handleDrag, { immediate: false })

  // D'n'D
  let draggedEl: HTMLElement | null = null
  let draggedElInitialIdx = 0
  let draggedContainerEl: HTMLElement | null = null
  let mouseOffset = { x: 0, y: 0 }
  let lastTarget: HTMLElement | null = null
  let targetContainerEl: HTMLElement | null = null
  let lastPlacement: 'up' | 'down' | 'left' | 'right' | null = null

  // Mouse
  function handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement
    draggedEl = getDraggableEl(target)
    draggedContainerEl = getDraggableContainerEl(target)

    if (!draggedEl || !draggedContainerEl) {
      return
    }

    draggedElInitialIdx = Array.from(draggedContainerEl.children).indexOf(draggedEl)

    event.preventDefault()
    event.stopPropagation()

    startMousePosition = { x: event.clientX, y: event.clientY }

    const rect = draggedEl.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.clientX,
      y: rect.top - event.clientY,
    }

    cloneElement(event)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)

    lastEv = event
    onDragStart(draggedItem.value!)
  }

  function handleMouseMove(event: MouseEvent) {
    hasMoved = hasMoved
    || Math.abs(event.clientX - startMousePosition.x) > 2
    || Math.abs(event.clientY - startMousePosition.y) > 2

    if (!hasMoved) {
      return
    }

    draggedEl?.classList.add('is-dragged')
    clonedElement!.style.visibility = 'visible'

    if (clonedElement) {
      let newLeft = event.clientX + mouseOffset.x
      let newTop = event.clientY + mouseOffset.y

      // Constrain to viewport
      newLeft = Math.min(newLeft, window.innerWidth - clonedElement.offsetWidth)
      newTop = Math.min(newTop, window.innerHeight - clonedElement.offsetHeight)
      newLeft = Math.max(newLeft, 0)
      newTop = Math.max(newTop, 0)

      clonedElement.style.left = `${newLeft}px`
      clonedElement.style.top = `${newTop}px`
    }

    draggedItem.value!.pos = { x: event.clientX, y: event.clientY }

    lastEv = event
    calculateScroll(event)
  }

  // Touch
  function handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement
    draggedEl = getDraggableEl(target)

    if (!draggedEl) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const rect = draggedEl.getBoundingClientRect()

    mouseOffset = {
      x: rect.left - event.touches[0].clientX,
      y: rect.top - event.touches[0].clientY,
    }

    cloneElement(event)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleDragEnd)

    lastEv = event
    onDragStart(draggedItem.value!)
  }

  function handleTouchMove(event: TouchEvent) {
    if (clonedElement) {
      let newLeft = event.touches[0].clientX + mouseOffset.x
      let newTop = event.touches[0].clientY + mouseOffset.y

      // Constrain to viewport
      newLeft = Math.min(newLeft, window.innerWidth - clonedElement.offsetWidth)
      newTop = Math.min(newTop, window.innerHeight - clonedElement.offsetHeight)
      newLeft = Math.max(newLeft, 0)
      newTop = Math.max(newTop, 0)

      clonedElement.style.left = `${newLeft}px`
      clonedElement.style.top = `${newTop}px`
    }

    draggedItem.value!.pos = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }

    lastEv = event
    calculateScroll(event)
  }

  // Shared
  function handleDragEnd() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleDragEnd)

    if (!draggedEl || !draggedContainerEl) {
      return
    }

    let isSamePosition = draggedContainerEl === targetContainerEl
    isSamePosition = isSamePosition && draggedElInitialIdx === Array.from(draggedContainerEl.children).indexOf(draggedEl)

    hasMoved = hasMoved && !isSamePosition

    if (clonedElement) {
      clonedElement.remove()
      clonedElement = null
    }

    // Handle the drag result
    if (draggedItem.value && hasMoved) {
      const idx = Array.from(targetContainerEl!.children).indexOf(draggedEl!)

      // @ts-expect-error ...
      draggedContainerEl?.['remove-item'](draggedItem.value.ref)

      // @ts-expect-error ...
      targetContainerEl?.['insert-item'](idx, draggedItem.value.ref)

      const previousItemEl = targetContainerEl?.children[idx - 1] as HTMLElement | undefined
      // @ts-expect-error ...
      const previousItem = previousItemEl?.['get-item']?.()

      onDragEnd({
        previousItem,
        item: draggedItem.value,
        toIdx: idx,

        // @ts-expect-error ...
        from: draggedContainerEl?.['get-parent']?.() ?? undefined,

        // @ts-expect-error ...
        to: targetContainerEl?.['get-parent']?.() ?? undefined,
      })
    }

    // Reset
    draggedItem.value = undefined
    draggedEl?.classList.remove('is-dragged')
    lastEv = null
    hasMoved = false
    startMousePosition = { x: 0, y: 0 }
    scrollBy.value = { speedX: 0, speedY: 0 }
    pause()
    pauseRaf()
  }

  function handleDrag() {
    const target = lastEv?.target as HTMLElement
    const _draggedItem = toValue(draggedItem)

    if (!_draggedItem) {
      return
    }

    const targetDraggableEl = getDraggableEl(target)
    targetContainerEl = getDraggableContainerEl(target)

    if (targetDraggableEl && targetContainerEl) {
      handleDragOverItem(_draggedItem, targetDraggableEl)
    } else if (targetContainerEl) {
      handleDragOverContainer(_draggedItem)
    }
  }

  function handleDragOverItem(
    draggedItem: IDraggedItem<T>,
    targetDraggableEl: HTMLElement,
  ) {
    // @ts-expect-error - TS doesn't know about our custom functions
    const targetDraggableItem = targetDraggableEl?.['get-item']?.()
    const isSelf = draggedItem.ref === targetDraggableItem

    if (isSelf || !targetDraggableItem) {
      lastTarget = targetDraggableEl

      return
    }

    let placement: 'up' | 'down' | 'left' | 'right' | null = null
    const {
      x = 0,
      y = 0,
      width = 1,
      height = 1,
    } = targetDraggableEl?.getBoundingClientRect() ?? {}

    if (direction === 'horizontal') {
      const relativeX = (draggedItem.pos.x - x) / width
      placement = relativeX < 0.5 ? 'left' : 'right'
    } else {
      const relativeY = (draggedItem.pos.y - y) / height
      placement = relativeY < 0.5 ? 'up' : 'down'
    }

    if (lastPlacement !== placement || lastTarget !== targetDraggableEl) {
      lastPlacement = placement
      lastTarget = targetDraggableEl

      // Remove from old container
      // draggedContainerEl?.['remove-item'](draggedItem.ref)

      if (placement === 'up' || placement === 'left') {
        // DOM manipulation
        targetDraggableEl.insertAdjacentElement(
          'beforebegin',
          draggedEl!,
        )

        // IMMEDIATE
        // Add to new container
        // const idx = Array.from(targetContainerEl.children).indexOf(targetDraggableEl)
        // targetContainerEl?.['insert-item'](idx, draggedItem.ref)
      } else if (placement === 'down' || placement === 'right') {
        // DOM manipulation
        targetDraggableEl.insertAdjacentElement(
          'afterend',
          draggedEl!,
        )

        // IMMEDIATE
        // Add to new container
        // const idx = Array.from(targetContainerEl.children).indexOf(targetDraggableEl)
        // targetContainerEl?.['insert-item'](idx + 1, draggedItem.ref)
      }

      // draggedContainerEl = targetContainerEl
    }
  }

  function handleDragOverContainer(
    draggedItem: IDraggedItem<T>,
  ) {
    if (
      !targetContainerEl
      || !draggedContainerEl
      || lastTarget === targetContainerEl
    ) {
      return
    }

    lastTarget = targetContainerEl

    // IMMEDIATE
    // // @ts-expect-error - TS doesn't know about our custom functions
    // const items = targetContainerEl?.['get-items']?.() ?? []
    // const isItemAlreadyInContainer = items.includes(draggedItem.ref)

    // if (isItemAlreadyInContainer) {
    //   return
    // }

    // DOM manipulation
    const firstItemTop = targetContainerEl.firstElementChild?.getBoundingClientRect()?.top ?? 0
    const lastItemBottom = targetContainerEl.lastElementChild?.getBoundingClientRect()?.bottom ?? 0
    const isBelowLastItem = draggedItem.pos.y > lastItemBottom
    const isAboveFirstItem = draggedItem.pos.y < firstItemTop

    if (isBelowLastItem) {
      targetContainerEl.append(draggedEl!)
    } else if (isAboveFirstItem) {
      targetContainerEl.prepend(draggedEl!)
    }

    // Remove from old container
    // draggedContainerEl?.['remove-item'](draggedItem.ref)

    // Add to new container
    // targetContainerEl?.['insert-item'](items.length, draggedItem.ref)

    // draggedContainerEl = targetContainerEl
  }

  // Cloning
  let clonedElement: HTMLElement | null = null

  function cloneElement(event: MouseEvent | TouchEvent) {
    clonedElement = draggedEl?.cloneNode(true) as HTMLElement

    // @ts-expect-error - TS doesn't know about our custom functions
    const item: T = draggedEl?.['get-item']?.()

    if (clonedElement) {
      let clientX: number, clientY: number

      if (event instanceof MouseEvent) {
        clientX = event.clientX
        clientY = event.clientY
      } else {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      }

      clonedElement.style.position = 'absolute'
      clonedElement.style.left = `${clientX + mouseOffset.x}px`
      clonedElement.style.top = `${clientY + mouseOffset.y}px`
      clonedElement.style.width = `${draggedEl!.offsetWidth}px`
      clonedElement.style.height = `${draggedEl!.offsetHeight}px`
      clonedElement.style.zIndex = '9999'
      clonedElement.style.opacity = '0.8'
      clonedElement.style.pointerEvents = 'none'
      clonedElement.style.transform = 'rotate(5deg)'
      clonedElement.style.visibility = 'hidden'
      document.body.appendChild(clonedElement)

      draggedItem.value = {
        ref: item,
        pos: { x: clientX, y: clientY },
      }
    }

    resumeRaf()
  }

  // Scrolling
  function calculateScroll(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement
    scrollContainerEl = getDraggableContainerEl(target)

    if (!scrollContainerEl || !clonedElement) {
      return
    }

    const containerRect = scrollContainerEl.getBoundingClientRect()
    const threshold = 40 // Distance from edge of container in px
    let speedX = 0
    let speedY = 0

    let clientX: number, clientY: number
    if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }

    if (clientX < containerRect.left + threshold) {
      // Scroll left
      speedX = -Math.max(1, (threshold - (clientX - containerRect.left)) / 10)
    } else if (clientX > containerRect.right - threshold) {
      // Scroll right
      speedX = Math.max(1, (threshold - (containerRect.right - clientX)) / 10)
    }

    if (clientY < containerRect.top + threshold) {
      // Scroll up
      speedY = -Math.max(1, (threshold - (clientY - containerRect.top)) / 10)
    } else if (clientY > containerRect.bottom - threshold) {
      // Scroll down
      speedY = Math.max(1, (threshold - (containerRect.bottom - clientY)) / 10)
    }

    scrollBy.value = { speedX, speedY }

    if (speedX === 0 && speedY === 0) {
      pause()
    } else if (!isActive.value) {
      resume()
    }
  }

  return {
    draggedItem,
    onDragStart,
    onDragEnd,

    // Events
    handleMouseDown,
    handleTouchStart,
  }
}

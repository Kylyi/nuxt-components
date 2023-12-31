<script setup lang="ts">
// Types
import type { IQueryBuilderRowProps } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Injections
import {
  qbContainerKey,
  qbDraggedItemKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Components
import QueryBuilderItem from '~/components/QueryBuilder/QueryBuilderItem.vue'
import QueryBuilderGroup from '~/components/QueryBuilder/QueryBuilderGroup.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<IQueryBuilderRowProps>()

// Injections
const scrollContainer = injectStrict(qbContainerKey)
const draggedItem = injectStrict(qbDraggedItemKey)
const items = injectStrict(qbItemsKey)

// Layout
const draggableEl =
  ref<InstanceType<typeof QueryBuilderGroup | typeof QueryBuilderItem>>()

// Scrolling
const scrollBy = ref({ speedX: 0, speedY: 0 })

const { pause, resume, isActive } = useIntervalFn(
  () => {
    const { speedX, speedY } = scrollBy.value
    scrollContainer.value?.scrollBy(speedX, speedY)
  },
  5,
  { immediate: false }
)

// D'n'D
let clonedElement: HTMLElement | null = null
let mouseOffset = { x: 0, y: 0 }

const draggableElement = computed(
  () => unrefElement(draggableEl as any) as unknown as HTMLElement
)

function handleMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement
  const isDraggableEl =
    target.classList.contains('query-builder-move-handler') ||
    target.classList.contains('query-builder-move-handler__icon')

  if (!isDraggableEl) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const rect = draggableElement.value!.getBoundingClientRect()

  mouseOffset = {
    x: rect.left - event.clientX,
    y: rect.top - event.clientY,
  }

  cloneElement(event)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event: MouseEvent) {
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

    draggedItem.value!.pos = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  calculateScroll(event)
}

function cloneElement(event: MouseEvent | TouchEvent) {
  clonedElement = draggableElement.value?.cloneNode(true) as HTMLElement

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
    clonedElement.style.width = `${draggableElement.value!.offsetWidth}px`
    clonedElement.style.height = `${draggableElement.value!.offsetHeight}px`
    clonedElement.style.zIndex = '1000'
    clonedElement.style.opacity = '0.5'
    clonedElement.style.pointerEvents = 'none'
    document.documentElement.style.cursor = 'grabbing'
    document.body.appendChild(clonedElement)

    draggedItem.value = {
      row: props.item,
      pos: { x: clientX, y: clientY },
    }
  }
}

function calculateScroll(event: MouseEvent | TouchEvent) {
  if (!scrollContainer.value || !clonedElement) {
    return
  }

  const containerRect = scrollContainer.value.getBoundingClientRect()
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

function handleMouseUp() {
  document.documentElement.style.cursor = ''
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  if (clonedElement) {
    clonedElement.remove()
    clonedElement = null
  }

  // Handle the drag result
  if (draggedItem.value) {
    const { newPath, dropDirection, newPathIsGroup } = draggedItem.value

    if (newPath && dropDirection) {
      // Get current row info
      const currentPath = props.item.path
      const currentParentPath = currentPath.split('.').slice(0, -2).join('.')
      const currentParent =
        props.parent ?? get(toValue(items), currentParentPath)
      const currentIndex = +currentPath.slice(-1)

      // Get the new location info
      const parentPath = newPathIsGroup
        ? newPath
        : newPath.split('.').slice(0, -2).join('.')
      const parent = get(toValue(items), parentPath) as IQueryBuilderGroup
      const index = newPathIsGroup
        ? dropDirection === 'below'
          ? parent.children.length
          : 0
        : +newPath.slice(-1)

      // In case we're moving the item within its parent
      if (parent === currentParent) {
        if (dropDirection === 'below') {
          parent.children.splice(index + 1, 0, {
            ...props.item,
            path: '_moved',
          })
        } else {
          parent.children.splice(index, 0, { ...props.item, path: '_moved' })
        }

        // We remove the original row
        const idx = parent.children.findIndex(
          child => child.path === currentPath
        )
        parent.children.splice(idx, 1)
      }

      // In case we're moving the item to another parent
      else {
        const itemExtracted = currentParent.children.splice(currentIndex, 1)[0]

        if (dropDirection === 'below') {
          parent.children.splice(index + 1, 0, itemExtracted)
        } else {
          parent.children.splice(index, 0, itemExtracted)
        }
      }

      // We update the paths for the structure
      updatePaths()

      // We reset the dragged item
      draggedItem.value = undefined
    }
  }

  // Reset scrolling
  scrollBy.value = { speedX: 0, speedY: 0 }
  pause()
}

function updatePaths(parent?: IQueryBuilderGroup) {
  const _parent = parent ?? (toValue(items)[0] as IQueryBuilderGroup)

  _parent.children.forEach((child, idx) => {
    child.path = `${_parent.path}.children.${idx}`

    if ('isGroup' in child) {
      updatePaths(child)
    }
  })
}

function handleTouchStart() {
  console.log('handleTouchStart')
}
</script>

<template>
  <QueryBuilderGroup
    v-if="'isGroup' in item"
    ref="draggableEl"
    :data-path="item.path"
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    v-bind="$attrs"
    @delete:row="updatePaths()"
    @mousedown="handleMouseDown"
    @touchstart.prevent="handleTouchStart"
  />

  <QueryBuilderItem
    v-else
    ref="draggableEl"
    :data-path="item.path"
    :item="item"
    :level="level"
    :parent="parent"
    :is-last-child="isLastChild"
    v-bind="$attrs"
    @delete:row="updatePaths()"
    @mousedown="handleMouseDown"
    @touchstart.prevent="handleTouchStart"
  />
</template>

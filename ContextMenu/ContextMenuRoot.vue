<script setup lang="ts">
// Utils
import { useContextMenuUtils } from '~/components/ContextMenu/functions/useContextMenuUtils'

const props = defineProps<{
  isSub?: boolean
  list?: HTMLUListElement
}>()

// Utils
const { getCoordsForMenu } = useContextMenuUtils()

// Layout
const rootEl = ref<HTMLDivElement | null>(null)
const rootParentEl = ref<HTMLElement | null>(null)

const model = defineModel<boolean>({ required: true })
const coordinateX = defineModel<number>('x', { required: true })
const coordinateY = defineModel<number>('y', { required: true })

// Functions
async function openMenu(ev: MouseEvent) {
  ev.preventDefault()

  const { x, y } = getCoordsForMenu(props.list!)

  coordinateX.value = x
  coordinateY.value = y

  model.value = true
}

function closeMenu(ev: MouseEvent) {
  ev?.preventDefault()
  ev?.stopPropagation()

  model.value = false
}

async function openMenuOnHover() {
  if (props.isSub && rootEl.value) {
    const { x, y } = getCoordsForMenu(props.list!, rootEl.value!)

    coordinateX.value = x
    coordinateY.value = y - 4

    model.value = true
  }
}

function closeMenuAfterHover() {
  if (props.isSub) {
    const { innerWidth, innerHeight } = window

    model.value = false

    coordinateX.value = innerWidth
    coordinateY.value = innerHeight
  }
}

// Binding event listeners on root parent element
onMounted(() => {
  rootParentEl.value = rootEl.value!.parentElement

  if (rootParentEl.value) {
    rootParentEl.value.style.position = 'relative'
    rootParentEl.value.addEventListener('contextmenu', openMenu)
    rootParentEl.value.addEventListener('mouseenter', openMenuOnHover)
    rootParentEl.value.addEventListener('mouseup', closeMenu)
    rootParentEl.value.addEventListener('mouseleave', closeMenuAfterHover)
  }
})

onUnmounted(() => {
  if (rootParentEl.value) {
    rootParentEl.value.removeEventListener('contextmenu', openMenu)
    rootParentEl.value.removeEventListener('mouseenter', openMenuOnHover)
    rootParentEl.value.removeEventListener('mouseup', closeMenu)
    rootParentEl.value.removeEventListener('mouseleave', closeMenuAfterHover)
  }
})
</script>

<template>
  <div
    ref="rootEl"
    class="absolute top-0 left-0 h-full w-full pointer-events-none"
  >
    <slot />
  </div>
</template>

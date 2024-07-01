<script setup lang="ts">
// Utils
import { useContextMenuUtils } from '~/components/ContextMenu/functions/useContextMenuUtils'

// Types
import type { IContextMenuProps } from '~/components/ContextMenu/types/context-menu-props.type'

withDefaults(defineProps<IContextMenuProps>(), {
  teleport: () => ({
    to: 'body',
    disabled: false,
  }),
})

const emits = defineEmits<{
  (e: 'openMenu'): void
  (e: 'closeMenu'): void
}>()

// Utils
const { getScrollableListHeight } = useContextMenuUtils()

// Layout
const list = ref<HTMLUListElement>()
const isOpen = ref(false)
const scrollable = ref(false)
const listHeight = ref(0)
const coords = reactive({
  x: 0,
  y: 0,
})

watch(isOpen, value => {
  if (value) {
    const height = getScrollableListHeight(list.value!, coords.y)

    if (height) {
      listHeight.value = height
      scrollable.value = true
    }

    emits('openMenu')
  } else {
    listHeight.value = 0
    scrollable.value = false

    emits('closeMenu')
  }
})

// Functions
function closeMenu(ev: MouseEvent) {
  const { innerWidth, innerHeight } = window

  if (ev.button !== 2) {
    isOpen.value = false

    coords.x = innerWidth
    coords.y = innerHeight
  }
}

// Binding event listeners
onMounted(() => {
  document.addEventListener('mouseup', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', closeMenu)
})
</script>

<template>
  <ContextMenuRoot
    v-model="isOpen"
    v-model:x="coords.x"
    v-model:y="coords.y"
    :is-sub="isSub"
    :list="list"
  >
    <Teleport
      v-if="teleport && !teleport.disabled"
      :to="teleport.to"
    >
      <div
        ref="list"
        class="context-menu-list bg-dark light:bg-gray-100"
        :class="[
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
          menuClasses,
        ]"
        :style="`
          left: ${coords.x}%;
          top: ${scrollable ? 5 : coords.y}px;
          height: ${scrollable ? `${listHeight}px` : 'auto'};
          overflow-y: ${scrollable ? 'scroll' : 'auto'};
        `"
        @mouseenter="isOpen = true"
      >
        <slot>
          <template v-if="menuItems?.length">
            <ContextMenuItem
              v-for="(menuItem, index) in menuItems"
              :key="`${menuItem.label}_${index}`"
              v-bind="menuItem"
            />
          </template>
        </slot>
      </div>
    </Teleport>

    <template v-else>
      <div
        ref="list"
        class="context-menu-list bg-dark light:bg-gray-100"
        :class="[
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
          menuClasses,
        ]"
        :style="`
          left: ${scrollable && isSub ? coords.x - 1 : coords.x}%;
          top: ${scrollable ? 5 : coords.y}px;
          height: ${scrollable ? `${listHeight}px` : 'auto'};
          overflow-y: ${scrollable ? 'scroll' : 'auto'};
        `"
        @mouseenter="isOpen = true"
      >
        <slot>
          <template v-if="menuItems?.length">
            <ContextMenuItem
              v-for="(menuItem, index) in menuItems"
              :key="`${menuItem.label}_${index}`"
              v-bind="menuItem"
            />
          </template>
        </slot>
      </div>
    </template>
  </ContextMenuRoot>
</template>

<style lang="scss" scoped>
.context-menu-list {
  --apply: fixed h-max min-w-20 p-1 rounded text-xs flex flex-col gap-2
    shadow-lg z-9999;

  &::-webkit-scrollbar {
    --apply: w-[3px];

    &-thumb {
      --apply: bg-gray rounded-full;
    }
  }
}
</style>

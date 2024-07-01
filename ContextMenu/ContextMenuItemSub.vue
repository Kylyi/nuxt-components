<script setup lang="ts">
// Types
import type { IContextMenuItemSubProps } from '~/components/ContextMenu/types/context-menu-props.type'

const props = defineProps<IContextMenuItemSubProps>()

const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <ContextMenuItem
    v-bind="props.menuItem"
    class="relative"
    icon="i-majesticons:chevron-right"
    @click.stop="emits('click')"
  >
    <template #label>
      <slot name="label" />
    </template>

    <template #shortcut>
      <slot name="shortcut" />
    </template>

    <template #icon>
      <slot name="icon" />
    </template>

    <template #sub>
      <ContextMenu
        v-bind="props.menu"
        :teleport="{ disabled: true }"
        :is-sub="true"
      >
        <slot name="menu" />
      </ContextMenu>
    </template>
  </ContextMenuItem>
</template>

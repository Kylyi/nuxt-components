<script setup lang="ts">
// Types
import type { IQueryBuilderProps } from '~/components/QueryBuilder/types/query-builder-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

// Injections
import {
  qbCollapsedKey,
  qbColumnsKey,
  qbContainerKey,
  qbHoveredItemKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Functions
import { useQueryBuilderDragAndDrop } from '~/components/QueryBuilder/functions/useQueryBuilderDragAndDrop'

const props = defineProps<IQueryBuilderProps>()
const emits = defineEmits<{
  (e: 'update:items', items: IQueryBuilderRow[]): void
}>()

// Utils
const { draggedItem, queryBuilderEl } = useQueryBuilderDragAndDrop()

// Layout
const items = useVModel(props, 'items', emits)
const level = 0

// Provide
const columns = toRef(props, 'columns')
const hoveredRow = ref<IQueryBuilderRow>()
const collapsed = ref<Record<string, boolean>>({})

provide(qbColumnsKey, columns)
provide(qbItemsKey, items)
provide(qbHoveredItemKey, hoveredRow)
provide(qbContainerKey, queryBuilderEl)
provide(qbCollapsedKey, collapsed)

// When no items are provided, initialize the items with a group
if (!props.items.length) {
  items.value = [
    {
      id: new Date().getTime().toString(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: '0',
    },
  ]
}
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder"
  >
    <QueryBuilderRow
      v-for="item in items"
      :key="item.path"
      :item="item"
      :level="level"
      p="!l-2"
      m="!l-0"
    />

    <!-- Drop indicator -->
    <div
      v-if="draggedItem?.dropIndicatorPos"
      class="drop-indicator"
      :style="{
        left: `${draggedItem.dropIndicatorPos.x ?? 0}px`,
        top: `${draggedItem.dropIndicatorPos.y ?? 0}px`,
        width: `${draggedItem.dropIndicatorPos.width ?? 0}px`,
      }"
    >
      <div
        class="tabler:arrow-back drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.dropDirection === 'below',
          'rotate-180 -top-7px': draggedItem.dropDirection === 'above',
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.query-builder {
  --apply: relative bg-ca p-1 rounded-custom overflow-auto;
}

.drop-indicator {
  --apply: absolute h-2px bg-primary w-full rounded-full pointer-events-none;

  &__icon {
    --apply: w-5 h-5 relative -left-5 color-primary;
  }
}
</style>

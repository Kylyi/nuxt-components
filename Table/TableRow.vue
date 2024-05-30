<script setup lang="ts">
import { NuxtLink } from '#components'

// Models
import { type ITableProps } from '~/components/Table/types/table-props.type'

type IProps = Pick<
  ITableProps,
  'columns' | 'rowHeight' | 'to' | 'selectionOptions' | 'editable' | 'rowClass'
> & {
  index?: number
  rows: any[]
}

const props = withDefaults(defineProps<IProps>(), {
  index: 0,
})

// Layout
const row = computed(() => props.rows[0])

const dataColumns = computed(() => {
  return props.columns?.filter(col => !col.hidden) ?? []
})

const isEditable = computedEager(() => {
  return props.editable === true || props.editable === 'table'
})
</script>

<template>
  <Component
    :is="to?.(row) ? NuxtLink : 'div'"
    flex="~"
    class="tr"
    :style="{ minHeight: `${rowHeight}px` }"
    :class="[
      { 'is-odd': index % 2 && !rowClass },
      { 'is-deleted': row.deleted },
      rowClass?.(row),
    ]"
    :data-split-row-idx="0"
    :to="to?.(row)"
  >
    <slot :row="row">
      <slot
        name="row-inside"
        mode="table"
        :row="row"
      />

      <TableCell
        v-for="col in dataColumns"
        :key="col.field"
        :column="col"
        :row="row"
        :editable="isEditable"
        :selection-options="selectionOptions"
      >
        <slot
          :name="col.name"
          :row="row"
        />
      </TableCell>
    </slot>
  </Component>
</template>

<style lang="scss" scoped>
.tr {
  --apply: relative;

  &.is-deleted {
    --apply: line-through color-ca;
  }

  &.is-odd {
    --apply: bg-$Table-alternate-row-bg;
  }
}

.cell {
  --apply: min-h-inherit flex shrink-0 items-center border-b-1 border-ca;

  &.has-data {
    --apply: border-l-1;
  }

  &:last-of-type {
    --apply: border-r-1;
  }

  &.is-frozen {
    --apply: dark:shadow-black/30 shadow-black/10;
    box-shadow: 8px 0 24px -2px var(--un-shadow-color);
  }
}

.tr:hover {
  .cell {
    --apply: bg-blue-500/10;
  }
}
</style>

<script setup lang="ts">
import { Placement } from '@floating-ui/dom'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

type IProps = {
  rows: any[]
  column: TableColumn<any>
  columns: TableColumn<any>[]
  useChips?: boolean
  useServer?: boolean
  placement?: Placement
  offset?: number
  referenceTarget?: any
}

const props = defineProps<IProps>()

// LAYOUT
const column = toRef(props, 'column')

/**
 * On menu hide, we remove the filter if the `compareValue` is `undefined`
 */
function handleMenuHide() {
  column.value.filters = column.value.filters.filter(filterItem => {
    if (Array.isArray(filterItem.compareValue)) {
      return filterItem.compareValue.length
    }

    return filterItem.compareValue !== undefined
  })
}
</script>

<template>
  <Btn size="sm">
    <template #icon>
      <div class="w-7 h-7 relative">
        <div
          class="icon top-.5 left-.5 ic:round-filter-alt"
          :class="{ 'color-primary': column.filters.length }"
        />
        <div
          class="icon bottom-.5 right-.5 basil:sort-outline"
          :class="{ 'color-primary': column.sort }"
        />

        <div
          v-if="column.sortOrder"
          class="icon-badge"
        >
          {{ column.sortOrder }}
        </div>
      </div>
    </template>

    <MenuProxy
      w="90"
      dense
      hide-header
      position="top"
      :placement="placement"
      :offset="offset"
      :reference-target="referenceTarget"
      content-class="flex flex-col"
      @before-hide="handleMenuHide"
    >
      <TableColumnSorting
        v-if="column.sortable"
        :column="column"
        :columns="columns"
      />
      <TableColumnFiltering
        v-if="column.filterable"
        v-bind="props"
      />
    </MenuProxy>
  </Btn>
</template>

<style lang="scss" scoped>
.icon {
  --apply: w-4 h-4 absolute;

  &-badge {
    --apply: flex flex-center absolute -bottom-.5 -right-.5 w-3 h-3 bg-primary
      color-white text-10px rounded-full leading-none;
  }
}
</style>

<script setup lang="ts">
import { config } from '~/config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableColumnsKey,
  tableNonHelpersColumnsKey,
  tableRefreshKey,
  tableSelectionKey,
} from '~/components/Table/provide/table.provide'

// Components
import QueryBuilderInline from '~/components/QueryBuilder/QueryBuilderInline.vue'

const props = defineProps<
  Pick<ITableProps, 'queryBuilder' | 'selectable'> & { search?: string }
>()

// Constants
const MIN_VISIBLE_QUERY_BUILDER_ROWS = 1
const MAX_VISIBLE_QUERY_BUILDER_ROWS = 3
const QUERY_BUILDER_INLINE_PADDING = 8

// Injections
const selection = injectStrict(tableSelectionKey)
const columns = injectStrict(tableColumnsKey)
const nonHelperColumns = injectStrict(tableNonHelpersColumnsKey)
const tableRefresh = injectStrict(tableRefreshKey)

// Layout
const queryBuilder = useVModel(props, 'queryBuilder')
const queryBuilderInlineEl = ref<InstanceType<typeof QueryBuilderInline>>()

const queryBuilderHeight = computed(() => {
  return {
    minHeight: `${
      MIN_VISIBLE_QUERY_BUILDER_ROWS * 32 + QUERY_BUILDER_INLINE_PADDING
    }px`,
    maxHeight: `${
      MAX_VISIBLE_QUERY_BUILDER_ROWS * 32 + QUERY_BUILDER_INLINE_PADDING
    }px`,
  }
})

const selectionCount = computed(() => {
  if (!selection.value) {
    return 0
  }

  return Array.isArray(selection.value)
    ? selection.value.length
    : Object.keys(selection.value).length
})

/**
 * Creates readable sorting string
 */
const tableSorting = computed(() => {
  return columns.value
    .filter(col => col.sort)
    .map(col => {
      return {
        label: col.label,
        field: col.field,
        direction: col.sort,
        sortOrder: col.sortOrder,
      }
    })
    .sort((a, b) => {
      return (a!.sortOrder || 0) - (b!.sortOrder || 0)
    })
    .map(
      col =>
        `${col.label} (<span>${
          col.direction === 'asc' ? '&#8593;' : '&#8595;'
        }</span>)`
    )
    .join(', ')
})

function handleFilterClear(filters?: 'queryBuilder' | 'columns') {
  if (filters === 'columns') {
    columns.value.forEach(col => {
      col.filters = []
    })

    tableRefresh()
  } else if (filters === 'queryBuilder') {
    queryBuilderInlineEl.value?.clearFilter()
  } else {
    columns.value.forEach(col => {
      col.filters = []
    })
    queryBuilderInlineEl.value?.clearFilter()
  }
}
</script>

<template>
  <div class="table-top">
    <!-- Toolbar -->
    <div class="table-top__toolbar">
      <!-- Query builder button -->
      <div grow>
        <slot name="left-prepend" />

        <TableQueryBuilderBtn
          v-if="queryBuilder"
          v-model:query-builder="queryBuilder"
        />

        <slot name="left-append" />
      </div>

      <slot name="right-prepend" />

      <!-- Exports -->
      <ExportBtn />

      <slot name="right-append" />
    </div>

    <Separator />

    <!-- Query builder -->
    <div
      v-if="queryBuilder"
      class="table-top__qb"
    >
      <VerticalScroller
        grow
        :style="queryBuilderHeight"
      >
        <div
          p="1"
          bg="white dark:darker"
          rounded="custom"
          min-h="10"
        >
          <QueryBuilderInline
            ref="queryBuilderInlineEl"
            v-model:items="queryBuilder"
            :columns="nonHelperColumns"
          />
        </div>
      </VerticalScroller>

      <Separator
        vertical
        h="full"
      />

      <!-- Remove filters -->
      <Btn
        no-upeprcase
        shrink-0
        size="xs"
        :label="$t('table.removeQueryBuilderFilters')"
        no-uppercase
        w="20"
        no-truncate
        stacked
        h="full"
        p="!y-0"
        bg="dark:darker"
        color="ca hover:negative"
        border="2 transparent hover:negative"
      >
        <Menu
          placement="left"
          hide-header
          :no-arrow="false"
          content-class="gap-1"
        >
          <Btn
            :label="$t('table.removeQueryBuilderFilter')"
            size="sm"
            no-uppercase
            @click="handleFilterClear('queryBuilder')"
          />
          <Btn
            :label="$t('table.removeColumnsFilter')"
            size="sm"
            no-uppercase
            @click="handleFilterClear('columns')"
          />

          <Separator />

          <Btn
            :label="$t('table.removeAllFilters')"
            size="sm"
            no-uppercase
            color="negative"
            @click="handleFilterClear"
          />
        </Menu>
      </Btn>
    </div>

    <Separator
      v-if="queryBuilder"
      m="b-1"
    />

    <!-- Subbar -->
    <div class="table-top__subbar">
      <!-- Selection & Sorting -->
      <div
        grow
        flex="~ gap-2"
        items-center
        display="lt-md:none"
      >
        <!-- Selection info -->
        <div
          v-if="selectable"
          flex="~ gap-1"
          items-center
          text="caption xs"
        >
          <div fluent:select-all-on-20-regular />
          <span m="l-1">{{ $t('general.selected') }}</span>
          <span font="bold">{{ selectionCount }}</span>
          <span>{{ $t('general.item', selectionCount) }}</span>
        </div>

        <!-- Selection actions -->
        <Btn
          v-if="selectable"
          size="sm"
          no-uppercase
          :label="$t('table.groupEdit')"
          icon="line-md:chevron-small-right rotate-90 order-2"
        >
          <MenuProxy
            hide-header
            :no-arrow="false"
          >
            <Item
              h="8"
              p="x-2"
              flex="center"
            >
              Something
            </Item>
            <Item
              h="8"
              p="x-2"
              flex="center"
            >
              here
            </Item>
          </MenuProxy>
        </Btn>

        <!-- Sorting -->
        <div
          v-if="tableSorting"
          flex="~ gap-1"
          items-center
        >
          <span
            text="caption xs"
            font="bold"
          >
            {{ $t('table.sortBy') }}:
          </span>
          <span
            text="caption"
            v-html="tableSorting"
          />
        </div>
      </div>

      <!-- Layout -->
      <div
        flex="~ gap-2"
        items-center
        grow
        justify="end"
      >
        <span
          text="caption xs"
          font="bold"
          display="lt-md:none"
        >
          {{ $t('table.layoutState') }}:
        </span>

        <!-- Columns btn -->
        <TableColumnsBtn v-model:columns="columns" />

        <template v-if="config.table.useServerState">
          <!-- Layout selector -->
          <TableLayoutSelector v-model:query-builder="queryBuilder" />

          <!-- Layout settings -->
          <TableLayoutSettingsBtn />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-top {
  --apply: flex flex-col;

  &__toolbar {
    --apply: flex gap-2 items-center p-x-2 p-y-1;
  }

  &__qb {
    --apply: flex gap-1 items-start p-x-2 p-y-1;
  }

  &__subbar {
    --apply: flex gap-2 items-center justify-between p-x-2 p-y-1;
  }
}
</style>
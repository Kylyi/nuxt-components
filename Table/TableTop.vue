<script setup lang="ts">
import { config } from '~/components/config/components-config'

// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'

// Injections
import {
  tableColumnsKey,
  tableNonHelperColumnsKey,
  tableRefreshKey,
  tableRowsKey,
  tableSelectionKey,
  tableSlotsKey,
  tableStorageKey,
  tableStretchColumnsKey,
} from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'
import { useAppStore } from '~/libs/App/app.store'

// Components
import QueryBuilderInline from '~/components/QueryBuilder/QueryBuilderInline.vue'
import TableExportBtn from '~/components/Table/TableExportBtn.vue'

const props = defineProps<
  Pick<
    ITableProps,
    | 'tableTopFunctionality'
    | 'queryBuilder'
    | 'selectionOptions'
    | 'nonSavableSettings'
    | 'minimumColumnWidth'
    | 'exportProps'
    | 'noSearch'
  > & {
    search: string
    smallScreen?: boolean
  }
>()
const emits = defineEmits<{
  (e: 'update:columnsWidth'): void
  (e: 'update:search', search: string): void
}>()
const slots = useSlots()

// Constants
const MIN_VISIBLE_QUERY_BUILDER_ROWS = 1
const MAX_VISIBLE_QUERY_BUILDER_ROWS = 2
const QUERY_BUILDER_INLINE_PADDING = 8
const QUERY_BUILDER_INLINE_GAP = 2

// Store
const appStore = useAppStore()
const { setTableState } = useTableStore()

// Injections
const selection = injectStrict(tableSelectionKey)
const columns = injectStrict(tableColumnsKey)
const nonHelperColumns = injectStrict(tableNonHelperColumnsKey)
const storageKey = injectStrict(tableStorageKey)
const tableRows = injectStrict(tableRowsKey)
const tableRefresh = injectStrict(tableRefreshKey)
const tableSlots = injectStrict(tableSlotsKey)
const tableStretchColumns = injectStrict(tableStretchColumnsKey)

// Layout
const queryBuilder = useVModel(props, 'queryBuilder')
const queryBuilderInlineEl = ref<InstanceType<typeof QueryBuilderInline>>()
const search = useVModel(props, 'search')

const hasActionBar = computedEager(() => {
  return (
    !!slots['left-prepend'] ||
    !!slots['left-append'] ||
    !!slots['right-prepend'] ||
    !!slots['right-append']
  )
})

const queryBuilderHeight = computed(() => {
  return {
    minHeight: `${
      MIN_VISIBLE_QUERY_BUILDER_ROWS * 26 +
      QUERY_BUILDER_INLINE_PADDING +
      QUERY_BUILDER_INLINE_GAP
    }px`,
    maxHeight: `${
      MAX_VISIBLE_QUERY_BUILDER_ROWS * 26 +
      QUERY_BUILDER_INLINE_PADDING +
      QUERY_BUILDER_INLINE_GAP
    }px`,
  }
})

const qbControlsClasses = computedEager(() => {
  const hasQueryBuilder = !!queryBuilder.value

  // Search is used
  if (!props.noSearch) {
    return {
      removeFiltersBtn: 'self-center',
      exportBtn: 'self-center',
      separator: 'self-center',
      queryBuilderBtn: 'self-start m-t-1',
    }
  }

  // Chips are used
  else if (!hasQueryBuilder) {
    return {
      removeFiltersBtn: 'self-start',
      exportBtn: 'm-t-0.5',
      separator: 'm-t-1.5',
      queryBuilderBtn: '',
    }
  }

  // Query builder is used
  return {
    removeFiltersBtn: 'self-start',
    exportBtn: 'm-t-1',
    separator: 'm-t-2',
    queryBuilderBtn: '',
  }
})

const ExportBtn = computed(() => {
  if ('exportComponent' in config.table && config.table.exportComponent) {
    return config.table.exportComponent
  }

  return TableExportBtn
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
      col.clearFilters()
    })

    tableRefresh()
  } else if (filters === 'queryBuilder') {
    queryBuilder.value = [
      {
        id: generateUUID(),
        isGroup: true,
        children: [],
        condition: 'AND',
        path: '0',
      },
    ]
  } else {
    // Clear columns filters
    columns.value.forEach(col => {
      col.clearFilters()
    })

    // Reset query builder
    queryBuilder.value = [
      {
        id: generateUUID(),
        isGroup: true,
        children: [],
        condition: 'AND',
        path: '0',
      },
    ]
    search.value = ''

    if (!queryBuilderInlineEl.value && !search.value) {
      tableRefresh()
    }
  }
}

function handleClearSorting() {
  columns.value.forEach(col => {
    col.sort = undefined
    col.sortOrder = undefined
  })
}

function handleFitColumns(ev?: MouseEvent) {
  const isShiftKey = !!ev?.shiftKey

  const fittableColumns = columns.value.filter(
    col => col.resizable && !col.hidden && !col.isHelperCol
  )

  // We unfreeze any frozen column
  const frozenColumn = fittableColumns.find(col => col.frozen)
  frozenColumn?.freeze(fittableColumns)

  setTimeout(async () => {
    // We autofit the columns
    for await (const col of fittableColumns) {
      const slotRenderFnc = tableSlots[col.field]
      await col.autoFit(
        tableRows.value,
        slotRenderFnc,
        props.minimumColumnWidth
      )
    }

    // We stretch the columns
    if (isShiftKey) {
      tableStretchColumns()
    }

    // We freeze the column again
    frozenColumn?.freeze(fittableColumns)

    setTableState(storageKey.value, { columns: columns.value })
    emits('update:columnsWidth')
  }, 0)
}

// Keyboard shortcuts
onKeyStroke(['d', 'D'], (ev: KeyboardEvent) => {
  // When using CTRL or META, we return back to readonly mode
  const isControlKey = ev.ctrlKey || ev.metaKey
  const isFocusedInInput = appStore.isActiveElementInput()

  if (isFocusedInInput || !isControlKey) {
    return
  }

  ev.preventDefault()

  handleFilterClear()
})
</script>

<template>
  <div class="table-top">
    <!-- Action bar -->
    <div
      v-if="hasActionBar"
      class="table-top__actionbar"
    >
      <div flex="~ gap-1 items-center grow">
        <slot name="left-prepend" />

        <slot name="left-append" />
      </div>

      <slot name="right-prepend" />

      <slot name="right-append" />
    </div>

    <!-- Toolbar -->
    <template v-if="!tableTopFunctionality?.noToolbar">
      <Separator />

      <div class="table-top__qb">
        <TableQueryBuilderBtn
          v-if="queryBuilder"
          v-model:query-builder="queryBuilder"
          :class="qbControlsClasses.queryBuilderBtn"
          self-start
          m="t-1"
        />

        <slot name="middle-start" />

        <slot name="left">
          <!-- Search -->
          <TableSearch
            v-if="!noSearch"
            v-model:search="search"
            :columns="columns"
          />

          <!-- Query builder -->
          <template v-else-if="queryBuilder">
            <Separator
              vertical
              m="l-1"
              :class="qbControlsClasses.separator"
            />

            <VerticalScroller
              grow
              self-center
              :style="queryBuilderHeight"
            >
              <QueryBuilderInline
                ref="queryBuilderInlineEl"
                v-model:items="queryBuilder"
                :columns="nonHelperColumns"
                editable
              />
            </VerticalScroller>
          </template>

          <!-- Chips -->
          <TableTopChips
            v-else
            :columns="columns"
            grow
          />

          <Separator
            vertical
            :class="qbControlsClasses.separator"
          />

          <!-- Remove filters -->
          <Btn
            size="xs"
            :label="$t('table.removeQueryBuilderFilters')"
            no-uppercase
            no-truncate
            stacked
            class="table-top__qb-remove-filters"
            data-cy="remove-filters"
            :class="qbControlsClasses.removeFiltersBtn"
          >
            <Menu
              placement="left"
              :no-arrow="false"
            >
              <!-- Remove query builder filters -->
              <Btn
                v-if="queryBuilder"
                :label="$t('table.removeQueryBuilderFilter')"
                size="sm"
                no-uppercase
                data-cy="remove-advanced-filter"
                @click="handleFilterClear('queryBuilder')"
              />

              <!-- Remove columns filters -->
              <Btn
                :label="$t('table.removeColumnsFilter')"
                size="sm"
                no-uppercase
                data-cy="remove-columns-filter"
                @click="handleFilterClear('columns')"
              />

              <Separator />

              <!-- Remove all filters -->
              <Btn
                :label="$t('table.removeAllFilters')"
                size="sm"
                no-uppercase
                color="negative"
                data-cy="remove-all-filters"
                p="!y-1.5"
                @click="handleFilterClear"
              >
                <KeyboardShortcut
                  char="D"
                  with-ctrl
                  class="!absolute top--1 right-1"
                />
              </Btn>
            </Menu>
          </Btn>

          <!-- Subscriptions -->
          <template
            v-if="
              !tableTopFunctionality?.noSubscription &&
              'subscriptionComponent' in config &&
              config.subscriptionComponent
            "
          >
            <Separator
              vertical
              m="r-1"
              :class="qbControlsClasses.separator"
            />

            <Component
              :is="config.subscriptionComponent"
              self-start
              m="t-1"
            />
          </template>

          <!-- Export -->
          <slot
            v-if="!tableTopFunctionality?.noExport"
            name="export"
          >
            <Separator
              vertical
              m="r-1"
              :class="qbControlsClasses.separator"
            />

            <Component
              :is="ExportBtn"
              v-bind="exportProps"
              shrink-0
              :class="qbControlsClasses.exportBtn"
            />
          </slot>
        </slot>
      </div>

      <Separator m="b-1" />
    </template>

    <!-- Subbar -->
    <ClientOnly>
      <div
        v-if="!tableTopFunctionality?.noSubbar"
        class="table-top__subbar"
      >
        <!-- Selection & Sorting -->
        <div class="table-top__selection">
          <template
            v-if="
              selectionOptions?.selectable &&
              ($slots['bulk-actions'] || $slots['bulk-actions-menu'])
            "
          >
            <!-- Selection actions -->
            <slot
              name="bulk-actions"
              :selection="selection"
            >
              <Btn
                size="sm"
                no-uppercase
                p="!r-0.5"
                icon="i-fluent:select-all-on-20-regular !w-5 !h-5"
                :label="`${$t('general.selected')}: ${selectionCount}`"
              >
                <MenuProxy :no-arrow="false">
                  <slot
                    name="bulk-actions-menu"
                    :selection="selection"
                  />
                </MenuProxy>

                <div
                  class="i-line-md:chevron-small-right rotate-90 h-4 w-4 m-l--1"
                />
              </Btn>
            </slot>
          </template>

          <!-- Sorting -->
          <div
            v-if="tableSorting && !tableTopFunctionality?.noSort"
            flex="~ gap-1 items-center"
          >
            <span
              text="caption xs"
              font="bold"
              m="t-0.5"
            >
              {{ $t('table.sortBy') }}:
            </span>
            <span
              text="caption"
              data-cy="sort-active-fields"
              v-html="tableSorting"
            />

            <Btn
              preset="TRASH"
              size="xs"
              :label="$t('sorting.clear')"
              data-cy="clear-sorting"
              @click="handleClearSorting"
            />
          </div>
        </div>

        <!-- Layout & Columns -->
        <div class="table-top__layout">
          <span
            v-if="!tableTopFunctionality?.noLayout"
            class="table-top__layout-label"
          >
            {{ $t('table.layoutState') }}:
          </span>

          <!-- Columns -->
          <TableColumnsBtn
            v-if="!tableTopFunctionality?.noColumnSelection"
            v-model:columns="columns"
          />

          <!-- Autofit -->
          <Btn
            v-if="!tableTopFunctionality?.noAutoFit && !smallScreen"
            size="sm"
            no-uppercase
            icon="i-material-symbols:fit-width"
            color="ca"
            :label="$t('table.fitColumns')"
            @click="handleFitColumns"
          />

          <template v-if="!tableTopFunctionality?.noLayout">
            <!-- Layout selector -->
            <TableLayoutSelector v-model:query-builder="queryBuilder" />

            <!-- Layout settings -->
            <TableLayoutSettingsBtn
              :non-saveable-settings="nonSavableSettings"
            />
          </template>
        </div>

        <slot name="subbar-right" />
      </div>

      <template #fallback>
        <div
          h="10"
          w="full"
        />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
.table-top {
  --apply: flex flex-col;

  &__actionbar {
    --apply: flex flex-wrap gap-2 items-center p-x-2 p-y-1;
  }

  &__qb {
    --apply: flex gap-1 items-start p-x-2 p-y-1;

    &-remove-filters {
      --apply: shrink-0 w-20 min-h-10 dark:bg-darker bg-white color-ca
        border-2 border-transparent hover:border-negative;

      --apply: "!hover:color-negative !p-y-0";
    }
  }

  &__subbar {
    --apply: flex gap-2 items-center justify-between p-x-2 p-y-1;
  }

  &__layout {
    --apply: flex gap-2 items-center grow justify-end;

    &-label {
      --apply: text-caption text-xs font-bold;
      --apply: '!lt-md:hidden';
    }
  }

  &__selection {
    --apply: flex grow gap-2 items-center;
    --apply: '!lt-md:hidden';

    &-info {
      --apply: flex gap-1 items-center leading-none text-caption text-xs;
    }
  }
}
</style>

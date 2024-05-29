<script setup lang="ts">
import { config } from '~/components/config/components-config'

type IProps = {
  currentPage: number
  currentPageSize: number
  isFirstPage: boolean
  isLastPage: boolean
  noPagination?: boolean
  pageCount: number
  totalRows?: number
  currentRows?: number
  infiniteScroll?: boolean
  limitRows?: number
  rowsPerPageOptions?: number[]
  prev: () => void
  next: () => void
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:currentPageSize', page: number): void
}>()
const slots = useSlots()

// Layout
const currentPage = useVModel(props, 'currentPage', emits)
const currentPageSize = useVModel(props, 'currentPageSize', emits)

const pages = computed(() => {
  // Less than 5 pages
  if (props.pageCount <= 5) {
    return Array.from({ length: props.pageCount }, (_, i) => i + 1)
  }

  // We are currently on the first or second page
  // -> [1, 2, 3, ..., pageCount]
  else if (props.isFirstPage || props.currentPage === 1) {
    return [1, 2, 3, Number.POSITIVE_INFINITY, props.pageCount]
  }

  // We are currently on the last or second to last page
  // -> [1, ..., pageCount - 2, pageCount - 1, pageCount]
  else if (props.isLastPage || props.currentPage === props.pageCount - 1) {
    return [
      1,
      Number.POSITIVE_INFINITY,
      props.pageCount - 2,
      props.pageCount - 1,
      props.pageCount,
    ]
  }

  // We are currently on some page in between
  // -> [currentPage - 1, currentPage, currentPage + 1, ..., pageCount]
  else {
    return [
      props.currentPage - 1,
      props.currentPage,
      props.currentPage + 1,
      Number.POSITIVE_INFINITY,
      props.pageCount,
    ]
  }
})

const isLimitRowsReached = computed(() => {
  const limitRows = props.limitRows ?? config.table.props.limitRows
  const currentRows = props.currentRows || 0
  const totalRows = props.totalRows || 0

  return limitRows && currentRows >= limitRows && totalRows > limitRows
})

const isPaginationRightVisible = computed(() => {
  return slots['pagination-append'] || !props.noPagination
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="pageCount !== Number.POSITIVE_INFINITY"
      class="table-pagination"
    >
      <!-- Total rows -->
      <div
        absolute
        left="2"
        :class="{ 'lt-md:hidden': !noPagination }"
        flex="~ gap-x-2 center"
      >
        <span
          v-if="currentRows"
          text="caption"
        >
          <template v-if="infiniteScroll">
            <span
              font="bold"
              data-cy="current-rows"
            >
              {{ currentRows }}
            </span>
            {{ $t('general.outOf') }}
            <span
              font="bold"
              data-cy="total-rows"
              >{{ totalRows }}</span
            >
            {{ $t('general.row', totalRows || 0) }}
          </template>

          <template v-else-if="!noPagination">
            <span font="bold">
              {{ (currentPage - 1) * currentPageSize }} -
              {{ (currentPage - 1) * currentPageSize + currentRows }}
            </span>
            {{ $t('general.outOf') }}
            <span font="bold">{{ totalRows }}</span>
            {{ $t('general.row', totalRows || 0) }}
          </template>
        </span>

        <span
          v-else
          text="caption"
        >
          {{ $t('table.totalRows') }}:
          {{ totalRows }}
        </span>
      </div>

      <!-- Limit amount of rows reached -->
      <template v-if="isLimitRowsReached">
        <div
          flex="~ gap-2 items-center"
          text="caption"
        >
          <div class="color-blue-500 i-bi:info-lg" />
          <span>{{ $t('table.limitRowsReached') }}</span>

          <Tooltip
            placement="top"
            w="120"
            :offset="8"
            text="center"
          >
            {{ $t('table.limitRowsReachedTooltip') }}
          </Tooltip>
        </div>
      </template>

      <template v-else-if="pages.length > 1 && !noPagination">
        <!-- First page -->
        <Btn
          :disabled="isFirstPage"
          size="sm"
          disable-style="flat"
          icon="i-line-md:chevron-small-double-right rotate-180"
          @click="currentPage = 1"
        />

        <!-- Previous page -->
        <Btn
          :disabled="isFirstPage"
          size="sm"
          disable-style="flat"
          icon="i-material-symbols:chevron-right-rounded rotate-180"
          @click="prev"
        />

        <!-- Pages -->
        <template
          v-for="(page, idx) in pages"
          :key="idx"
        >
          <Btn
            v-if="page !== Infinity"
            size="sm"
            :label="page"
            :class="{ 'is-active': page === currentPage }"
            @click="currentPage = page"
          />
          <div v-else>...</div>
        </template>

        <!-- Next page -->
        <Btn
          :disabled="isLastPage"
          size="sm"
          icon="i-material-symbols:chevron-right-rounded"
          @click="next"
        />

        <!-- Last page -->
        <Btn
          :disabled="isLastPage"
          size="sm"
          disable-style="flat"
          icon="i-line-md:chevron-small-double-right"
          @click="currentPage = pageCount"
        />
      </template>

      <!-- Page size -->
      <slot
        v-if="isPaginationRightVisible"
        name="pagination-append"
      >
        <div class="table-pagination__page-size">
          <span
            text="caption"
            class="!lt-md:hidden"
          >
            {{ $t('table.rowsPerPage') }}
          </span>

          <Selector
            v-model="currentPageSize"
            :options="rowsPerPageOptions"
            emit-key
            size="sm"
            no-search
            w="18"
            append-class="!p-x-1"
            inner-class="!p-l-2 !p-r-2px"
          />
        </div>
      </slot>
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.table-pagination {
  @apply relative flex flex-center flex-gap-x-1 p-y-1 min-h-10 bg-$Table-pagination-bg;

  .btn.is-active {
    --apply: bg-$Table-pagination-button-active-bg color-white;
  }

  &__page-size {
    --apply: absolute right-2 flex flex-center flex-gap-x-2;
    --apply: 'lt-sm:hidden';
  }
}
</style>

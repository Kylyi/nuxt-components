<script setup lang="ts" generic="T">
import type { CSSProperties } from 'vue'

// Types
import type { IVirtualScrollEvent } from '~/components/VirtualScroller/types/virtual-scroll-event.type'

type IProps = {
  /**
   * The number of rows to render initially
   */
  initialRowsRenderCount?: number

  /**
   * When adding more rows to the virtual scroller, this must be set to true
   * to not override calculated heights
   *
   * Note: This is only relevant for dynamic row heights
   */
  fetchMore?: boolean

  /**
   * When true, the component will NOT emit scroll events (performance)
   */
  noScrollEmit?: boolean

  /**
   * The overscan (in pixels) for both top and bottom directions
   */
  overscan?: { top?: number; bottom?: number }

  /**
   * The data rows
   */
  rows?: T[]

  /**
   * The height of each row
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: keyof T

  /**
   * Watch for width changes
   */
  watchWidth?: boolean
}

type IRow = {
  ref: T
  idx: number
  style: CSSProperties
}

type IVisibleRows = {
  rows: IRow[]
  firstRow: IRow | null
  lastRow: IRow | null
}

const props = withDefaults(defineProps<IProps>(), {
  rowHeight: 40,
  rowKey: 'id' as keyof T,
})

const emits = defineEmits<{
  (e: 'virtual-scroll', payload: IVirtualScrollEvent): void
}>()

defineExpose({
  scrollToTop: () => scrollTo(0),
  scrollTo,
  focus: () => virtualScrollEl.value?.focus(),
  rerender: (noEmit?: boolean) => rerenderVisibleRows({ triggerScrollEvent: !noEmit }),
  renderOnlyVisible,
  updateRowHeight,
})

// Utils
const { isDesktopOrTablet } = useDevice()
const { onOverflow } = useOverflow()
const lastScrollEvent = ref<Event>()
const preventNextScroll = autoResetRef(false, 50)
let lastScrollTop = 0

function getRowKey(row: T) {
  return String(row?.[rowKey.value] || '')
}

// Constants
const VIRTUAL_SCROLL_THRESHOLD = 80
const OVERSCAN_PX = { top: 200, bottom: 400 }
const INITIAL_ROWS_RENDER_COUNT =
  props.initialRowsRenderCount ??
  (isDesktopOrTablet
    ? Math.ceil(2160 / props.rowHeight)
    : Math.ceil(1080 / props.rowHeight))

// Layout
const rows = toRef(props, 'rows')
const containerEl = ref<HTMLDivElement>()
const virtualScrollEl = ref<HTMLDivElement>()
const isMounted = ref(false)
const isVirtual = ref(false)
const rowHeight = toRef(props, 'rowHeight')
const rowKey = toRef(props, 'rowKey') as Ref<keyof T>
const visibleItemsIdx = ref({ first: 0, last: 0 })

const containerRect = useElementSize(containerEl)
const virtualScrollerRect = useElementSize(virtualScrollEl)

const overscan = computed(() => {
  return {
    top: props.overscan?.top ?? OVERSCAN_PX.top,
    bottom: props.overscan?.bottom ?? OVERSCAN_PX.bottom,
  }
})

const heights = ref<number[]>(
  Array.from({ length: props.rows?.length ?? 0 }, () => props.rowHeight)
)

const heightsCumulated = computed(() => {
  let height = 0

  return heights.value.map(h => {
    height += h

    return height
  })
})

const renderedRows = ref(
  getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)
) as Ref<IVisibleRows>

const { height, width } = useElementSize(virtualScrollEl)

useScroll(virtualScrollEl, {
  onScroll(ev) {
    pauseRowHeightWatcher()
    handleScrollEvent(ev)

    lastScrollEvent.value = ev
  },
  onStop: () => {
    nextTick(resumeRowHeightWatcher)
  },
})

onOverflow(virtualScrollEl, () => {
  setTimeout(() => rerenderVisibleRows())
})

const virtualScrollStyle = computed(() => {
  return {
    '--rowHeight': `${rowHeight.value}px`,
  }
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    minHeight: `${heights.value.reduce((agg, curr) => agg + curr, 0)}px`,
  }
})

const rowsInViewport = computed(() => {
  const scrollTop =
    (lastScrollEvent.value?.target as HTMLElement)?.scrollTop ?? 0

  const overscanBot = Math.max(
    height.value +
      overscan.value.bottom +
      Math.min(overscan.value.top, scrollTop),
    0
  ) as number

  return Math.ceil(overscanBot / rowHeight.value)
})

function handleScrollEvent(
  ev?: Event,
  options?: {
    /**
     * Whether the `virtual-scroll` event should be emitted
     */
    noEmit?: boolean

    /**
     * Force the scrolling event to recalculate the visible rows
     */
    force?: boolean
  }
) {
  if (preventNextScroll.value) {
    preventNextScroll.value = false

    return
  }

  const { noEmit, force } = options ?? {}
  const _noEmit = props.noScrollEmit || noEmit
  const scrollY = ((ev?.target as any)?.scrollTop || 1) as number

  if (!force && lastScrollTop === scrollY) {
    return
  }

  lastScrollTop = scrollY

  // Rendered rows
  const overscanTop = Math.max(scrollY - overscan.value.top, 1)
  const firstIdx = isVirtual.value
    ? heightsCumulated.value.findIndex(h => h >= overscanTop)
    : 0
  const lastIdx = isVirtual.value
    ? firstIdx + rowsInViewport.value
    : rows.value?.length - 1

  renderedRows.value = getRenderedRows(firstIdx, lastIdx)

  // Visible rows
  const firstVisibleIdx = heightsCumulated.value.findIndex(h => h >= scrollY)
  let lastVisibleIdx = heightsCumulated.value.findIndex(
    h => h >= scrollY + (virtualScrollerRect.height.value)
  )

  lastVisibleIdx = lastVisibleIdx === -1 ? rows.value?.length - 1 : lastVisibleIdx

  const firstVisibleItem = props.rows![firstVisibleIdx]
  const lastVisibleItem = props.rows![lastVisibleIdx]

  visibleItemsIdx.value.first = firstVisibleIdx
  visibleItemsIdx.value.last = lastVisibleIdx

  if (!_noEmit) {
    emits('virtual-scroll', {
      visibleStartItem: {
        index: firstVisibleIdx,
        key: getRowKey(firstVisibleItem),
        size: heights.value[firstVisibleIdx],
      },
      visibleEndItem: {
        index: lastVisibleIdx,
        key: getRowKey(lastVisibleItem),
        size: heights.value[lastVisibleIdx],
      },
    })
  }
}

function updateRowHeight(rowKey: keyof T) {
  const row = renderedRows.value.rows.find(
    row => get(row, props.rowKey!) === rowKey
  )

  if (row) {
    const el = document.querySelector(`[data-key="${String(rowKey)}"]`)
    handleMountedRow(el, row)
  }
}

/**
 * Gets the rows that should be rendered
 */
function getRenderedRows(firstIdx: number, lastIdx: number): IVisibleRows {
  if (!props.rows?.length) {
    return {
      rows: [] as IRow[],
      firstRow: null,
      lastRow: null,
    }
  }

  const translateYBase = heightsCumulated.value[firstIdx - 1] ?? 0
  const _lastIdx = Math.min(lastIdx, props.rows.length - 1)

  let preceedingRowsHeight = 0

  const rows: IRow[] = props.rows
    .slice(firstIdx, _lastIdx + 1)
    .map((row, idx) => {
      const rowStyle: CSSProperties = {}

      rowStyle['--translateY'] = preceedingRowsHeight + translateYBase

      const rowObj = {
        ref: row,
        idx: firstIdx + idx,
        style: rowStyle,
      }

      preceedingRowsHeight += heights.value[firstIdx + idx]

      return rowObj
    })

  const firstRow = rows[0]
  const lastRow = rows[rows.length - 1]

  return { rows, firstRow, lastRow }
}

/**
 * Scrolls to the row at the given index
 * NOTE - Be aware that this will not work properly if the row heights are not
 * all the same height
 */
function scrollTo(idx: number) {
  const scrollY = idx * rowHeight.value

  virtualScrollEl.value?.scrollTo({ top: scrollY })
}

/**
 * When row is mounted, we update the height for that specific row
 */
async function handleMountedRow(node: any, row: IRow) {
  const el = 'el' in node ? node.el : node
  const idx = +el.dataset.idx

  if (heights.value[idx] !== el.clientHeight) {
    heights.value[idx] = el.clientHeight
  }

  nextTick(() => {
    row.style['--translateY'] = heightsCumulated.value[idx - 1] ?? 0
  })
}

function rerenderVisibleRows(payload?: {
  triggerScrollEvent?: boolean
  emitScrollEvent?: boolean
}) {
  const { triggerScrollEvent = true, emitScrollEvent } = payload ?? {}

  const renderedRowsByIdx = renderedRows.value.rows.reduce((agg, row) => {
    agg[row.idx] = row
    return agg
  }, {} as Record<number, IRow>)
  const children = Array.from(containerEl.value?.children || [])

  children?.forEach(el => {
    const idx = Number((el as HTMLElement).dataset.idx ?? 0)
    const row = renderedRowsByIdx[idx]
    handleMountedRow(el, row)
  })

  if (triggerScrollEvent) {
    handleScrollEvent(lastScrollEvent.value, { noEmit: !emitScrollEvent, force: true })
  }
}

watchThrottled(
  width,
  () => {
    pauseRowHeightWatcher()
    rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false })
    // virtualScrollerRect.value = virtualScrollEl.value?.getBoundingClientRect()

    nextTick(resumeRowHeightWatcher)
  },
  {
    throttle: 150,
    leading: true,
    trailing: true,
  }
)

watch(rows, (rows, rowsOld) => {
  isVirtual.value = rows?.length > VIRTUAL_SCROLL_THRESHOLD
  pauseRowHeightWatcher()

  // When fetching more data, we just want to extend the heights array with
  // the default heights -> they will be recalculated when the rows are mounted
  if (props.fetchMore) {
    const newRowsCount = (rows.length ?? 0) - (rowsOld.length ?? 0)
    const newHeights = Array.from(
      { length: newRowsCount },
      () => props.rowHeight
    )

    heights.value = [...heights.value, ...newHeights]

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false })
    })
  }

  // Otherwise we want to recalculate the heights - basically reinitialize the component
  else {
    heights.value = Array.from(
      { length: rows.length ?? 0 },
      () => props.rowHeight
    )

    renderedRows.value = getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false })
    })
  }

  setTimeout(() => {
    resumeRowHeightWatcher()
  })
})

// We check for the same height of the `content` and `scroller`
// If they are the same, it means we loaded the full content but it doesn't overflow
// If that happens, we can assume either
// * We loaded all the data
// * The data is not enough to overflow the container, so we need to force the scroll event to possibly load more data
watch([containerRect.height, virtualScrollerRect.height], async (heights) => {
  const isZero = heights.some(h => h === 0)
  const isSameHeight = heights[0] === heights[1]

  if (isSameHeight && !isZero) {
    nextTick(() => {
      handleScrollEvent(lastScrollEvent.value, { noEmit: false, force: true })
    })
  }
})

// Height watcher
const hasJustRerendered = ref(false)

const {
  pause: pauseRowHeightWatcher,
  resume: resumeRowHeightWatcher
} = watchPausable(
  () => renderedRows.value.rows,
  () => {
    if (hasJustRerendered.value) {
      hasJustRerendered.value = false

      return
    }

    pauseRowHeightWatcher()

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: false })
      resumeRowHeightWatcher()
    })

    hasJustRerendered.value = true
  },
  { deep: true }
)

pauseRowHeightWatcher()

// Lifecycle
onMounted(() => {
  nextTick(() => {
    isMounted.value = true
    // virtualScrollerRect.value = virtualScrollEl.value?.getBoundingClientRect()
  })
  setTimeout(resumeRowHeightWatcher, 0)
})

function renderOnlyVisible(
  alsoRerender?: boolean,
  options?: {
    firstIdx?: number
    lastIdx?: number
    rowHeight?: number
  }
) {
  const { firstIdx, lastIdx, rowHeight } = options ?? {}
  const { first, last } = visibleItemsIdx.value

  const _first = firstIdx ?? first
  let _last = lastIdx ?? last

  if (rowHeight) {
    const rowsInViewport = Math.ceil(
      (virtualScrollerRect.height.value) / (rowHeight || props.rowHeight)
    )

    _last = _first + rowsInViewport
  }

  preventNextScroll.value = true
  renderedRows.value = getRenderedRows(_first, _last)

  if (alsoRerender) {
    rerenderVisibleRows()
  }
}
</script>

<template>
  <div
    ref="virtualScrollEl"
    class="virtual-scroll"
    :class="{ 'is-virtual': isMounted && isVirtual }"
    :style="virtualScrollStyle"
    tabindex="0"
  >
    <div
      ref="containerEl"
      class="virtual-scroll__content"
      :style="containerStyle"
    >
      <div
        v-for="row in renderedRows.rows"
        :key="get(row.ref, rowKey)"
        :data-idx="row.idx"
        :data-key="get(row.ref, rowKey)"
        class="virtual-scroll__row"
        :style="row.style"
        @vue:mounted="handleMountedRow($event, row)"
      >
        <slot
          :row="row.ref"
          :index="row.idx"
        >
          <div
            flex="~ center"
            min-h="$rowHeight"
            border="y-1 blue"
          >
            {{ row.ref }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  --apply: relative overflow-auto grow outline-none;

  &__container {
    --apply: relative rounded-custom;
  }

  &__row {
    --apply: flex w-full min-h-$rowHeight;

    will-change: transform;
  }
}

.virtual-scroll.is-virtual {
  .virtual-scroll__row {
    --apply: absolute;

    transform: translateY(calc(var(--translateY) * 1px));
  }
}
</style>

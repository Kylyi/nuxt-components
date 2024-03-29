// Types
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import {
  tableFocusKey,
  tableResizeKey,
  tableStretchColumnsKey,
} from '~/components/Table/provide/table.provide'

// Functions
import { useTableColumns } from '~/components/Table/functions/useTableColumns'
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// Constants
import { $bp } from '~/libs/App/constants/breakpoints.constant'

// Components
import TableRow from '~/components/Table/TableRow.vue'
import TableRowMobile from '~/components/Table/TableRow.mobile.vue'
import TableHeader from '~/components/Table/TableHeader.vue'
import TableTotals from '~/components/Table/TableTotals/TableTotals.vue'
import VirtualScroller from '~/components/VirtualScroller/VirtualScroller.vue'

export function useTableLayout(
  props: ITableProps,
  columnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>
) {
  const instance = getCurrentInstance()

  // Utils
  const { onOverflow } = useOverflow()
  const { getRowKey } = useTableUtils()
  const {
    hasVisibleColumn,
    internalColumns,
    searchableColumnLabels,
    resizeColumns,
    stretchColumns,
    recreateColumns,
  } = useTableColumns(props, columnsRef, layoutRef)

  // Provides
  provide(tableResizeKey, () => handleResize(true))
  provide(tableFocusKey, () => scrollerEl.value?.focus())
  provide(tableStretchColumnsKey, () => handleStretchColumns())

  // Layout
  const scrollerEl = ref<ComponentInstance<typeof VirtualScroller>>()
  const tableEl = ref<HTMLDivElement>()
  const headerEl = ref<InstanceType<typeof TableHeader>>()
  const totalsEl = ref<InstanceType<typeof TableTotals>>()
  const containerEl = ref<HTMLDivElement>()

  const rowKey = computedEager(() => getRowKey(props))

  function handleRowClick(rows: any[], event: PointerEvent) {
    const rowEl = event.target as HTMLElement
    const el = rowEl.closest('.tr') as HTMLElement

    if (!el) {
      return
    }

    const idx = Number(el.dataset.splitRowIdx as string)
    const row = rows[idx]

    if (props.rowClickable) {
      instance?.emit('row-click', { row, el, ev: event })
    }
  }

  // CSS variables
  const rowHeight = useCssVar('--rowHeight', tableEl)
  const mobileRowHeight = useCssVar('--mobileRowHeight', tableEl)
  const rowHeaderHeight = useCssVar('--headerHeight', tableEl)

  watchEffect(() => {
    rowHeight.value = `${props.rowHeight}px`
    mobileRowHeight.value = `${props.mobileRowHeight}px`
    rowHeaderHeight.value = `${props.headerHeight || props.rowHeight}px`
  })

  // Resize & scrolling
  const isScrolled = ref(false)
  const isOverflown = ref(false)
  let containerWidth = 0

  /**
   * Handles the resize of the table
   */
  function handleResize(force?: boolean) {
    const { width } = unrefElement(
      scrollerEl.value as any
    ).getBoundingClientRect()

    if (
      scrollerEl.value &&
      tableEl.value &&
      (width !== containerWidth || force)
    ) {
      internalColumns.value = resizeColumns(
        tableEl.value,
        scrollerEl.value.$el,
        internalColumns.value,
        {
          groupsRef: [],
          isSelectableRef: props.selectionOptions?.selectable,
          groupExpandWidthRef: props.groupExpandWidth,
          minColWidthRef: props.minimumColumnWidth,
        }
      )
      containerWidth = width
    }

    headerEl.value?.updateArrows()
    totalsEl.value?.updateArrows()
  }

  /**
   * Will stretch the columns to the full width of the table
   */
  function handleStretchColumns() {
    const table = toValue(tableEl)
    const scroller = toValue(scrollerEl)

    const { width } = unrefElement(scrollerEl as any).getBoundingClientRect()

    if (scroller && table) {
      internalColumns.value = stretchColumns(
        table,
        scroller.$el,
        toValue(internalColumns),
        {
          groupsRef: [],
          isSelectableRef: props.selectionOptions?.selectable,
          groupExpandWidthRef: props.groupExpandWidth,
          minColWidthRef: props.minimumColumnWidth,
        }
      )

      containerWidth = width
    }
  }

  // Detect overflow
  // On overflow, we recaulculate the columns
  onOverflow(
    containerEl,
    _isOverflown => {
      isOverflown.value = _isOverflown as boolean

      // handleResize(true)
      nextTick(() => handleResize(true))
    },
    { direction: 'vertical' }
  )

  // Sync scrolling between header and body
  const { x: scrollLeft } = useScroll(containerEl, {
    onScroll: ev => {
      const el = ev.target as HTMLDivElement
      headerEl.value?.syncScroll(el.scrollLeft)
      totalsEl.value?.syncScroll(el.scrollLeft)
      isScrolled.value = el.scrollTop !== 0
    },
  })

  const throttledHandleResize = useThrottleFn(
    (force?: boolean) => {
      handleResize(force)
    },
    250,
    true,
    false
  )

  // Responsivity
  const isBreakpoint = computedEager(() => {
    // This is a semi-hack to prevent warnings...
    const currentBreakpoints = $bp.current().value

    return currentBreakpoints.includes(props.breakpoint || 'md')
  })

  const tableRowHeight = computed(() => {
    const visibleColumns = internalColumns.value.filter(
      column => !column.hidden && column.field !== '_selectable'
    )

    const MOBILE_ROW_Y_PADDING = 2 * (12 + 1) // + 1 is border
    const MOBILE_ROW_CONTAINER_Y_PADDING = 2 * 4
    const columnsHeight =
      visibleColumns.length *
      (props.mobileRowHeight || props.mobileRowHeight || 40)

    const mobile =
      columnsHeight + MOBILE_ROW_Y_PADDING + MOBILE_ROW_CONTAINER_Y_PADDING
    const current = isBreakpoint.value ? props.rowHeight : mobile

    return {
      mobile,
      desktop: props.rowHeight,
      current,
    }
  })

  const TableRowComponent = computed(() => {
    return isBreakpoint.value && props.splitRow === 1
      ? TableRow
      : TableRowMobile
  })

  onMounted(() => {
    const selfDom = instance?.vnode.el as HTMLElement

    containerEl.value = selfDom.querySelector(
      '.virtual-scroll'
    ) as HTMLDivElement
  })

  return {
    isScrolled,
    isOverflown,
    isBreakpoint,
    tableRowHeight,
    TableRowComponent,
    rowKey,
    handleScrollLeft: (left: number) => (scrollLeft.value = left),

    // Element refs
    scrollerEl,
    tableEl,
    headerEl,
    totalsEl,
    containerEl,

    // Columns
    internalColumns,
    searchableColumnLabels,
    hasVisibleColumn,

    // Functions
    handleRowClick,
    handleStretchColumns,
    throttledHandleResize,
    recreateColumns,
    handleResize,
  }
}

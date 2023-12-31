import { klona } from 'klona'

// MODELS
import { TableColumn } from '~/components/Table/models/table-column.model'

// COMPOSITION FUNCTIONS
import { useTableUtils } from '~/components/Table/functions/useTableUtils'

// COMPONENTS
import HorizontalScroller from '@/components/Scroller/HorizontalScroller.vue'

// INJECTION KEYS
import { updateTableStateKey } from '~/components/Table/provide/table.provide'

type ISplitter = {
  field: TableColumn['field']
  left: number
}

type IActiveSplitter = ISplitter & {
  minLeft: number // ~ when dragging, it cannot go lower than this
  top: number
  height: number
  column: TableColumn
  adjustedWidth: number
}

export function useTableColumnResizing(props: {
  columns: TableColumn<any>[]
  minimumColumnWidth?: number
}) {
  // INJECTIONS
  const updateTableState = injectStrict(updateTableStateKey)

  // UTILS
  const { extractColumnsStateData } = useTableUtils()

  const headerEl = ref<InstanceType<typeof HorizontalScroller>>()

  // SPLITTERS (for resizing columns)
  let pageX = 0

  const activeSplitter = ref<IActiveSplitter>()

  const columnSplitters = computed(() => {
    const splitters: ISplitter[] = []
    let lastLeftPosition = 0

    props.columns
      .filter(col => !col.hidden)
      .forEach(col => {
        lastLeftPosition += col.adjustedWidth

        if (col.isHelperCol || !col.resizable) {
          return
        }

        splitters.push({
          field: col.field as string,
          left: lastLeftPosition,
        })
      })

    // We need to move the last splitter a bit to the left so it doesn't create overflow
    // But only in case the last column is actually resizable
    const lastCol = props.columns[props.columns.length - 1]

    if (lastCol.resizable) {
      splitters[splitters.length - 1].left -= 4
    }

    return splitters
  })

  function handleSplitterPointerDown(splitter: ISplitter, ev: PointerEvent) {
    const col = props.columns.find(c => c.field === splitter.field)
    const splitterCopy = klona(splitter)
    // @ts-expect-error some weird type
    const headerDom = unrefElement(headerEl)!
    const { y: headerY, height: headerHeight } =
      headerDom.getBoundingClientRect()
    const { height: tableHeight } = (
      headerDom.parentElement!.querySelector(
        '.vue-recycle-scroller'
      ) as HTMLElement
    ).getBoundingClientRect()

    pageX = ev.pageX

    activeSplitter.value = {
      ...splitterCopy,
      left: pageX,
      minLeft:
        ev.pageX - col!.adjustedWidth + (props.minimumColumnWidth || 0) - 4, // 4px is the middle of the splitter
      top: headerY,
      height: headerHeight + tableHeight,
      column: col!,
      adjustedWidth: col!.adjustedWidth,
    }

    document.documentElement.style.cursor = 'col-resize'
    document.documentElement.style.userSelect = 'none'

    document.documentElement.addEventListener(
      'pointermove',
      handleSplitterPointerMove
    )
    document.documentElement.addEventListener(
      'pointerup',
      handleSplitterPointerUp
    )
  }

  function handleSplitterPointerMove(ev: PointerEvent) {
    if (activeSplitter.value) {
      activeSplitter.value.left = Math.max(
        activeSplitter.value.minLeft!,
        ev.pageX
      )

      activeSplitter.value.adjustedWidth =
        activeSplitter.value.column.adjustedWidth +
        activeSplitter.value.left -
        pageX
    }
  }

  function handleSplitterPointerUp() {
    // Once we start changing the width of a column, we need to set width of the
    // other columns to a fixed value so it doesn't jump around
    props.columns.forEach(col => col.setWidth(col.adjustedWidth))

    // Set the width of the column we're resizing to the new width
    activeSplitter.value!.column.setWidth(activeSplitter.value!.adjustedWidth)

    // Reset the active splitter
    activeSplitter.value = undefined

    document.documentElement.removeEventListener(
      'pointermove',
      handleSplitterPointerMove
    )
    document.documentElement.removeEventListener(
      'pointerup',
      handleSplitterPointerUp
    )

    nextTick(() => {
      document.documentElement.style.cursor = ''
      document.documentElement.style.userSelect = ''

      updateTableState({
        columns: extractColumnsStateData(props.columns),
      })
      headerEl.value?.updateArrows()
    })
  }

  return {
    headerEl,
    activeSplitter,
    columnSplitters,
    handleSplitterPointerDown,
  }
}

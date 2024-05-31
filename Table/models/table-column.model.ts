import { type CSSProperties } from 'vue'
import { type Required } from 'utility-types'
import { config } from '~/components/config/components-config'

// Types
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { IItem, IItemBase } from '~/libs/Shared/types/item.type'
import type {
  ITableFilterItem,
  ITableOrderBy,
} from '~/components/Table/types/table-query.type'

// Models
import { ComparatorEnum } from '~/libs/App/enums/comparator.enum'
import { FilterItem } from '~/libs/Shared/models/filter-item'

// Functions
import { useRenderTemporaryTableCell } from '~/components/Table/functions/useRenderTemporaryTableCell'

// Constants
import { DATE_TYPES } from '~/libs/Shared/types/datetime.type'
import { NON_VALUE_COMPARATORS } from '~/components/Table/constants/comparator-categories.const'

// Components
import DynamicInput from '~/components/Inputs/DynamicInput/DynamicInput.vue'

export class TableColumn<T = IItem> implements IItemBase<T> {
  name: string | Extract<keyof T, string | number>
  format?: (row: T, value?: any) => any
  dataType: ExtendedDataType = 'string'
  label: string
  width: number | string = 1
  align: 'left' | 'center' | 'right' = 'left'
  field: ObjectKey<T>
  hideLabel?: boolean
  noFilters?: boolean
  filterable = true
  reorderable = true
  resizable = true
  sortable = true

  /**
   * When provided, the `select` will be extended with these fields
   */
  needsFields?: string[]

  /**
   * When true, the column label will be shown in the help button in the
   * search input of the table
   *
   * @default false
   */
  searchable?: boolean

  /**
   * When true, the column will be selectable
   *
   * @default true
   */
  selectable?: boolean

  /**
   * We might need to filter by a different field than the one displayed,
   * this property is used for that
   */
  filterField?: string

  /**
   * When true, the column will be not editable
   */
  noEdit?: boolean | ((row: T) => boolean)

  /**
   * When true, the column will be hidden in the table
   */
  hidden?: boolean

  /**
   * When true, the column will not be present in the column selection and will not
   * be generally accessible
   * It will also be hidden!
   */
  nonInteractive?: boolean

  /**
   * The column's original width
   */
  originalWidth: number | string = 1

  /**
   * When true, the column will always be included in the `select` query
   */
  alwaysSelected = false

  /**
   * When provided, the table will automatically create a link to the provided route
   */
  link?: (row: T) => string | undefined | false

  /**
   * The link's props
   *
   * Usage: passing `target` or `rel` props to the link
   */
  linkProps?: Record<string, any>

  /**
   * The column's minimum width in px
   */
  minWidth?: number

  /**
   * When true, the column cannot be frozen
   */
  noFreeze?: boolean

  /**
   * Frozen columns are columns that are always visible
   */
  frozen?: boolean

  /**
   * If column is `semiFrozen` it means that it is not directly frozen but
   * it is part of a group of columns that are "before" the frozen column
   */
  semiFrozen?: boolean

  // FILTERING
  filters: FilterItem<T>[] = []

  /**
   * For some comparators, we should be using a specific component
   *
   * For example, when using `in` or `not.in` we should use a multi-select
   * with autocompletion and stuff
   */
  filterComponent?: {
    component: any
    props?: IItem | ((row: T, column: ITableFilterItem) => IItem)
    comparators: ComparatorEnum[]
    valueFormatter?: {
      getter: (value: any) => any
      setter: (value: any) => void
    }
  }

  /**
   * The component to use for editing the actual value in the table
   */
  editComponent?: {
    component: any
    props?: Record<string, any>
  }

  /**
   * The default component used for editing
   */
  get _editComponent() {
    if (this.editComponent) {
      return this.editComponent
    }

    return {
      component: markRaw(DynamicInput),
      props: {
        dataType: this.dataType,
      },
    }
  }

  /**
   * The initial comparator
   */
  comparator = ComparatorEnum.STARTS_WITH

  /**
   * If used, these will be the only available comparators
   */
  comparators?: ComparatorEnum[]

  /**
   * These are comparators that will be added to the default ones
   */
  extraComparators?: ComparatorEnum[]

  /**
   * When filtering in the filter dropdown, we can use different formatting than in the table
   */
  filterFormat?: (row: T) => string | number

  /**
   * Whether to sort options in the filter dropdown
   */
  noFilterSort = false

  clearFilters() {
    this.filters = this.filters.filter(filter => !!filter.nonInteractive)
  }

  /**
   * Miscellanous data that can be used for anything
   */
  misc?: Record<string, any>

  get filterDbQuery() {
    if (!this.filters.length) {
      return undefined
    }

    // Filter must have a comparator and value to be considered valid
    const validFilters = this.filters.filter(filter => {
      if (Array.isArray(filter.value)) {
        return filter.comparator && filter.value.length
      }
      const isNonValueComparator = NON_VALUE_COMPARATORS.includes(
        filter.comparator
      )

      return filter.comparator && (!isNil(filter.value) || isNonValueComparator)
    })

    if (!validFilters.length) {
      return undefined
    }

    return validFilters
  }

  get filteredKeys() {
    return this.filters.reduce((agg, filter) => {
      Object.assign(agg, filter.filteredKeys)

      return agg
    }, {})
  }

  // Sorting
  sort?: 'asc' | 'desc'
  sortOrder?: number

  /**
   * When merging columns from the state and the original table columns,
   * the state columns order should be preserved, this is used for that
   */
  _internalSort?: number

  /**
   * When sorting in the filter dropdown, we can use different formatting than in the table
   */
  sortFormat?: (row: T) => string | number | boolean

  get sortDbQuery(): ITableOrderBy | undefined {
    if (!this.sort) {
      return undefined
    }

    return {
      field: this.field,
      direction: this.sort,
      sortOrder: this.sortOrder,
    }
  }

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: For getting distinct values from the server
   */
  getDistinctData?: (
    col: TableColumn<T>
  ) => Promise<DistinctData[]> | DistinctData[]

  // Styling
  style: CSSProperties = {}
  classes?: ClassType
  headerStyle: CSSProperties = {}
  headerClasses?: ClassType
  totalsStyle: CSSProperties = {}
  totalsClasses?: ClassType

  // Helpers
  /**
   * Helper cols are non-data columns like group actions
   */
  isHelperCol = false

  /**
   * Is calculated, not set by user
   */
  adjustedWidth = 1

  /**
   * When `false`, the autofit width will be calculated based on all the rows,
   * not just the longest in terms of text
   */
  autofitLongestText = true

  get _label() {
    return this.hideLabel ? '' : this.label
  }

  get adjustedWidthPx() {
    return `${this.adjustedWidth}px`
  }

  /**
   * @param width The width in px (must be a string, e.g. '100px')
   */
  setWidth(width: string) {
    this.width = width
    this.adjustedWidth = Number.parseInt(width.replace('px', ''))
  }

  setDataType(dataType?: ExtendedDataType, defaultComparator?: ComparatorEnum) {
    this.dataType = dataType || 'string'
    const _dataType = this.dataType?.replace('Simple', '')

    switch (_dataType) {
      case 'number':
      case 'int':
      case 'long':
      case 'double':
      case 'datetime':
      case 'DateTime':
      case 'date':
      case 'timestamp':
      case 'duration':
      case 'stringEnum':
      case 'custom':
        this.comparator = defaultComparator ?? ComparatorEnum.EQUAL

        break

      case 'boolean':
      case 'bool':
        this.comparator = defaultComparator ?? ComparatorEnum.IS

        break

      default:
        this.comparator = defaultComparator ?? ComparatorEnum.STARTS_WITH

        break
    }

    // If the column doesn't support the comparator, we set it to the first one
    if (
      this.comparators &&
      !this.comparators.includes(this.comparator as ComparatorEnum)
    ) {
      this.comparator = this.comparators[0]
    }
  }

  async autoFit(rows: any[], slotRenderFnc?: Function, tableMinColWidth = 80) {
    if (!this.resizable) {
      return
    }

    const { getCellWidth } = useRenderTemporaryTableCell()

    let maxContentWidth = 0

    // We primarily use the row with the longest text to calculate the autofit width
    if (this.autofitLongestText) {
      // We get the row with the maximum content
      const maxContentRow = (rows || [])
        .slice(0, config.table.columnAutoFit.rowsLimit)
        .reduce(
          (agg, row) => {
            const cellValue = this.valueGetter(row)
            const cellFormattedValue = Array.isArray(cellValue)
              ? cellValue.map(val => this.format?.(row, val) || val).join(', ')
              : this.format?.(row, cellValue) || cellValue

            const labelChars = String(cellFormattedValue || '').length

            if (labelChars > agg.labelChars || !agg.labelChars) {
              agg.labelChars = labelChars
              agg.row = row
            }

            return agg
          },
          { labelChars: 0, row: undefined } as Record<string, any>
        )

      maxContentWidth = await getCellWidth(
        maxContentRow.row,
        this,
        slotRenderFnc
      )
    }

    // When necessary, we can put `autofitLongestText = false` to calculate the
    // autofit width based on all the rows
    else {
      const _rows = (rows || []).slice(0, config.table.columnAutoFit.rowsLimit)

      for await (const row of _rows) {
        const width = await getCellWidth(row, this, slotRenderFnc)

        maxContentWidth = Math.max(maxContentWidth, width)
      }
    }

    const labelChars = this._label.length
    const CELL_PADDING = 12
    const colMinWidth = Math.min(
      Math.max(
        tableMinColWidth,
        this.minWidth || 0,
        config.table.columnAutoFit.considerHeader ? labelChars * 8 + 40 : 0, // These numbers are arbitrary
        maxContentWidth + CELL_PADDING
      ),
      config.table.columnAutoFit.maxColumnWidthChars * 6 + 20 // When autofitting, we don't want to go over some predefined value
    )

    this.setWidth(`${colMinWidth}px`)
  }

  freeze(columns: TableColumn[]) {
    const isFrozen = this.frozen

    // We unfreeze any other frozen column
    columns.forEach(col => {
      col.frozen = false
      col.semiFrozen = false
      col.headerStyle = omit(this.headerStyle, [
        'left',
        'position',
        'backgroundColor',
        'zIndex',
      ])
      col.style = omit(this.style, [
        'left',
        'position',
        'backgroundColor',
        'zIndex',
      ])
    })

    if (!isFrozen) {
      // And we freeze the current column
      const colIdx = columns.findIndex(col => col.field === this.field)

      let left = 0
      columns.slice(0, colIdx + 1).forEach(col => {
        col.setWidth(`${col.adjustedWidth}px`)

        col.semiFrozen = true
        col.headerStyle = {
          ...col.headerStyle,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }
        col.style = {
          ...col.style,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }

        left += col.adjustedWidth
      })

      this.frozen = true
    }
  }

  /**
   * Function that defines how do we access a value for this column
   * for a specific row
   */
  valueGetter(row: T) {
    return get(row, this.field) as any
  }

  constructor(col: Required<Partial<TableColumn<T>>, 'field'>) {
    this.name = col.name ?? col.field
    this.format = col.format
    this.filterable = col.filterable ?? true
    this.dataType = col.dataType ?? this.dataType
    this.label = String(col.label || col.name)
    this.field = col.field
    this.filterField = col.filterField || this.field
    this.width = col.width || this.width
    this.originalWidth = col.width || this.width
    this.minWidth = col.minWidth
    this.align = col.align || this.align
    this.hideLabel = col.hideLabel
    this.noFilters = col.noFilters
    this.sortable = col.sortable ?? true
    this.searchable = col.searchable ?? false
    this.hidden = col.hidden ?? false
    this.alwaysSelected = col.alwaysSelected ?? false
    this.nonInteractive = col.nonInteractive ?? false
    this.link = col.link
    this.linkProps = col.linkProps
    this.noFreeze = col.noFreeze
    this.autofitLongestText = col.autofitLongestText ?? true
    this.selectable = col.selectable ?? true
    this.needsFields = col.needsFields

    // Editing
    this.noEdit = col.noEdit
    this.editComponent = col.editComponent

    // We also hide the column when it's non-interactive
    if (col.nonInteractive) {
      this.hidden = true
    }

    this.isHelperCol = col.isHelperCol ?? this.isHelperCol

    // Filtering
    this.filters = col.filters ? col.filters : []
    this.filterComponent = col.filterComponent
    this.comparators = col.comparators ?? config.dataTypes.comparators[this.dataType]
    this.comparator = col.comparator ?? config.dataTypes.defaultComparator[this.dataType] ?? this.comparator
    this.extraComparators = col.extraComparators
    this.noFilterSort = col.noFilterSort ?? false
    this.filterFormat = col.filterFormat
    this.getDistinctData = col.getDistinctData
    this.valueGetter = col.valueGetter ?? this.valueGetter

    this.reorderable = col.reorderable ?? this.reorderable
    this.resizable = col.resizable ?? this.resizable

    this.setDataType(col.dataType, col.comparator)

    // Sorting
    this.sort = col.sort
    this.sortOrder = col.sortOrder
    this.sortFormat = col.sortFormat
    this._internalSort = col._internalSort

    if (DATE_TYPES.includes(this.dataType) && !this.sortFormat) {
      this.sortFormat = (row: T) => {
        return getDateSimpleValue(get(row, this.field) as Datetime)
      }
    }

    // Styling
    this.style = col.style || this.style
    this.classes = col.classes
    this.headerStyle = col.headerStyle || this.headerStyle
    this.headerClasses = col.headerClasses
    this.totalsStyle = col.totalsStyle || this.totalsStyle
    this.totalsClasses = col.totalsClasses || 'flex-center'

    this.misc = col.misc
  }
}

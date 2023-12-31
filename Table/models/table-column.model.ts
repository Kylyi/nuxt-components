import { Required } from 'utility-types'
import { CSSProperties } from 'vue'

// TYPES
import type { DistinctData } from '~/components/Table/types/distinct-data.type'
import type { IItem, IItemBase } from '~/libs/App/types/item.type'

// MODELS
import { FilterItem } from '~/libs/App/data/models/filter-item'
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// CONSTANTS
import { DATE_TYPES } from '~/libs/App/types/datetime.type'
import { config } from '~/config'

const STRING_LIKE_COMPARATORS = [
  ComparatorEnum.STARTS_WITH,
  ComparatorEnum.ENDS_WITH,
  ComparatorEnum.CONTAINS,
  ComparatorEnum.EQUAL,
]

export class TableColumn<T = IItem> implements IItemBase<T> {
  name: string | Extract<keyof T, string | number>
  format?: (row: T, value?: any) => any
  dataType: DataType = 'string'
  label: string
  width: number | string = 1
  minWidth?: string
  align: 'left' | 'center' | 'right' = 'left'
  field: Extract<keyof T, string | number>
  hideLabel?: boolean
  hideFilters?: boolean
  filterable = true
  reorderable = true
  resizable = true
  sortable = true
  searchable?: boolean
  hidden?: boolean

  // FILTERING
  filters: FilterItem<T>[] = []

  /**
   * The initial comparator
   */
  comparator = ComparatorEnum.STARTS_WITH

  /**
   * If used, these will be the only available comparators
   */
  comparators?: ComparatorEnum[]

  /**
   * When filtering in the filter dropdown, we can use different formatting than in the table
   */
  filterFormat?: (row: T) => string | number

  // Whether to sort options in the filter dropdown
  noFilterSort = false

  get filterDbQuery() {
    if (!this.filters.length) {
      return undefined
    }

    // We can also filter by `null` values
    // but Prisma doesn't support `null` in `in` or `notIn` comparators
    // so we need to extract those values and add them to the query manually
    const comparatorsWithNull: ComparatorEnum[] = []

    const filterConditions = this.filters.reduce((agg, filter) => {
      const isEmptyArray = Array.isArray(filter) && !filter.length

      if (filter.compareValue !== undefined && !isEmptyArray) {
        // When using the `in` or `notIn` comparator, we have an array of values
        if (Array.isArray(filter.compareValue)) {
          if (filter.compareValue.some(item => item._value === null)) {
            comparatorsWithNull.push(filter.comparator)
          }

          // The `_value` comes from the DistnctData type
          agg[filter.comparator] = filter.compareValue
            .map(item => {
              return item._value
            })
            .filter(Boolean)

          // We don't want to send empty arrays
          if (agg[filter.comparator].length === 0) {
            delete agg[filter.comparator]
          }
        }

        // When using `datetime` or `date` datatype, we need to create a range
        else if (
          (this.dataType === 'datetime' || this.dataType === 'date') &&
          filter.comparator === ComparatorEnum.EQUAL
        ) {
          agg.gte = filter.compareValue
          agg.lt = $date(filter.compareValue).add(1, 'day')
        }

        // Otherwise, we just use the value
        else {
          agg[filter.comparator] = filter.compareValue
        }
      }

      return agg
    }, {} as IItem)

    let query: IItem = {}

    const isStringLikeFilter =
      this.dataType === 'string' &&
      STRING_LIKE_COMPARATORS.includes(this.comparator)

    set(query, this.field, {
      ...filterConditions,
      ...(config.table.useInsensitiveFilter &&
        isStringLikeFilter && { mode: 'insensitive' }),
    })

    if (comparatorsWithNull.length) {
      query = {
        OR: [query],
      }

      comparatorsWithNull.forEach(comparator => {
        query.OR.unshift({
          [this.field]: {
            [comparator === ComparatorEnum.IN ? 'equals' : 'not']: null,
          },
        })
      })
    }

    return query
  }

  get filteredKeys() {
    return this.filters.reduce((agg, filter) => {
      Object.assign(agg, filter.filteredKeys)

      return agg
    }, {})
  }

  // SORTING
  sort?: -1 | 0 | 1
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

  get sortDbQuery(): Record<string, 'asc' | 'desc'> | undefined {
    if (!this.sort) {
      return undefined
    }

    const query: Record<string, any> = {}
    set(query, this.field, this.sort === 1 ? 'asc' : 'desc')

    return query
  }

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: For getting distinct values from the server
   */
  getDistinctData?: (
    col: TableColumn<T>
  ) => Promise<DistinctData[]> | DistinctData[]

  // STYLING
  style: CSSProperties = {}
  classes?: ClassType
  headerStyle: CSSProperties = {}
  headerClasses?: ClassType

  // HELPERS
  isHelperCol = false // Helper cols are non-data columns like group actions
  adjustedWidth = 1 // Is calculated, not set by user

  get _label() {
    return this.hideLabel ? '' : this.label
  }

  get adjustedWidthPx() {
    return `${this.adjustedWidth}px`
  }

  setWidth(width: number) {
    this.width = `${width}px`
    this.adjustedWidth = width
  }

  constructor(col: Required<Partial<TableColumn<T>>, 'field'>) {
    this.name = col.name ?? col.field
    this.format = col.format
    this.filterable = col.filterable ?? true
    this.dataType = col.dataType ?? this.dataType
    this.label = String(col.label || col.name)
    this.field = col.field
    this.width = col.width || this.width
    this.minWidth = col.minWidth
    this.align = col.align || this.align
    this.hideLabel = col.hideLabel
    this.hideFilters = col.hideFilters
    this.sortable = col.sortable ?? true
    this.searchable = col.searchable ?? false
    this.hidden = col.hidden ?? false

    this.isHelperCol = col.isHelperCol ?? this.isHelperCol

    // FILTERING
    this.filters = col.filters
      ? col.filters.map(filter => new FilterItem(filter))
      : []
    this.comparators = col.comparators
    this.noFilterSort = col.noFilterSort ?? false
    this.filterFormat = col.filterFormat
    this.getDistinctData = col.getDistinctData

    this.reorderable = col.reorderable ?? this.reorderable
    this.resizable = col.resizable ?? this.resizable

    switch (this.dataType) {
      case 'number':
      case 'boolean':
      case 'datetime':
      case 'date':
        this.comparator = col.comparator ?? ComparatorEnum.EQUAL

        break

      default:
        this.comparator = col.comparator ?? ComparatorEnum.STARTS_WITH

        break
    }

    // SORTING
    this.sort = col.sort
    this.sortOrder = col.sortOrder
    this.sortFormat = col.sortFormat
    this._internalSort = col._internalSort

    if (DATE_TYPES.includes(this.dataType) && !this.sortFormat) {
      this.sortFormat = (row: T) => {
        return getDateSimpleValue(row[this.field as keyof T] as Datetime)
      }
    }

    // STYLING
    this.style = col.style || this.style
    this.classes = col.classes
    this.headerStyle = col.headerStyle || this.headerStyle
    this.headerClasses = col.headerClasses
  }
}

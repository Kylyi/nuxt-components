import type { RouteLocationRaw } from '#vue-router'

// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { ITableDataFetchFncInput } from '~/components/Table/types/table-query.type'
import type { ITableSelection } from '~/components/Table/types/table-selection.type'
import type { ITableSelectionOptions } from '~/components/Table/types/table-selection-options.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

export interface ITableProps {
  /**
   * Whether the table should handle the resize event - performance heavy(-ish)
   */
  autoResize?: boolean

  /**
   * The breakpoint at which the table should switch to mobile view
   */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'inf'

  /**
   * Definition of the table columns
   */
  columns?: TableColumn<any>[]

  /**
   * Whether the table should have inline editing
   */
  editable?: boolean | 'cards' | 'table'

  /**
   * The export props - gets passed to the `ExportBtn` component (in TableTop.vue)
   */
  exportProps?: {
    /**
     * When true, the default export btn (`TableExportBtn.vue`) will be used
     */
    useDefault?: boolean

    [key: string]: any
  }

  /**
   * The default width for expand columns
   */
  groupExpandWidth?: number

  /**
   * The default height for grouped table row
   */
  groupRowHeight?: number

  /**
   * The total amount of rows
   */
  totalRows?: number

  /**
   * The default height for the table header
   */
  headerHeight?: number

  /**
   * Whether the column filters should be hidden
   */
  noFilters?: boolean

  /**
   * Whether the table should have the lock-column buttons
   */
  noLock?: boolean

  /**
   * Whether the table header should be hidden
   */
  noHeader?: boolean

  /**
   * Basically the opposite of pagination
   */
  infiniteScroll?: boolean

  /**
   * Number of rows per page options when using pagination
   */
  rowsPerPageOptions?: number[]

  /**
   * The initial layout schema for the table
   * When provided, the table will be initialized with this schema
   */
  initialLayoutSchema?: string

  /**
   * The layout schema that will be included in every request but will not be
   * visible to the user
   */
  appendedLayoutSchema?: string

  /**
   * Whether the table is in `loading` state
   */
  loading?: boolean

  /**
   * Whether the loading should be on top of the table
   */
  loadingOnTop?: boolean

  /**
   * The maximum amount of rows when using the infinite scroll
   */
  limitRows?: number

  /**
   * The minimum column width
   */
  minimumColumnWidth?: number

  /**
   * The default row height in mobile view
   */
  mobileRowHeight?: number

  /**
   * Whether the export btn should be hidden
   */
  noExport?: boolean

  /**
   * Whether the pagination should be used
   *
   * NOTE - When `null` is used, the pagination will be completely hidden, when
   * `true` the pagination will still be used but not visible
   */
  noPagination?: boolean | null

  /**
   * Whether the search should be hidden
   */
  noSearch?: boolean

  /**
   * Whether the top of the table should be hidden
   */
  noTop?: boolean

  /**
   * Whether the totals should be hidden
   */
  noTotals?: boolean

  /**
   * Query builder rows
   */
  queryBuilder?: IQueryBuilderRow[]

  /**
   * Whether the row should be clickable
   */
  rowClickable?: boolean

  /**
   * The default height for the table rows
   */
  rowHeight?: number

  /**
   * The default key for the table rows
   * @default 'id'
   */
  rowKey?: string

  /**
   * The actual data rows
   */
  rows?: any[]

  /**
   * The class of the row
   */
  rowClass?: (row: any) => ClassType

  /**
   * When true, table will not get focused on initialization
   *
   * Note: We focus the table to enable keyboard navigation
   */
  noFocusOnInit?: boolean

  /**
   * When true, the table will not save the state in the local storage
   */
  noStateSave?: boolean

  /**
   * The settings that are saveable whtin the table
   */
  nonSavableSettings?: Array<'columns' | 'filters' | 'sorting' | 'public'>

  paginationOptions?: {
    pageSize?: number
    page?: number

    /**
     * When scrolling to the bottom of the table, this amount of rows
     * will trigger the `loadMore` event
     */
    rowsCountTrigger?: number
  }

  /**
   * Defines visuals for the separators in the table
   */
  separator?: 'horizontal' | 'vertical' | 'cell'

  /**
   * When columns come from the metadata, this is the prefix used for the
   * `label` when creating the columns
   *
   * For example:
   *  `label: 'name'` will become `label: '<translationPrefix>.name'`
   */
  translationPrefix?: string

  /**
   * Whether the table should include archived rows
   * Note: Project specific
   */
  useIncludeDeleted?: boolean

  /**
   * Whether to use worker to handle intesive tasks
   * @default 'depends on amount of rows'
   */
  useWorker?: boolean

  tableTopFunctionality?: {
    /**
     * Whether to show the table top's row with query builder, filters, etc.
     */
    noToolbar?: boolean

    /**
     * Whether to show the table top's sorting, table layout, etc.
     */
    noSubbar?: boolean

    noSort?: boolean
    noBulk?: boolean
    noLayout?: boolean
    noColumnSelection?: boolean
    noAutoFit?: boolean
    noExport?: boolean
    noSubscription?: boolean
  }

  /**
   * Method to get data for the table
   * `payloadKey` ~ key in the response that contains the data
   * `countKey` ~ key in the response that contains the total count of rows
   * `urlKey` ~ key in the response that contains the query params for the request
   * `hashKeys` ~ keys in the response that contains table hashes - used to hydrate the table state
   * `createIdentifier` ~ function to create a unique identifier for each row when the `rowKey` is not unique
   * `errorHandler` ~ function to handle errors that come from fetching the table data
   */
  getData?: {
    fnc: (options: ITableDataFetchFncInput) => Promise<any> | any
    payloadKey?: string
    countKey?: string
    hashKeys?: Record<string, string>
    versionKey?: string
    createIdentifier?: (row: any, idx: number) => string | number
    errorHandler?: (error: any) => void
    limitRows?: number
  }

  getTotalsData?: {
    fnc: (
      options: ITableDataFetchFncInput,
      column: TableColumn,
      rows: any[]
    ) => Promise<any> | any
    errorHandler?: (error: any) => void
    payloadKey?: string
    labelKey?: string

    /**
     * Whether to get the totals data immediately
     */
    immediate?: boolean
  }

  getMetaData?: {
    /**
     * The function to get the metadata
     */
    fnc: () => any | Promise<any>

    /**
     * The key in the response that contains the columns
     * @default config.table.columnsKey
     */
    columnsKey?: string

    /**
     * The key in the response that contains the default layout
     * @default config.table.defaultLayoutKey
     */
    defaultLayoutKey?: string

    /**
     * The key in the response that contains the layouts
     * @default config.table.layoutsKey
     */
    layoutsKey?: string

    /**
     * The function to modify the column before it's added to the table
     */
    modifyColumnFnc?: (column: TableColumn) => void

    /**
     * When true, if metadata returns columns, they all will be used, no matter
     * if we defined just some of them explcitly in the `columns` prop
     */
    useAllColumns?: boolean

    /**
     * The function that handles the response in case of an error
     */
    errorHandler?: (error: any) => void
  }

  /**
   * Will split the table row into multiple columns
   */
  splitRow?: number

  /**
   * Selection-related props
   */
  selectionOptions?: {
    /**
     * Function that gets called on row select, returrn `false` to prevent the
     * selection from happening
     */
    onSelect?: (
      row: any,
      selection: MaybeRefOrGetter<ITableSelection>,
      options?: ITableSelectionOptions
    ) => void | false | Promise<void | false>

    /**
     * Selection key
     * The key to use for the selection
     */
    selectionKey?: string

    /**
     * Whether the table rows should be selectable
     */
    selectable?: boolean

    /**
     * Whether the table rows have the selection disabled
     */
    disabled?: boolean | ((row: any) => boolean)
  }

  /**
   * The selected rows, can be either:
   * * Array<string | number> ~ use for `rowKey` selection
   * * Record<itemKey, item> ~ use for `item` selection
   */
  selected?: ITableSelection

  /**
   * Key for the local storage, if not provided, the key will be generated
   * based on the parent component of the table
   * use `null` to disable this functionality
   */
  storageKey?: string | null

  /**
   * Link to the detail from page
   */
  to?: (row: any) => RouteLocationRaw

  /**
   * Whether to use the url to store the table state
   */
  useUrl?: boolean
}

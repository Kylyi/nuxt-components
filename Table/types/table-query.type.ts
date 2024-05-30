import { config } from '~/components/config/components-config'

// Types
import type { IItem } from '~/libs/Shared/types/item.type'
import type { IQueryBuilderGroup } from '~/components/QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderItem } from '~/components/QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'

export type ITableOrderBy = {
  field: string
  direction: 'asc' | 'desc'
  sortOrder?: number | undefined
}
export type ISelect = Record<string, boolean | Record<string, boolean>>

export type ITableFilterItem<T = IItem> = Pick<
  IQueryBuilderItem<T>,
  'field' | 'filterField' | 'value' | 'comparator' | 'dataType' | 'filterField'
>

export type ITableFilterGroup<T = IItem> = Pick<
  IQueryBuilderGroup,
  'isGroup' | 'condition'
> & {
  children: ITableFilterItem<T>[]
}

export type ITableFilterRow<T = IItem> =
  | ITableFilterItem<T>
  | ITableFilterGroup<T>

export type ITableQuery = {
  queryBuilder?: IQueryBuilderRow[]
  columnFilters?: ITableFilterItem[]
  filters?: ITableFilterRow[]
  orderBy?: ITableOrderBy[]
  search?: string
  take?: number
  skip?: number
  select?: string[]
  includeDeleted?: boolean
  isInitialFetch?: boolean // Whether this is the initial fetch

  /**
   * The layout schema that will be included in every request but will not be
   * visible to the user
   */
  appendedLayoutSchema?: string

  fetchMore?: {
    rowKey: string
    $key: number | string
    lastRow: any
  }
}

export type ITableDataFetchFncInput = {
  /**
   * The table query object with all the filters, sorting and everything else
   * in the object-like structure
   */
  tableQuery: ITableQuery

  /**
   * Same as the `tableQuery` but with the `alwaysSelected` columns included
   * Note: Used for actual data fetching
   */
  fetchTableQuery: ITableQuery

  /**
   * The query parameters for the actual fetch query
   * Note: Used for navigation
   */
  queryParams: ReturnType<typeof config.table.getQuery>

  /**
   * Same idea as `queryParams` but with the `alwaysSelected` columns included
   * Also contains all the sorted columns in `select` even if the column is not visible
   * Note: Used for actual data fetching
   */
  fetchQueryParams: ReturnType<typeof config.table.getQuery>

  /**
   * We can also inject our own keys to this object
   */
  [key: string]: any
}

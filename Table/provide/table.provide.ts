import { TableColumn } from '~/components/Table/models/table-column.model'
import { ITableQuery } from '~/components/Table/types/table-query.type'
import { ITableState } from '~/components/Table/types/table-state.type'

export const getTableStateKey: InjectionKey<() => ITableState> =
  Symbol('getTableStateKey')
export const updateTableStateKey: InjectionKey<
  (
    tableState: Partial<ITableState>,
    callback?: (
      tableState: ITableState,
      originalColumns: TableColumn<any>[]
    ) => ITableState,
    updateInternalColumns?: boolean,
    updateServerState?: boolean
  ) => void
> = Symbol('updateTableState')

export const tableIncludeDeletedKey: InjectionKey<Ref<boolean>> = Symbol(
  'tableIncludeDeleted'
)

export const refreshTableDataKey: InjectionKey<() => void> =
  Symbol('refreshTableData')

export const recalculateTableColumnsKey: InjectionKey<
  (force?: boolean) => void
> = Symbol('recalulateTableColumns')

export const tableGetTableQueryKey: InjectionKey<() => ITableQuery> = Symbol(
  'tableGetTableQueryKey'
)

export const tableSelectRowKey: InjectionKey<(row: any) => void> =
  Symbol('tableSelectRow')

export const tableIsSelectedRowKey: InjectionKey<(row: any) => boolean> =
  Symbol('tableIsSelectedRow')

import { config } from '~/components/config/components-config'

// Types
import type { IQueryBuilderRow } from '~/components/QueryBuilder/types/query-builder-row-props.type'
import type { ITableLayout } from '~/components/Table/types/table-layout.type'
import type { ITableProps } from '~/components/Table/types/table-props.type'
import type { IVirtualScrollEvent } from '~/components/VirtualScroller/types/virtual-scroll-event.type'
import type {
  ITableDataFetchFncInput,
  ITableFilterRow,
  ITableOrderBy,
  ITableQuery,
} from '~/components/Table/types/table-query.type'

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'
import { FilterItem } from '~/libs/Shared/models/filter-item'

// Functions
import { useTableUtils } from '~/components/Table/functions/useTableUtils'
import {
  serializeFilterString,
  serializeOrderByString,
} from '~/libs/App/functions/table/transformTableQueryToQueryParams'

// Injections
import {
  tableCustomDataKey,
  tableExternalDataKey,
  tableQueryBuilderKey,
  tableQueryKey,
  tableRecreateQueryBuilderKey,
  tableRefreshKey,
  tableRowsKey,
  tableStorageKey,
  tableVersionKey,
} from '~/components/Table/provide/table.provide'

// Store
import { useTableStore } from '~/components/Table/table.store'
import { useAppStore } from '~/libs/App/app.store'

export function useTableData(
  props: ITableProps,
  internalColumnsRef: Ref<TableColumn[]>,
  layoutRef: Ref<ITableLayout | undefined>,
  queryBuilder: Ref<IQueryBuilderRow[] | undefined>,
  scrollerEl: Ref<any>,
  metaDataRefetch?: (
    forceRefetch?: boolean,
    options?: { meta?: any }
  ) => Promise<void>,
  recreateColumns?: (shouldRecreate?: boolean) => void,
  resizeColumns?: (force?: boolean) => void
) {
  // Utils
  const route = useRoute()
  const instance = getCurrentInstance()
  const { getStorageKey, parseUrlParams, getRowKey } = useTableUtils(props)
  const { isLoading, handleRequest } = useRequest({
    loadingInitialState: !props.rows,
  })

  function extractHashes(data: any) {
    const hashKeys = props.getData?.hashKeys ?? config.table.hashKeys
    const hashes: Record<string, string | number> = {}

    Object.keys(hashKeys).forEach(key => {
      const hash = get(data, hashKeys[key as keyof typeof hashKeys])

      if (hash) {
        hashes[key] = hash
      }
    })

    return hashes
  }

  // Layout
  const isInitialized = ref(false)
  const hasMore = ref(false)
  const versionId = ref<number>()
  const dataHasBeenFetched = ref(false)
  const isForcedRefetch = ref(false)
  const search = ref('')
  const customData = ref<IItem>({})
  const rows = (props.rows ? useVModel(props, 'rows') : ref([])) as Ref<any[]>
  const previousDbQuery = ref<ITableDataFetchFncInput>()
  const totalRows = props.totalRows
    ? useVModel(props, 'totalRows')
    : ref<number>()

  const storageKey = computed(() => getStorageKey())

  const rowKey = computed(() => getRowKey(props))

  const rowsSplit = computed<any[]>(() => {
    if (!props.splitRow) {
      return rows.value.map(row => ({
        [rowKey.value]: row[rowKey.value],
        data: [row],
      }))
    }

    return rows.value.reduce((agg, row, idx) => {
      const mod = idx % props.splitRow!

      if (mod === 0) {
        agg.push({
          [rowKey.value]: '',
          data: [],
        })
      }

      agg[agg.length - 1][rowKey.value] += `_${row[rowKey.value]}`
      agg[agg.length - 1].data.push(row)

      return agg
    }, [] as any[])
  })

  // Store
  const { activeElement } = storeToRefs(useAppStore())
  const { getTableState, setTableState, resetTableState } = useTableStore()
  const tableState = getTableState(storageKey.value)

  initializeQueryBuilder()

  // Provides & Injects
  const externalData = inject(tableExternalDataKey, ref({} as IItem))

  provide(tableRefreshKey, (force?: boolean) => refreshData(force))
  provide(tableRecreateQueryBuilderKey, () => initializeQueryBuilder())
  provide(tableStorageKey, storageKey)
  provide(tableRowsKey, rows)
  provide(tableQueryBuilderKey, queryBuilder)
  provide(tableVersionKey, versionId)
  provide(tableCustomDataKey, customData)

  // Pagination
  const {
    currentPage,
    next,
    prev,
    isFirstPage,
    pageCount,
    isLastPage,
    currentPageSize,
  } = useOffsetPagination({
    ...tableState.value,
    total: () => totalRows.value ?? Number.POSITIVE_INFINITY,
    onPageChange: page => {
      if (isInitialized.value) {
        tableState.value.page = page.currentPage
        dbQuery.trigger()
      }
    },
    onPageSizeChange: page => {
      if (isInitialized.value) {
        tableState.value.pageSize = page.currentPageSize
        dbQuery.trigger()
      }
    },
  })

  // Infinite scroll
  const fetchMore = ref(false)

  // The id of the fetched row (~ is used for fetching more data)
  const lastRow = computed(() => {
    return rows.value[rows.value.length - 1]
  })

  function handleInfiniteScroll(payload: IVirtualScrollEvent) {
    const { visibleEndItem } = payload

    if (!totalRows.value || !rows.value) {
      return
    }

    // When using split rows, we need to adjust the `visibleEndItem` index
    const modifier = props.splitRow ?? 1
    const rowsCountTrigger = props.paginationOptions?.rowsCountTrigger ?? 20

    const isAtBottom = visibleEndItem.index * modifier >= rows.value.length - rowsCountTrigger

    if (hasMore.value && isAtBottom && !fetchMore.value) {
      fetchMore.value = true
      fetchAndSetData(dbQuery, true)
    }
  }

  // Data fetching
  const pagination = computed(() => {
    const {
      page = config.table.defaultPagination.page,
      pageSize = config.table.defaultPagination.pageSize,
    } = props.paginationOptions ?? {}

    const take = tableState.value.pageSize || pageSize
    const skip = ((tableState.value.page || page) - 1) * take

    return { take, skip }
  })

  // Sorting
  const orderBy = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .reduce((agg, col) => {
        if (col.sortDbQuery) {
          agg.push(col.sortDbQuery)
        }

        return agg
      }, [] as ITableOrderBy[])
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  })

  // Columns selection
  const select = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .filter(col => !col.isHelperCol && !col.hidden)
      .flatMap(col => [col.field, ...(col.needsFields ?? [])])
  })

  // Column filters
  const columnFilters = computed(() => {
    const columns = toValue(internalColumnsRef)

    return columns
      .flatMap(col => col?.filterDbQuery)
      .filter(Boolean) as FilterItem<IItem>[]
  })

  const dbQuery = computedWithControl(
    // We trigger the `dbQuery` on basically everything except for column filters
    // Column filters are handled manually!
    () => [orderBy.value, search.value, select.value, queryBuilder.value],
    () => {
      const hasQueryBuilder =
        queryBuilder.value?.length &&
        'isGroup' in queryBuilder.value[0] &&
        queryBuilder.value[0].children.length > 0

      // TODO: Type
      // @ts-expect-error wrong type
      const filters: ITableFilterRow[] = [
        ...(queryBuilder.value && hasQueryBuilder ? queryBuilder.value : []),
        ...columnFilters.value,
      ]

      // We check if we use some filters
      const hasFilters = filters.length > 0

      const tableQuery: ITableQuery = {
        ...pagination.value,
        queryBuilder: queryBuilder.value,
        columnFilters: columnFilters.value,
        filters: hasFilters ? filters : undefined, // Query builder and column filters combined
        orderBy: orderBy.value,
        search: search.value,
        select: select.value,
        includeDeleted: tableState.value.includeDeleted,
        appendedLayoutSchema: props.appendedLayoutSchema,
        isInitialFetch: true,
      }

      // When there are some columns with `alwaysSelected` attribute set to true,
      // we need to add them to the `select` array
      // When `strict` is used, we ignore this behaviour
      // TODO: SSR version for this
      const isStrictMode = route.query.strict === 'true'

      const fetchTableQuery: ITableQuery = {
        ...tableQuery,
        select: Array.from(
          new Set([
            ...(tableQuery.select || []),

            // Add `alwaysSelected` columns when `strict` is not used
            ...internalColumnsRef.value
              .filter(col => col.alwaysSelected && !isStrictMode)
              .map(col => col.field),

            // Add sorted columns
            ...(tableQuery.orderBy?.map(order => order.field) || []),
          ])
        ),
      }

      const fetchInput: ITableDataFetchFncInput = {
        tableQuery,
        fetchTableQuery,
        queryParams: config.table.getQuery(tableQuery),
        fetchQueryParams: config.table.getQuery(fetchTableQuery),
      }

      return fetchInput
    }
  )

  provide(tableQueryKey, dbQuery)

  const refreshData = useDebounceFn((force?: boolean) => {
    isForcedRefetch.value = !!force

    dbQuery.trigger()
  }, 100)

  /**
   * The function that actually fetches the data from the server
   */
  function fetchData(optionsRef: MaybeRefOrGetter<ITableDataFetchFncInput>) {
    return handleRequest(
      async () => {
        if (!props.getData) {
          return
        }

        const options = toValue(optionsRef)

        const result = await props.getData.fnc(options)

        versionId.value = get(
          result,
          props.getData.versionKey || config.table.versionKey
        )

        let data = get(
          result,
          props.getData.payloadKey || config.table.payloadKey
        ) as any[]

        if (props.getData.createIdentifier) {
          data = data.map((row, idx) => {
            Object.assign(row, {
              _uuid: props.getData!.createIdentifier!(row, idx),
            })

            return row
          })
        }

        return {
          data,
          totalRows: get(
            result,
            props.getData.countKey || config.table.countKey
          ),
          hashes: extractHashes(result),
          res: result,
        }
      },
      { noResolve: true }
    )
  }

  /**
   * Fetches the data and sets it to the appropriate variables
   */
  async function fetchAndSetData(
    optionsRef: MaybeRefOrGetter<ITableDataFetchFncInput>,
    isFetchMore?: boolean
  ) {
    try {
      let options = toValue(optionsRef)

      // NOTE: We check whether the amount of data we already fetched is not
      // greater than the limit
      const limitRows = props.getData?.limitRows || config.table.props.limitRows

      if (limitRows && rows.value.length >= limitRows) {
        return
      }

      // When fetching more data, we need to manually get the queryParams again as
      // it is not triggered in the `dbQuery` computed
      if (isFetchMore) {
        options.fetchQueryParams = config.table.getQuery({
          ...options.fetchTableQuery,
          isInitialFetch: false,
          fetchMore: {
            $key: get(lastRow.value, rowKey.value),
            rowKey: rowKey.value,
            lastRow: lastRow.value,
          },
        })

        options.tableQuery.isInitialFetch = false
        options.fetchTableQuery.isInitialFetch = false
      }

      if (
        'extendTableFetchInput' in config.table &&
        typeof config.table.extendTableFetchInput === 'function'
      ) {
        if (isFetchMore) {
          options.fetchTableQuery.skip = rows.value.length
        }

        options = config.table.extendTableFetchInput(options)
      }

      const res = await fetchData(options)

      if (config.table.extractData) {
        customData.value = Object.assign(
          customData.value,
          config.table.extractData(res, {
            externalDataRef: externalData,
            metaRef: tableState.value?.meta,
          })
        )
      }

      // When any of the hashes mismatches, we force metadata refetch and data refetch
      if (!dataHasBeenFetched.value) {
        const resHashes = res?.hashes ?? {}
        const stateHashes = extractHashes(tableState.value.meta)

        const hasHashMismatch = Object.keys(stateHashes).some(key => {
          const stateHash = stateHashes[key]
          const resHash = resHashes[key]

          return stateHash !== resHash
        })

        if (hasHashMismatch) {
          await metaDataRefetch?.(true)
          recreateColumns?.(false)
          initializeQueryBuilder()
          resizeColumns?.(true)

          return
        }
      }

      if (res) {
        rows.value = isFetchMore ? [...rows.value, ...res.data] : res.data
        totalRows.value = isFetchMore ? totalRows.value : res.totalRows
        hasMore.value =
          totalRows.value! > rows.value.length &&
          options.fetchTableQuery.take! === res.data.length

        instance?.emit('update:rows', rows.value)
        instance?.emit('update:totalRows', totalRows.value)
      }

      // We scroll to top if we are not fetching more data
      if (!isFetchMore) {
        scrollerEl.value?.scrollTo(0)
      }

      // We reset the `fetchMore`
      nextTick(() => {
        fetchMore.value = false
      })

      // We set the `dataHasBeenFetched` to true
      dataHasBeenFetched.value = true
    } catch (error) {
      resetTableState(storageKey.value)
    }
  }

  // Fetch and set data on init and when the `dbQuery` changes
  // Also change the URL accordingly
  // Also save the `TableState`
  watch(
    dbQuery,
    async dbQuery => {
      const _isInitialized = isInitialized.value

      // NOTE: When we provide the rows, we don't want to fetch them right away
      if (!isInitialized.value && rows.value.length) {
        return
      }

      // ANCHOR: We only refetch data if the query has changed or we forced the refetch
      if (
        !isForcedRefetch.value &&
        previousDbQuery.value?.fetchQueryParams.toString() ===
          dbQuery.fetchQueryParams.toString()
      ) {
        // We might have some columns `alwaysSelected`, so if we add such column into
        // the table, it would actually not trigger the refetch, if that happens,
        // we need to manually adjust the url
        const hasDifferentVisibleCols =
          dbQuery.tableQuery.select?.length !==
          previousDbQuery.value?.tableQuery.select?.length

        if (!hasDifferentVisibleCols) {
          if (layoutRef.value?.preventLayoutReset) {
            layoutRef.value.preventLayoutReset = false
          }

          return
        }
      }

      if (layoutRef.value?.preventLayoutReset) {
        layoutRef.value.preventLayoutReset = false
      } else {
        layoutRef.value = undefined
      }

      await fetchAndSetData(dbQuery)
      previousDbQuery.value = dbQuery

      // NOTE: Set URL
      if (props.useUrl) {
        const tableColumnFields = internalColumnsRef.value
          .filter(col => !col.isHelperCol)
          .map(col => col.field)

        const routeQueryWithoutTableParams = omit(route.query, [
          'qb',
          'filters',
          'order',
          'select',
          'search',
          'and',
          'or',
          ...tableColumnFields,
        ])
        const qb = serializeFilterString(dbQuery.tableQuery.queryBuilder)
        const filters = serializeFilterString(dbQuery.tableQuery.columnFilters)
        const order = serializeOrderByString(dbQuery.tableQuery.orderBy)
        const select = internalColumnsRef.value
          .filter(col => !col.hidden && !col.isHelperCol)
          .map(col => col.field)
          .join(',')

        navigateTo(
          {
            query: {
              ...routeQueryWithoutTableParams,
              ...(qb && qb !== 'and()' && { qb }),
              ...(filters && { filters }),
              ...(order && { order: `(${order})` }),
              ...(select && { select }),
              ...(!props.infiniteScroll && {
                skip: dbQuery.tableQuery.skip,
                take: dbQuery.tableQuery.take,
              }),
              ...(dbQuery.tableQuery.search && {
                search: dbQuery.tableQuery.search,
              }),
              ...(dbQuery.tableQuery.includeDeleted && {
                includeDeleted: String(dbQuery.tableQuery.includeDeleted),
              }),
            },
          },
          { replace: true }
        )
      }

      // NOTE: Save `TableState`
      if (!props.noStateSave) {
        setTableState(storageKey.value, {
          page: dbQuery.tableQuery.skip! / dbQuery.tableQuery.take! + 1,
          pageSize: dbQuery.tableQuery.take!,
          includeDeleted: dbQuery.tableQuery.includeDeleted,
          schema: dbQuery.queryParams.toString(),
          columns: internalColumnsRef.value,
          queryBuilder: dbQuery.tableQuery.queryBuilder,
        })
      }

      // NOTE: Focus the table so we can use keyboard navigation
      // (but only if no floating element is visible - we don't want to close it by refocusing)
      // also when user has search input focused, we don't want to refocus
      const shouldFocus = _isInitialized || !props.noFocusOnInit

      if (process.client && shouldFocus) {
        const hasFloatingEl = !!document.querySelector('.floating-element')
        const isSearchInputFocused =
          activeElement.value?.tagName === 'INPUT' &&
          activeElement.value?.getAttribute('name') === '_search'

        if (!hasFloatingEl && !isSearchInputFocused) {
          scrollerEl.value?.focus()
        }
      }
    },
    { immediate: true }
  )

  // Initialize query builder
  function initializeQueryBuilder() {
    const {
      queryBuilder: urlQueryBuilder,
      columns: urlColumns,
      filters: urlFilters,
      sort: urlSort,
    } = parseUrlParams({ columnsRef: internalColumnsRef })
    const { queryBuilder: schemaQueryBuilder } = parseUrlParams({
      columnsRef: internalColumnsRef,
      searchParams: layoutRef.value?.schema,
      fromSchema: !!layoutRef.value?.schema,
    })

    const isUrlUsed =
      !!urlQueryBuilder?.length ||
      !!urlColumns?.length ||
      !!urlFilters?.length ||
      !!urlSort?.length

    const usedQueryBuilder = isUrlUsed ? urlQueryBuilder : schemaQueryBuilder

    // When the query builder is present in the URL, use it
    if (
      usedQueryBuilder &&
      usedQueryBuilder.length &&
      queryBuilder.value !== undefined
    ) {
      queryBuilder.value = usedQueryBuilder.length
        ? usedQueryBuilder
        : [
            {
              id: generateUUID(),
              isGroup: true,
              children: [],
              condition: 'AND',
              path: '0',
            },
          ]
    }

    // Otherwise, when the query builder is present in the table state, use it
    else if (
      !isUrlUsed &&
      tableState.value.queryBuilder?.length &&
      queryBuilder.value !== undefined
    ) {
      queryBuilder.value = tableState.value.queryBuilder
    }
  }

  // Emit loading events
  watch(isLoading, loading => instance?.emit('update:loading', loading))

  isInitialized.value = true

  return {
    isLoading,
    rows,
    rowsSplit,
    fetchMore,
    dbQuery,
    search,
    totalRows,
    storageKey,
    customData,
    refreshData,

    // Pagination
    currentPage,
    next,
    prev,
    isFirstPage,
    isLastPage,
    pageCount,
    currentPageSize,

    // Infinite scroll
    handleInfiniteScroll,
  }
}

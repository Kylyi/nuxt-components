// Types
import { IQueryBuilderGroup } from 'components/QueryBuilder/types/query-builder-group-props.type'
import { IQueryBuilderItem } from 'components/QueryBuilder/types/query-builder-item-props.type'

export type IQueryBuilderRow = IQueryBuilderItem | IQueryBuilderGroup

export type IQueryBuilderRowProps = {
  /**
   * The actual query builder row item
   */
  item: IQueryBuilderRow

  /**
   * The nested level
   */
  level: number

  /**
   * Parent of the current item
   */
  parent?: IQueryBuilderGroup

  /**
   * Whether the current item is the first child of its parent
   */
  isFirstChild?: boolean

  /**
   * Whether the current item is the last child of its parent
   */
  isLastChild?: boolean
}

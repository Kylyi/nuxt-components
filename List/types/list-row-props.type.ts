// TYPES
import type { IListBaseProps } from '~~/components/List/types/list-base-props.type'

export interface IListRowProps extends IListBaseProps {
  item: any
  isSelected?: boolean
  isHovered?: boolean
  rowHeight?: number
}

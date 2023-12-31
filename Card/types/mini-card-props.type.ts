import { IBtnProps } from '~/components/Button/types/btn-props.type'
import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export interface IMiniCardProps extends IValueFormatter {
  label: string | number
  labelClass?: ClassType
  valueClass?: ClassType
  to?: IBtnProps['to']
}

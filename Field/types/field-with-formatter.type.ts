import { IFieldProps } from '~/components/Field/types/field-props.type'
import { IValueFormatter } from '~/components/ValueFormatter/types/value-formatter-props.type'

export interface IFieldWithFormatterProps
  extends IFieldProps,
    IValueFormatter {}

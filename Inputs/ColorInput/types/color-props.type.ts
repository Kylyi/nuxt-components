// @unocss-include

// TYPES
import { IFieldProps } from '~/components/Field/types/field-props.type'

export type IColorProps = {
  modelValue?: any
  icon?: 'material-symbols:format-color-text-rounded' | 'mdi:palette'
} & IFieldProps

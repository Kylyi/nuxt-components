// @unocss-include

// Types
import { type IFieldProps } from '~/components/Field/types/field-props.type'

export type IColorProps = {
  modelValue?: any
  icon?: 'i-material-symbols:format-color-text-rounded' | 'i-mdi:palette'
  rgba?: boolean
} & IFieldProps

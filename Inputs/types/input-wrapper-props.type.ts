import type { CSSProperties } from 'vue'

// Types
import type { IInputLabelProps } from '~/components/Inputs/types/input-label-props.type'
import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'
import type { IZodValidationOptions } from '~/utils/zod/types/zod-validation-options.type'

export type IInputWrapperProps = IInputLabelProps & {
  /**
   * The cursor that will be shown when hovering over the input
   */
  cursor?: 'cursor-text' | 'cursor-pointer' | 'cursor-default'

  /**
   * Whether the input is disabled
   */
  disabled?: boolean

  /**
   * When true, the error container takes space (~ is relative positioned)
   * WHen false, the error container is absolute positioned
   */
  errorTakesSpace?: boolean

  /**
   * Whether the error is visible
   */
  errorVisible?: boolean

  /**
   * The hint that will be shown below the input
   */
  hint?: string

  /**
   * Whether the input is loading
   */
  loading?: boolean

  /**
   * The input value
   */
  modelValue?: any

  /**
   * Whether the input has no border
   */
  noBorder?: boolean

  /**
   * The original value of the input
   * Is used to compare the current value with the original value
   */
  originalValue?: any

  /**
   * When true, the input element will use `margin` instead of `padding` for
   * centering purposes
   *
   * Usage: `Selector` - when multiple rows of chips are present, the scroll
   * would work poorly with padding
   */
  preferMargin?: boolean

  /**
   * Whether the input is readonly
   */
  readonly?: boolean

  /**
   * When clicking into the input, the tooltip will be shown
   * Note: Currently works only for TextInput
   */
  tooltip?: string

  /**
   * Prop to handle the visuals of the component
   */
  ui?: {
    /**
     * The border color of the input
     */
    borderColor?: string

    /**
     * The border radius of the input
     */
    borderRadius?: string

    /**
     * The class of the input wrapper (including label,...)
     */
    contentClass?: ClassType

    /**
     * The style of the input container
     */
    contentStyle?: CSSProperties

    /**
     * Class of the input container
     *
     * Note: Primarily used for background color
     */
    inputContainerClass?: ClassType

    /**
     * Style of the input container
     *
     * Note: Primarily used for background color
     */
    inputContainerStyle?: CSSProperties
  }

  /**
   * Validation object
   */
  validation?: IZodValidationItem | Array<IZodValidationItem | undefined>

  /**
   * Validation key
   *
   * When provided, the validation
   */
  zod?:
    | string
    | {
      key: string
      options?: IZodValidationOptions
    }
}

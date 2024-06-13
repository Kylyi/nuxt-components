type IInputRangeDirection = 'rtl' | 'ltr' // right to left | left to right

export type IInputRangeProps = {
  /**
   * Value or values in case of multiple dots
   * min <= {modelValue} <= max
   */
  modelValue: number | number[]

  /** Min value */
  min?: number

  /** Max value */
  max?: number

  /** Value of one step */
  step?: number

  /** Direction of input */
  direction?: IInputRangeDirection

  /**
   *  Height of the rail in px
   */
  railHeight?: string | number

  /** CSS classes for the rail */
  railClasses?: string

  /** CSS classes for the progress bar */
  progressClasses?: string

  /** Progress bar default color */
  progressColor?: string

  /** Dot classes */
  dotClasses?: string

  /** Dot default color */
  dotColor?: string

  /** Should tooltip be visible */
  showTooltip?: boolean

  /** CSS classes tooltip */
  tooltipClasses?: string

  /** Show marks of each value */
  showMarks?: boolean

  /** CSS classes for step mark */
  markClasses?: string
}

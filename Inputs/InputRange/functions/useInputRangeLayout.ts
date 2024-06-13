// Types
import type { IInputRangeProps } from '~/components/Inputs/InputRange/types/input-range-props.type'
import type { IInputRangeDot } from '~/components/Inputs/InputRange/types/input-range-dot.type'

// Utils
import { useInputRangeUtils } from '~/components/Inputs/InputRange/functions/useInputRangeUtils'

export function useInputRangeLayout(props: IInputRangeProps) {
  // Utils
  const { getZeroesAmount } = useInputRangeUtils()

  // Global
  const positionStart = computed(() =>
    props.direction === 'rtl' ? 'left' : 'right'
  )

  const largestDotPosition = computed(() =>
    dots.value?.length > 1
      ? Math.max(...dots.value.map(dot => dot.position))
      : null
  )
  const smallestDotPosition = computed(() =>
    dots.value?.length > 1
      ? Math.min(...dots.value.map(dot => dot.position))
      : null
  )

  // Progress bar
  /** Width of the progress bar */
  const progressWidth = computed(() => {
    if (dots.value.length === 1) {
      return `width: ${dots.value[0].position}%`
    } else {
      return ``
    }
  })

  /** Start position of the progress bar, depends on direction */
  const progressPosition = computed(() => {
    if (dots.value.length === 1) {
      return props.direction === 'rtl'
        ? 'left: 0; right: auto;'
        : 'right: 0; left: auto;'
    } else {
      return props.direction === 'rtl'
        ? `
            left: ${smallestDotPosition.value}%;
            right: ${100 - largestDotPosition.value!}%;
          `
        : `
            right: ${smallestDotPosition.value}%;
            left: ${100 - largestDotPosition.value!}%;
          `
    }
  })

  /** List of marks */
  const marks = computed<IInputRangeDot[]>(() => {
    const marksList: IInputRangeDot[] = []

    for (let i = props.min!; i <= props.max!; i += props.step!) {
      const mark = {
        value: +i.toFixed(getZeroesAmount(props.step ?? 0)),
        position: calculateDotPosition(i),
      }

      marksList.push(mark)
    }

    return marksList
  })

  // Dots
  const dots = computed<IInputRangeDot[]>(() => {
    if (Array.isArray(props.modelValue)) {
      // If there are multiple dots
      return props.modelValue.map(value => {
        const dotValidValue =
          value < props.max! && value > props.min!
            ? value
            : value <= props.min!
            ? props.min ?? 0
            : props.max!

        return {
          value: +dotValidValue.toFixed(getZeroesAmount(props.step ?? 0)),
          position: calculateDotPosition(dotValidValue),
        }
      })
    } else {
      // If there is a single dot
      const dotValidValue =
        props.modelValue < props.max! ? props.modelValue : props.max!

      return [
        {
          value: +dotValidValue.toFixed(getZeroesAmount(props.step ?? 0)),
          position: calculateDotPosition(dotValidValue),
        },
      ]
    }
  })

  /**  Get value relatives to the rail width in percents */
  function calculateDotPosition(value: number): number {
    const valueMinusMin = value - props.min!

    if (valueMinusMin === 0) {
      return 0
    }

    const valueInRange = (value - props.min!) / (props.max! - props.min!)
    return valueInRange * 100
  }

  /** Get value by position on the rail taking into account the step */
  function getValueByPosition(pos: number) {
    // Absolute value
    const value = props.min! + ((props.max! - props.min!) / 100) * pos

    if (marks.value.length) {
      // Initial value of the closest mark (step)
      let closestMarkValue = props.min ?? 0

      // Check if there is a mark (step) that is closer to the value
      for (let i = 0; i < marks.value.length; i++) {
        // Half of one step to round properly
        const halfStep = props.step ? props.step / 2 : 0.5

        // Gap between 2 marks and value
        const gap = marks.value[i].value + props.step! - value

        // Finding 2 closest marks
        if (gap >= 0 && gap < props.step!) {
          // Rounding the closest mark value
          if (gap > halfStep) {
            closestMarkValue = marks.value[i].value
          } else {
            closestMarkValue = marks.value[i + 1]?.value || marks.value[i].value
          }
        }
      }

      return +closestMarkValue.toFixed(getZeroesAmount(props.step ?? 0))
    }

    return Math.round(value)
  }

  /** Get the closest to event dot's index */
  function getClosestDotIndex(clickPos: number) {
    let delta: number
    let index = -1

    dots.value.forEach((dot, i) => {
      const currentDelta = Math.abs(clickPos - dot.position)

      if (!delta) {
        delta = currentDelta
        index = i
        return
      }

      if (delta > currentDelta) {
        delta = currentDelta
        index = i
      }
    })

    return index
  }

  return {
    progressWidth,
    progressPosition,
    marks,
    dots,
    positionStart,
    getValueByPosition,
    getClosestDotIndex,
  }
}

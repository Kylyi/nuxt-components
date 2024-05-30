// Types
import { config } from '~/components/config/components-config'
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  function getInputWrapperProps(props: IInputWrapperProps) {
    return reactivePick(
      props,
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hint',
      'label',
      'layout',
      'loading',
      'modelValue',
      'originalValue',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'noBorder',
      'validation',
      'ui',
      'zod',
    )
  }

  function getInputWrapperStyleVariables(props: IInputWrapperProps) {
    const styleVariables = {
      '--fontSize': '',
      '--labelFontSize': '',
      '--lineHeight': '',
      '--padding': '',
      '--margin': '',
      '--bodyMargin': '',
      '--borderColor': props.ui?.borderColor || 'var(--color-primary)',
      '--borderRadius': props.ui?.borderRadius || config.inputWrapper.borderRadius,
    }

    const preferMargin = !!props.preferMargin
    const isLabelInside = props.layout === 'label-inside'
    const isRegular = props.layout === 'regular'
    const hasLabel = !!props.label

    // Size: sm
    if (props.size === 'sm') {
      styleVariables['--fontSize'] = '14px'
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = preferMargin ? '0 12px' : '4px 12px'
      styleVariables['--margin'] = preferMargin ? '4px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '14px 12px 2px'
        styleVariables['--margin'] = preferMargin ? '14px 0 2px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '8px 0'
          } else {
            styleVariables['--padding'] = '8px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '0px 12px' : '4px 12px'
        styleVariables['--margin'] = preferMargin ? '4px 0px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '4px 0'
          } else {
            styleVariables['--padding'] = '4px 12px'
          }
        }
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '26px'
      styleVariables['--padding'] = preferMargin ? '0px 12px' : '7px 12px'
      styleVariables['--margin'] = preferMargin ? '7px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '16px 12px 2px'
        styleVariables['--margin'] = preferMargin ? '16px 0 2px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '9px 0'
          } else {
            styleVariables['--padding'] = '9px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '1px 12px' : '7px 12px'
        styleVariables['--margin'] = preferMargin ? '6px 0' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '6px 0'
          } else {
            styleVariables['--padding'] = '7px 12px'
          }
        }
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = preferMargin ? '4px 12px' : '10px 12px'
      styleVariables['--margin'] = preferMargin ? '6px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '20px 12px 6px'
        styleVariables['--margin'] = preferMargin ? '20px 0 6px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '13px 0'
          } else {
            styleVariables['--padding'] = '13px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '2px 12px' : '10px 12px'
        styleVariables['--margin'] = preferMargin ? '8px 0' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '10px 0 8px'
          } else {
            styleVariables['--padding'] = '10px 12px'
          }
        }
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}

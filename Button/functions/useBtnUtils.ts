// TYPES
import type { IBtnProps } from '~/components/Button/types/btn-props.type'

export function useBtnUtils() {
  function getBtnProps(props: IBtnProps) {
    return reactivePick(props, [
      'disabled',
      'download',
      'exact',
      'external',
      'navigateToOptions',
      'noActiveLink',
      'noUnderline',
      'to',
      'type',
    ])
  }

  return {
    getBtnProps,
  }
}

import type { MaybeElementRef } from '@vueuse/core'
import type { Middleware } from '@floating-ui/dom'
import { arrow, flip, offset, shift, size } from '@floating-ui/vue'

// Types
import type { IMenuProps } from '~/components/Menu/types/menu-props.type'

// Middleware
import { fitWidth } from '~/utils/floatingMiddleware/fitWidth'
import { matchWidth } from '~/utils/floatingMiddleware/matchWidth'
import { cover } from '~/utils/floatingMiddleware/cover'

export function useMenuMiddleware(
  props: IMenuProps,
  options: { arrowEl: MaybeElementRef }
) {
  const { arrowEl } = options

  const middleware = computed(() => {
    const middleware: Middleware[] = [
      ...(props.fit ? [fitWidth] : []),
      ...(props.matchWidth ? [matchWidth] : []),
      ...(props.cover ? [cover] : []),
      shift({ padding: 0 }),
      flip({ fallbackPlacements: props.fallbackPlacements }),
      size({
        apply: ({ availableHeight, availableWidth, elements }) => {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight:
              typeof props.maxHeight === 'number'
                ? `${Math.min(availableHeight, props.maxHeight)}px`
                : `min(${availableHeight}px, ${props.maxHeight})`,
          })
        },
        boundary: props.boundary,
        padding: 8,
      }),
    ]

    // Offset
    if (props.offset) {
      middleware.unshift(offset(props.offset))
    }

    // Arrow
    if (!props.noArrow) {
      middleware.push(arrow({ element: arrowEl, padding: 4 }))
    }

    return middleware
  })

  return {
    middleware,
  }
}

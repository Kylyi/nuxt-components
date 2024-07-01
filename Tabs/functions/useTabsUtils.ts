// Types
import { type IItem } from '~/libs/Shared/types/item.type'

export type ITab = IItem & {
  id: string | number
  label?: string
}

export function useTabsUtils() {
  /**
   * Creating Tab component to have proper work of KeepAlive.
   * Returns component that's made in combination with `defineComponent` and render function `h()`
   */
  function createTab(t: VNode, index: number) {
    // Creates a new components. It returns Tab.vue, but with a new name
    const component = h(
      defineComponent(
        () => {
          return () => t
        },
        {
          name: `${(t.type as any).name}${index}`,
        }
      )
    )

    // Creates and return component
    // that made with render function h() to pass props there and to have access to props after
    return h(
      component,
      Object.assign({
        'id': t.props!.name,
        'label': t.props!.label || t.props!.name,
        'icon': t.props!.icon,
        'size': t.props!.size,
        'keep-alive': t.props?.['keep-alive'],
        'componentName': `${(t.type as any).name}${index}`,
      })
    )
  }

  return {
    createTab,
  }
}

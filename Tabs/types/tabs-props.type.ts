import type { IBtnProps } from "~/components/Button/types/btn-props.type"

export interface ITabsProps {
  contentClass?: ClassType
  labelActiveClass?: ClassType
  labelClass?: ClassType
  modelValue?: string | number
  navClass?: ClassType
  noNav?: boolean
  noAnimation?: boolean
  tabBtnProps?: IBtnProps

  /**
   * The classes for the HorizontalScroller inside Tabs
   */
  navContentClass?: ClassType

  /**
   * For tabs that should be part of the DOM but not visible
   */
  invisibleTabs?: string[]

  // Transitions
  noLeaveTransition?: boolean
  transitionPrevious?: string
  transitionNext?: string
}

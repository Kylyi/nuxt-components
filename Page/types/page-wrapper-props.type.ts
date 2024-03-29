import type { IPageTitleProps } from '~/components/Page/types/page-title-props.type'

export type IPageWrapperProps = IPageTitleProps & {
  /**
   * Class for the content wrapper
   */
  contentClass?: ClassType

  /**
   * If true, the TopBar component will be included in the page
   */
  includeTopBar?: boolean

  /**
   * If true, Loading component will be shown instead of the page content
   */
  loading?: boolean

  /**
   * If true, the page will include margin-top corresponding to the navigation height
   *
   * Usage: SSR
   */
  pad?: boolean
}

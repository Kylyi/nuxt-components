export type ISplitterPanelProps = {
  /**
   * Size of the pannel relative to 100%.
   */
  size?: number

  /**
   * Minimum size of the pannel relative to 100%.
   */
  minSize?: number

  /**
   * Whether the panel is collapsible or not.
   */
  collapsible?: boolean

  /**
   * Size of the panel when collapsed relative to 100%.
   */
  collapsedSize?: number
}

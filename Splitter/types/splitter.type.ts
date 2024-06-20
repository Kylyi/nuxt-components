// Props type
export type ISplitterProps = {
  /**
   * Orientation of the panels.
   */
  layout?: 'horizontal' | 'vertical'

  /**
   * Size of the divider in pixels.
   */
  gutterSize?: number

  /**
   * Step factor to increment/decrement the size of the panels while pressing the arrow keys.
   */
  step?: number

  ui?: {
    /**
     * Whether to show the resize arrow hint or not when hovering the divider.
     */
    noResizeArrowHint?: boolean
  }
}

// Emit
type IResizeEmitOptions = {
  originalEvent: Event
}

export type ISplitterEmit = {
  (e: 'resize', options: IResizeEmitOptions): void
  (e: 'resizestart', options: IResizeEmitOptions): void
  (e: 'resizeend', options: IResizeEmitOptions): void
  (e: 'collapse', options: IResizeEmitOptions): void
}

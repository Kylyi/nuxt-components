import type { ISplitterPanelProps } from '~/components/Splitter/types/splitter-panel.type'

export const registerPanelPropsKey: InjectionKey<
  (props: ISplitterPanelProps) => void
> = Symbol('registerPanelProps')

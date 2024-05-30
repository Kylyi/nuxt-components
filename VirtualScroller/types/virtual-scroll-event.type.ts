type VirtualItem = {
  index: number
  key: string
  size: number
}

export type IVirtualScrollEvent = {
  visibleStartItem: VirtualItem
  visibleEndItem: VirtualItem
}

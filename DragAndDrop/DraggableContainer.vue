<script setup lang="ts" generic="T">
// Functions
import { useDragAndDrop } from '~/components/DragAndDrop/functions/useDragAndDrop'

type IProps = {
  direction?: 'horizontal' | 'vertical'
  items?: T[]
  parent?: IItem
  itemKey?: ObjectKey<T> | ((item: T) => ObjectKey<T>)
}

const props = withDefaults(defineProps<IProps>(), {
  direction: 'vertical',
  itemKey: 'id' as ObjectKey<T>,
})

const emits = defineEmits<{
  (e: 'update:items', items: T[]): void
  (e: 'insert:item', payload: { item: T, idx: number }): void
  (e: 'remove:item', item: T): void
}>()

// Utils
const { handleMouseDown, handleTouchStart } = useDragAndDrop({ direction: props.direction })

// Layout
const { model } = useRefReset(() => props.items, { autoSyncFromParent: true })

const classes = computed(() => {
  return {
    'flex-row': props.direction === 'horizontal',
    'flex-col': props.direction === 'vertical',
  }
})

function getItemKey(item: T) {
  return typeof props.itemKey === 'function'
    ? props.itemKey(item)
    : get(item, props.itemKey as any)
}

function getItems() {
  return model.value
}

function getParent() {
  return props.parent
}

function insertItem(idx: number, item: T) {
  model.value = model.value?.toSpliced(idx, 0, item)

  emits('insert:item', { item, idx })
  debouncedSync()
}

function removeItem(item: T) {
  model.value = model.value?.filter(i => i !== item)

  emits('remove:item', item)
  debouncedSync()
}

const debouncedSync = useDebounceFn(() => {
  emits('update:items', model.value!)
}, 50)
</script>

<template>
  <div
    class="draggable-container"
    data-draggable-container
    :class="classes"
    .get-items="getItems"
    .remove-item="removeItem"
    .insert-item="insertItem"
    .get-parent="getParent"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <DraggableItem
      v-for="(item) in model"
      :key="getItemKey(item)"
      :item="item"
      @remove:item="removeItem(item)"
    >
      <template #default>
        <slot :item="item" />
      </template>
    </DraggableItem>
  </div>
</template>

<style lang="scss" scoped>
.draggable-container {
  @apply relative flex overflow-y-auto overflow-x-hidden;
}

/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  // transition: all 0.25s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.1);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>

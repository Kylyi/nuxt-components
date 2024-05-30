<script setup lang="ts">
// Types
import type { ITableProps } from '~/components/Table/types/table-props.type';

// Models
import { TableColumn } from '~/components/Table/models/table-column.model'

// Injections
import {
  tableInlineEditKey,
  tableIsSelectedRowKey,
  tableSelectRowKey,
} from '~/components/Table/provide/table.provide'

type IProps = {
  column: TableColumn
  editable?: boolean
  row: any
  selectionOptions?: ITableProps['selectionOptions']
}

const props = defineProps<IProps>()

// Injections
const handleSelectRow = injectStrict(tableSelectRowKey, () => {})
const isSelectedRow = injectStrict(tableIsSelectedRowKey, () => false)
const {
  isEditing,
  editRowHeight,
  editValue,
  editRow,
  handleEditRow,
  handleCancelEditRow,
  handleSaveRow,
} = injectStrict(tableInlineEditKey, {} as any)

// Utils
const self = getCurrentInstance()

function focusSiblingCellHorizontal(
  direction: 'previous' | 'next',
  e: KeyboardEvent
) {
  let siblingCell = self?.vnode?.el?.[`${direction}ElementSibling`] as
    | HTMLElement
    | null
    | undefined
  const isLastCell = !siblingCell || !siblingCell?.classList?.contains?.('cell')
  const parentRowEl = self?.vnode.el?.closest(
    '.virtual-scroll__content-row'
  ) as HTMLElement

  lastDirection.value = direction === 'next' ? 'right' : 'left'

  let parentRowElSibling: HTMLElement | null = null
  if (isLastCell && !parentRowEl) {
    return
  } else if (isLastCell) {
    parentRowElSibling = parentRowEl?.[
      `${direction}ElementSibling`
    ] as HTMLElement
  }

  const isLastParentRow = !parentRowElSibling?.classList?.contains?.(
    'virtual-scroll__content-row'
  )
  if (isLastCell && isLastParentRow) {
    return
  }

  siblingCell = isLastCell
    ? parentRowElSibling?.querySelector?.(
        `.cell${direction === 'previous' ? ':last-child' : ''}`
      )
    : siblingCell

  const isDataCol = siblingCell?.classList?.contains?.('has-data')

  if (isDataCol) {
    siblingCell?.click()
  } else {
    // handleKeyDown(e)
  }

  return siblingCell
}

function focusSiblingCellVertical(
  direction: 'previous' | 'next',
  e: KeyboardEvent
) {
  const cellEl = self?.vnode.el?.closest('.cell') as HTMLElement

  // Get index of current instance within the `cellEl`
  const cellIndex = Array.from(cellEl?.parentElement?.children ?? []).indexOf(
    cellEl
  )

  const parentRowEl = self?.vnode.el?.closest(
    '.virtual-scroll__content-row'
  ) as HTMLElement

  lastDirection.value = direction === 'next' ? 'down' : 'up'

  let parentRowElSibling: HTMLElement | null = null
  if (!parentRowEl) {
    return
  }

  parentRowElSibling = parentRowEl?.[
    `${direction}ElementSibling`
  ] as HTMLElement

  const isLastParentRow = !parentRowElSibling?.classList?.contains?.(
    'virtual-scroll__content-row'
  )
  if (isLastParentRow) {
    return
  }

  const siblingCell = parentRowElSibling?.querySelector?.(
    `.cell:nth-child(${cellIndex + 1})`
  ) as HTMLElement | null

  const isDataCol = siblingCell?.classList?.contains?.('has-data')

  if (isDataCol) {
    siblingCell?.click()
  } else {
    // handleKeyDown(e)
  }

  return siblingCell
}

// Layout
const inputEl = ref<any>()
const siblingCell = ref<HTMLElement | null | undefined>()
const col = toRef(props, 'column')
const lastDirection = ref<'up' | 'down' | 'left' | 'right'>()

const { pause, resume } = useIntersectionObserver(
  siblingCell,
  entries => {
    if (entries[0].intersectionRatio < 1) {
      let scrollBlock: ScrollLogicalPosition = 'nearest'

      switch (lastDirection.value) {
        case 'down':
          scrollBlock = 'start'
          break

        case 'up':
          scrollBlock = 'end'
          break

        default:
          break
      }

      siblingCell.value?.scrollIntoView({ block: scrollBlock })
    }

    pause()
  },
  { immediate: false }
)

const isEditingField = computedEager(() => {
  return (
    isEditing?.value &&
    editRow?.value?.row === props.row &&
    (editRow?.value?.column === col.value || !editRow?.value?.column)
  )
})

function handleEditCell() {
  if (!props.editable || isEditingField.value) {
    return
  }

  if (isEditingField.value) {
    handleCancelEditRow()

    return
  }

  handleEditRow(props.row, props.column)
}

// Keyboard shortcuts
async function handleKeyDown(e: KeyboardEvent) {
  const isControlKey = e.ctrlKey || e.metaKey

  switch (e.key) {
    case 'Escape':
      handleCancelEditRow()
      break

    case 'Enter':
      setTimeout(() => {
        handleSaveRow()

        if (isControlKey) {
          return
        }

        handleKeyDown({
          ...e,
          key: 'ArrowRight',
          ctrlKey: true,
        } as KeyboardEvent)
      })

      e.preventDefault?.()
      e.stopPropagation?.()

      break

    case 'ArrowRight':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCellHorizontal('next', e)

      break

    case 'ArrowLeft':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCellHorizontal('previous', e)

      break

    case 'ArrowDown':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCellVertical('next', e)

      break

    case 'ArrowUp':
      if (!isControlKey) {
        return
      }

      e.preventDefault?.()
      e.stopPropagation?.()

      resume()
      siblingCell.value = focusSiblingCellVertical('previous', e)

      break

    default:
      break
  }
}

function selectSelf(self: any) {
  nextTick(() => {
    self.component?.exposed?.select?.() ?? self.component?.exposed?.focus?.()
  })
}

function isSelectDisabled() {
  if (!props.selectionOptions) {
    return true
  }

  return typeof props.selectionOptions.disabled === 'function'
    ? props.selectionOptions.disabled(props.row)
    : props.selectionOptions.disabled
}
</script>

<template>
  <div
    class="cell"
    :class="[
      `col-${col.name}`,
      col.classes,
      {
        'has-data': !col.isHelperCol,
        'is-frozen': col.frozen,
        'is-semi-frozen': col.semiFrozen,
        'is-editing': isEditingField,
      },
    ]"
    :data-field="col.field"
    :style="{ ...col.style, width: col.adjustedWidthPx }"
    @click="handleEditCell"
  >
    <!-- Selection -->
    <div
      v-if="col.field === '_selectable'"
      flex="~ center"
      w="full"
      @click.stop.prevent
    >
      <Checkbox
        :model-value="isSelectedRow(row)"
        name="select-row"
        :editable="!isSelectDisabled()"
        @update:model-value="handleSelectRow(row)"
      />
    </div>

    <!-- Edit mode -->
    <Component
      :is="col._editComponent.component"
      v-else-if="isEditingField"
      ref="inputEl"
      :model-value="get(editValue, col.field)"
      v-bind="col._editComponent.props"
      no-border
      grow
      size="sm"
      input-class="color-black dark:color-white !font-rem-13"
      :style="{
        height: `${editRowHeight}px`,
      }"
      :input-props="{ onKeydown: handleKeyDown }"
      @update:model-value="set(editValue, col.field, $event)"
      @vue:mounted="selectSelf"
      @blur="handleSaveRow(true)"
    />

    <!-- Regular field -->
    <ValueFormatter
      v-else
      :value="col.valueGetter(row)"
      :data-type="col.dataType"
      :row="row"
      :format="col.format"
      :empty-value="{}"
    >
      <template #default="{ val }">
        <slot :value="val">
          <!-- Boolean -->
          <Checkbox
            v-if="col.dataType === 'boolean'"
            :model-value="col.valueGetter(row)"
            :editable="false"
            :label="val"
            m="x-2"
            :visuals="{
              checked: { checkbox: '!bg-blue-500 !border-blue-500' },
            }"
          />

          <!-- Link -->
          <NuxtLink
            v-else-if="col.link?.(row)"
            class="link"
            truncate
            p="x-2"
            :to="col.link(row) || ''"
            v-bind="col.linkProps"
          >
            {{ val }}
          </NuxtLink>

          <span
            v-else
            class="p-x-2 truncate"
          >
            {{ val }}
          </span>
        </slot>
      </template>
    </ValueFormatter>
  </div>
</template>

<style scoped lang="scss">
.cell {
  --apply: relative;

  &.is-editing::after {
    --apply: absolute content-empty inset-0 pointer-events-none border-primary
      border-2;
  }
}
</style>

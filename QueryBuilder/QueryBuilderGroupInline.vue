<script setup lang="ts">
// Types
import type {
  IQueryBuilderGroup,
  IQueryBuilderGroupProps,
} from '~/components/QueryBuilder/types/query-builder-group-props.type'

// Models
import { ComparatorEnum } from '~/libs/App/data/enums/comparator.enum'

// Injections
import {
  qbContainerKey,
  qbItemsKey,
} from '~/components/QueryBuilder/provide/query-builder.provide'

// Components
import Menu from '~/components/Menu/Menu.vue'

const props = defineProps<IQueryBuilderGroupProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderGroup): void
}>()

// Injections
const container = injectStrict(qbContainerKey)
const items = injectStrict(qbItemsKey)

// Layout
const item = toRef(props, 'item')
const isHovered = ref(false)
const conditionMenuEl = ref<InstanceType<typeof Menu>>()

const levelColor = computed(() => {
  const color = COLORS[props.level % COLORS.length]

  return getColor(color)
})

function handleSetCondition(val: 'AND' | 'OR') {
  item.value.condition = val
  conditionMenuEl.value?.hide()
}

function handleAddCondition(useParent?: boolean) {
  const parent = useParent ? props.parent : item.value

  if (!parent) {
    return
  }

  const newPath = `${parent.path}.children.${parent.children.length}`

  parent.children = [
    ...parent.children,
    {
      id: new Date().getTime().toString(),
      field: undefined as unknown as string,
      comparator: undefined as unknown as ComparatorEnum,
      value: undefined as unknown as string,
      path: newPath,
    },
  ]

  nextTick(() => {
    const addedEl = container.value?.querySelector(
      `[data-path="${newPath}"]`
    ) as HTMLElement

    setTimeout(() => {
      addedEl?.click()
    }, 150)
  })
}

function handleRemoveGroup() {
  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
}
</script>

<template>
  <!-- Condition -->
  <Btn
    :label="
      item.condition === 'AND' ? $t('queryBuilder.and') : $t('queryBuilder.or')
    "
    size="xs"
    class="condition-btn bg-primary color-white self-center"
    :class="{ 'is-first-child': isFirstChild }"
    :style="{ '--bracketColor': levelColor }"
    no-dim
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <Menu
      ref="conditionMenuEl"
      :no-arrow="false"
      w="40"
      hide-header
    >
      <!-- Conditions -->
      <Btn
        size="xs"
        :label="$t('queryBuilder.and')"
        @click="handleSetCondition('AND')"
      />
      <Btn
        size="xs"
        :label="$t('queryBuilder.or')"
        @click="handleSetCondition('OR')"
      />

      <Separator spaced />

      <!-- Delete btn -->
      <Btn
        size="xs"
        :label="$t('queryBuilder.removeGroup')"
        preset="TRASH"
        @click="handleRemoveGroup"
      />
    </Menu>
  </Btn>

  <!-- Children -->
  <QueryBuilderRowInline
    v-for="(child, idx) in item.children"
    :key="child.id"
    :item="child"
    :level="level + 1"
    :parent="item"
    :is-last-child="idx === item.children.length - 1"
    :is-first-child="idx === 0"
    :style="{
      ...(isHovered && {
        backgroundColor: 'var(--bracketColor)',
        color: 'white',
      }),
    }"
    @add:row="handleAddCondition()"
  />

  <Btn
    v-if="isLastChild"
    size="xs"
    preset="ADD"
    self-center
    :style="{
      '--bracketColor': levelColor,
      'color': levelColor,
    }"
    class="last-child-bracket"
    @click="handleAddCondition"
  />
</template>

<style scoped lang="scss">
.condition-btn {
  --apply: m-t-1;

  &.is-first-child {
    --apply: m-l-2;

    &::before {
      --apply: absolute -top-7px -left-2 text-8 leading-none font-normal;
      content: '[';
      color: var(--bracketColor);
    }
  }
}

.last-child-bracket {
  --apply: relative self-center m-t-1 m-r-2;

  &::after {
    --apply: absolute -top-7px -right-2 text-8 leading-none font-normal;
    content: ']';
    color: var(--bracketColor);
  }
}
</style>

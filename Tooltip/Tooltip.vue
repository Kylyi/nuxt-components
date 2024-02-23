<script setup lang="ts">
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'

// Types
import { type IMenuProps } from '~/components/Menu/types/menu-props.type'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<IMenuProps & { noInheritFontStyle?: boolean }>(),
  { noInheritFontStyle: true }
)

function getTargetElement(target: any): any {
  if (!process.client) {
    return
  }

  // Target is an element
  if (target instanceof Element) {
    return target as Element
  }

  // Target is a selector
  else if (typeof target === 'string') {
    return document?.querySelector(target) || document?.body || undefined
  }

  // Target is Vue component
  else if (target) {
    const el = unrefElement(target)

    if (el) {
      return el
    }
  }

  return instance?.vnode.el?.parentNode
}

const instance = getCurrentInstance()

// Layout
const model = defineModel({ default: false })
const tooltipEl = ref<HTMLElement>()
const referenceEl = ref<Element>() // Element that menu is attached to
const arrowEl = ref<HTMLDivElement>()
const middleware = ref([
  offset(props.offset),
  flip(),
  shift(),
  ...(props.noArrow ? [] : [arrow({ element: arrowEl, padding: 4 })]),
])

const { floatingStyles, placement, middlewareData } = useFloating(
  referenceEl,
  tooltipEl,
  {
    placement: props.placement,
    middleware,
    strategy: 'fixed',
  }
)

const tooltipClass = computed(() => {
  return {
    'is-dense': props.dense,
    'font-normal normal-case text-base': props.noInheritFontStyle,
  }
})

watch(middlewareData, middlewareData => {
  if (middlewareData.arrow) {
    const { x, y } = middlewareData.arrow

    Object.assign(arrowEl.value!.style, {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
    })
  }
})

onMounted(() => {
  nextTick(() => {
    referenceEl.value = getTargetElement(props.referenceTarget)
    referenceEl.value && referenceEl.value.classList.add('has-tooltip')

    referenceEl.value?.addEventListener('mouseenter', () => {
      referenceEl.value && referenceEl.value.classList.add('tooltip-hovered')

      setTimeout(() => {
        const isStillInside =
          referenceEl.value?.classList.contains('tooltip-hovered')

        if (isStillInside) {
          model.value = true
        }
      }, props.delay?.[0] || 0)
    })

    referenceEl.value?.addEventListener('mouseleave', () => {
      referenceEl.value && referenceEl.value.classList.remove('tooltip-hovered')

      setTimeout(() => {
        const isStillInside =
          referenceEl.value?.classList.contains('tooltip-hovered')

        if (!isStillInside) {
          model.value = false
        }
      }, props.delay?.[1] || 0)
    })
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="model"
      ref="tooltipEl"
      :style="floatingStyles"
      class="tooltip"
      p="x-2 y-1"
      :class="tooltipClass"
      :placement="placement"
      v-bind="$attrs"
    >
      <!-- Arrow -->
      <div
        v-if="!noArrow"
        ref="arrowEl"
        class="arrow"
        :class="{
          'bg-ca': !hideHeader,
          'has-header': !hideHeader,
        }"
      />

      <slot />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tooltip {
  --apply: dark:bg-darker bg-white border-ca border-custom rounded-custom
    z-$zMenu;

  &.is-dense {
    --apply: p-0 leading-none;
  }
}

.arrow {
  --apply: absolute w-2 h-2 rotate-45 dark:bg-darker bg-white;

  &.has-header {
    --apply: bg-white dark:bg-darker;
  }
}

.tooltip[placement^='top'] > .arrow {
  --apply: bottom--5px border-b-custom border-r-custom border-ca;
}

.tooltip[placement^='bottom'] > .arrow {
  --apply: top--5px border-t-custom border-l-custom border-ca;
}

.tooltip[placement^='left'] > .arrow {
  --apply: right--5px border-r-custom border-t-custom border-ca;
}

.tooltip[placement^='right'] > .arrow {
  --apply: left--5px border-l-custom border-b-custom border-ca;
}
</style>

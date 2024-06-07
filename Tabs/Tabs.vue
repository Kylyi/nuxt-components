<script setup lang="ts">
// ENHANCEMENT: For now, the only way to use <KeepAlive /> is to use default slot
// and `v-show` in parent for each tab. There must be a better way to do this.
import { isVNode } from 'vue'

import { config } from '~/components/config/components-config'

// Types
import type { ITabsProps } from '~/components/Tabs/types/tabs-props.type'

const props = withDefaults(defineProps<ITabsProps>(), {
  noAnimation: config.tabs.props.noAnimation,
})
const emits = defineEmits<{
  (e: 'update:modelValue', id: string | number): void
}>()

// Layout
const keepAliveTabs = ref<string[]>([])
const model = useVModel(props, 'modelValue', emits)
const isAnimationOngoing = ref(false)

const transitionProps = computed(() => ({
  enterActiveClass: `${transitionEnter.value} h-min overflow-hidden ease-linear animate-duration-320 inset-0`,
  leaveActiveClass: !props.noLeaveTransition
    ? `${transitionLeave.value} h-min overflow-hidden ease-linear animate-duration-320 absolute`
    : undefined,
}))

// When we change the model externally, the animation breaks because the model
// is changed before we can check what the previous state was.
// This variable keeps track of the last model value to handle this
const oldModel = ref(model.value)

const instance = getCurrentInstance()

const tabs = computed(() => {
  const defaultSlot = instance?.slots.default?.() || []
  const vueInstances = defaultSlot.flatMap(t => {
    const children = t.children || []

    return [
      ...(isVNode(t) ? [t] : []),
      ...(Array.isArray(children) ? children.filter(isVNode) : []),
    ]
  })

  return vueInstances
    .filter(
      t =>
        typeof t.type === 'object' && (t.type as any).name?.startsWith('Tab_')
    )
    .map((t: VNode) => {
      return {
        id: t.props!.name,
        label: t.props!.label || t.props!.name,
        icon: t.props!.icon,
        size: t.props!.size,
        component: t,
        componentName: (t.type as any).name,
      }
    })
})

const activeTab = computed(() => {
  return tabs.value.find(tab => tab.id === props.modelValue)
})

watch(
  tabs,
  tabs => {
    keepAliveTabs.value = tabs
      .filter(tab => !isNil(tab.component.props?.['keep-alive']))
      .map(tab => tab.componentName)
  },
  { immediate: true }
)

// Handling tab changes
const preventTabChange = autoResetRef(false, 300)
const transitionEnter = ref('')
const transitionLeave = ref('')

function handleTabChange(id: string | number) {
  const currentIdx = tabs.value.findIndex(tab => tab.id === oldModel.value)
  const selectedTabIdx = tabs.value.findIndex(tab => tab.id === id)

  if (currentIdx < selectedTabIdx) {
    transitionEnter.value = props.transitionNext || 'animate-fade-in-right'
    transitionLeave.value = props.transitionPrevious || 'animate-fade-out'
  } else {
    transitionEnter.value = props.transitionNext || 'animate-fade-in-left'
    transitionLeave.value = props.transitionNext || 'animate-fade-out'
  }

  preventTabChange.value = true
  model.value = id
  oldModel.value = id
}

watch(model, model => {
  if (model && !preventTabChange.value) {
    handleTabChange(model)
  }
})
</script>

<template>
  <div
    flex="~ col"
    overflow="auto"
  >
    <!-- Labels -->
    <HorizontalScroller
      v-if="!noNav"
      :content-class="['flex gap-x-1 p-x-2 items-center', navContentClass]"
      rounded-1
      shrink-0
      p="y-1"
      :class="navClass"
    >
      <slot
        v-for="tab in tabs"
        :key="tab.id"
        :name="`${tab.id}-label`"
        :tab="tab"
        :change-fn="(id?: number | string) => handleTabChange(id ?? tab.id)"
      >
        <Btn
          v-if="!invisibleTabs?.includes(tab.id)"
          :label="tab.label"
          :icon="tab.icon"
          no-uppercase
          class="tab-label"
          :size="tab.size || 'lg'"
          :class="[
            labelClass,
            ...(tab.id === activeTab?.id ? [labelActiveClass] : []),
            { 'is-active': tab.id === activeTab?.id },
          ]"
          v-bind=tabBtnProps
          @click="handleTabChange(tab.id)"
        />
      </slot>
    </HorizontalScroller>

    <slot name="above" />

    <!-- Content -->
    <div
      v-if="activeTab"
      relative
      class="tab-content"
      :class="[contentClass, { 'is-animating': isAnimationOngoing }]"
    >
      <Transition
        v-bind="transitionProps"
        :css="!noAnimation"
        @before-enter="isAnimationOngoing = true"
        @after-leave="isAnimationOngoing = false"
      >
        <KeepAlive :include="keepAliveTabs">
          <Component
            :is="activeTab.component"
            :key="activeTab.id"
          />
        </KeepAlive>

        <!-- <Component
          :is="activeTab.component"
          v-else
          :key="activeTab.id"
        /> -->
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab {
  &-content {
    --apply: overflow-x-hidden;
  }

  &-label {
    --apply: min-w-min;
    --apply: '!lt-lg:p-x-4';
  }

  &-label.is-active {
    &::after {
      --apply: content-empty absolute inset-inline-0 bottom-0 h-1 bg-secondary
        rounded-custom;
    }
  }
}
</style>

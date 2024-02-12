<script setup lang="ts">
import { config } from '~/config'

// Types
import { IBreadcrumbProps } from '~/components/Breadcrumbs/types/breadcrumbs-props.type'

// Constants
import { BUTTON_PRESET } from '~/components/Button/constants/button-preset.constant'

const props = withDefaults(defineProps<IBreadcrumbProps>(), {
  notAdaptive: false,
  hideBtnPosition: 'left',
})

const breadcrumbsInjected = injectStrict(breadcrumbsKey, ref([]))

const breadcrumbs = computed(() => {
  return [
    {
      icon: 'lucide:home',
      to: $p(config.breadcrumbs.homePath || '/'),
    },
    ...breadcrumbsInjected.value,
  ]
})

const breadcrumbEls = ref<(Element | ComponentPublicInstance | null)[]>([])

const breadcrumbsDivEl = ref<HTMLElement>()
const { width: breadcrumbsDivWidth } = useElementSize(breadcrumbsDivEl)

const slotAppendEl = ref<HTMLElement>()
const { width: slotAppendWidth } = useElementSize(slotAppendEl)

const breadcrumbsWidthByIndex = ref<number[]>([])

function calculateAvailableWidth() {
  return floor(breadcrumbsDivWidth.value - slotAppendWidth.value - 4)
}

const isMounted = ref(false)
const isBreadcrumbVisibleByIndex = computed(() => {
  if (!isMounted.value) {
    return Array(breadcrumbs.value.length).fill(true)
  }

  let result = Array(breadcrumbs.value.length).fill(true)
  let visibleBreadcrumbsWidth = breadcrumbsWidthByIndex.value.reduce(
    (agg: number, width: number) => agg + width,
    0
  )

  // 65px = hidden breadcrumbs btn width
  while (visibleBreadcrumbsWidth > calculateAvailableWidth() - 65) {
    const { breadcrumbsVisibleByIndex, index } = hideTheRightBreadcrumb(result)
    result = breadcrumbsVisibleByIndex
    if (index === undefined) {
      break
    }
    visibleBreadcrumbsWidth -= breadcrumbsWidthByIndex.value[index]
  }

  return result
})

const isAnyBreadcrumbHidden = computedEager(() => {
  return isBreadcrumbVisibleByIndex.value.includes(false)
})

const hiddenBreadcrumbs = computedEager(() => {
  return breadcrumbs.value.filter(
    (_, index) => !isBreadcrumbVisibleByIndex.value[index]
  )
})

onMounted(() => {
  if (props.notAdaptive) {
    isMounted.value = true
    return
  }
  // setTimeout is needed for non-ssr applications. NextTick isnt enough, lower values than 100ms arent sometimes enough
  setTimeout(() => {
    // calculate breadcrumbs width
    for (const [index, breadcrumb] of breadcrumbs.value.entries()) {
      const breadcrumbEl = breadcrumbEls.value[
        breadcrumbs.value.indexOf(breadcrumb)
      ] as HTMLElement

      if (breadcrumbEl) {
        breadcrumbsWidthByIndex.value[index] =
          breadcrumbEl.offsetWidth + (index === 0 ? 0 : 4) // 4px for gap
      }
    }

    isMounted.value = true
  }, 100)
})

function hideTheRightBreadcrumb(breadcrumbsVisibleByIndex: boolean[]) {
  if (breadcrumbsVisibleByIndex.length <= 2) {
    return { breadcrumbsVisibleByIndex }
  }

  let index: number
  if (props.hideBtnPosition === 'right') {
    // Start hiding from the second-to-last to second
    for (index = breadcrumbsVisibleByIndex.length - 2; index > 1; index--) {
      if (breadcrumbsVisibleByIndex[index]) {
        break
      }
    }
  } else {
    // Start hiding from the second to second-to-last
    index = breadcrumbsVisibleByIndex.findIndex(
      (value, i) =>
        i !== 0 && i !== breadcrumbsVisibleByIndex.length - 1 && value === true
    )
  }
  breadcrumbsVisibleByIndex[index] = false

  return { breadcrumbsVisibleByIndex, index }
}

const hideBtnIndex = computedEager(() => {
  if (props.hideBtnPosition === 'left') {
    return 0 // right after home icon
  }
  return (
    breadcrumbs.value.length -
    // calculate how many breadcrumbs are hidden
    isBreadcrumbVisibleByIndex.value.reduce(
      (acc, val) => acc + (val === false ? 1 : 0),
      0
    ) -
    2 // before last breadcrumb
  )
})
</script>

<template>
  <div class="breadcrumbs-wrapper">
    <div
      ref="breadcrumbsDivEl"
      class="breadcrumbs"
      :class="{
        'absolute invisible': !isMounted, // to calculate widths right after mounting
      }"
    >
      <template
        v-for="(breadcrumb, idx) in breadcrumbs"
        :key="`${breadcrumb.to}-${idx}`"
      >
        <div
          v-if="isBreadcrumbVisibleByIndex![idx]"
          :ref="
            el => {
              breadcrumbEls[idx] = el
            }
          "
          flex
          flex-col
          items-center
        >
          <!-- Chevron -->
          <span
            v-if="idx !== 0"
            :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
            class="breadcrumb-item"
          />
          <Btn
            v-bind="breadcrumb"
            no-active-link
            color="!dark !dark:light"
            size="sm"
            class="breadcrumb-item"
            :class="{
              'is-last': breadcrumb === breadcrumbs[breadcrumbs.length - 1],
            }"
            no-uppercase
          />

          <!-- Hidden breadcrumbs btn -->
          <span
            v-if="isAnyBreadcrumbHidden && idx === hideBtnIndex"
            flex
            items-center
            p-l-1
          >
            <span
              :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
              class="breadcrumb-item"
            />
            <HiddenBreadcrumbsBtn :breadcrumbs="hiddenBreadcrumbs" />
          </span>
        </div>
      </template>

      <div ref="slotAppendEl">
        <slot name="append" />
      </div>
    </div>
    <!-- margin is for breadcrumb measuring purpose (in breadcrumbs absolute stays on the left) -->
    <div m-l-a>
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss">
.breadcrumbs {
  --apply: flex grow flex-gap-x-1 items-center text-sm m-t-2 m-b-1;

  &-wrapper {
    --apply: flex flex-gap-x-1 items-center md:p-x-3;
    --apply: bg-$Breadcrumbs-bg;
  }
}

@screen lt-lg {
  .breadcrumbs > .breadcrumb-item {
    --apply: hidden;

    &.is-last {
      --apply: flex;
    }
  }
}

.main-bar .breadcrumbs {
  --apply: m-t-0;
}
</style>

<script setup lang="ts">
import { type MotionInstance } from '@vueuse/motion'

// Types
import type { IDialogProps } from '~/components/Dialog/types/dialog-props.type'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IDialogProps>(), {
  maxHeight: 99999,
  transitionDuration: 250,
})

const emits = defineEmits<{
  (e: 'update:model-value', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'before-hide'): void
  (e: 'before-show'): void
}>()

// Helpers
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

  // Target is a Vue element
  else if (target) {
    const el = unrefElement(target)

    if (el) {
      return el
    }
  }

  return instance?.vnode.el?.parentNode
}

// Layout
const instance = getCurrentInstance()
const dialogEl = ref<HTMLDivElement>()
const dialogWrapperEl = ref<HTMLDivElement>()
const triggerEl = ref<HTMLDivElement>() // Element that triggers the menu
const backdropBg = ref('bg-transparent')

const dialogClasses = computedEager(() => {
  const contentClass = [props.contentClass]

  if (!props.dense) {
    contentClass.push('p-y-2')
    contentClass.push('p-x-3')
  }

  const innerClasses = {
    contentClass: contentClass.filter(Boolean).join(' '),
    headerClass: props.dense
      ? 'bg-white dark:bg-darker'
      : 'bg-white dark:bg-darker p-l-3 p-r-1',
  }

  switch (props.position) {
    case 'top':
      return {
        containerClass: 'flex items-start justify-center',
        wrapperClass: 'rounded-b-custom !border-t-0',
        ...innerClasses,
      }

    case 'bottom':
      return {
        containerClass: 'flex items-end justify-center',
        wrapperClass: 'rounded-t-custom !border-b-0',
        ...innerClasses,
      }

    case 'left':
      return {
        containerClass: 'flex items-center justify-start',
        wrapperClass: 'rounded-custom',
        ...innerClasses,
      }

    case 'right':
      return {
        containerClass: 'flex items-center justify-end',
        wrapperClass: 'rounded-custom',
        ...innerClasses,
      }

    default:
      return {
        containerClass: 'flex flex-center',
        wrapperClass: 'rounded-custom dialog--centered',
        ...innerClasses,
      }
  }
})

const placement = computedEager(() => {
  if (props.position === 'top') {
    return 'bottom'
  } else if (props.position === 'bottom') {
    return 'top'
  }
})

// Animations
const animationTimestamp = ref<{ show: number; hide: number }>({
  show: 0,
  hide: 0,
})
const motionInstance = ref<MotionInstance | undefined>()
const animationTimeCorrection = 50

async function handleAnimation() {
  await nextTick()

  setTimeout(() => (backdropBg.value = 'bg-darker/80'))

  // Reset transform origin
  dialogEl.value?.classList.forEach(
    (c: any) => c.startsWith('origin-') && dialogEl.value?.classList.remove(c)
  )

  // Set transform origin
  let transformOrigin: string

  // Initial
  const initial = {
    opacity: 0,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  }

  switch (props.position) {
    case 'bottom': {
      transformOrigin = 'origin-bottom'
      initial.y = 100
      document.documentElement.classList.add('overflow-y-hidden')

      break
    }

    case 'top': {
      transformOrigin = 'origin-top'
      initial.y = -100

      break
    }

    case 'left': {
      transformOrigin = 'origin-left'
      initial.x = -100

      break
    }

    case 'right': {
      transformOrigin = 'origin-right'
      initial.x = 100

      break
    }

    default:
      transformOrigin = 'origin-center'
  }

  dialogEl.value?.classList.add(transformOrigin)

  // @ts-expect-error vue-motion type
  motionInstance.value = useMotion(dialogEl.value, {
    initial,
    enter: {
      x: 0,
      y: 0,
      opacity: 1,
      scaleY: 1,
      scaleX: 1,
      transition: {
        type: 'keyframes',
        duration: props.transitionDuration,
        ease: 'linear',
      },
    },
    leave: {
      ...initial,
      transition: {
        duration: props.transitionDuration,
        type: 'keyframes',
        ease: 'linear',
      },
    },
  })

  motionInstance.value?.apply('enter')?.then(() => emits('show'))

  setTimeout(() => {
    document.documentElement.classList.remove('overflow-y-hidden')
  }, 150)
}

async function bounce() {
  await motionInstance.value?.apply({
    scaleX: 1.05,
    scaleY: 1.05,
    transition: {
      type: 'keyframes',
      duration: 50,
    },
  })

  await motionInstance.value?.apply('enter')
}

// Interactions
const preventInteractions = refAutoReset(false, 10)
const internalValue = ref(props.modelValue)

function show() {
  if (preventInteractions.value) {
    return
  }
  preventInteractions.value = true

  // Idle
  if (!motionInstance.value) {
    animationTimestamp.value.show = new Date().getTime()
    internalValue.value = true
    handleAnimation()
    emits('update:model-value', true)
    emits('before-show')
  }

  // Motion instance exists ~ dialog is being currently closed
  else {
    internalValue.value = true
    animationTimestamp.value.show = new Date().getTime()
    const diffTime = Math.min(
      new Date().getTime() -
        animationTimestamp.value.hide -
        animationTimeCorrection,
      props.transitionDuration
    )

    // @ts-expect-error Blind assignment
    motionInstance.value.variants.enter.transition.duration =
      props.transitionDuration - diffTime
    motionInstance.value.apply('enter')
  }
}

function hide(force = false, skipAnimation = false, hideAncestors?: boolean) {
  if (preventInteractions.value) {
    return
  }
  preventInteractions.value = true

  if (hideAncestors) {
    const menuDom = unrefElement(dialogEl)!

    // Get all siblings (including current element)
    const allSiblings = Array.from(menuDom.parentNode?.children || [])

    // Find the index of current element
    const currentIndex = allSiblings.indexOf(menuDom)

    // Get all siblings after current element
    const nextSiblingsAll = allSiblings.slice(currentIndex + 1)

    // Filter siblings to get only ones with 'floating' class
    const floatingAncestors = nextSiblingsAll.filter(sibling =>
      sibling.classList.contains('floating-element')
    )

    floatingAncestors.forEach(floatingUiEl => {
      floatingUiEl.setAttribute('hide-trigger', 'true')
    })
  }

  if (force || !props.persistent) {
    backdropBg.value = 'bg-transparent'

    // Component got unmounted (animation has nothing to attach to)
    if (skipAnimation) {
      cleanComponent()
      emits('update:model-value', false)
      emits('hide')
      emits('before-hide')
    }

    // Call leave animation and eventually remove the menu
    else {
      animationTimestamp.value.hide = new Date().getTime()
      const diffTime = Math.min(
        new Date().getTime() -
          animationTimestamp.value.show -
          animationTimeCorrection,
        props.transitionDuration
      )

      if (motionInstance.value) {
        emits('before-hide')
        // @ts-expect-error Blind assignment
        motionInstance.value.variants.leave.transition.duration = diffTime
        motionInstance.value.leave(() => {
          cleanComponent()
          emits('hide')
          emits('update:model-value', false)
          nextTick(() => (backdropBg.value = 'bg-transparent'))
        })
      }
    }
  } else {
    bounce()
  }
}

function toggle(val?: boolean | MouseEvent) {
  if (val !== undefined && typeof val === 'boolean') {
    val ? show() : hide()
  } else {
    internalValue.value ? hide() : show()
  }
}

/**
 * Remove all menu-related stuff to not clutter the runtime
 */
function cleanComponent() {
  internalValue.value = false
  motionInstance.value = undefined
}

onClickOutside(dialogEl, handleClickOutside)

function handleClickOutside(ev: Event) {
  if (!internalValue.value) {
    return
  }

  const targetEl = ev.target as HTMLElement

  const isTargetBody = targetEl === document.body
  const isPartOfFloatingUI = dialogEl.value?.contains(targetEl)
  const isPartOfReferenceEl = triggerEl.value!.contains(targetEl)
  const lastFloatingElement = document.querySelector(
    '.floating-element:last-child'
  )
  const isNotifications = !!targetEl.closest('.notifications')

  if (
    !isTargetBody &&
    !isPartOfFloatingUI &&
    !isPartOfReferenceEl &&
    !isNotifications &&
    lastFloatingElement === dialogWrapperEl.value
  ) {
    hide()
  }
}

useMutationObserver(
  dialogWrapperEl,
  () => {
    if (dialogWrapperEl.value?.hasAttribute('hide-trigger')) {
      hide()

      dialogWrapperEl.value?.removeAttribute('hide-trigger')
    }
  },
  { attributeFilter: ['hide-trigger'] }
)

watch(
  () => props.modelValue,
  val => (val ? show() : hide(true))
)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    triggerEl.value = getTargetElement(props.target)

    !props.manual && triggerEl.value?.addEventListener('click', toggle)

    if (internalValue.value) {
      show()
    }
  })
})

onBeforeUnmount(() => {
  cleanComponent()
  triggerEl.value?.removeEventListener('click', toggle)
})

defineExpose({ show, hide, toggle, getFloatingEl: () => dialogWrapperEl.value })
</script>

<template>
  <Teleport
    v-if="internalValue || motionInstance?.isAnimating"
    to="body"
  >
    <div
      ref="dialogWrapperEl"
      class="dialog-wrapper floating-element"
      :class="dialogClasses.containerClass"
      :style="{
        '--dialogMaxHeight':
          typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        '--transition': `${transitionDuration}ms`,
      }"
    >
      <!-- Backdrop -->
      <div
        v-if="!seamless"
        class="backdrop"
        :class="[backdropBg, backdropClass]"
      />

      <!-- Dialog wrapper -->
      <div
        ref="dialogEl"
        class="dialog"
        :class="dialogClasses.wrapperClass"
        :placement="placement"
        h="120"
        w="100"
        max-h="[min(95%,var(--dialogMaxHeight))]"
        max-w="95vw"
        v-bind="$attrs"
      >
        <!-- Header -->
        <slot
          v-if="!hideHeader"
          name="header"
          :hide="hide"
        >
          <div
            flex="~"
            h="12"
            items-center
            border="b-1 ca"
            bg="ca"
            shrink-0
            :class="[dialogClasses.headerClass, headerClass]"
          >
            <slot name="title">
              <h6
                flex="1"
                text="h6"
                p="r-2"
                truncate
              >
                <span>
                  {{ title }}
                </span>
              </h6>
            </slot>

            <div flex="~ gap-1">
              <slot name="header-right-prepend" />

              <Btn
                v-if="!noClose"
                preset="CLOSE"
                size="sm"
                @click="hide(true, undefined, true)"
              />

              <slot name="header-right-append" />
            </div>
          </div>
        </slot>

        <!-- Content -->
        <div
          flex="~ col 1"
          overflow="auto"
          relative
          :class="dialogClasses.contentClass"
          :style="contentStyle"
        >
          <slot> Slot. </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.dialog-wrapper {
  --apply: fixed inset-0 z-$zDialog;
}

.dialog {
  --apply: flex flex-col bg-white dark:bg-darker overflow-auto
   border-custom border-ca;
}

.backdrop {
  --apply: inset-0 absolute transition-background-color
    duration-$transition ease;
}

// Specifically for selector
.selector {
  --apply: w-95vw;
}
</style>

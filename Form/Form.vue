<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IFormProps } from '~/components/Form/types/form-props.type'

// Functions
import { useFormErrors } from '~/components/Form/functions/useFormErrors'
import { useAppStore } from '~/libs/App/app.store'

// Components
import MenuConfirmation from '~/components/MenuConfirmation/MenuConfirmation.vue'

// Injections
import { isFormEditingKey } from '~/components/Form/provide/form.provide'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IFormProps>(), {
  errorsOnTop: true,
  labelForcedVisibility: true,
  hasControls: undefined,
  submitConfirmation: undefined,
  focusFirstInput: false,
  preventSubmitOnEnter: config.form.props.preventSubmitOnEnter,
})

const emits = defineEmits<{
  (e: 'submit', payload?: any): void
  (e: 'update:errors', errors: string[]): void
  (e: 'update:isEditing', val: boolean): void
}>()

// Store
const appStore = useAppStore()
const { appState, lastPointerDownType, activeElement } = storeToRefs(appStore)

// Errors
const errors = toRef(props, 'errors', [])
const { errorsExtended, handleDismissError } = useFormErrors(errors, emits)

// Layout
const formEl = ref<HTMLFormElement>()
const menuConfirmationEl = ref<InstanceType<typeof MenuConfirmation>>()
const isSubmitted = ref(false)
const isEditing = defineModel('isEditing', { default: false })
const { isDesktop } = useDevice()

provide(isFormEditingKey, isEditing)

function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight ||
        document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /* or $(window).width() */
  )
}

const formConfirmation = computed(() => {
  // When set in code, we want to use the value from the code
  if (props.submitConfirmation !== undefined) {
    return props.submitConfirmation
  }

  // When we don't allow people to edit the confirmation we just use whatever is
  // in the config
  const isEditable = config.form.confirmation.editable

  if (!isEditable) {
    return config.form.confirmation.enabled
  }

  // Otherwise, we use the value from the app state (with fallback to config)
  const isEnabled =
    !!appState.value.form?.confirmation?.enabled ||
    config.form.confirmation.enabled

  return isEnabled
})

const preventSubmitOnEnter = computed(() => {
  return !!props.preventSubmitOnEnter
})

const editControls = computed(() => {
  if (props.noEditControls || !props.editControls) {
    return
  }

  return {
    cancel: props.editControls === true || props.editControls?.cancel,
    edit: props.editControls === true || props.editControls?.edit,
  }
})

const FormConfirmation = computed(() => {
  return config.form?.confirmation?.component ?? MenuConfirmation
})

const formClass = computed(() => ({
  'form--dense': props.dense,
  'is-bordered': props.bordered,
  'is-submitted': isSubmitted.value,
  'has-controls-on-top': props.controlsOnTop,
  'is-grown': !props.noGrow,
  'is-label-forced-visible': props.labelForcedVisibility,
}))

const controlsClass = computed(() => {
  const classes = [
    'w-full border-ca',
    'lt-lg:p-x-2 sticky bottom-0 inset-inline-0',
  ]

  if (props.controlsOnTop) {
    classes.push('order--1 border-b-1')
  } else {
    classes.push('border-t-1')
  }

  return [...classes, props.ui?.controlsClass]
})

// Keyboard shortcuts
onKeyStroke(['e', 'E'], (ev: KeyboardEvent) => {
  // When using CTRL or META, we return back to readonly mode
  const isControlKey = ev.ctrlKey || ev.metaKey

  if (isControlKey) {
    ev.preventDefault()
    isEditing.value = false
    menuConfirmationEl.value?.hide()

    return
  }

  // When `e` is pressed, we want to enter the edit mode
  const isFocusedInInput = appStore.isActiveElementInput()

  if (isFocusedInInput) {
    return
  }

  isEditing.value = true
})

// Functions
const throttledSubmit = useThrottleFn(
  (isConfirmed?: boolean, payload?: any) => {
    if (!isConfirmed && formConfirmation.value) {
      menuConfirmationEl.value?.show()
      menuConfirmationEl.value?.focusConfirmButton?.()

      return
    }

    if (!props.loading && !props.submitDisabled) {
      emits('submit', payload)
    }

    isSubmitted.value = true
  },
  500,
  false,
  true
)

function focusFirstInput() {
  // We only focus the first input if the last pointer down type was a mouse
  // because on touch devices, it would most likely open a virtual keyboard
  // which might take unnecessary space on the screen
  const shouldFocus =
    lastPointerDownType?.value === 'mouse' ||
    (isDesktop && !lastPointerDownType.value)

  if (shouldFocus && props.focusFirstInput) {
    const spanElements =
      formEl?.value?.querySelectorAll('span.wrapper-body__input') || []

    const firstEditableField = Array.from(spanElements).find(el => {
      const inputChild = el.querySelector(
        '.control:not([readonly]):not([disabled])'
      ) as HTMLElement

      return !!inputChild
    }) as HTMLElement

    const firstEditableInput = firstEditableField?.querySelector(
      '.control:not([readonly]):not([disabled])'
    ) as HTMLElement

    if (firstEditableInput) {
      const isInViewPort = isElementInViewport(firstEditableInput)

      if (isInViewPort) {
        firstEditableInput.focus()
      }
    }
  }
}

function handleEnter(ev: KeyboardEvent) {
  const isCtrlKey = ev.ctrlKey || ev.metaKey
  const isInput = activeElement.value?.tagName === 'INPUT'
  const hasCustomEnterHandler =
    activeElement.value?.classList.contains('custom-enter')

  const isInputWithCustomEnterHandler = isInput && hasCustomEnterHandler

  if (
    preventSubmitOnEnter.value &&
    isInput &&
    !isCtrlKey &&
    !isInputWithCustomEnterHandler
  ) {
    ev.preventDefault()
  } else if (isCtrlKey && !props.submitDisabled) {
    throttledSubmit()
  }
}

defineExpose({
  submit: throttledSubmit,
  fakeSubmit: () => (isSubmitted.value = true),
  reset: () => formEl.value?.reset(),
  recomputeConfirmationMenuPosition: () => {
    menuConfirmationEl.value?.recomputeMenuPosition()
  },
})

// When triggering the edit mode, we want to focus the first input
whenever(isEditing, () => {
  // Small delay for waiting for the input to be appended in EDIT mode
  nextTick(() => {
    focusFirstInput()
  })
})

// We also try to focus the first input when the form is mounted
onMounted(() => {
  focusFirstInput()
})
</script>

<template>
  <form
    ref="formEl"
    class="form"
    :class="formClass"
    autocomplete="off"
    novalidate
    @submit.stop.prevent="throttledSubmit()"
    @keydown.enter="handleEnter"
  >
    <slot name="above" />

    <div
      class="form-content"
      rounded="t-custom"
      overflow="auto"
      :class="{ 'flex flex-col': !$attrs.grid }"
      v-bind="$attrs"
    >
      <slot />
    </div>

    <slot name="errors">
      <Section
        v-if="errorsExtended.length"
        flex="~ col gap-y-2"
        :section-class="{
          'order--1': !!errorsOnTop,
        }"
      >
        <Banner
          v-for="error in errorsExtended"
          :key="error.idx"
          type="error"
          dismissable
          icon-class="!self-center"
          :counter="error.count"
          :label="$t(error.errorText)"
          @dismiss="handleDismissError(error)"
        />
      </Section>
    </slot>

    <slot
      v-if="!noControls && hasControls !== false"
      name="submit"
    >
      <div
        id="form-controls"
        flex="~ wrap gap-2 items-center shrink-0"
        p="2"
        :class="controlsClass"
      >
        <slot
          v-if="$slots['submit-start']"
          name="submit-start"
        >
          <span>&nbsp;</span>
        </slot>

        <!-- Spacer -->
        <div grow />

        <div
          relative
          flex="~ gap-2"
          :class="ui?.submitWrapperClass"
        >
          <slot name="submit-before" />

          <CrudBtnCancel
            v-if="editControls?.cancel"
            :class="{ invisible: !isEditing }"
            :reset="reset"
          />

          <Btn
            v-if="!noSubmit"
            bg="primary"
            color="white"
            w="40"
            :class="[
              ui?.submitClass,
              { invisible: !isEditing && !!editControls },
            ]"
            :disabled="submitDisabled"
            :loading="loading"
            :icon="icon"
            type="submit"
            data-cy="save-button"
            :label="label ?? $t('submit')"
          >
            <Component
              :is="FormConfirmation"
              v-if="formConfirmation"
              ref="menuConfirmationEl"
              manual
              :confirmation-text="submitConfirmationText"
              @ok="throttledSubmit(true, $event)"
            >
              <template #append>
                <slot name="confirmation" />
              </template>
            </Component>

            <slot name="submit-btn" />
          </Btn>

          <CrudEditBtn v-if="editControls?.edit" />

          <slot name="submit-after" />
        </div>
      </div>
    </slot>
  </form>
</template>

<style lang="scss" scoped>
.form {
  &-content {
    --apply: flex-gap-2 border-ca;
  }

  &.is-grown {
    --apply: contents;

    > .form-content {
      --apply: flex-grow p-$Form-content-padding;
    }
  }

  &.is-bordered {
    > .form-content {
      --apply: border-x-2 border-t-2 border-ca;
    }

    > #form-controls {
      --apply: border-x-2 border-b-2 border-ca rounded-b-custom;
    }
  }

  &:not(.is-label-forced-visible) {
    :deep(#form-controls .btn-label) {
      --apply: lt-lg:hidden;
    }

    :deep(#form-controls .btn) {
      --apply: lt-lg:p-x-0;
    }
  }

}
</style>

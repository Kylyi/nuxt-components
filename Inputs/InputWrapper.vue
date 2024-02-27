<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

// Functions
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'
import { useInputValidationUtils } from '~/components/Inputs/functions/useInputValidationUtils'

// Components
import InputWrapperRegular from '~/components/Inputs/InputWrapper/InputWrapperRegular.vue'
import InputWrapperInline from '~/components/Inputs/InputWrapper/InputWrapperInline.vue'
import InputWrapperInside from '~/components/Inputs/InputWrapper/InputWrapperInside.vue'

const props = withDefaults(defineProps<IInputWrapperProps>(), {
  cursor: 'cursor-text',
  errorVisible: true,
  size: 'md',
  layout: config.inputs.wrapperProps.layout,
  required: undefined,
})

// Utils
const { getInputWrapperStyleVariables } = useInputWrapperUtils()
const { issues, isRequired } = useInputValidationUtils(props)

// Layout
const wrapperEl = ref<HTMLDivElement>()

const isModified = computed(() => {
  if (!props.originalValue) {
    return false
  }

  return !isEqual(props.originalValue, props.modelValue)
})

const labelProps = computed(() => {
  return {
    hasContent: props.hasContent,
    hasError: !!issues.value.length,
    label: props.label,
    labelClass: props.labelClass,
    labelStyle: props.labelStyle,
    layout: props.layout,
    placeholder: props.placeholder,
    required: props.required,
    size: props.size,
    stackLabel: props.stackLabel,
    validation: props.validation,
  }
})

const wrapperClass = computed(() => {
  return [
    `wrapper--${props.size}`,
    props.cursor,
    {
      'has-content': props.hasContent,
      'has-label-inside': props.layout === 'label-inside',
      'is-inline': props.layout === 'inline',
    },
  ]
})

const contentClass = computed(() => {
  return {
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
    'has-error': !!issues.value.length,
    'has-label': !!props.label,
    'is-modified': isModified.value,
  }
})

const wrapperStyleVariables = computed(() =>
  getInputWrapperStyleVariables(props)
)

// Wrapper
const WrapperComponent = computed(() => {
  switch (props.layout) {
    case 'inline':
      return InputWrapperInline

    case 'label-inside':
      return InputWrapperInside

    default:
      return InputWrapperRegular
  }
})

const wrapperProps = computed(() => {
  return {
    noBorder: props.noBorder,
    readonly: props.readonly,
    disabled: props.disabled,
    hasErrors: !!issues.value.length,
    hint: props.hint,
    size: props.size,
    hasLabel: !!props.label,
    ui: props.ui,
  }
})
</script>

<template>
  <div
    ref="wrapperEl"
    class="wrapper"
    :class="wrapperClass"
    :style="wrapperStyleVariables"
  >
    <Component
      :is="WrapperComponent"
      v-bind="wrapperProps"
      class="wrapper__body"
      :class="[contentClass, ui?.contentClass]"
      :style="ui?.contentStyle"
    >
      <!-- Label -->
      <template
        v-if="label"
        #label
      >
        <InputLabel
          v-bind="labelProps"
          :required="isRequired"
        />
      </template>

      <!-- Prepend -->
      <template
        v-if="$slots.prepend"
        #prepend
      >
        <slot name="prepend" />
      </template>

      <!-- Input -->
      <template #input>
        <slot />
      </template>

      <!-- Loading -->
      <template
        v-if="loading"
        #loading
      >
        <LoaderBlock
          :size="7"
          class="loading"
        />
      </template>

      <!-- Append -->
      <template
        v-if="$slots.append"
        #append
      >
        <slot name="append" />
      </template>

      <!-- Error -->
      <template
        v-if="errorVisible"
        #error
      >
        <ErrorContainer
          :error-takes-space="errorTakesSpace"
          :errors="issues"
          class="wrapper-error"
        />
      </template>

      <!-- Hint -->
      <template
        v-if="hint"
        #hint
      >
        <HintContainer :hint="hint" />
      </template>
    </Component>

    <slot name="menu" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  --apply: relative flex flex-col rounded-custom;

  .wrapper__body {
    --apply: relative;
    --apply: dark:bg-darker bg-white;
    margin: var(--bodyMargin);

    &.is-readonly,
    &.is-disabled {
      :slotted(.control) {
        --apply: cursor-default;
      }

      &::after {
        --apply: border-dashed;
      }
    }

    :slotted(.control) {
      --apply: bg-inherit outline-none rounded-custom w-full;

      font-size: var(--fontSize);
      line-height: var(--lineHeight);
      padding: var(--padding);
      margin: var(--margin);
    }
  }

  &:not(.has-content) {
    :slotted(.control) {
      --apply: color-true-gray-400;
    }

    &:not(:focus-within) {
      :slotted(.control) {
        --apply: "!color-transparent";
      }

    }
  }
}
</style>

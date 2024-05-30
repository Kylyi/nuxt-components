<script setup lang="ts">
// Types
import type { IInputWrapperProps } from '~/components/Inputs/types/input-wrapper-props.type'

const props = defineProps<
  Pick<
    IInputWrapperProps,
    'noBorder' | 'readonly' | 'disabled' | 'size' | 'hint' | 'ui'
  > & {
    hasErrors?: boolean
    hasLabel?: boolean
  }
>()

// Layout
const classes = computed(() => {
  return {
    'has-border': !props.noBorder,
    'has-errors': props.hasErrors,
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
    'has-label': !!props.hasLabel,
  }
})
</script>

<template>
  <div
    class="input-wrapper__regular"
    :class="classes"
  >
    <!-- Label -->
    <div
      v-if="$slots.label"
      class="input-wrapper__regular-label"
    >
      <slot name="label" />
    </div>

    <!-- Border -->
    <div
      class="input-wrapper__regular-border input-wrapper-border"
      :class="ui?.inputContainerClass"
      :style="ui?.inputContainerStyle"
    />

    <!-- Prepend -->
    <div class="input-wrapper__regular-prepend input-wrapper__focusable">
      <slot name="prepend" />
    </div>

    <!-- Input -->
    <div class="input-wrapper__regular-input input-wrapper__focusable">
      <slot name="input" />
    </div>

    <!-- Loading -->
    <div class="input-wrapper__regular-loading input-wrapper__focusable">
      <slot name="loading" />
    </div>

    <!-- Append -->
    <div class="input-wrapper__regular-append input-wrapper__focusable">
      <slot name="append" />
    </div>

    <!-- Errors & Hint -->
    <div class="input-wrapper__regular-error">
      <slot name="hint" />
      <slot name="error" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__regular {
  --apply: grid items-center rounded-$borderRadius;

  // Without label
  grid-template-areas:
    'prepend  input loading append'
    'nothing4 error nothing5 nothing6';

  grid-template-columns: auto 1fr auto auto;
  grid-template-rows: 1fr auto;

  &.has-label {
    grid-template-areas:
      'nothing  label nothing2 nothing3'
      'prepend  input loading append'
      'nothing4 error nothing5 nothing6';

    grid-template-columns: auto 1fr auto auto;
    grid-template-rows: 16px auto 1fr;
  }

  .input-wrapper__regular-input {
    --apply: relative flex overflow-auto;
    grid-area: input;
  }

  .input-wrapper__regular-label {
    --apply: self-start relative fit;
    grid-column: 2 / 5;
    grid-row: 1 / 3;
  }

  .input-wrapper__regular-prepend {
    --apply: fit flex flex-center;
    grid-area: prepend;
  }

  .input-wrapper__regular-loading {
    grid-area: loading;
  }

  .input-wrapper__regular-append {
    --apply: fit flex flex-center;
    grid-area: append;
  }

  .input-wrapper__regular-error {
    --apply: flex flex-col p-x-1;
    grid-area: error;
  }
}

// Border
// Without label
.input-wrapper__regular-border {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  --apply: fit border-custom rounded-$borderRadius pointer-events-none border-ca
    bg-$Input-wrapper-bg;
}

// With label
.input-wrapper__regular.has-label > .input-wrapper__regular-border {
  grid-row: 2 / 3;
}

.input-wrapper__regular:focus-within {
  .input-wrapper__regular-border {
    --apply: border-$borderColor;
  }
}

.input-wrapper__regular.has-errors > .input-wrapper__regular-border {
  --apply: border-negative;
}

.input-wrapper__regular.is-readonly > .input-wrapper__regular-border {
  --apply: border-dashed;
}

.input-wrapper__regular.is-disabled {
  --apply: opacity-80 cursor-not-allowed;

  :slotted(.control) {
    --apply: '!cursor-not-allowed';
  }
}

.input-wrapper__regular:not(.has-border) .input-wrapper__regular-border {
  --apply: border-none;
}
</style>

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

    <!-- Prepend -->
    <div
      class="input-wrapper__regular-prepend input-wrapper__focusable"
      :class="ui?.inputContainerClass"
      :style="ui?.inputContainerStyle"
    >
      <slot name="prepend" />
    </div>

    <!-- Input -->
    <div
      class="input-wrapper__regular-input input-wrapper__focusable"
      :class="ui?.inputContainerClass"
      :style="ui?.inputContainerStyle"
    >
      <slot name="input" />
    </div>

    <!-- Loading -->
    <div
      class="input-wrapper__regular-loading input-wrapper__focusable"
      :class="ui?.inputContainerClass"
      :style="ui?.inputContainerStyle"
    >
      <slot name="loading" />
    </div>

    <!-- Append -->
    <div
      class="input-wrapper__regular-append input-wrapper__focusable"
      :class="ui?.inputContainerClass"
      :style="ui?.inputContainerStyle"
    >
      <slot name="append" />
    </div>

    <!-- Errors & Hint -->
    <div
      v-if="$slots.error || hint"
      class="input-wrapper__reular-error"
    >
      <slot
        v-if="hasErrors"
        name="error"
      />
      <slot
        v-else-if="hint"
        name="hint"
      />
    </div>

    <!-- Border -->
    <div class="input-wrapper__regular-border input-wrapper-border" />
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__regular {
  --apply: grid items-center rounded-custom;

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
    --apply: overflow-hidden self-start relative fit;
    grid-column: 2 / 3;
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

  .input-wrapper__reular-error {
    --apply: p-x-3;
    grid-area: error;
  }
}

// Border
// Without label
.input-wrapper__regular-border {
  grid-column: 1 / -1;
  grid-row: 1 / 2;

  --apply: fit transition-all border-custom rounded-custom pointer-events-none
    border-ca;
}

.input-wrapper__regular:not(.has-border) .input-wrapper__regular-border {
  --apply: border-none;
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
</style>

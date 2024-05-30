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
    [`is-${props.size}`]: true,
    'has-border': !props.noBorder,
    'has-errors': props.hasErrors,
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
  }
})
</script>

<template>
  <div
    class="input-wrapper__inside"
    :class="[classes, ui?.inputContainerClass]"
    :style="ui?.inputContainerStyle"
  >
    <!-- Input -->
    <div class="input-wrapper__inside-input input-wrapper__focusable">
      <slot name="input" />
    </div>

    <!-- Background filler -->
    <div
      v-if="hasLabel"
      class="input-wrapper__inside-background-filler"
    />

    <!-- Border -->
    <div class="input-wrapper__inside-border input-wrapper-border" />

    <!-- Prepend -->
    <div class="input-wrapper__inside-prepend input-wrapper__focusable">
      <slot name="prepend" />
    </div>

    <!-- Loading -->
    <div class="input-wrapper__inside-loading input-wrapper__focusable">
      <slot name="loading" />
    </div>

    <!-- Append -->
    <div class="input-wrapper__inside-append input-wrapper__focusable">
      <slot name="append" />
    </div>

    <!-- Label -->
    <div
      v-if="$slots.label"
      class="input-wrapper__inside-label"
    >
      <slot name="label" />
    </div>

    <!-- Errors & Hint -->
    <div class="input-wrapper__regular-error">
      <slot name="hint" />
      <slot name="error" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__inside {
  --apply: grid items-center rounded-$borderRadius bg-$Input-wrapper-bg;

  grid-template-areas:
    'prepend input loading append'
    'prepend input loading append'
    'nothing error nothing2 nothing3';

  grid-template-columns: auto 1fr auto auto;
  grid-template-rows: 18px 1fr auto;

  &.is-sm {
    --apply: min-h-9;

    grid-template-rows: 16px 1fr auto;
  }

  &.is-md {
    --apply: min-h-11;
  }

  &.is-lg {
    --apply: min-h-13;
  }

  .input-wrapper__inside-label {
    --apply: fit overflow-hidden;
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .input-wrapper__inside-input {
    --apply: flex relative h-full;
    grid-area: input;
  }

  .input-wrapper__inside-prepend {
    --apply: fit flex flex-center;
    grid-area: prepend;
  }

  .input-wrapper__inside-loading {
    grid-area: loading;
  }

  .input-wrapper__inside-append {
    --apply: fit flex flex-center;
    grid-area: append;
  }

  .input-wrapper__regular-error {
    --apply: p-x-3;
    grid-area: error;
  }
}

// Border
.input-wrapper__inside-border {
  grid-column: 1 / -1;
  grid-row: 1 / 3;
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  --apply: absolute fit border-custom rounded-$borderRadius pointer-events-none
    border-ca;
}

.input-wrapper__inside:focus-within {
  .input-wrapper__inside-border {
    --apply: border-$borderColor;
  }
}

.input-wrapper__inside.has-errors > .input-wrapper__inside-border {
  --apply: border-negative;
}

.input-wrapper__inside.is-readonly > .input-wrapper__inside-border {
  --apply: border-dashed;
}

.input-wrapper__inside.is-disabled {
  --apply: opacity-80 cursor-not-allowed;

  :slotted(.control) {
    --apply: '!cursor-not-allowed';
  }
}

// Height of input based on size
.input-wrapper__inside {
  &.is-sm > .input-wrapper__inside-input {
    --apply: min-h-40px;
  }

  &.is-md > .input-wrapper__inside-input {
    --apply: min-h-44px;
  }

  &.is-lg > .input-wrapper__inside-input {
    --apply: min-h-48px;
  }
}

.input-wrapper__inside-background-filler {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  --apply: absolute fit pointer-events-none rounded-t-custom bg-inherit;
}

.input-wrapper__inside:not(.has-border) .input-wrapper__inside-border {
  --apply: border-none;
}
</style>

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
    class="input-wrapper__inline"
    :class="classes"
  >
    <!-- Label -->
    <div class="input-wrapper__inline-label">
      <slot name="label" />
    </div>

    <!-- Input wrapper -->
    <div class="input-wrapper__inline-input input-wrapper__focusable">
      <!-- Prepend -->
      <div
        class="input-wrapper__inline-input-prepend"
        :class="ui?.inputContainerClass"
        :style="ui?.inputContainerStyle"
      >
        <slot name="prepend" />
      </div>

      <!-- Input -->
      <div
        class="input-wrapper__inline-input-input"
        :class="ui?.inputContainerClass"
      >
        <slot name="input" />
      </div>

      <!-- Loading -->
      <div
        class="input-wrapper__inline-input-loading"
        :class="ui?.inputContainerClass"
      >
        <slot name="loading" />
      </div>

      <!-- Append -->
      <div
        class="input-wrapper__inline-input-append"
        :class="ui?.inputContainerClass"
      >
        <slot name="append" />
      </div>

      <!-- Border -->
      <div class="input-wrapper__inline-border input-wrapper-border" />

      <!-- Errors & Hint -->
      <div
        v-if="$slots.error || hint"
        class="input-wrapper__inline-input-error"
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-wrapper__inline {
  --apply: flex flex-col rounded-custom;

  &-label {
    --apply: shrink-0;
  }

  &-input {
    --apply: grid items-center;

    grid-template-areas:
      'prepend input loading append'
      'error error nothing2 nothing3';

    grid-template-columns: auto 1fr auto auto;
    grid-template-rows: 1fr auto;
  }

  .input-wrapper__inline-input-prepend {
    --apply: fit flex flex-center;
    grid-area: prepend;
  }

  .input-wrapper__inline-input-input {
    --apply: flex flex-col;
    grid-area: input;
  }

  .input-wrapper__inline-input-loading {
    grid-area: loading;
  }

  .input-wrapper__inline-input-append {
    --apply: fit flex flex-center;
    grid-area: append;
  }

  .input-wrapper__inline-input-error {
    --apply: p-x-3;
    grid-area: error;
  }

  @screen md {
    --apply: flex-row items-start gap-2;

    &-label {
      --apply: flex items-center;
    }

    &-input {
      --apply: grow;
    }

    // Label must be have at least the same height as the input to be positioned properly
    &.is-sm > .input-wrapper__inline-label {
      --apply: min-h-8;
    }

    &.is-md > .input-wrapper__inline-label {
      --apply: min-h-10;
    }

    &.is-lg > .input-wrapper__inline-label {
      --apply: min-h-12;
    }
  }

  :slotted(> *) {
    --apply: shrink-0;
  }

  :slotted(.wrapper-body__input) {
    --apply: grow;
  }
}

// Border
.input-wrapper__inline-border {
  grid-column: 1 / -1;
  grid-row: 1 / 2;

  --apply: transition-all border-custom rounded-custom pointer-events-none
    border-ca fit;
}

.input-wrapper__inline:not(.has-border) .input-wrapper__inline-border {
  --apply: border-none;
}

.input-wrapper__inline:focus-within {
  .input-wrapper__inline-border {
    --apply: border-$borderColor;
  }
}

.input-wrapper__inline.has-errors .input-wrapper__inline-border {
  --apply: border-negative;
}

.input-wrapper__inline.is-readonly .input-wrapper__inline-border {
  --apply: border-dashed;
}

.input-wrapper__inline.is-disabled {
  --apply: opacity-80 cursor-not-allowed;

  :slotted(.control) {
    --apply: '!cursor-not-allowed';
  }
}
</style>

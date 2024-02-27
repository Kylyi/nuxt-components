<script setup lang="ts">
// Functions
import type { InputLabelProps } from '~/components/Inputs/types/input-label-props.type'

const props = withDefaults(defineProps<InputLabelProps>(), {
  required: undefined,
})

const labelLocalClass = computed(() => {
  const isInline = props.layout === 'inline'
  const isInside = props.layout === 'label-inside'
  const isRegular = props.layout === 'regular'

  return [
    props.labelClass,
    `label--${props.size}`,
    {
      'is-inline': isInline,
      'is-required': props.required,
      'is-inside': isInside,
      'is-regular': isRegular,
      'is-floating':
        !isInline &&
        (props.stackLabel || props.placeholder || props.hasContent),
    },
  ]
})
</script>

<template>
  <div
    class="label"
    :class="labelLocalClass"
    :style="labelStyle"
  >
    {{ label }}
  </div>
</template>

<style lang="scss" scoped>
div.label {
  --apply: ease-linear tracking-wide z-10 origin-top-left top-0 left-0 pointer-events-none
    leading-tight color-gray-500 dark:color-gray-400 max-w-full p-x-3 break-words;

  --apply: color-$InputLabel-color;

  transition: transform .2s cubic-bezier(.4,0,.2,1),
              padding .2s cubic-bezier(.4,0,.2,1),
              font-size .2s  cubic-bezier(.4,0,.2,1),
              color     .2s  linear;

  // Layout ~ Inline
  &.is-inline {
    --apply: order--1 font-rem-13;

    @screen md {
      --apply: min-w-200px w-200px text-right font-rem-14 p-y-0.5 p-x-0;
    }
  }

  // Layout ~ Regular
  &.is-regular {
    --apply: absolute;
  }

  // Layout ~ not Inline
  &:not(.is-inline) {
    --apply: origin-top-left left-0 top-0 truncate w-full overflow-hidden;
  }

  // Size: Small
  &--sm {
    --apply: font-rem-14 leading-3.5;

    &.is-inside {
      --apply: translate-y-13px;
    }

    &.is-regular {
      --apply: translate-y-25px;
    }
  }

  // Size: Medium
  &--md {
    --apply: leading-4;

    &.is-inside {
      --apply: translate-y-14px;
    }

    &.is-regular {
      --apply: translate-y-27px;
    }
  }

  // Size: Large
  &--lg {
    --apply: font-rem-16 leading-5;

    &.is-inside {
      --apply: translate-y-17px;
    }

    &.is-regular {
      --apply: translate-y-30px;
    }
  }

  &.is-floating:not(.is-inline) {
    --apply: font-rem-12;
  }

  &.is-floating.is-inside {
    --apply: translate-y-3px rounded-t-custom;
  }

  &.is-floating.is-regular {
    --apply: translate-y-0px
  }

  &.is-required::after {
    content: ' *';
    --apply: color-negative;
  }
}

.wrapper__body:not(.selector-wrapper):focus-within {
  div.label {
    --apply: color-primary;
    --apply: color-$InputLabel-active-color;

    &:not(.is-inline) {
      --apply: font-rem-12;
    }

    &.is-inside {
      --apply: translate-y-3px rounded-t-custom;
    }

    &.is-regular {
      --apply: translate-y--0px;
    }
  }

  div.label[haserror="true"] {
    --apply: color-negative;
  }
}

div.label.is-floating:not(.is-inside) {
  --apply: p-x-1;
}

div.label.is-inline {
  @screen lt-md {
    --apply: p-x-1;
  }
}

.wrapper__body:not(.selector-wrapper):focus-within {
  div.label:not(.is-inside):not(.is-inline) {
    --apply: p-x-1;
  }
}
</style>

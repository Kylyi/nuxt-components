<script setup lang="ts">
// TYPES
import type { ICheckboxProps } from '~~/components/Checkbox/types/checkbox-props.type'

const props = withDefaults(defineProps<ICheckboxProps>(), {
  color: 'primary',
  editable: true,
  size: 'sm',
  checkValue: true,
  uncheckValue: false,
  indeterminateValue: null,
})

const emits = defineEmits<{
  (e: 'update:model-value', value: any): void
}>()

const toggleState = computed(() => {
  const isChecked =
    props.comparatorFn?.(props.modelValue, props.checkValue) ??
    props.modelValue === props.checkValue

  const isIndeterminate =
    props.comparatorFn?.(props.modelValue, props.indeterminateValue) ??
    props.modelValue === props.indeterminateValue

  return {
    checked: !isIndeterminate ? isChecked : undefined,
    indeterminate: isIndeterminate || undefined,
  }
})

function handleStateChange() {
  if (!props.editable) {
    return
  }

  if (toggleState.value.checked) {
    emits('update:model-value', props.uncheckValue)
  } else if (toggleState.value.indeterminate) {
    emits('update:model-value', props.checkValue)
  } else {
    emits(
      'update:model-value',
      props.indeterminate ? props.indeterminateValue : props.checkValue
    )
  }
}
</script>

<template>
  <label
    tabindex="0"
    class="label"
    :class="[
      `is-${size}`,
      {
        'is-checked': toggleState.checked,
        'is-indeterminate': toggleState.indeterminate,
        'is-readonly': !editable,
      },
    ]"
    @click.stop.prevent="handleStateChange"
  >
    <input
      type="checkbox"
      hidden
      tabindex="-1"
      :name="name"
      v-bind="toggleState"
    />

    <div
      class="checkbox"
      :class="[`is-${color}`, { 'is-readonly': !editable }]"
    >
      <Checkmark
        :class="{ hidden: !toggleState.checked }"
        h="auto"
        w="auto"
        m="1px"
        stroke-color="stroke-white"
      />

      <Indeterminate
        :class="{ hidden: !toggleState.indeterminate }"
        h="auto"
        w="auto"
        m="1px"
        stroke-color="stroke-white"
      />
    </div>

    <slot>
      <span
        v-if="label"
        class="checkbox-label"
        :class="labelClass"
      >
        {{ label }}
      </span>
    </slot>

    <slot name="append" />

    <span
      v-if="!noHoverEffect"
      class="focus-helper"
    />
  </label>
</template>

<style lang="scss" scoped>
.label {
  --apply: flex items-center relative gap-2 cursor-pointer transition-all
    rounded-custom p-x-2 select-none;

  &.is-readonly {
    --apply: opacity-80;
  }

  &:not(.is-checked):not(.is-indeterminate) {
    .checkbox {
      --apply: bg-transparent;
    }
  }

  &.is-xs {
    --apply: min-h-6;

    .checkbox {
      --apply: h-3.5 w-3.5 rounded-1 m-t-5px;
    }

    .checkbox-label {
      --apply: font-rem-13 p-y-1;
    }
  }

  &.is-sm {
    --apply: min-h-8;

    .checkbox {
      --apply: h-4.5 w-4.5 rounded-1 m-t-7px;
    }

    .checkbox-label {
      --apply: font-rem-14 p-y-6px;
    }
  }

  &.is-md {
    --apply: min-h-10;

    .checkbox {
      --apply: h-5.5 w-5.5 rounded-1.5 m-t-9px;
    }

    .checkbox-label {
      --apply: p-y-8px;
    }
  }

  &.is-lg {
    --apply: min-h-12;

    .checkbox {
      --apply: h-6 w-6 rounded-1.5 m-t-12px;
    }

    .checkbox-label {
      --apply: font-rem-18 p-y-10px;
    }
  }
}

.checkbox {
  --apply: flex flex-center rounded-2 border-primary border-2 shrink-0 self-start;

  &-label {
    --apply: leading-none;
  }

  &.is-primary {
    --apply: bg-primary border-primary;
  }

  &.is-secondary {
    --apply: bg-secondary border-secondary;
  }

  &.is-positive {
    --apply: bg-positive border-positive;
  }

  &.is-warning {
    --apply: bg-warning border-warning;
  }

  &.is-negative {
    --apply: bg-negative border-negative;
  }

  &.is-info {
    --apply: bg-info border-info;
  }

  &.is-light {
    --apply: bg-light border-light;
  }

  &.is-dark {
    --apply: bg-dark border-dark;
  }

  &.is-darker {
    --apply: bg-darker border-darker;
  }

  &.is-readonly {
    --apply: bg-true-gray border-true-gray;
  }

  &.is-sm {
    --apply: h-5 w-5;
  }

  &.is-md {
    --apply: h-6 w-6;
  }

  &.is-lg {
    --apply: h-9 w-9;
  }
}

.focus-helper {
  --apply: absolute inset-0 z-3 hover:bg-current hover:opacity-10 cursor-pointer
    rounded-inherit;
}
</style>

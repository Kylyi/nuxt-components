<script setup lang="ts">
// TODO: am/pm values are not reactive on language change (broken only for 13h for some reason...)

// eslint-disable-next-line import/named
import { AnyMaskedOptions, MaskedRange } from 'imask'

// TYPES
import type { ITimeInputProps } from '~/components/Inputs/TimeInput/types/time-input-props.type'

// COMPOSITION FUNCTIONS
import { useInputUtils } from '@/components/Inputs/functions/useInputUtils'

// STORE

// COMPONENTS
import InputWrapper from '@/components/Inputs/InputWrapper.vue'
import TimeInputPicker from '~/components/Inputs/TimeInput/TimeInputPicker.vue'

const props = withDefaults(defineProps<ITimeInputProps>(), {
  debounce: 0,
  emptyValue: () => undefined,
  errorTakesSpace: true,
  errorVisible: true,
  immediate: true,
})

const emits = defineEmits<{
  (e: 'update:model-value', val?: Datetime): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'blur'): void
}>()

// UTILS
const { localeUses24HourTime } = useDateUtils()

const is12h = computed(() => !localeUses24HourTime())

function isTime(time: any) {
  if (time === '' || isNil(time) || time === props.emptyValue) {
    return false
  }

  return true
}

function isMaskString(val?: string) {
  return val === PATTERN
}

function localizeTime(time?: string | undefined) {
  if (!isTime(time) || isMaskString(time)) {
    return ''
  }

  const [hh, mm] = time!.split(':')

  if (is12h.value && +hh > 13) {
    return `${padStart(String(+hh % 12), 2, '0')}:${mm}`
  } else if (is12h.value && +hh < 1) {
    return `12:${mm}`
  }

  return time
}

function delocalizeTime(time?: string | undefined) {
  if (!isTime(time) || isMaskString(time)) {
    return ''
  }

  const [hh, mm] = time!.split(':')

  if (is12h.value && !isAm.value && +hh < 12) {
    return `${+hh + 12}:${mm}`
  }

  return time
}

// CONSTANTS
const PATTERN = 'HH:mm'

// LAYOUT
const preventNextIsAmChange = autoResetRef(false, 50)

const delocalizedTimeParts = computed(() => {
  const time = props.modelValue || '12:00'

  return {
    hh: time.split(':')[0],
    mm: time.split(':')[1],
  }
})

// MASKS
const maskFullTime = computed<AnyMaskedOptions>(() => {
  return {
    mask: PATTERN,
    pattern: PATTERN,
    lazy: false,
    overwrite: true,
    blocks: {
      HH: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'H',
        from: is12h.value ? 1 : 0,
        to: is12h.value ? 12 : 23,
        maxLength: 2,
      },
      mm: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'm',
        from: 0,
        to: 59,
        maxLength: 2,
      },
    },
    format: (val: string) => {
      if (!isTime(val)) {
        return PATTERN
      }

      if (isMaskString(val)) {
        return val
      }

      return localizeTime(val)
    },
    parse: (val: string) => {
      if (!isTime(val)) {
        return props.emptyValue
      }

      if (isMaskString(val)) {
        return val
      }

      return delocalizeTime(val)
    },
  }
})

// LAYOUT
const wrapperEl = ref<InstanceType<typeof InputWrapper>>()
const isAm = ref(+delocalizedTimeParts.value.hh < 12)

const modelValueLocalized = computed(() => localizeTime(props.modelValue!))

const propsExtended = reactiveComputed(() => ({
  ...props,
  modelValue: modelValueLocalized.value,
}))

function handleInput(ev: Event) {
  const { data } = ev as InputEvent

  if (is12h.value && data) {
    const dataLowercase = data.toLocaleLowerCase()

    if (dataLowercase === 'a') {
      isAm.value = true
    } else if (dataLowercase === 'p') {
      isAm.value = false
    }
  }

  setTimeout(() => {
    timeInputPickerEl.value?.sync()
  }, 100)
}

// PICKER
const timeInputPickerEl = ref<InstanceType<typeof TimeInputPicker>>()

// WATCH `isAm` changes
watch(isAm, isAm => {
  if (preventNextIsAmChange.value || !is12h.value) {
    return
  }

  if (isTime(props.modelValue)) {
    const { hh, mm } = delocalizedTimeParts.value

    if (isAm && +hh >= 12) {
      emits('update:model-value', `${padStart(String(+hh % 12), 2, '0')}:${mm}`)
    } else if (!isAm && +hh < 12) {
      emits('update:model-value', `${+hh + 12}:${mm}`)
    }
  } else {
    handleManualModelChange(isAm ? '00:00' : '12:00', true)
  }
})

// WATCH `modelValue` changes
watch(
  () => props.modelValue,
  () => {
    preventNextIsAmChange.value = true
    isAm.value = +delocalizedTimeParts.value.hh < 12
  }
)

const {
  el,
  maskedValue,
  wrapperProps,
  hasNoValue,
  handleManualModelChange,
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
} = useInputUtils({
  props: propsExtended,
  maskRef: maskFullTime,
  preventFocusOnTouch: true,
  menuElRef: () => timeInputPickerEl.value?.getMenuEl(),
})

defineExpose({
  focus,
  select,
  blur,
  reset,
  touch,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    ref="wrapperEl"
    v-bind="wrapperProps"
    :has-content="!hasNoValue"
    @click="handleClickWrapper"
  >
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot
        name="prepend"
        :clear="clear"
        :focus="focus"
      />
    </template>

    <input
      ref="el"
      :value="maskedValue"
      flex="1"
      type="text"
      inputmode="decimal"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || label || placeholder"
      class="control"
      :class="[inputClass]"
      :style="inputStyle"
      @focus="handleFocusOrClick"
      @input="handleInput"
    />

    <template #append>
      <div
        v-if="$slots.append || (!readonly && !disabled)"
        flex="~ gap-x-2 center"
        fit
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <template v-if="!readonly && !disabled">
          <!-- AM / PM SWITCH -->
          <Btn
            v-if="is12h"
            flex="shrink"
            :label="isAm ? $t('general.am') : $t('general.pm')"
            size="xs"
            self-end
            color="ca"
            tabindex="-1"
            @click.stop.prevent="isAm = !isAm"
            @mousedown.stop.prevent=""
          />

          <div
            class="time-input-icon"
            bx:time-five
          />
        </template>
      </div>
    </template>

    <template #menu>
      <TimeInputPicker
        ref="timeInputPickerEl"
        v-model:is-am="isAm"
        v-model:prevent-next-is-am-change="preventNextIsAmChange"
        :reference-target="el"
        :is12h="is12h"
        :model-value-localized="modelValueLocalized"
        :handle-manual-model-change="handleManualModelChange"
        :shortcuts="shortcuts"
      />
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.time-input-icon {
  --apply: cursor-pointer color-ca m-x-2 h-6 w-6;
}

.input-wrapper {
  &--xs,
  &--sm {
    .time-input-icon {
      --apply: h-5 w-5;
    }
  }
}
</style>

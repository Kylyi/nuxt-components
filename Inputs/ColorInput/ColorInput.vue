<script setup lang="ts">
// Types
import type { IColorProps } from '~/components/Inputs/ColorInput/types/color-props.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

// Components
import MenuProxy from '~/components/MenuProxy/MenuProxy.vue'
import Field from '~/components/Field/Field.vue'

const props = withDefaults(defineProps<IColorProps>(), {
  icon: 'i-material-symbols:format-color-text-rounded',
  inline: undefined,
  labelInside: undefined,
  required: undefined,
  stackLabel: undefined,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(fieldEl as any)?.querySelector(
    '.wrapper__body'
  ) as HTMLDivElement
})

// Layout
const fieldEl = ref<InstanceType<typeof Field>>()
const referenceEl = ref<HTMLDivElement>()
const menuEl = ref<InstanceType<typeof MenuProxy>>()
const model = useVModel(props, 'modelValue', emits)

const modelLabel = computed(() => {
  if (!model.value) {
    return ''
  }

  const label = $t(`color.${model.value}`)

  return label === `color.${model.value}` ? model.value : label
})

function handlePickColor(color?: string) {
  model.value = color
  // fieldEl.value?.focus()

  // menuEl.value?.hide()
  // nextTick(() => {
  //   fieldEl.value?.blur()
  // })
}

// Field
const { getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  menuElRef: menuEl,
})

const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :no-content="!model"
    @focus="handleFocusOrClick"
  >
    <span :style="{ color: model }">
      {{ modelLabel || '&nbsp;' }}
    </span>

    <MenuProxy
      ref="menuEl"
      manual
      tabindex="-1"
      :fit="false"
      placement="bottom-start"
      :reference-target="referenceEl"
      no-uplift
    >
      <ColorBrandingPicker
        v-model="model"
        :rgba="rgba"
        @update:model-value="handlePickColor"
      />
    </MenuProxy>

    <template #append>
      <div
        :class="icon"
        m="x-2"
        tabindex="-1"
        cursor="pointer"
        :style="{ color: model }"
      />
    </template>
  </Field>
</template>

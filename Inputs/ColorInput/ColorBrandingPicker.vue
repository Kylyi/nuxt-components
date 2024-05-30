<script setup lang="ts">
import { colors } from '@unocss/preset-mini'

// TYPES
import type { ISelectorProps } from '~/components/Selector/types/selector-props.type'

type IProps = {
  modelValue?: string
  rgba?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', val: string | undefined): void
}>()

// Constants
const relevantColors = [
  'yellow',
  'orange',
  'red',
  'pink',
  'fuchsia',
  'purple',
  'cyan',
  'teal',
  'lightBlue',
  'blue',
  'violet',
  'lime',
  'green',
  'emerald',
  'slate',
  'trueGray',
]

const themeColors = [
  'primary',
  'secondary',
  'tertiary',
  'positive',
  'negative',
  'warning',
  'info',
]

// Utils
const { getColor, hexToRgb } = useColors()

// Layout
const model = defineModel<string>()
const { isSupported, open: openEyeDropper, sRGBHex } = useEyeDropper()

const standardColorsByColumn = computed(() => {
  const _colors = pick(colors, relevantColors)

  return Object.entries(_colors).reduce((agg, [key, value]) => {
    const colorShades = new Set(Object.values(value as any))

    agg[key] = Array.from(colorShades)
    if (agg[key]) {
      agg[key]?.splice(agg[key]!.length - 2, 1)
    }

    // Pick every second color
    agg[key] = agg[key]?.filter((_, i) => i % 2 === 0)

    return agg
  }, {} as Record<string, ISelectorProps['options']>)
})

const opacity = computed({
  get() {
    if (model.value?.startsWith('rgba')) {
      return Number(model.value.split(', ')[3].replace(')', '')) * 100
    }
  },
  set(val) {
    if (model.value?.startsWith('rgba')) {
      // Remove `rgba(` and `)`
      const _model = model.value.replace(/^rgba\(|\)$/g, '')
      const [r, g, b, _] = _model.split(',').map(trim)

      model.value = `rgba(${r}, ${g}, ${b}, ${(val ?? 0) / 100})`
    }
  },
})

watch(sRGBHex, value => {
  if (value && props.rgba) {
    model.value = hexToRgb(value)
  }
})

// Methods
function setColor(color: string, isThemeColor = false) {
  if (!props.rgba) {
    if (isThemeColor) {
    model.value = getColor(color, undefined, true)

    return
  }

    model.value = color

    return
  }

  if (isThemeColor) {
    model.value = getColor(color)

    return
  }

  model.value = hexToRgb(color)
}
</script>

<template>
  <div flex="~ col gap-y-3">
    <!-- Theme colors -->
    <div flex="~ col gap-y-px wrap">
      <div text="caption">
        {{ $t('color.theme') }}
      </div>

      <div flex="~ justify-between">
        <div grid="~ flow-col gap-x-px">
          <div
            class="color-block"
            p="x-2"
            w="!fit"
            border="1 ca"
            text="center"
            leading="none"
            flex="~ center"
            @click="model = undefined"
          >
            {{ $t('color.auto') }}
          </div>

          <div
            class="color-block"
            bg="white"
            border="1 ca"
            text="center"
            @click="setColor('#FFFFFF')"
          />

          <div
            class="color-block"
            bg="black"
            text="center"
            @click="setColor('#000000')"
          />

          <div
            v-for="themeColor in themeColors"
            :key="themeColor"
            :style="{ backgroundColor: `var(--color-${themeColor})` }"
            class="color-block"
            @click="setColor(themeColor, true)"
          />
        </div>

        <div grid="~ flow-col gap-x-px">
          <button
            v-if="isSupported"
            class="color-block"
            flex="~ center"
            @click="openEyeDropper()"
          >
            <div class="i-mdi:eyedropper" />
          </button>
        </div>
      </div>
    </div>

    <!-- Standard colors -->
    <div flex="~ col">
      <div
        w="full"
        text="caption"
      >
        {{ $t('color.standard') }}
      </div>

      <div grid="~ gap-x-px flow-col">
        <div
          v-for="(shades, colorKey) in standardColorsByColumn"
          :key="colorKey"
          grid="~ gap-y-px"
        >
          <div
            v-for="shade in shades"
            :key="shade"
            :style="{ backgroundColor: shade }"
            class="color-block"
            @click="setColor(shade)"
          />
        </div>
      </div>
    </div>

    <!-- Customize color -->
    <div
      v-if="typeof opacity === 'number' && rgba"
      flex="~ gap-2"
    >
      <RangeInput
        v-model.number="opacity"
        :step="5"
        h="10"
        grow
      />

      <NumberInput
        v-model="opacity"
        size="sm"
        :min="0"
        :max="100"
        :step="5"
        w="!20"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-block {
  --apply: h-6 w-6 hover:shadow-consistent shadow-ca hover:z-1 cursor-pointer;
}
</style>

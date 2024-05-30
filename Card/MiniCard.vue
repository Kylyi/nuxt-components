<script setup lang="ts">
// Types
import { type IMiniCardProps } from '~/components/Card/types/mini-card-props.type'

// Functions
import { useValueFormatterUtils } from '~/components/ValueFormatter/functions/useValueFormatterUtils'

const props = withDefaults(defineProps<IMiniCardProps>(), {
  emptyValueString: '-',
  previousValue: undefined,
})

// Utils
const { getValueFormatterProps } = useValueFormatterUtils()

const valueFormatterProps = getValueFormatterProps(props)

// Layout
const [DefineTemplate, OriginalValueBtn] = createReusableTemplate()

function getShownValue(val: any) {
  if (isNil(val) || val === '' || (Array.isArray(val) && val.length === 0)) {
    return props.emptyValueString
  }

  return val
}

const isModified = computed(() => {
  if (props.originalValue === undefined) {
    return false
  }

  return !isEqual(props.originalValue, props.value)
})
</script>

<template>
  <div class="value-container-card">
    <div
      v-if="$slots.icon || icon"
      class="value-container-card__icon color-$MiniCard-icon-color"
    >
      <slot name="icon">
        <div
          v-if="icon"
          :class="icon"
          class="h-6 w-6"
        />
      </slot>
    </div>

    <div class="value-container-card__content">
      <div
        class="value-container-card-label"
        :class="labelClass"
      >
        {{ label }}
      </div>

      <ValueFormatter v-bind="valueFormatterProps">
        <template #default="{ val }">
          <slot :val="val">
            <!-- Current value -->
            <span
              v-if="!to || !val"
              class="value-container-card__value"
              :class="[
                valueClass,
                { 'font-bold': !noBold, 'is-modified': isModified },
              ]"
              :style="valueStyle"
            >
              {{ getShownValue(val) }}

              <OriginalValueBtn v-if="isModified" />
            </span>

            <NuxtLink
              v-else
              :to="to"
              class="link"
              :class="[
                valueClass,
                { 'font-bold': !noBold, 'is-modified': isModified },
              ]"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                {{ getShownValue(val) }}

                <OriginalValueBtn v-if="isModified" />
              </span>
            </NuxtLink>
          </slot>
        </template>

        <!-- Previous Value -->
        <template
          v-if="previousValue !== undefined"
          #previousValue="{ val }"
        >
          <div m-t-2>
            <span
              v-if="!toPreviousValue || !val"
              class="value-container-card__value color-purple-500 dark:color-purple-600"
              :class="[previousValueClass, { 'font-bold': !noBold }]"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="toPreviousValue"
              class="link"
              :class="[previousValueClass, { 'font-bold': !noBold }]"
              color="color-purple-500 dark:color-purple-600"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                <span>{{ getShownValue(val) }}</span>
              </span>
            </NuxtLink>
          </div>
        </template>
      </ValueFormatter>
    </div>

    <DefineTemplate>
      <span
        inline-block
        bg="purple-500 dark:purple-600"
        rounded="full"
      >
        <Btn
          size="xs"
          round
          icon="i-solar:history-outline !h-5 !w-5"
          color="white"
          no-dim
        >
          <Menu
            no-uplift
            w="80"
            :ui="{ contentClass: 'p-2' }"
          >
            <span
              font="bold"
              text="caption"
            >
              {{ $t('version.currentValue') }}
            </span>

            <ValueFormatter
              v-bind="valueFormatterProps"
              :value="originalValue"
            >
              <template #default="{ val }">
                {{ getShownValue(val) }}
              </template>
            </ValueFormatter>
          </Menu>
        </Btn>
      </span>
    </DefineTemplate>
  </div>
</template>

<style scoped lang="scss">
.value-container-card {
  --apply: flex rounded-custom p-x-2 p-y-1 flex-gap-2;

  &__icon {
    --apply: shrink-0 m-t-.5;
  }

  &-label {
    --apply: text-caption color-$MiniCard-label-color font-size-$MiniCard-label-font-size p-b-1;
  }

  &__value {
    --apply: text-sm font-size-$MiniCard-value-font-size;
    overflow-wrap: break-word;
    font-weight: var(--MiniCard-value-font-weight);
    white-space: pre-line;

    &.is-modified {
      --apply: p-l-1 rounded-custom;
    }
  }

  &__content {
    --apply: w-full leading-4.5;
  }

  .link {
    --apply: decoration-none font-size-$MiniCard-value-font-size text-sm;
    overflow-wrap: break-word;
    white-space: pre-line;
    font-weight: var(--MiniCard-value-font-weight);

    &__label {
      --apply: relative;

      &::before {
        --apply: content-empty inline-block w-4 min-w-4;
      }

      &:hover {
        --apply: color-blue-500 dark:color-blue-700;

        background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), theme('colors.blue.500') calc(100% - 1px), theme('colors.blue.500') 100%);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: 0% 100%;
      }

      &-icon{
        // top-0.4 makes the icon align with text, no deeper meaning
        --apply: i-ph:link min-h-4 h-4 min-w-4 w-4 absolute left-0 top-0.4;
      }
    }

    &.is-modified {
      --apply: p-l-1 rounded-custom;
    }
  }
}

.dark{
    .link {
      &__label {
        &:hover {
          background-image: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), theme('colors.blue.700') calc(100% - 1px), theme('colors.blue.700') 100%);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: 0% 100%;
        }
      }
    }
  }
</style>

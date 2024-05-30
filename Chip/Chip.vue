<script setup lang="ts">
// Types
import type { IChipProps } from '~/components/Chip/types/chip-props.type'

// Directives
import { vRipple } from '~/libs/App/directives/ripple.directive'

const props = defineProps<IChipProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// Utils
function handleClick() {
  if (props.to) {
    $nav(props.to, undefined, props.navigateToOptions)
  }
}
</script>

<template>
  <div
    v-ripple="ripple"
    class="chip"
    border="ca"
    h="5"
    :class="[
      hasRemove ? 'p-r-1' : 'p-r-2',
      {
        'cursor-pointer': !!to || !!ripple,
        '!overflow-visible': hasCopy,
      },
    ]"
  >
    <div
      v-if="icon"
      :class="icon"
    />

    <CopyBtn
      v-if="hasCopy"
      :model-value="label"
      size="auto"
      color="ca"
      h="4"
      w="4"
      m="x-1"
      position="bottom"
    />

    <div
      class="chip-label"
      :class="[labelClass, { 'justify-center': center }]"
    >
      <slot>
        <NuxtLink
          v-if="to"
          :to="to"
        >
          <template #default="{ route }">
            <a
              :href="route.path"
              class="link"
              truncate
              @click.stop.prevent="handleClick"
            >
              {{ label }}
            </a>
          </template>
        </NuxtLink>

        <span
          v-else
          truncate
        >
          {{ label }}
        </span>
      </slot>
    </div>

    <Btn
      v-if="hasRemove"
      icon="i-eva:close-fill !w-4 !h-4"
      size="auto"
      color="ca"
      h="4"
      w="4"
      self-center
      shrink-0
      tabindex="-1"
      :rounded="false"
      class="rounded"
      @click.stop.prevent="$emit('remove')"
      @mousedown.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.chip {
  --apply: flex gap-2 p-y-3px p-l-2 border-px rounded truncate relative
    leading-tight items-center self-center font-rem-14;

  &-label {
    --apply: flex flex-gap-x-2 flex-1 truncate;
  }
}
</style>

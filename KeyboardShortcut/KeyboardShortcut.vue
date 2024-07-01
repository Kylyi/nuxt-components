<script setup lang="ts">
// Store
import { useAppStore } from '~/libs/App/app.store'

// Types
import type { IKeyboardShortcutProps } from '~/components/KeyboardShortcut/types/keyboard-shortcut-props.type'

const props = defineProps<IKeyboardShortcutProps>()

// Utils
const appStore = useAppStore()
const { isApple } = useDevice()

const hasAnyModifier = computed(() => {
  return props.withCtrl || props.withAlt || props.withShift
})

const isVisible = computed(() => {
  return appStore.lastPointerDownType === 'mouse'
})
</script>

<template>
  <div
    v-if="isVisible"
    class="keyboard-shortcut"
  >
    <!-- Modifier - CTRL -->
    <div
      v-if="withCtrl"
      class="keyboard-shortcut__wrapper"
    >
      <div
        v-if="isApple"
        i-ph:command
        class="icon"
      />
      <div
        v-else
        i-fluent:control-button-20-regular
        class="icon"
      />
    </div>

    <!-- Modifier - ALT -->
    <div
      v-if="withAlt"
      class="keyboard-shortcut__wrapper"
    >
      <div
        v-if="isApple"
        i-ph:option
        class="icon"
      />
      <div
        v-else
        i-tabler:alt
        class="icon"
      />
    </div>

    <!-- Modifier - SHIFT -->
    <div
      v-if="withShift"
      class="keyboard-shortcut__wrapper"
    >
      <div
        i-material-symbols:shift-lock-rounded
        class="icon"
      />
    </div>

    <div v-if="hasAnyModifier">
      +
    </div>

    <!-- Key -->
    <div class="keyboard-shortcut__wrapper">
      <div
        :class="icon"
        font="rem-14"
      >
        {{ char }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.keyboard-shortcut {
  @apply flex gap-1 items-center font-mono color-ca leading-none;

  &__wrapper {
    @apply flex flex-center border-1 border-ca rounded-1 w-4.5 h-4.5
      bg-white color-darker dark:(bg-darker color-white);

    & > .icon {
      @apply h-4 w-4;
    }
  }
}
</style>

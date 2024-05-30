<script setup lang="ts">
type IProps = {
  rows?: any[]
}

const props = defineProps<IProps>()

const hasRows = computed(() => props.rows && props.rows?.length > 0)
</script>

<template>
  <div
    class="loading"
    :class="{ 'is-absolute': hasRows }"
    data-cy="loading-table"
  >
    <div
      class="flex flex-center"
      relative
      min-w="30"
      backdrop="blur-sm"
    >
      <LoaderInline
        size="sm"
        bg="white dark:darker"
        rounded="full"
        h="8"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  --apply: flex flex-center z-1;

  &.is-absolute {
    --apply: absolute inset-inline-0 bottom-0 h-10;
  }
}
</style>

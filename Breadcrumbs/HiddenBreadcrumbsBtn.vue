<script setup lang="ts">
// Types
import { IBreadcrumb } from '~/components/Breadcrumbs/types/breadcrumb.type'

defineProps<{
  breadcrumbs: IBreadcrumb[]
}>()
</script>

<template>
  <Btn label="...">
    <Menu
      hide-header
      :no-arrow="false"
    >
      <Btn
        v-for="breadcrumb in breadcrumbs"
        :key="breadcrumb.to?.toString()"
        v-bind="breadcrumb"
        no-active-link
        color="dark dark:light"
        size="sm"
        no-uppercase
      />
    </Menu>
  </Btn>
</template>

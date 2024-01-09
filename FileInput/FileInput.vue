<script setup lang="ts">
import { config } from '~/config'

// Types
import type { IFile } from '~/components/FileInput/types/file.type'
import type { IFileInputProps } from '~/components/FileInput/types/file-input-props.type'

// Functions
import { useFieldUtils } from '~/components/Field/functions/useFieldUtils'

const props = withDefaults(defineProps<IFileInputProps>(), {
  maxChipsRows: 3,
  downloadUrl: config.fileInput.downloadUrl,
})
const emits = defineEmits<{
  (e: 'update:modelValue', value: Array<File | IFile>): void
  (e: 'filesAdded', value: Array<File | IFile>): void
  (e: 'filesRemoved', value: Array<File | IFile>): void
}>()

// Utils
const { getFieldProps } = useFieldUtils()

// Layout
const fileInputWrapperEl = ref<HTMLDivElement>()
const model = useVModel(props, 'modelValue', emits)
const fieldProps = getFieldProps(props)

const wrapperClass = computed(() => {
  return {
    'is-dragger-over': isOverDropZone.value,
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
  }
})

// File handling
const { isOverDropZone } = useDropZone(fileInputWrapperEl, handleAdd)
const { open, onChange, reset } = useFileDialog({
  accept: props.accept,
  multiple: props.multi,
})

function handleOpen() {
  if (!props.readonly && !props.disabled) {
    open()
  }
}

function handleAdd(files: FileList | File[] | null) {
  if (!files) {
    return
  }

  const filesArray = Array.from(files)
  emits('filesAdded', filesArray)

  if (props.multi) {
    model.value = [...(model.value || []), ...filesArray]
  } else {
    model.value = filesArray
  }

  reset()
}

function handleRemove(idx: number) {
  if (!model.value) {
    return
  }

  const removed = model.value.splice(idx, 1)
  emits('filesRemoved', removed)
  emits('update:modelValue', [...model.value])
}

onChange(handleAdd)
</script>

<template>
  <Field
    v-bind="fieldProps"
    :no-content="!model?.length"
    no-border
    control-class="!p-0"
    stack-label
  >
    <div
      ref="fileInputWrapperEl"
      class="file-input-wrapper"
      :class="[
        wrapperClass,
        props.innerWrapperClass,
        {
          'no-border': props.noBorder,
        },
      ]"
      @click.stop.prevent="handleOpen"
    >
      <FilePreview
        v-for="(file, idx) in model"
        :key="idx"
        :file="file"
        :editable="!readonly && !disabled"
        :no-download-button="noDownloadButton"
        :download-url="downloadUrl"
        @remove="handleRemove(idx)"
      />

      <div
        v-if="!model?.length"
        class="file-input-wrapper-hint"
        :class="props.hintClass"
      >
        <div
          ic:sharp-cloud-upload
          h="16"
          w="16"
        />
        <div
          text="center"
          p="x-3"
        >
          {{ $t('filesUpload') }}
        </div>
      </div>
    </div>
  </Field>
</template>

<style scoped lang="scss">
.file-input-wrapper {
  --apply: grid gap-2 p-2 rounded-3 relative min-h-35 overflow-auto;
  --apply: dark:bg-darker bg-white;

  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));

  &.is-dragger-over,
  &:hover {
    :not(.no-border){
      --apply: dark:border-true-gray-600 border-true-gray-300;
    }

    .file-input-wrapper-hint {
      --apply: color-darker dark:color-light-800;
    }
  }

  &-hint {
    --apply: absolute grid place-items-center inset-0;
    --apply: color-true-gray-500;
  }

  &:not(.is-readonly) {
    --apply: cursor-pointer;
  }

  &:not(.no-border){
    --apply: border-2 border-dashed dark:border-true-gray-600/50 border-true-gray-300/80;
  }
}
</style>

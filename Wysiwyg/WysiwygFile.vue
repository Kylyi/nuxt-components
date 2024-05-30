<script lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

// Models
import type { FileModel } from '~/components/FileInput/models/file.model';
import { filesByFilepathKey } from '~/components/Wysiwyg/provide/wysiwyg.provide';

export default {
  components: { NodeViewWrapper },
  props: nodeViewProps,

  setup(props) {
    const { files: deepFiles } = useFiles()
    const { handleRequest } = useRequest()
    const uuid = props.node.attrs.uuid
    const self = getCurrentInstance()
    const providedData = inject<IItem>('providedData')
    const removeElement = inject<Function>('removeElement')
    const syncFilesHTML = inject<Function>('syncFilesHTML')

    // Files provided through the Wysiwyg component
    const injectedFiles = inject(filesByFilepathKey, ref({}))

    // New files uploaded through and grouped by the `uuid`
    const componentData = providedData?.[uuid]

    const files = computed(() => {
      const uploadedFilesPaths = props.node.attrs.files
        ?.split('__|__')
        .map(trim)
        .filter(Boolean) as string[]

      const uploadedFiles = uploadedFilesPaths
        .map(id => injectedFiles.value?.[id])
        .filter(Boolean) as IFile[]

      return [
        ...(componentData?.files?.filter(Boolean) ?? []),
        ...uploadedFiles
      ] as Array<IFile | FileModel>
    })

    function handleRemoveElement(idx: number) {
      const file = files.value?.[idx] as FileModel

      if (!file) {
        return
      }

      componentData!.files = files.value?.filter((_, i: number) => i !== idx)

      file.delete(handleRequest)

      if (!providedData![uuid].files.length) {
        removeElement?.(self?.vnode.el)
      }

    }

    // When this component is mounted (~ an image is inserted into the Wysiwyg editor, upload the files)
    onMounted(() => {
      nextTick(() => {
        files.value.forEach(file => {
          if ('id' in file) {
            return
          }

          file.upload?.(handleRequest).then(() => syncFilesHTML?.())
        })
      })
    })

    syncRef(files, deepFiles, { direction: 'both', deep: true })

    // onBeforeUnmount(() => {
    //   files.value.forEach((file: FileModel) => file.delete(handleRequest))
    // })

    return {
      files,
      removeElement,
      componentData,
      handleRemoveElement,
    }
  },
}
</script>

<template>
  <NodeViewWrapper class="wysiwyg-file">
    <FilePreview
      v-for="(file, idx) in files"
      :key="idx"
      :file="file"
      data-drag-handle
      :editable="!('id' in file)"
      @remove="handleRemoveElement(idx)"
    />
  </NodeViewWrapper>
</template>

<style lang="scss" scoped>
.wysiwyg-file {
  @apply cursor-default grid gap-2;

  @apply border-2 border-dashed p-2 rounded-3 relative overflow-auto;
  @apply dark:border-true-gray-600/50 border-true-gray-300/80;
  @apply dark:bg-darker bg-white;

  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
</style>

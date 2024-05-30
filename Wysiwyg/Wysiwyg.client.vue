<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'

// TipTap Extensions
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Mention } from '@tiptap/extension-mention'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Dropcursor } from '@tiptap/extension-dropcursor'

// Types
import type { ClientRectObject } from '@floating-ui/vue'
import type { IWysiwygProps } from '~/components/Wysiwyg/types/wysiwyg-props.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

// Models
import { FileModel } from '~/components/FileInput/models/file.model'

// Functions
import { useWysiwygUtils } from '~/components/Wysiwyg/functions/useWysiwygUtils'
import { useInputWrapperUtils } from '~/components/Inputs/functions/useInputWrapperUtils'

// Components
import WysiwygMention from '~/components/Wysiwyg/WysiwygMention.vue'

// Injections
import { editorKey, filesByFilepathKey, mentionItemsKey } from '~/components/Wysiwyg/provide/wysiwyg.provide'

const props = withDefaults(defineProps<IWysiwygProps>(), {
  autoResolveFiles: true,
  errorVisible: true,
})

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

defineExpose({
  resolveValues: () => {
    if (editor.value) {
      resolveValues(editor.value.view)
    }
  },
})

// Utils
const { FileComponent, resolveValues } = useWysiwygUtils()
const { getInputWrapperProps } = useInputWrapperUtils()

// Layout
const editorEl = ref<any>()
const model = defineModel()
const isFocused = ref(false)
const providedData = reactive<IItem>({})

provide('providedData', providedData)

const mentionItems = injectStrict(mentionItemsKey, toRef(props, 'mentionItems'))

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-fade-in animate-duration-150',
  leaveActiveClass: 'animate-fade-out animate-duration-150',
}))

const ui = computed(() => {
  return {
    ...props.ui,
    contentClass: [props.ui?.contentClass, 'selector-wrapper'],
  } as typeof props.ui
})

// Wrapper
const wrapperProps = getInputWrapperProps(props)

// TipTap Extensions
// Placeholder https://tiptap.dev/api/extensions/placeholder
const PlaceholderExt = Placeholder.configure({
  placeholder: () => props.placeholder || '',
  emptyNodeClass: 'is-empty',
})

// TextAlign https://tiptap.dev/api/extensions/text-align
const TextAlignExt = TextAlign.configure({
  types: ['paragraph', 'heading'],
})

// Color https://tiptap.dev/api/extensions/color
const ColorExt = Color.configure({
  types: ['textStyle'],
})

// Image https://tiptap.dev/api/extensions/image
const ImageExt = Image.configure(typeof props.image === 'boolean' ? {} : props.image)

// Link https://tiptap.dev/api/marks/link
const LinkExt = Link.extend({
  // @ts-expect-error Idk
  addKeyboardShortcuts() {
    return {
      ArrowRight: ({ editor }) => {
        if (!editor.isActive('link')) {
          return
        }

        const { from, to, $anchor } = editor.state.selection
        const transaction = editor.state.tr

        // Check if the cursor is at the end of the link
        if ($anchor && $anchor.nodeAfter && $anchor.nodeAfter.isText) {
          return
        }

        transaction.removeMark(from, to, editor.schema.marks.link)

        if ($anchor) {
          transaction.removeStoredMark(editor.schema.marks.link)
        }

        editor.view.dispatch(transaction)

        editor.chain().focus().insertContent(' ').run()

        return true
      },
    }
  },
}).configure({
  openOnClick: 'whenNotEditable',
  protocols: ['ftp', 'mailto'],
  HTMLAttributes: {
    class: 'link',
  },
})

// Dropcursor https://tiptap.dev/api/extensions/dropcursor
const DropcursorExt = Dropcursor.configure()

// Mention https://tiptap.dev/api/nodes/mention
const mentionEl = ref<InstanceType<typeof WysiwygMention>>()
const selectFnc = ref<Function>(() => {})
const mentionItemsFiltered = ref<IWysiwygMentionItem[]>([])
const getRectFnc = ref<() => ClientRectObject>(() => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
}))

const MentionExt = Mention.configure({
  renderLabel: ({ node, options }) => {
    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}}`
  },
  suggestion: {
    char: '{{',
    items: ({ query }) => {
      if (!query) {
        mentionItemsFiltered.value = toValue(mentionItems) || []
      }

      mentionItemsFiltered.value = (toValue(mentionItems) || []).filter(
        item => {
          return item.label.toLowerCase().startsWith(query.toLowerCase())
        },
      )

      return []
    },
    render: () => {
      return {
        onStart: ({ clientRect, command }) => {
          if (!clientRect || !isFocused.value) {
            return
          }

          getRectFnc.value = clientRect as () => ClientRectObject
          mentionEl.value?.show()
          selectFnc.value = command
        },
        onKeyDown: ({ event, view }) => {
          mentionEl.value?.onKeyDown(event)

          if (event.key === 'Enter' && props.autoResolveMentions) {
            nextTick(() => resolveValues(view))
          }

          return event.key !== 'Escape' && event.key !== 'Backspace'
        },
        onExit: () => {
          mentionEl.value?.hide()
        },
      }
    },
  },
})

// Editor
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    // Extensions
    StarterKit,
    PlaceholderExt,
    TextAlignExt,
    Underline,
    TextStyle,
    ColorExt,
    DropcursorExt,
    ...(toValue(mentionItems) ? [MentionExt] : []),
    ...(props.fileUpload ? [FileComponent()] : []),
    ...(props.image ? [ImageExt] : []),
    ...(props.allowLink ? [LinkExt] : []),
  ],
  editable: !props.readonly && !props.disabled,
  editorProps: {
    attributes: {
      class: 'wysiwyg',
    },
  },
  onUpdate: ({ editor }) => {
    const text = editor.getText()
    if (text.length) {
      model.value = editor.getHTML()
    } else {
      model.value = props.emptyValue
    }
  },
  onFocus() {
    isFocused.value = true
  },
  onBlur() {
    isFocused.value = false
  },
})

function removeElement(el: HTMLElement | null) {
  el?.remove()
}

const isSinkVisible = computed(() => {
  const isEditable = !props.readonly && !props.disabled

  return (isFocused.value || props.sinkAlwaysVisible)
    && isEditable
    && !props.noSink
})

// Uploaded files that the Wysiwyg must have access to, by their path
const filesByPath = computed(() => {
  return props.files?.reduce((agg, file) => {
    agg[file.path] = file

    return agg
  }, {} as Record<IFile['path'], Pick<IFile, 'id' | 'path' | 'name'>>)
})

function syncFilesHTML() {
  if (!editor.value) {
    return ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(editor.value?.getHTML(), 'text/html')

  const fileNodes = doc.querySelectorAll('wysiwyg-file')
  const newFileNodes = Array.from(fileNodes).filter(node => {
    return providedData[node.getAttribute('uuid') ?? '']
  })

  newFileNodes.forEach(node => {
    node.setAttribute(
      'files',
      providedData[node.getAttribute('uuid') ?? ''].files
        ?.map((file: FileModel) => file.uploadedFile?.filepath).join('__|__'),
    )
  })

  model.value = doc.body.innerHTML
  editor.value?.chain().setContent(doc.body.innerHTML).run()
}

provide(editorKey, editor)
provide(filesByFilepathKey, filesByPath)
provide('removeElement', removeElement)
provide('syncFilesHTML', syncFilesHTML)

// Editor commands
function focusEditor() {
  if (!editor.value?.isFocused) {
    editor.value?.chain().focus().run()
  }
}

// Watch model to update editor content (only if not focused)
watch(model, model => {
  if (!isFocused.value) {
    editor.value?.chain().setContent(model ?? '').run()
  }
})

// Watch readonly prop and set editor editable
watch(
  () => props.readonly,
  isReadonly => {
    editor.value?.setEditable(!isReadonly)
  },
)

onMounted(() => {
  nextTick(() => {
    if (props.mentionReplace && editor.value) {
      resolveValues(editor.value.view)
    }

    // Handle files drop
    editor.value?.view.dom.addEventListener('drop', event => {
      event.preventDefault()

      const droppedFiles = Array.from(event.dataTransfer?.files || [])

      if (droppedFiles.length) {
        const files = droppedFiles.map(file => new FileModel({ file }))

        const uuid = generateUUID()
        providedData[uuid] = { files }

        const pos = editor.value?.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })

        if (pos) {
          editor.value?.chain().focus()
            .insertContentAt(pos.pos, `<wysiwyg-file uuid="${uuid}" />`)
            .run()
        }
      }
    })
  })
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :has-content="!!modelValue"
    class="relative"
    :ui="ui"
    @mousedown="focusEditor"
  >
    <EditorContent
      ref="editorEl"
      class="control"
      :editor="editor"
      min-h="50"
      :class="editorClass"
      :style="editorStyle"
      @drop.stop.prevent
    />

    <WysiwygMention
      ref="mentionEl"
      :get-rect="getRectFnc"
      :select-fnc="selectFnc"
      :items="mentionItemsFiltered"
    />

    <template #menu>
      <Transition
        appear
        v-bind="transitionProps"
      >
        <WysiwygSink
          v-if="isSinkVisible && editor"
          :editor="editor"
          class="wysiwyg-sink"
          :allow-link="allowLink"
        />
      </Transition>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.control {
  --apply: w-full;
}

.wysiwyg {
  &-sink {
    --apply: absolute -top-40px right-0 w-full;
  }
}

:deep(.wysiwyg) {
  --apply: outline-none fit;

  p.is-empty:first-child::before {
    content: attr(data-placeholder);

    --apply: color-gray-500 dark: color-gray-400 float-left h-0
      pointer-events-none;
  }

  [data-type='mention'] {
    --apply: italic;
  }
}

:deep(.wysiwyg-file) {
  // @apply w-fit;
}

:deep(.ProseMirror-selectednode) {
  @apply outline-2 outline-solid outline-primary rounded-custom;
}
</style>

import type { Editor } from '@tiptap/vue-3'

// Types
import type { IItem } from '~/libs/Shared/types/item.type'
import type { IWysiwygMentionItem } from '~/components/Wysiwyg/types/wysiwyg-mention-item.type'

export const editorKey: InjectionKey<Ref<Editor | null | undefined> | undefined>
  = Symbol('editor')

export const filesByFilepathKey: InjectionKey<Ref<Record<IFile['path'], Pick<IFile, 'id' | 'path' | 'name'>> | undefined>>
  = Symbol('filesByPath')

export const mentionItemsKey: InjectionKey<
  MaybeRefOrGetter<IWysiwygMentionItem[] | null | undefined> | undefined
> = Symbol('mentionItems')

export const mentionEntityKey: InjectionKey<
  MaybeRefOrGetter<IItem | null | undefined> | undefined
> = Symbol('mentionEntity')

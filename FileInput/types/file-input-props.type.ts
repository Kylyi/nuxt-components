// Types
import type { IFile } from '~/components/FileInput/types/file.type'
import type { IZodValidationItem } from '~/utils/zod/types/zod-validation-item.type'

export interface IFileInputProps {
  accept?: string
  contentClass?: ClassType
  innerWrapperClass?: ClassType
  disabled?: boolean
  downloadUrl?: string
  errorTakesSpace?: boolean
  hint?: string
  hintClass?: ClassType
  loading?: boolean
  modelValue?: Array<File | IFile> | null
  multi?: boolean
  noBorder?: boolean
  placeholder?: string
  readonly?: boolean
  scroller?: boolean

  /**
   * Is relevant only for `multi` and input-like mode
   */
  maxChipsRows?: number

  /**
   * Whether to hide the download button
   */
  noDownloadButton?: boolean

  /**
   * Validation object
   */
  validation?: IZodValidationItem
}

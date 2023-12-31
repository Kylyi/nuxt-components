import Fuse from 'fuse.js'

// TYPES
import type { IItem } from '~~/libs/App/types/item.type'

/**
 *
 * @param fuseSearchResult result you get from useFuse (fuzzy search)
 * @param highlightClassName optionally, you can set the class for each of the matched parts
 * @returns a string of HTML code with highlighted parts, check example below to see how it should be used in template
 *
 * @example <span v-html="<whatever_is_returned>" />
 */
export function highlight<T = IItem>(
  fuseSearchResult: Array<Fuse.FuseResult<T>>,
  keys: Fuse.FuseOptionKey<any>[],
  highlightClassName = 'fuse-highlighted'
) {
  let hasExactMatch = false

  const generateHighlightedText = (
    highlighted: string,
    inputText = '',
    regions: readonly Fuse.RangeTuple[]
  ) => {
    let content = ''
    let nextUnhighlightedRegionStartingIndex = 0

    regions.forEach(region => {
      const lastRegionNextIndex = region[1] + 1

      content += [
        inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]),
        `<span class="${highlightClassName}">`,
        inputText.substring(region[0], lastRegionNextIndex),
        '</span>',
      ].join('')

      nextUnhighlightedRegionStartingIndex = lastRegionNextIndex
    })

    content += inputText.substring(nextUnhighlightedRegionStartingIndex)

    return `${highlighted.trim()} ${content}`
  }

  const highlightedResult = fuseSearchResult
    .filter(({ matches }) => matches && matches.length)
    .map(({ item, matches, score }) => {
      let highlighted = ''

      keys.forEach(key => {
        const match = matches?.find(match => match.key === key)

        highlighted = match
          ? generateHighlightedText(highlighted, match.value, match.indices)
          : `${highlighted} ${get(item, key as string)}`
      })

      hasExactMatch = hasExactMatch || score! <= Number.EPSILON

      return { item, highlighted }
    })

  return { highlightedResult, hasExactMatch }
}

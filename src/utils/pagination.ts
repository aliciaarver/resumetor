export const A4_MM_WIDTH = 210
export const A4_MM_HEIGHT = 297
export const MM_TO_PX = 3.7795275591
export const A4_PX_WIDTH = A4_MM_WIDTH * MM_TO_PX
export const A4_PX_HEIGHT = A4_MM_HEIGHT * MM_TO_PX

export interface PagedLayout {
  height: number
  pageStarts: number[]
}

export function measurePagedLayout(element: HTMLElement | null): PagedLayout {
  if (!element) {
    return {
      height: A4_PX_HEIGHT,
      pageStarts: [0],
    }
  }

  const height = Math.max(
    A4_PX_HEIGHT,
    element.scrollHeight,
    element.offsetHeight,
    element.clientHeight,
  )

  const rootRect = element.getBoundingClientRect()
  const scaleX =
    rootRect.width > 0 && element.offsetWidth > 0 ? rootRect.width / element.offsetWidth : 1
  const scaleY =
    rootRect.height > 0 && element.offsetHeight > 0
      ? rootRect.height / element.offsetHeight
      : scaleX || 1
  const blocks = Array.from(element.querySelectorAll<HTMLElement>('[data-page-block]')).map(
    (block) => {
      const rect = block.getBoundingClientRect()

      return {
        top: (rect.top - rootRect.top) / scaleY,
        bottom: (rect.bottom - rootRect.top) / scaleY,
        height: rect.height / scaleY,
        kind: block.dataset.pageBlockKind ?? 'item',
      }
    },
  )

  if (!blocks.length) {
    return {
      height,
      pageStarts: Array.from(
        { length: Math.ceil(height / A4_PX_HEIGHT) },
        (_, index) => index * A4_PX_HEIGHT,
      ),
    }
  }

  const pageStarts = [0]
  let currentStart = 0
  let currentLimit = A4_PX_HEIGHT

  blocks.forEach((block, index) => {
    const nextBlock = blocks[index + 1]
    const shouldKeepWithNext =
      block.kind === 'heading' &&
      !!nextBlock &&
      nextBlock.height < A4_PX_HEIGHT &&
      nextBlock.bottom > currentLimit

    const shouldMoveToNextPage =
      (block.height < A4_PX_HEIGHT && block.bottom > currentLimit && block.top > currentStart) ||
      (shouldKeepWithNext && block.top > currentStart)

    if (shouldMoveToNextPage) {
      currentStart = block.top
      currentLimit = currentStart + A4_PX_HEIGHT
      pageStarts.push(currentStart)
    }
  })

  const lastStart = pageStarts[pageStarts.length - 1] ?? 0
  if (height - lastStart > A4_PX_HEIGHT) {
    let nextStart = lastStart + A4_PX_HEIGHT
    while (nextStart < height) {
      pageStarts.push(nextStart)
      nextStart += A4_PX_HEIGHT
    }
  }

  return {
    height,
    pageStarts,
  }
}

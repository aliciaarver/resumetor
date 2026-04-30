import { describe, it, expect, beforeEach, vi } from 'vitest'
import { measurePagedLayout, A4_PX_HEIGHT } from './pagination'

function makeElement(blocks: Array<{ top: number; bottom: number; kind?: string }>): HTMLElement {
  const root = document.createElement('div')

  Object.defineProperty(root, 'scrollHeight', { value: blocks[blocks.length - 1]?.bottom ?? A4_PX_HEIGHT, configurable: true })
  Object.defineProperty(root, 'offsetHeight', { value: blocks[blocks.length - 1]?.bottom ?? A4_PX_HEIGHT, configurable: true })
  Object.defineProperty(root, 'clientHeight', { value: blocks[blocks.length - 1]?.bottom ?? A4_PX_HEIGHT, configurable: true })

  const rootRect = { top: 0, bottom: blocks[blocks.length - 1]?.bottom ?? A4_PX_HEIGHT, left: 0, right: 794, width: 794, height: blocks[blocks.length - 1]?.bottom ?? A4_PX_HEIGHT, x: 0, y: 0, toJSON: () => {} }
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(rootRect as DOMRect)
  Object.defineProperty(root, 'offsetWidth', { value: 794, configurable: true })

  const blockElements = blocks.map(({ top, bottom, kind = 'item' }) => {
    const el = document.createElement('div')
    el.dataset.pageBlock = ''
    el.dataset.pageBlockKind = kind
    const height = bottom - top
    Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true })
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top, bottom, left: 0, right: 794, width: 794, height, x: 0, y: top, toJSON: () => {},
    } as DOMRect)
    return el
  })

  vi.spyOn(root, 'querySelectorAll').mockReturnValue(blockElements as unknown as NodeListOf<HTMLElement>)

  return root
}

describe('measurePagedLayout', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('no splits: item crosses page boundary → moved to next page', () => {
    const el = makeElement([
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1300 }, // crosses A4_PX_HEIGHT (~1122)
    ])
    const { pageStarts } = measurePagedLayout(el)
    expect(pageStarts).toEqual([0, 800])
  })

  it('cascades: two consecutive items cross their respective page limits', () => {
    const el = makeElement([
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1200 },  // crosses page 1 → page break at 800
      { top: 1200, bottom: 2000 }, // crosses page 2 (800+1122=1922) → page break at 1200
    ])
    const { pageStarts } = measurePagedLayout(el)
    expect(pageStarts).toEqual([0, 800, 1200])
  })

  it('heading stays with first item: both moved to next page', () => {
    const el = makeElement([
      { top: 0, bottom: 700 },
      { top: 900, bottom: 950, kind: 'heading' },
      { top: 950, bottom: 1200 }, // first item after heading crosses page boundary
    ])
    const { pageStarts } = measurePagedLayout(el)
    // heading + item should both be on page 2
    expect(pageStarts[1]).toBe(900)
    expect(pageStarts.length).toBe(2)
  })

  it('tall block: item taller than page counted in tallBlocks', () => {
    const el = makeElement([
      { top: 0, bottom: 500 },
      { top: 500, bottom: 1800 }, // height 1300 > A4_PX_HEIGHT
    ])
    const { tallBlocks } = measurePagedLayout(el)
    expect(tallBlocks).toBe(1)
  })

  it('no tall blocks when all items fit on one page', () => {
    const el = makeElement([
      { top: 0, bottom: 200 },
      { top: 200, bottom: 600 },
    ])
    const { tallBlocks } = measurePagedLayout(el)
    expect(tallBlocks).toBe(0)
  })

  it('item exactly at page boundary is not split', () => {
    const boundary = Math.round(A4_PX_HEIGHT)
    const el = makeElement([
      { top: 0, bottom: 900 },
      { top: 900, bottom: boundary + 1 }, // just barely crosses
    ])
    const { pageStarts } = measurePagedLayout(el)
    expect(pageStarts[1]).toBe(900)
  })

  it('returns pageStarts [0] for empty resume', () => {
    const el = makeElement([])
    const { pageStarts } = measurePagedLayout(el)
    expect(pageStarts[0]).toBe(0)
  })
})

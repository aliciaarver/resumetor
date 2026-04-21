interface PdfTextItemLike {
  str: string
  transform: number[]
  width: number
  height?: number
  hasEOL?: boolean
}

interface PdfToken {
  text: string
  x: number
  y: number
  width: number
  height: number
  end: number
  charWidth: number
  hasEOL: boolean
}

interface PdfLine {
  text: string
  xStart: number
  xEnd: number
  width: number
  y: number
  height: number
  isBullet: boolean
  isHeading: boolean
}

export function normalizePdfPageText(items: unknown[], pageWidth: number): string {
  const tokens = items
    .filter(isPdfTextItem)
    .map(toPdfToken)
    .filter((token) => token.text)

  if (!tokens.length) {
    return ''
  }

  const lines = buildLines(tokens)
  if (!lines.length) {
    return ''
  }

  const orderedLines = orderLines(lines, pageWidth)
  const paragraphs = buildParagraphs(orderedLines)

  return paragraphs.join('\n\n')
}

function isPdfTextItem(item: unknown): item is PdfTextItemLike {
  return Boolean(
    item &&
    typeof item === 'object' &&
    'str' in item &&
    'transform' in item &&
    'width' in item &&
    typeof (item as { str?: unknown }).str === 'string' &&
    Array.isArray((item as { transform?: unknown }).transform) &&
    typeof (item as { width?: unknown }).width === 'number',
  )
}

function toPdfToken(item: PdfTextItemLike): PdfToken {
  const text = normalizeTokenText(item.str)
  const x = item.transform[4] ?? 0
  const y = item.transform[5] ?? 0
  const height = Math.max(
    1,
    Math.abs(item.height ?? 0),
    Math.abs(item.transform[0] ?? 0),
    Math.abs(item.transform[3] ?? 0),
  )
  const width = Math.max(item.width, text.replace(/\s+/g, '').length * 2)

  return {
    text,
    x,
    y,
    width,
    height,
    end: x + width,
    charWidth: width / Math.max(text.replace(/\s+/g, '').length, 1),
    hasEOL: Boolean(item.hasEOL),
  }
}

function normalizeTokenText(value: string): string {
  return value
    .replace(/\0/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[•◦▪●]/g, '•')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLines(tokens: PdfToken[]): PdfLine[] {
  const sortedTokens = [...tokens].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
    return a.x - b.x
  })

  const lineTolerance = clamp(median(sortedTokens.map((token) => token.height)) * 0.45, 2, 8)
  const rawLines: Array<{ y: number; tokens: PdfToken[] }> = []

  sortedTokens.forEach((token) => {
    const targetLine = rawLines
      .filter((line) => Math.abs(line.y - token.y) <= lineTolerance)
      .sort((a, b) => Math.abs(a.y - token.y) - Math.abs(b.y - token.y))[0]

    if (targetLine) {
      targetLine.tokens.push(token)
      targetLine.y =
        (targetLine.y * (targetLine.tokens.length - 1) + token.y) / targetLine.tokens.length
      return
    }

    rawLines.push({ y: token.y, tokens: [token] })
  })

  const lineHeights = rawLines.map((line) => Math.max(...line.tokens.map((token) => token.height)))
  const medianHeight = median(lineHeights)

  return rawLines
    .map((line) => finalizeLine(line.tokens, line.y, medianHeight))
    .filter((line): line is PdfLine => Boolean(line?.text))
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })
}

function finalizeLine(tokens: PdfToken[], y: number, medianHeight: number): PdfLine | null {
  const sorted = [...tokens].sort((a, b) => a.x - b.x)
  let text = ''
  let previous: PdfToken | null = null

  sorted.forEach((token) => {
    if (!token.text) return

    if (!text) {
      text = token.text
      previous = token
      return
    }

    const gap = previous ? token.x - previous.end : 0
    const previousChar = text.slice(-1)
    const nextChar = token.text[0]
    const spaceThreshold = Math.max(2, Math.min(previous?.charWidth ?? 2, token.charWidth) * 0.7)

    if ((previous?.hasEOL ?? false) || token.hasEOL) {
      text = mergeSoftBreak(text, token.text)
    } else if (isSoftHyphenBreak(text, token.text)) {
      text = `${text.slice(0, -1)}${token.text}`
    } else if (shouldAddSpace(previousChar, nextChar, gap, spaceThreshold)) {
      text = `${text} ${token.text}`
    } else {
      text = `${text}${token.text}`
    }

    previous = token
  })

  const normalizedText = normalizeLineText(text)
  if (!normalizedText) return null

  const xStart = Math.min(...sorted.map((token) => token.x))
  const xEnd = Math.max(...sorted.map((token) => token.end))
  const height = Math.max(...sorted.map((token) => token.height))

  return {
    text: normalizedText,
    xStart,
    xEnd,
    width: xEnd - xStart,
    y,
    height,
    isBullet: isBulletLine(normalizedText),
    isHeading: isHeadingLine(normalizedText, height, medianHeight),
  }
}

function normalizeLineText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^•\s*/, '- ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function orderLines(lines: PdfLine[], pageWidth: number): PdfLine[] {
  const narrowLines = lines.filter((line) => line.width < pageWidth * 0.72)
  const splitX = detectColumnSplit(narrowLines, pageWidth)

  if (!splitX) {
    return [...lines].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })
  }

  const leftLines = lines
    .filter((line) => line.xStart < splitX)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })

  const rightLines = lines
    .filter((line) => line.xStart >= splitX)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })

  if (
    isAuxiliaryMetaColumn(leftLines, rightLines, pageWidth) ||
    isAuxiliaryMetaColumn(rightLines, leftLines, pageWidth)
  ) {
    return [...lines].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })
  }

  const topOfColumns = Math.max(
    leftLines[0]?.y ?? Number.NEGATIVE_INFINITY,
    rightLines[0]?.y ?? Number.NEGATIVE_INFINITY,
  )

  const preamble = lines
    .filter((line) => line.width >= pageWidth * 0.72 && line.y > topOfColumns)
    .sort((a, b) => b.y - a.y)

  const used = new Set<PdfLine>([...preamble, ...leftLines, ...rightLines])
  const tailWideLines = lines
    .filter((line) => !used.has(line))
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.1) return b.y - a.y
      return a.xStart - b.xStart
    })

  return [...preamble, ...leftLines, ...rightLines, ...tailWideLines]
}

function isAuxiliaryMetaColumn(
  candidate: PdfLine[],
  counterpart: PdfLine[],
  pageWidth: number,
): boolean {
  if (candidate.length < 2 || counterpart.length < 4) return false

  const medianWidth = median(candidate.map((line) => line.width))
  if (medianWidth > pageWidth * 0.22) return false

  const dateLikeCount = candidate.filter((line) => isDateLikeMetaLine(line.text)).length
  const mostlyDateLike = dateLikeCount / candidate.length >= 0.5
  if (!mostlyDateLike) return false

  const counterpartMedianWidth = median(counterpart.map((line) => line.width))
  return counterpartMedianWidth > medianWidth * 1.8
}

function isDateLikeMetaLine(text: string): boolean {
  return /\b(?:present|current|now|по\s*наст\w*|\d{1,2}[/-]\d{4}|\d{4}[.-]\d{2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|янв(?:арь|аря)?|фев(?:раль|раля)?|мар(?:т|та)?|апр(?:ель|еля)?|ма[йя]|июн(?:ь|я)?|июл(?:ь|я)?|авг(?:уст|уста)?|сен(?:тябрь|тября)?|окт(?:ябрь|ября)?|ноя(?:брь|бря)?|дек(?:абрь|абря)?)\b/i.test(
    text,
  )
}

function detectColumnSplit(lines: PdfLine[], pageWidth: number): number | null {
  if (lines.length < 8) {
    return null
  }

  const xStarts = lines.map((line) => line.xStart).sort((a, b) => a - b)
  let bestGap = 0
  let bestSplit = 0

  for (let index = 0; index < xStarts.length - 1; index++) {
    const gap = xStarts[index + 1] - xStarts[index]
    if (gap > bestGap) {
      bestGap = gap
      bestSplit = xStarts[index] + gap / 2
    }
  }

  if (bestGap < Math.max(40, pageWidth * 0.08)) {
    return null
  }

  const left = lines.filter((line) => line.xStart < bestSplit)
  const right = lines.filter((line) => line.xStart >= bestSplit)
  if (left.length < 3 || right.length < 3) {
    return null
  }

  const leftRightEdge = Math.max(...left.map((line) => line.xEnd))
  const rightLeftEdge = Math.min(...right.map((line) => line.xStart))
  if (rightLeftEdge - leftRightEdge < Math.max(24, pageWidth * 0.03)) {
    return null
  }

  return bestSplit
}

function buildParagraphs(lines: PdfLine[]): string[] {
  const paragraphs: string[] = []
  const verticalGaps = getVerticalGaps(lines)
  const medianGap = median(verticalGaps)

  lines.forEach((line, index) => {
    const previousLine = lines[index - 1]
    const currentText = line.text

    if (!paragraphs.length || shouldStartParagraph(previousLine, line, medianGap)) {
      paragraphs.push(currentText)
      return
    }

    paragraphs[paragraphs.length - 1] = mergeParagraphLine(
      paragraphs[paragraphs.length - 1],
      currentText,
    )
  })

  return paragraphs.map(normalizeParagraphText).filter(Boolean)
}

function getVerticalGaps(lines: PdfLine[]): number[] {
  const gaps: number[] = []

  for (let index = 1; index < lines.length; index++) {
    const previousLine = lines[index - 1]
    const line = lines[index]
    gaps.push(Math.max(0, previousLine.y - line.y))
  }

  return gaps
}

function shouldStartParagraph(
  previousLine: PdfLine | undefined,
  line: PdfLine,
  medianGap: number,
): boolean {
  if (!previousLine) return true
  if (previousLine.isHeading || line.isHeading) return true
  if (previousLine.isBullet || line.isBullet) return true

  const verticalGap = Math.max(0, previousLine.y - line.y)
  const paragraphGapThreshold = Math.max(
    medianGap * 1.6,
    Math.max(previousLine.height, line.height) * 1.15,
  )

  if (verticalGap > paragraphGapThreshold) return true
  if (Math.abs(previousLine.xStart - line.xStart) > Math.max(18, line.height * 1.5)) return true
  if (isLineLikelyStandalone(previousLine.text) || isLineLikelyStandalone(line.text)) return true

  return false
}

function mergeParagraphLine(paragraph: string, line: string): string {
  if (isSoftHyphenBreak(paragraph, line)) {
    return `${paragraph.slice(0, -1)}${line}`
  }

  if (/[([{/-]$/.test(paragraph)) {
    return `${paragraph}${line}`
  }

  return `${paragraph} ${line}`.replace(/\s+/g, ' ').trim()
}

function normalizeParagraphText(value: string): string {
  // Repair email spacing FIRST — before digit/letter splitting breaks emails like "alica4lisia@yandex.com"
  const emailRepaired = repairEmailSpacing(value)
  return normalizeDateRanges(
    repairUrlSpacing(
      repairEmailSpacing(
        emailRepaired
          .replace(/([,;:])([^\s])/g, '$1 $2')
          // Don't split digit-letter boundary inside emails
          .replace(/(\d)([A-Za-zА-Яа-яЁё])/g, (match, d, l, offset, str) => {
            // Check if we're inside an email token (preceded by word chars and followed by @)
            const before = str.slice(Math.max(0, offset - 30), offset + 1)
            const after = str.slice(offset + 1, offset + 40)
            if (/@/.test(after) || /[A-Za-z0-9._%+-]@/.test(before + after)) return match
            return `${d} ${l}`
          })
          .replace(/([A-Za-zА-Яа-яЁё])(\d)/g, (match, l, d, offset, str) => {
            const after = str.slice(offset + 1, offset + 40)
            if (/@/.test(after)) return match
            return `${l} ${d}`
          })
          .replace(/\b(\d{4})\s*[./-]\s*(\d{2})\b/g, '$1-$2')
          .replace(/\b(\d{1,2})\s*\/\s*(\d{4})\b/g, '$1/$2')
          .replace(/\b([A-Za-zА-Яа-яЁё]{3,})\s*\.\s*(\d{4})\b/g, '$1 $2')
          .replace(/\s+/g, ' ')
          .trim(),
      ),
    ),
  )
}

function isSoftHyphenBreak(previous: string, next: string): boolean {
  return /-$/.test(previous) && /^[a-zа-яё]/i.test(next)
}

function shouldAddSpace(
  previousChar: string,
  nextChar: string,
  gap: number,
  threshold: number,
): boolean {
  if (!previousChar || !nextChar) return false
  if (/\s/.test(previousChar) || /\s/.test(nextChar)) return false
  if (/[(/[{]/.test(previousChar)) return false
  if (/[.,;:!?)]/.test(nextChar)) return false
  return gap > threshold * 0.45
}

function mergeSoftBreak(previous: string, next: string): string {
  if (isSoftHyphenBreak(previous, next)) {
    return `${previous.slice(0, -1)}${next}`
  }

  return `${previous} ${next}`.replace(/\s+/g, ' ').trim()
}

function repairEmailSpacing(value: string): string {
  return value.replace(
    /\b[A-Za-z0-9._%+-]+(?:\s*[._%+-]\s*[A-Za-z0-9]+)*\s*@\s*[A-Za-z0-9-]+(?:\s*\.\s*[A-Za-z0-9-]+)+\b/g,
    (match) => match.replace(/\s+/g, ''),
  )
}

function repairUrlSpacing(value: string): string {
  return value
    .replace(/https?\s*:\s*\/\s*\/\s*/gi, (match) => match.replace(/\s+/g, ''))
    .replace(/\bwww\s*\.\s*/gi, 'www.')
    .replace(/\bgithub\s*\.\s*com\b/gi, 'github.com')
    .replace(/\blinkedin\s*\.\s*com\b/gi, 'linkedin.com')
    .replace(/\bt\s*\.\s*me\b/gi, 't.me')
    .replace(/\btelegram\s*\.\s*me\b/gi, 'telegram.me')
    .replace(
      /\b(?:https?:\/\/|www\.|github\.com|linkedin\.com|t\.me|telegram\.me)[A-Za-z0-9./_?=%#@:+~-]*(?:\s+[A-Za-z0-9./_?=%#@:+~-]+)*/gi,
      (match) => match.replace(/\s+/g, ''),
    )
}

function normalizeDateRanges(value: string): string {
  return value
    .replace(
      /\b([A-Za-zА-Яа-яЁё]{3,}\s+\d{4}|\d{4}-\d{2}|\d{1,2}\/\d{4})\s*[-–—]\s*(present|current|now|по\s*наст\w*)\b/gi,
      '$1 - $2',
    )
    .replace(
      /\b([A-Za-zА-Яа-яЁё]{3,}\s+\d{4}|\d{4}-\d{2}|\d{1,2}\/\d{4})\s*[-–—]\s*([A-Za-zА-Яа-яЁё]{3,}\s+\d{4}|\d{4}-\d{2}|\d{1,2}\/\d{4})\b/gi,
      '$1 - $2',
    )
}

function isBulletLine(text: string): boolean {
  return /^(-|\u2022)\s+/.test(text) || /^\d+[.)]\s+/.test(text)
}

function isHeadingLine(text: string, height: number, medianHeight: number): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  if (!text) return false
  if (/[.!?]$/.test(text)) return false
  if (wordCount <= 5 && text.length <= 48) return true
  if (height >= medianHeight * 1.25 && text.length <= 80) return true
  if (text === text.toUpperCase() && wordCount <= 6) return true
  return false
}

function isLineLikelyStandalone(text: string): boolean {
  if (!text) return false
  if (isBulletLine(text)) return true
  if (/[:•]$/.test(text)) return true
  if (/^(email|phone|linkedin|github|telegram|contacts?)$/i.test(text)) return true
  return false
}

function median(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  if (!filtered.length) return 0

  const middle = Math.floor(filtered.length / 2)
  if (filtered.length % 2 === 0) {
    return (filtered[middle - 1] + filtered[middle]) / 2
  }

  return filtered[middle]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

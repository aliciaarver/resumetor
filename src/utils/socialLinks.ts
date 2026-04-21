import type { SocialLink } from '@/types/resume'

export const SOCIAL_LINK_TYPES = ['Email', 'LinkedIn', 'Telegram', 'GitHub', 'Link'] as const

export type SocialLinkType = (typeof SOCIAL_LINK_TYPES)[number]

export function normalizeSocialLinkLabel(value: string | undefined): SocialLinkType {
  return SOCIAL_LINK_TYPES.includes(value as SocialLinkType) ? (value as SocialLinkType) : 'Link'
}

export function normalizeSocialLink(link: SocialLink): SocialLink {
  const label = normalizeSocialLinkLabel(link.label)

  return {
    ...link,
    label,
    url: label === 'Email' ? stripMailto(link.url) : link.url.trim(),
  }
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

const SCHEME_PATTERN = /^([a-z][a-z0-9+\-.]*):/i

function extractUrlProtocol(url: string): string | null {
  // Браузеры игнорируют управляющие символы в схеме (напр. `java\tscript:`),
  // поэтому вычищаем их до проверки, иначе allow-list можно обойти.
  const sanitized = url.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  const match = SCHEME_PATTERN.exec(sanitized)
  return match ? `${match[1].toLowerCase()}:` : null
}

export function buildSocialLinkHref(link: Pick<SocialLink, 'label' | 'url'>): string {
  const url = link.url.trim()
  const label = normalizeSocialLinkLabel(link.label)

  if (!url) return ''

  const protocol = extractUrlProtocol(url)

  if (protocol && !SAFE_URL_PROTOCOLS.has(protocol)) {
    return ''
  }

  if (label === 'Email' && !protocol) {
    return `mailto:${url}`
  }

  if (!protocol) {
    return `https://${url}`
  }

  return url
}

export function getSocialLinkDisplayText(
  link: Pick<SocialLink, 'label' | 'url'>,
  resolveLabel?: (label: string) => string,
): string {
  const label = normalizeSocialLinkLabel(link.label)
  const url = link.url.trim()

  if (!url && label === 'Link') {
    return ''
  }

  if (label === 'Email') {
    return stripMailto(url)
  }

  if (label === 'Link') {
    return url
  }

  return resolveLabel ? resolveLabel(label) : label
}

function stripMailto(value: string): string {
  return value.trim().replace(/^mailto:/i, '')
}

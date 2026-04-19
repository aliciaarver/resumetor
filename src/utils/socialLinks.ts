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

export function buildSocialLinkHref(link: Pick<SocialLink, 'label' | 'url'>): string {
  const url = link.url.trim()
  const label = normalizeSocialLinkLabel(link.label)

  if (!url) return ''

  if (label === 'Email' && !/^[a-z]+:/i.test(url)) {
    return `mailto:${url}`
  }

  if (!/^[a-z]+:/i.test(url)) {
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

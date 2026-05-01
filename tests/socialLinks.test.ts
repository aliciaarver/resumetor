import { describe, it, expect } from 'vitest'
import {
  normalizeSocialLinkLabel,
  normalizeSocialLink,
  buildSocialLinkHref,
  getSocialLinkDisplayText,
} from '@/utils/socialLinks'

describe('normalizeSocialLinkLabel', () => {
  it('returns known labels as-is', () => {
    expect(normalizeSocialLinkLabel('Email')).toBe('Email')
    expect(normalizeSocialLinkLabel('LinkedIn')).toBe('LinkedIn')
    expect(normalizeSocialLinkLabel('GitHub')).toBe('GitHub')
    expect(normalizeSocialLinkLabel('Telegram')).toBe('Telegram')
  })

  it('returns Link for unknown labels', () => {
    expect(normalizeSocialLinkLabel('Twitter')).toBe('Link')
    expect(normalizeSocialLinkLabel(undefined)).toBe('Link')
    expect(normalizeSocialLinkLabel('')).toBe('Link')
  })
})

describe('normalizeSocialLink', () => {
  it('strips mailto: prefix from Email links', () => {
    const result = normalizeSocialLink({ id: '1', label: 'Email', url: 'mailto:user@example.com' })
    expect(result.url).toBe('user@example.com')
  })

  it('trims whitespace from non-email links', () => {
    const result = normalizeSocialLink({ id: '1', label: 'GitHub', url: '  github.com/user  ' })
    expect(result.url).toBe('github.com/user')
  })

  it('normalizes unknown label to Link', () => {
    const result = normalizeSocialLink({ id: '1', label: 'Twitter' as any, url: 'twitter.com/x' })
    expect(result.label).toBe('Link')
  })
})

describe('buildSocialLinkHref', () => {
  it('returns empty string for empty URL', () => {
    expect(buildSocialLinkHref({ label: 'GitHub', url: '' })).toBe('')
  })

  it('prepends mailto: for Email without scheme', () => {
    expect(buildSocialLinkHref({ label: 'Email', url: 'user@example.com' })).toBe('mailto:user@example.com')
  })

  it('does not double mailto: for Email with mailto prefix', () => {
    expect(buildSocialLinkHref({ label: 'Email', url: 'mailto:user@example.com' })).toBe('mailto:user@example.com')
  })

  it('prepends https:// for URL without scheme', () => {
    expect(buildSocialLinkHref({ label: 'GitHub', url: 'github.com/user' })).toBe('https://github.com/user')
  })

  it('returns URL as-is when scheme present', () => {
    expect(buildSocialLinkHref({ label: 'Link', url: 'https://example.com' })).toBe('https://example.com')
  })
})

describe('getSocialLinkDisplayText', () => {
  it('returns empty string for empty Link', () => {
    expect(getSocialLinkDisplayText({ label: 'Link', url: '' })).toBe('')
  })

  it('returns stripped email for Email label', () => {
    expect(getSocialLinkDisplayText({ label: 'Email', url: 'mailto:user@example.com' })).toBe('user@example.com')
    expect(getSocialLinkDisplayText({ label: 'Email', url: 'user@example.com' })).toBe('user@example.com')
  })

  it('returns url for Link label', () => {
    expect(getSocialLinkDisplayText({ label: 'Link', url: 'https://example.com' })).toBe('https://example.com')
  })

  it('returns resolved label for known labels', () => {
    const resolve = (l: string) => `[${l}]`
    expect(getSocialLinkDisplayText({ label: 'GitHub', url: 'github.com/x' }, resolve)).toBe('[GitHub]')
  })

  it('returns label name when no resolver provided', () => {
    expect(getSocialLinkDisplayText({ label: 'LinkedIn', url: 'linkedin.com/in/x' })).toBe('LinkedIn')
  })
})

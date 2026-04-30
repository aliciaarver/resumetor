import { describe, it, expect } from 'vitest'
import { buildSocialLinkHref, getSocialLinkDisplayText } from './socialLinks'

describe('buildSocialLinkHref — XSS protocol allow-list', () => {
  const malicious = [
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ]

  for (const url of malicious) {
    it(`блокирует небезопасный href: ${JSON.stringify(url)}`, () => {
      expect(buildSocialLinkHref({ label: 'Link', url })).toBe('')
      expect(buildSocialLinkHref({ label: 'LinkedIn', url })).toBe('')
    })
  }

  it('пропускает http:', () => {
    expect(buildSocialLinkHref({ label: 'Link', url: 'http://example.com' })).toBe('http://example.com')
  })

  it('пропускает https:', () => {
    expect(buildSocialLinkHref({ label: 'Link', url: 'https://example.com' })).toBe('https://example.com')
  })

  it('пропускает mailto:', () => {
    expect(buildSocialLinkHref({ label: 'Email', url: 'mailto:a@b.c' })).toBe('mailto:a@b.c')
  })

  it('пропускает tel:', () => {
    expect(buildSocialLinkHref({ label: 'Link', url: 'tel:+123' })).toBe('tel:+123')
  })

  it('добавляет https:// для голого домена', () => {
    expect(buildSocialLinkHref({ label: 'LinkedIn', url: 'linkedin.com/in/x' })).toBe('https://linkedin.com/in/x')
  })

  it('добавляет mailto: для Email без схемы', () => {
    expect(buildSocialLinkHref({ label: 'Email', url: 'a@b.c' })).toBe('mailto:a@b.c')
  })

  it('пустая строка для пустого url', () => {
    expect(buildSocialLinkHref({ label: 'Link', url: '   ' })).toBe('')
  })
})

describe('getSocialLinkDisplayText не выполняет HTML', () => {
  it('возвращает строку как есть (рендер как text — без HTML-инъекций)', () => {
    const evil = '<img src=x onerror=alert(1)>'
    expect(getSocialLinkDisplayText({ label: 'Link', url: evil })).toBe(evil)
  })
})

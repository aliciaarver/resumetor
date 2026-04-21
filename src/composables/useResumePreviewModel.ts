import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import { formatMonthYear } from '@/utils/dateHelpers'
import { buildSocialLinkHref, getSocialLinkDisplayText } from '@/utils/socialLinks'

export function useResumePreviewModel() {
  const store = useResumeStore()
  const localeStore = useLocaleStore()
  const { data } = storeToRefs(store)
  const { locale } = storeToRefs(localeStore)
  const { t, proficiencyLabel } = localeStore

  const el = ref<HTMLElement | null>(null)
  const fullName = computed(() => {
    const parts = [
      data.value.personal.lastName,
      data.value.personal.firstName,
      data.value.personal.middleName,
    ]
      .map((part) => part.trim())
      .filter(Boolean)

    return parts.join(' ') || data.value.personal.fullName.trim()
  })

  function formatResumeDate(value: string) {
    return formatMonthYear(value, locale.value)
  }

  function formatDateRange(from: string, to: string, isCurrent: boolean): string {
    const fromStr = formatResumeDate(from)
    const toStr = isCurrent ? t('common.present') : formatResumeDate(to)
    if (fromStr && toStr) return `${fromStr} — ${toStr}`
    return fromStr || toStr
  }

  function buildLinkHref(link: { label: string; url: string }) {
    return buildSocialLinkHref(link)
  }

  function formatSocialLinkLabel(label: string) {
    return localeStore.socialLinkLabel(label)
  }

  const contactLinks = computed(() =>
    data.value.personal.links
      .map((link) => {
        const text = getSocialLinkDisplayText(link, formatSocialLinkLabel).trim()
        const href = link.url.trim() ? buildLinkHref(link) : ''

        return {
          id: link.id,
          text,
          href,
        }
      })
      .filter((link) => link.text),
  )

  return {
    data,
    fullName,
    t,
    proficiencyLabel,
    el,
    contactLinks,
    formatDateRange,
    buildLinkHref,
  }
}

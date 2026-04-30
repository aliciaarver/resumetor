import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'

const STORAGE_KEY = 'resumetor:resume:v1'

async function flushDebounce() {
  // debounce 500ms in store
  await vi.advanceTimersByTimeAsync(600)
  await nextTick()
}

describe('useResumeStore — localStorage persistence (WTMyfVjT)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('инициализируется из demo и НЕ пишет в localStorage до правки пользователя', async () => {
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()
    expect(store.data.personal).toBeTruthy()
    // ничего не записано: чистый демо-черновик не должен оседать в storage
    await flushDebounce()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('пишет в localStorage с дебаунсом после правки', async () => {
    vi.resetModules()
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()

    store.data.personal.firstName = 'Alicia'
    await nextTick()
    // до окончания дебаунса записи быть не должно
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    await flushDebounce()
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.personal.firstName).toBe('Alicia')
  })

  it('использует версионный ключ v1', async () => {
    vi.resetModules()
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()
    store.data.personal.firstName = 'X'
    await flushDebounce()
    expect(localStorage.getItem('resumetor:resume:v1')).not.toBeNull()
  })

  it('при наличии черновика в storage загружает его вместо demo', async () => {
    const draft = {
      personal: {
        firstName: 'FromStorage',
        lastName: '',
        title: '',
        location: '',
        email: '',
        phone: '',
        about: '',
        links: [],
      },
      workExperience: [],
      education: [],
      languages: [],
      skills: [],
      projects: [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))

    vi.resetModules()
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()
    expect(store.data.personal.firstName).toBe('FromStorage')
  })

  it('некорректный JSON в storage не ломает загрузку (фолбэк на demo)', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    vi.resetModules()
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()
    expect(store.data.personal).toBeTruthy()
  })

  it('resetResume() очищает localStorage', async () => {
    vi.resetModules()
    const { useResumeStore } = await import('./resume')
    const store = useResumeStore()
    store.data.personal.firstName = 'Y'
    await flushDebounce()
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

    store.resetResume()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

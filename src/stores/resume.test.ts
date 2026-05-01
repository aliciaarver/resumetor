import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResumeStore } from './resume'

const STORAGE_KEY = 'resumetor:resume:v1'

describe('useResumeStore — localStorage persistence (WTMyfVjT)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('инициализируется из demo и НЕ пишет в localStorage до правки пользователя', () => {
    const store = useResumeStore()
    expect(store.data.personal).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('пишет в localStorage с дебаунсом после правки', () => {
    const store = useResumeStore()
    store.data.personal.firstName = 'Alicia'
    // до флаша — ничего не записано
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    store.flushPersist()
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.personal.firstName).toBe('Alicia')
  })

  it('использует версионный ключ v1', () => {
    const store = useResumeStore()
    store.data.personal.firstName = 'X'
    store.flushPersist()
    expect(localStorage.getItem('resumetor:resume:v1')).not.toBeNull()
  })

  it('при наличии черновика в storage загружает его вместо demo', () => {
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

    const store = useResumeStore()
    expect(store.data.personal.firstName).toBe('FromStorage')
  })

  it('некорректный JSON в storage не ломает загрузку (фолбэк на demo)', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    const store = useResumeStore()
    expect(store.data.personal).toBeTruthy()
  })

  it('resetResume() очищает localStorage', () => {
    const store = useResumeStore()
    store.data.personal.firstName = 'Y'
    store.flushPersist()
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

    store.resetResume()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

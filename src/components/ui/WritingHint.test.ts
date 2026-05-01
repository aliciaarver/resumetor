import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WritingHint from './WritingHint.vue'

const defaultProps = {
  title: 'Как написать',
  example: 'Пример текста',
  checklist: ['Пункт 1', 'Пункт 2'],
}

describe('WritingHint', () => {
  it('отображается когда поле пустое', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: '' } })
    expect(wrapper.find('.hint').exists()).toBe(true)
  })

  it('развёрнут по умолчанию когда поле пустое', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: '' } })
    expect(wrapper.find('.hint__body').exists()).toBe(true)
  })

  it('показывает пример и чек-лист в развёрнутом состоянии', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: '' } })
    expect(wrapper.text()).toContain('Пример текста')
    expect(wrapper.text()).toContain('Пункт 1')
    expect(wrapper.text()).toContain('Пункт 2')
  })

  it('свёрнут по умолчанию когда поле заполнено', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: 'уже заполнено' } })
    expect(wrapper.find('.hint__body').exists()).toBe(false)
  })

  it('остаётся видимым когда поле заполнено (но свёрнутым)', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: 'текст' } })
    expect(wrapper.find('.hint').exists()).toBe(true)
  })

  it('разворачивается по клику на кнопку', async () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: 'текст' } })
    expect(wrapper.find('.hint__body').exists()).toBe(false)
    await wrapper.find('.hint__toggle').trigger('click')
    expect(wrapper.find('.hint__body').exists()).toBe(true)
  })

  it('сворачивается по повторному клику', async () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: '' } })
    expect(wrapper.find('.hint__body').exists()).toBe(true)
    await wrapper.find('.hint__toggle').trigger('click')
    expect(wrapper.find('.hint__body').exists()).toBe(false)
  })

  it('не скрывается когда поле заполнено и пользователь явно раскрыл', async () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: 'текст' } })
    await wrapper.find('.hint__toggle').trigger('click') // открыть
    expect(wrapper.find('.hint__body').exists()).toBe(true)
    expect(wrapper.find('.hint').exists()).toBe(true)
  })

  it('показывает заголовок', () => {
    const wrapper = mount(WritingHint, { props: { ...defaultProps, fieldValue: '' } })
    expect(wrapper.find('.hint__label').text()).toBe('Как написать')
  })
})

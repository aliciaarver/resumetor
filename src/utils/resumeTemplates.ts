import type { Component } from 'vue'
import ResumePreview from '@/components/preview/ResumePreview.vue'

export type ResumeTemplateId = 'classic'

export interface ResumeTemplateDefinition {
  id: ResumeTemplateId
  labelKey: string
  component: Component
}

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: 'classic',
    labelKey: 'builder.templateClassic',
    component: ResumePreview,
  },
]

export function getResumeTemplate(templateId: ResumeTemplateId) {
  return RESUME_TEMPLATES.find((template) => template.id === templateId) ?? RESUME_TEMPLATES[0]
}

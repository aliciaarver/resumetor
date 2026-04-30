import type { Component } from 'vue'
import ResumePreview from '@/components/preview/ResumePreview.vue'
import ModernResumePreview from '@/components/preview/ModernResumePreview.vue'

export type ResumeTemplateId = 'classic' | 'modern'

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
  {
    id: 'modern',
    labelKey: 'builder.templateModern',
    component: ModernResumePreview,
  },
]

export function getResumeTemplate(templateId: ResumeTemplateId) {
  return RESUME_TEMPLATES.find((template) => template.id === templateId) ?? RESUME_TEMPLATES[0]
}

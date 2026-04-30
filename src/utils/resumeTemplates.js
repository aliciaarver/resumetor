import ResumePreview from '@/components/preview/ResumePreview.vue';
import ModernResumePreview from '@/components/preview/ModernResumePreview.vue';
export const RESUME_TEMPLATES = [
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
];
export function getResumeTemplate(templateId) {
    return RESUME_TEMPLATES.find((template) => template.id === templateId) ?? RESUME_TEMPLATES[0];
}

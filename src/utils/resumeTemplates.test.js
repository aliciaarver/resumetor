import { describe, it, expect } from 'vitest';
import { RESUME_TEMPLATES, getResumeTemplate } from './resumeTemplates';
import ResumePreview from '@/components/preview/ResumePreview.vue';
import ModernResumePreview from '@/components/preview/ModernResumePreview.vue';
describe('RESUME_TEMPLATES', () => {
    it('registers classic and modern templates', () => {
        const ids = RESUME_TEMPLATES.map((t) => t.id);
        expect(ids).toEqual(['classic', 'modern']);
    });
    it('maps modern id to ModernResumePreview component', () => {
        const modern = getResumeTemplate('modern');
        expect(modern.component).toBe(ModernResumePreview);
        const classic = getResumeTemplate('classic');
        expect(classic.component).toBe(ResumePreview);
    });
    it('uses i18n label keys', () => {
        expect(RESUME_TEMPLATES.find((t) => t.id === 'modern')?.labelKey).toBe('builder.templateModern');
        expect(RESUME_TEMPLATES.find((t) => t.id === 'classic')?.labelKey).toBe('builder.templateClassic');
    });
});

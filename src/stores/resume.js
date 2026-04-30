import { defineStore } from 'pinia';
import { ref } from 'vue';
import { buildHydratedResumeData, createDemoResume, detectDemoResumeLocale, normalizeResumeData, } from '@/entities/resume';
const buildEmptyWorkExperience = () => ({
    id: crypto.randomUUID(),
    company: '',
    companyUrl: '',
    position: '',
    location: '',
    fromMonth: '',
    toMonth: '',
    isCurrent: false,
    description: '',
    skills: [],
});
const buildEmptySocialLink = () => ({
    id: crypto.randomUUID(),
    label: 'Link',
    url: '',
});
const buildEmptyEducation = () => ({
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    field: '',
    fromMonth: '',
    toMonth: '',
    isCurrent: false,
});
const buildEmptyLanguage = () => ({
    id: crypto.randomUUID(),
    name: '',
    proficiency: 'Intermediate',
});
const buildEmptySkill = () => ({
    id: crypto.randomUUID(),
    name: '',
});
const buildEmptyProject = () => ({
    id: crypto.randomUUID(),
    kind: 'project',
    title: '',
    subtitle: '',
    issuedAt: '',
    link: '',
    description: '',
});
export const useResumeStore = defineStore('resume', () => {
    const data = ref(normalizeResumeData(createDemoResume()));
    function addWorkExperience() {
        data.value.workExperience.push(buildEmptyWorkExperience());
    }
    function removeWorkExperience(id) {
        data.value.workExperience = data.value.workExperience.filter((e) => e.id !== id);
    }
    function addSocialLink() {
        data.value.personal.links.push(buildEmptySocialLink());
    }
    function removeSocialLink(id) {
        data.value.personal.links = data.value.personal.links.filter((l) => l.id !== id);
    }
    function addEducation() {
        data.value.education.push(buildEmptyEducation());
    }
    function removeEducation(id) {
        data.value.education = data.value.education.filter((e) => e.id !== id);
    }
    function addLanguage() {
        data.value.languages.push(buildEmptyLanguage());
    }
    function removeLanguage(id) {
        data.value.languages = data.value.languages.filter((l) => l.id !== id);
    }
    function addSkill() {
        data.value.skills.push(buildEmptySkill());
    }
    function removeSkill(id) {
        data.value.skills = data.value.skills.filter((skill) => skill.id !== id);
    }
    function addProject() {
        data.value.projects.push(buildEmptyProject());
    }
    function addCertification() {
        data.value.projects.push({
            ...buildEmptyProject(),
            kind: 'certification',
        });
    }
    function removeProject(id) {
        data.value.projects = data.value.projects.filter((project) => project.id !== id);
    }
    function resetResume(locale) {
        data.value = createDemoResume(locale);
    }
    function localizeDemoResume(locale) {
        if (!detectDemoResumeLocale(data.value)) {
            return false;
        }
        data.value = createDemoResume(locale);
        return true;
    }
    function hydrateFromParsed(parsed) {
        data.value = buildHydratedResumeData(parsed);
    }
    return {
        data,
        addWorkExperience,
        removeWorkExperience,
        addSocialLink,
        removeSocialLink,
        addEducation,
        removeEducation,
        addLanguage,
        removeLanguage,
        addSkill,
        removeSkill,
        addProject,
        addCertification,
        removeProject,
        resetResume,
        localizeDemoResume,
        hydrateFromParsed,
    };
});

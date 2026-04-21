import type { ResumeData } from '@/entities/resume/model/types'
import type { ParseBlockReview } from '@/features/upload-resume/lib/confidence-scoring'

export function applyConfidenceFallback(
  resume: Partial<ResumeData>,
  blocks: ParseBlockReview[],
): Partial<ResumeData> {
  const keep = new Set(
    blocks
      .filter((block) => block.imported)
      .map((block) => block.key)
  )

  const safeResume: Partial<ResumeData> = {}

  if (keep.has('personal') && resume.personal) safeResume.personal = resume.personal
  if (keep.has('aboutMe')) safeResume.aboutMe = resume.aboutMe ?? ''
  if (keep.has('workExperience')) safeResume.workExperience = resume.workExperience ?? []
  if (keep.has('education')) safeResume.education = resume.education ?? []
  if (keep.has('skills')) safeResume.skills = resume.skills ?? []
  if (keep.has('languages')) safeResume.languages = resume.languages ?? []
  if (keep.has('projects')) safeResume.projects = resume.projects ?? []

  return safeResume
}

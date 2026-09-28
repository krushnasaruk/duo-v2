import { z } from 'zod';

export const lectureContentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('TEXT'),
    content: z.string().min(1, 'Text content cannot be empty'),
  }),
  z.object({
    id: z.string(),
    type: z.literal('CODE'),
    language: z.string().min(1, 'Language is required'),
    code: z.string().min(1, 'Code cannot be empty'),
  }),
  z.object({
    id: z.string(),
    type: z.literal('CALLOUT'),
    content: z.string().min(1, 'Callout content cannot be empty'),
  }),
  z.object({
    id: z.string(),
    type: z.literal('WORKED_EXAMPLE'),
    title: z.string().min(1, 'Title is required'),
    problem: z.string().min(1, 'Problem statement is required'),
    steps: z.array(z.object({
      id: z.string(),
      title: z.string().min(1, 'Step title is required'),
      explanation: z.string().min(1, 'Explanation is required'),
      code: z.string().optional()
    })).min(1, 'At least one step is required'),
  }),
  z.object({
    id: z.string(),
    type: z.literal('COMMON_MISTAKES'),
    title: z.string().min(1, 'Title is required'),
    mistakes: z.array(z.object({
      id: z.string(),
      mistake: z.string().min(1, 'Mistake description is required'),
      explanation: z.string().min(1, 'Explanation is required'),
      correction: z.string().min(1, 'Correction is required')
    })).min(1, 'At least one mistake is required'),
  }),
]);

export const lectureVideoSchema = z.object({
  id: z.string(),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long'),
});

export const lectureResourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
});

export const createLectureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  content: z.array(lectureContentBlockSchema).min(0, 'Content must be an array'),
  video: lectureVideoSchema.nullable().optional().default(null),
  resources: z.array(lectureResourceSchema).default([]),
  learningObjectives: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
});

export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type LectureContentBlockInput = z.infer<typeof lectureContentBlockSchema>;
export type LectureVideoInput = z.infer<typeof lectureVideoSchema>;
export type LectureResourceInput = z.infer<typeof lectureResourceSchema>;

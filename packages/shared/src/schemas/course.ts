import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  shortDescription: z.string().min(1, 'Short description is required').max(200, 'Description is too long'),
  fullDescription: z.string().min(1, 'Full description is required'),
  tagline: z.string().optional(),
  
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    required_error: 'Please select a difficulty level',
  }),
  language: z.string().min(1, 'Language is required'),
  
  targetAudience: z.string().optional(),
  
  duration: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  
  learningObjectives: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  
  glossary: z.array(z.object({
    id: z.string().optional(),
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
    relatedTerms: z.array(z.string()).default([])
  })).default([]),
  
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

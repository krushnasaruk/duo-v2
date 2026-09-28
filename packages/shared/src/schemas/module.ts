import { z } from 'zod';

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  learningObjectives: z.array(z.string()).default([]),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

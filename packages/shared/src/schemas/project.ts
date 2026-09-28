import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
  instructions: z.string().min(1, 'Instructions cannot be blank'),
  xp: z.number().int().positive('XP must be a positive integer'),
  moduleId: z.string().optional(),
});

export const createProjectMilestoneSchema = z.object({
  title: z.string().min(1, 'Title cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
  xp: z.number().int().positive('XP must be a positive integer'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateProjectMilestoneInput = z.infer<typeof createProjectMilestoneSchema>;

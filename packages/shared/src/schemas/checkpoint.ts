import { z } from 'zod';

export const codingTestCaseSchema = z.object({
  id: z.string(),
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
});

export const codingHintSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Content is required'),
  position: z.number().int().min(0),
});

export const createCodingCheckpointSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  instructions: z.string().min(1, 'Instructions are required').max(5000, 'Instructions are too long'),
  language: z.literal('python'),
  starterCode: z.string().min(1, 'Starter code is required'),
  visibleTests: z.array(codingTestCaseSchema).default([]),
  hiddenTests: z.array(codingTestCaseSchema).default([]),
  hints: z.array(codingHintSchema).default([]),
  xp: z.number().int().positive('XP must be a positive integer'),
  maxAttempts: z.number().int().positive('Max attempts must be a positive integer'),
  mandatory: z.boolean(),
});

export type CreateCodingCheckpointInput = z.infer<typeof createCodingCheckpointSchema>;
export type CodingTestCaseInput = z.infer<typeof codingTestCaseSchema>;
export type CodingHintInput = z.infer<typeof codingHintSchema>;

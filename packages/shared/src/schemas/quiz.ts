import { z } from 'zod';

export const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text cannot be blank'),
});

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'PREDICT_OUTPUT']),
  question: z.string().min(1, 'Question cannot be blank'),
  code: z.string().optional(),
  language: z.string().optional(),
  options: z.array(quizOptionSchema),
  correctOptionId: z.string().min(1, 'Please select the correct option'),
  explanation: z.string().min(1, 'Explanation cannot be blank'),
  xp: z.number().int().positive('XP must be a positive integer'),
}).superRefine((data, ctx) => {
  if (data.type === 'MCQ' || data.type === 'PREDICT_OUTPUT') {
    if (data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must contain at least two options',
        path: ['options'],
      });
    }
    if (data.type === 'PREDICT_OUTPUT') {
      if (!data.code || data.code.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Code cannot be empty for predict output questions',
          path: ['code'],
        });
      }
    }
  } else if (data.type === 'TRUE_FALSE') {
    if (data.options.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'True/False must contain exactly two options',
        path: ['options'],
      });
    }
  }

  const validOptionIds = data.options.map(o => o.id);
  if (!validOptionIds.includes(data.correctOptionId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Correct option must be one of the provided options',
      path: ['correctOptionId'],
    });
  }
});

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title cannot be blank'),
  description: z.string().min(1, 'Description cannot be blank'),
});

export type QuizOptionInput = z.infer<typeof quizOptionSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

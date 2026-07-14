import { z } from 'zod';

export const examCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  duration: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration must be less than 480 minutes'),
  passingScore: z
    .number()
    .min(0, 'Passing score must be at least 0%')
    .max(100, 'Passing score must be at most 100%'),
  maxAttempts: z
    .number()
    .min(1, 'At least 1 attempt is required')
    .max(100, 'Maximum 100 attempts allowed')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

export const examUpdateSchema = examCreateSchema.partial().extend({
  id: z.string().min(1, 'Exam ID is required'),
});

export const examSettingsSchema = z.object({
  randomizeQuestions: z.boolean(),
  randomizeOptions: z.boolean(),
  showResults: z.boolean(),
  showCorrectAnswers: z.boolean(),
  allowPause: z.boolean(),
  preventCopy: z.boolean(),
  showTimer: z.boolean(),
  allowCalculator: z.boolean(),
});

export const questionCreateSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  text: z
    .string()
    .min(1, 'Question text is required')
    .max(2000, 'Question must be less than 2000 characters'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank']),
  points: z
    .number()
    .min(1, 'Points must be at least 1')
    .max(100, 'Points must be less than 100'),
  explanation: z
    .string()
    .max(1000, 'Explanation must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
  correctAnswer: z.string().or(z.array(z.string())).optional(),
  order: z.number().optional(),
});

export const questionUpdateSchema = questionCreateSchema.partial().extend({
  id: z.string().min(1, 'Question ID is required'),
});

export const examAttemptSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
});

export const examAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const examSubmitSchema = z.object({
  attemptId: z.string().min(1, 'Attempt ID is required'),
  answers: z.array(examAnswerSchema),
});

export type ExamCreateInput = z.infer<typeof examCreateSchema>;
export type ExamUpdateInput = z.infer<typeof examUpdateSchema>;
export type ExamSettingsInput = z.infer<typeof examSettingsSchema>;
export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type ExamAttemptInput = z.infer<typeof examAttemptSchema>;
export type ExamAnswerInput = z.infer<typeof examAnswerSchema>;
export type ExamSubmitInput = z.infer<typeof examSubmitSchema>;

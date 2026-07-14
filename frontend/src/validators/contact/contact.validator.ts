import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters'),
});

export const bugReportSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  stepsToReproduce: z
    .string()
    .max(2000, 'Steps to reproduce must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  expectedBehavior: z
    .string()
    .max(1000, 'Expected behavior must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  actualBehavior: z
    .string()
    .max(1000, 'Actual behavior must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  attachments: z.array(z.string().url()).max(5).optional(),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  interests: z.array(z.string()).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type BugReportInput = z.infer<typeof bugReportSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().datetime({ message: 'Invalid ISO 8601 date string' }).optional().nullable(),
  userId: z.string().optional(), // Used by ADMIN to assign tasks
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime({ message: 'Invalid ISO 8601 date string' }).optional().nullable(),
  userId: z.string().optional(),
});

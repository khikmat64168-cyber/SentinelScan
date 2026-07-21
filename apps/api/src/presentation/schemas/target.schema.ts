import { z } from 'zod';

export const createTargetSchema = z.object({
  url:       z.string().url('Must be a valid URL'),
  projectId: z.string().uuid('Must be a valid UUID'),
});

export type CreateTargetInput = z.infer<typeof createTargetSchema>;

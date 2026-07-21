import { z } from 'zod';

export const createProjectSchema = z.object({
  name:        z.string().min(1, 'Name is required').max(120),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
}).refine(
  (d) => d.name !== undefined || d.description !== undefined,
  { message: 'At least one field must be provided' },
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

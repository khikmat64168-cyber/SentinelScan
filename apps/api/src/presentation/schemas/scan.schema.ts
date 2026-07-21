import { z } from 'zod';

export const startScanSchema = z.object({
  targetId:  z.string().uuid('Must be a valid UUID'),
  projectId: z.string().uuid('Must be a valid UUID'),
  pluginIds: z.array(z.string().min(1)).min(1, 'At least one plugin is required'),
});

export type StartScanInput = z.infer<typeof startScanSchema>;

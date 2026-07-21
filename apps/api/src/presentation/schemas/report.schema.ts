import { z } from 'zod';

export const generateReportSchema = z.object({
  scanId:    z.string().uuid('Must be a valid UUID'),
  projectId: z.string().uuid('Must be a valid UUID'),
  format:    z.enum(['PDF', 'HTML', 'JSON']),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;

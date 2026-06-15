import type { SeverityLevel } from './scan.types';

export interface ReportSummary {
  totalFindings: number;
  findingsBySeverity: Record<SeverityLevel, number>;
  overallRiskScore: number;
  pluginsExecuted: string[];
}

export interface ReportResponse {
  id: string;
  scanId: string;
  targetUrl: string;
  summary: ReportSummary;
  generatedAt: string;
}

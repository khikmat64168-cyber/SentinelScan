export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface ScanConfig {
  maxDepth: number;
  maxUrls: number;
  plugins: string[];
  requestDelayMs: number;
}

export interface InitiateScanRequest {
  targetId: string;
  config?: Partial<ScanConfig>;
}

export interface ScanResponse {
  scanId: string;
  status: ScanStatus;
  targetUrl: string;
  createdAt: string;
}

export interface FindingResponse {
  id: string;
  pluginId: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: string | null;
  url: string;
  parameter: string | null;
  remediation: string;
  references: string[];
  cvssScore: number;
  createdAt: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TargetResponse {
  id: string;
  projectId: string;
  url: string;
  isAuthorized: boolean;
  authorizationNote: string | null;
  createdAt: string;
}

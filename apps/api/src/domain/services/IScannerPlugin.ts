import type { Finding } from '../entities/Finding';

export interface ScanContext {
  scanId: string;
  targetUrl: string;
  projectId: string;
  requestTimeoutMs?: number;
}

export interface IScannerPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  run(context: ScanContext): Promise<Finding[]>;
}

import type { Scan } from '../entities/Scan';
import type { Finding } from '../entities/Finding';

export interface StartScanCommand {
  targetId: string;
  projectId: string;
  createdBy: string;
  pluginIds: string[];
}

export interface IScanService {
  startScan(command: StartScanCommand): Promise<Scan>;
  cancelScan(scanId: string, requestedBy: string): Promise<void>;
  getScanFindings(scanId: string): Promise<Finding[]>;
}

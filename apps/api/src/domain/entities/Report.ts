import { v4 as uuidv4 } from 'uuid';

export enum ReportFormat {
  PDF  = 'PDF',
  HTML = 'HTML',
  JSON = 'JSON',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  READY      = 'READY',
  FAILED     = 'FAILED',
}

export interface CreateReportProps {
  scanId: string;
  projectId: string;
  createdBy: string;
  format: ReportFormat;
}

export interface RehydrateReportProps {
  id: string;
  scanId: string;
  projectId: string;
  createdBy: string;
  format: ReportFormat;
  status: ReportStatus;
  storagePath: string | null;
  createdAt: Date;
  generatedAt: Date | null;
}

export class Report {
  readonly id: string;
  readonly scanId: string;
  readonly projectId: string;
  readonly createdBy: string;
  readonly format: ReportFormat;
  private _status: ReportStatus;
  private _storagePath: string | null;
  readonly createdAt: Date;
  private _generatedAt: Date | null;

  private constructor(props: RehydrateReportProps) {
    this.id          = props.id;
    this.scanId      = props.scanId;
    this.projectId   = props.projectId;
    this.createdBy   = props.createdBy;
    this.format      = props.format;
    this._status      = props.status;
    this._storagePath = props.storagePath;
    this.createdAt   = props.createdAt;
    this._generatedAt = props.generatedAt;
  }

  static create(props: CreateReportProps): Report {
    return new Report({
      id:          uuidv4(),
      scanId:      props.scanId,
      projectId:   props.projectId,
      createdBy:   props.createdBy,
      format:      props.format,
      status:      ReportStatus.GENERATING,
      storagePath: null,
      createdAt:   new Date(),
      generatedAt: null,
    });
  }

  static rehydrate(props: RehydrateReportProps): Report {
    return new Report(props);
  }

  get status(): ReportStatus { return this._status; }
  get storagePath(): string | null { return this._storagePath; }
  get generatedAt(): Date | null { return this._generatedAt; }

  markReady(storagePath: string): void {
    this._status      = ReportStatus.READY;
    this._storagePath = storagePath;
    this._generatedAt = new Date();
  }

  markFailed(): void {
    this._status      = ReportStatus.FAILED;
    this._generatedAt = new Date();
  }
}

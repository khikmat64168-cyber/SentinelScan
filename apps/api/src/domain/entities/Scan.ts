import { v4 as uuidv4 } from 'uuid';
import { BusinessRuleError } from '../errors';

export enum ScanStatus {
  PENDING   = 'PENDING',
  RUNNING   = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
  CANCELLED = 'CANCELLED',
}

const ALLOWED_TRANSITIONS: Record<ScanStatus, ScanStatus[]> = {
  [ScanStatus.PENDING]:   [ScanStatus.RUNNING, ScanStatus.CANCELLED],
  [ScanStatus.RUNNING]:   [ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED],
  [ScanStatus.COMPLETED]: [],
  [ScanStatus.FAILED]:    [],
  [ScanStatus.CANCELLED]: [],
};

export interface CreateScanProps {
  targetId: string;
  projectId: string;
  createdBy: string;
  pluginIds: string[];
}

export interface RehydrateScanProps {
  id: string;
  targetId: string;
  projectId: string;
  createdBy: string;
  pluginIds: string[];
  status: ScanStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

export class Scan {
  readonly id: string;
  readonly targetId: string;
  readonly projectId: string;
  readonly createdBy: string;
  readonly pluginIds: string[];
  private _status: ScanStatus;
  private _startedAt: Date | null;
  private _completedAt: Date | null;
  private _errorMessage: string | null;
  readonly createdAt: Date;

  private constructor(props: RehydrateScanProps) {
    this.id = props.id;
    this.targetId = props.targetId;
    this.projectId = props.projectId;
    this.createdBy = props.createdBy;
    this.pluginIds = [...props.pluginIds];
    this._status = props.status;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._errorMessage = props.errorMessage;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateScanProps): Scan {
    return new Scan({
      id: uuidv4(),
      targetId: props.targetId,
      projectId: props.projectId,
      createdBy: props.createdBy,
      pluginIds: props.pluginIds,
      status: ScanStatus.PENDING,
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      createdAt: new Date(),
    });
  }

  static rehydrate(props: RehydrateScanProps): Scan {
    return new Scan(props);
  }

  get status(): ScanStatus { return this._status; }
  get startedAt(): Date | null { return this._startedAt; }
  get completedAt(): Date | null { return this._completedAt; }
  get errorMessage(): string | null { return this._errorMessage; }

  start(): void {
    this._transition(ScanStatus.RUNNING);
    this._startedAt = new Date();
  }

  complete(): void {
    this._transition(ScanStatus.COMPLETED);
    this._completedAt = new Date();
  }

  fail(message: string): void {
    this._transition(ScanStatus.FAILED);
    this._completedAt = new Date();
    this._errorMessage = message;
  }

  cancel(): void {
    this._transition(ScanStatus.CANCELLED);
    this._completedAt = new Date();
  }

  isTerminal(): boolean {
    const terminals: ScanStatus[] = [ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED];
    return terminals.includes(this._status);
  }

  private _transition(next: ScanStatus): void {
    const allowed = ALLOWED_TRANSITIONS[this._status] ?? [];
    if (!allowed.includes(next)) {
      throw new BusinessRuleError(
        `Cannot transition scan from ${this._status} to ${next}.`,
      );
    }
    this._status = next;
  }
}

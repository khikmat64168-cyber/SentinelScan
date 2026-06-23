import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
  USER_LOGIN          = 'USER_LOGIN',
  USER_LOGOUT         = 'USER_LOGOUT',
  USER_CREATED        = 'USER_CREATED',
  USER_ROLE_CHANGED   = 'USER_ROLE_CHANGED',
  USER_DEACTIVATED    = 'USER_DEACTIVATED',
  PROJECT_CREATED     = 'PROJECT_CREATED',
  PROJECT_ARCHIVED    = 'PROJECT_ARCHIVED',
  TARGET_CREATED      = 'TARGET_CREATED',
  TARGET_AUTHORIZED   = 'TARGET_AUTHORIZED',
  TARGET_UNAUTHORIZED = 'TARGET_UNAUTHORIZED',
  SCAN_STARTED        = 'SCAN_STARTED',
  SCAN_COMPLETED      = 'SCAN_COMPLETED',
  SCAN_FAILED         = 'SCAN_FAILED',
  SCAN_CANCELLED      = 'SCAN_CANCELLED',
  REPORT_GENERATED    = 'REPORT_GENERATED',
}

export interface CreateAuditLogProps {
  action: AuditAction;
  actorId: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export interface RehydrateAuditLogProps {
  id: string;
  action: AuditAction;
  actorId: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
}

export class AuditLog {
  readonly id: string;
  readonly action: AuditAction;
  readonly actorId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly metadata: Record<string, unknown>;
  readonly ipAddress: string | null;
  readonly createdAt: Date;

  private constructor(props: RehydrateAuditLogProps) {
    this.id           = props.id;
    this.action       = props.action;
    this.actorId      = props.actorId;
    this.resourceType = props.resourceType;
    this.resourceId   = props.resourceId;
    this.metadata     = props.metadata;
    this.ipAddress    = props.ipAddress;
    this.createdAt    = props.createdAt;
  }

  static create(props: CreateAuditLogProps): AuditLog {
    return new AuditLog({
      id:           uuidv4(),
      action:       props.action,
      actorId:      props.actorId,
      resourceType: props.resourceType,
      resourceId:   props.resourceId,
      metadata:     props.metadata ?? {},
      ipAddress:    props.ipAddress ?? null,
      createdAt:    new Date(),
    });
  }

  static rehydrate(props: RehydrateAuditLogProps): AuditLog {
    return new AuditLog(props);
  }
}

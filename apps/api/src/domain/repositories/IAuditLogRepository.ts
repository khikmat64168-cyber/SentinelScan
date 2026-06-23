import type { AuditLog, AuditAction } from '../entities/AuditLog';

export interface AuditLogFilter {
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: AuditAction;
  from?: Date;
  to?: Date;
}

export interface IAuditLogRepository {
  findById(id: string): Promise<AuditLog | null>;
  findByFilter(filter: AuditLogFilter): Promise<AuditLog[]>;
  save(log: AuditLog): Promise<void>;
}

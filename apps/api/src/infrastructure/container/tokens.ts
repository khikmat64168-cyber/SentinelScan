export const TOKENS = {
  Pool:               Symbol('Pool'),
  Redis:              Symbol('Redis'),
  UserRepository:     Symbol('UserRepository'),
  ProjectRepository:  Symbol('ProjectRepository'),
  TargetRepository:   Symbol('TargetRepository'),
  ScanRepository:     Symbol('ScanRepository'),
  FindingRepository:  Symbol('FindingRepository'),
  ReportRepository:   Symbol('ReportRepository'),
  AuditLogRepository: Symbol('AuditLogRepository'),
} as const;

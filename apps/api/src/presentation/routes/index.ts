import { Router } from 'express';
import { container, TOKENS } from '@infrastructure/container';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IProjectRepository } from '@domain/repositories/IProjectRepository';
import type { ITargetRepository } from '@domain/repositories/ITargetRepository';
import type { IScanRepository } from '@domain/repositories/IScanRepository';
import type { IFindingRepository } from '@domain/repositories/IFindingRepository';
import type { IReportRepository } from '@domain/repositories/IReportRepository';
import type { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import type { AuthService } from '@application/auth/AuthService';
import { RegisterUseCase } from '@application/auth/RegisterUseCase';
import { LoginUseCase } from '@application/auth/LoginUseCase';
import { LogoutUseCase } from '@application/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@application/auth/RefreshTokenUseCase';
import { CreateProjectUseCase } from '@application/project/CreateProjectUseCase';
import { GetProjectUseCase } from '@application/project/GetProjectUseCase';
import { ListProjectsUseCase } from '@application/project/ListProjectsUseCase';
import { UpdateProjectUseCase } from '@application/project/UpdateProjectUseCase';
import { ArchiveProjectUseCase } from '@application/project/ArchiveProjectUseCase';
import { CreateTargetUseCase } from '@application/target/CreateTargetUseCase';
import { AuthorizeTargetUseCase } from '@application/target/AuthorizeTargetUseCase';
import { ListTargetsUseCase } from '@application/target/ListTargetsUseCase';
import { StartScanUseCase } from '@application/scan/StartScanUseCase';
import { CancelScanUseCase } from '@application/scan/CancelScanUseCase';
import { GetScanUseCase } from '@application/scan/GetScanUseCase';
import { ListScansUseCase } from '@application/scan/ListScansUseCase';
import { ListFindingsUseCase } from '@application/finding/ListFindingsUseCase';
import { GenerateReportUseCase } from '@application/report/GenerateReportUseCase';
import { GetReportUseCase } from '@application/report/GetReportUseCase';
import { createAuthMiddleware } from '../middleware/authenticate';
import { AuthController } from '../controllers/AuthController';
import { ProjectController } from '../controllers/ProjectController';
import { TargetController } from '../controllers/TargetController';
import { ScanController } from '../controllers/ScanController';
import { FindingController } from '../controllers/FindingController';
import { ReportController } from '../controllers/ReportController';
import { createAuthRouter } from './auth.routes';
import { createProjectRouter } from './project.routes';
import { createTargetRouter } from './target.routes';
import { createScanRouter, createScansByProjectRouter } from './scan.routes';
import { createFindingRouter } from './finding.routes';
import { createReportRouter } from './report.routes';

export function createApiRouter(): Router {
  const userRepo    = container.resolve<IUserRepository>(TOKENS.UserRepository);
  const projectRepo = container.resolve<IProjectRepository>(TOKENS.ProjectRepository);
  const targetRepo  = container.resolve<ITargetRepository>(TOKENS.TargetRepository);
  const scanRepo    = container.resolve<IScanRepository>(TOKENS.ScanRepository);
  const findingRepo = container.resolve<IFindingRepository>(TOKENS.FindingRepository);
  const reportRepo  = container.resolve<IReportRepository>(TOKENS.ReportRepository);
  const auditRepo   = container.resolve<IAuditLogRepository>(TOKENS.AuditLogRepository);
  const authService = container.resolve<AuthService>(TOKENS.AuthService);

  const authenticate = createAuthMiddleware(authService);

  const authController = new AuthController(
    new RegisterUseCase(userRepo, auditRepo),
    new LoginUseCase(authService, auditRepo),
    new LogoutUseCase(authService, auditRepo),
    new RefreshTokenUseCase(authService),
  );

  const projectController = new ProjectController(
    new CreateProjectUseCase(projectRepo, auditRepo),
    new GetProjectUseCase(projectRepo),
    new ListProjectsUseCase(projectRepo),
    new UpdateProjectUseCase(projectRepo),
    new ArchiveProjectUseCase(projectRepo, auditRepo),
  );

  const targetController = new TargetController(
    new CreateTargetUseCase(targetRepo, auditRepo),
    new AuthorizeTargetUseCase(targetRepo, auditRepo),
    new ListTargetsUseCase(targetRepo),
  );

  const scanController = new ScanController(
    new StartScanUseCase(scanRepo, targetRepo, auditRepo),
    new CancelScanUseCase(scanRepo, auditRepo),
    new GetScanUseCase(scanRepo),
    new ListScansUseCase(scanRepo),
  );

  const findingController = new FindingController(
    new ListFindingsUseCase(findingRepo),
  );

  const reportController = new ReportController(
    new GenerateReportUseCase(reportRepo, scanRepo, auditRepo),
    new GetReportUseCase(reportRepo),
  );

  const router = Router();

  router.use('/auth',     createAuthRouter(authController, authenticate));
  router.use('/projects', createProjectRouter(projectController, authenticate));
  router.use('/targets',  createTargetRouter(targetController, authenticate));
  router.use('/scans',    createScanRouter(scanController, authenticate));
  router.use('/reports',  createReportRouter(reportController, authenticate));

  // Nested: GET /api/v1/projects/:projectId/targets
  router.use('/projects/:projectId/targets',
    createTargetRouter(targetController, authenticate));

  // Nested: GET /api/v1/projects/:projectId/scans
  router.use('/projects/:projectId/scans',
    createScansByProjectRouter(scanController, authenticate));

  // Nested: GET /api/v1/scans/:scanId/findings
  router.use('/scans/:scanId/findings',
    createFindingRouter(findingController, authenticate));

  return router;
}

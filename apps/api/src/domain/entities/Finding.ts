import { v4 as uuidv4 } from 'uuid';
import { Severity } from '../value-objects/Severity';
import type { SeverityLevel } from '../value-objects/Severity';
import { CvssScore } from '../value-objects/CvssScore';

export enum FindingType {
  XSS                     = 'XSS',
  SQL_INJECTION           = 'SQL_INJECTION',
  SSRF                    = 'SSRF',
  OPEN_REDIRECT           = 'OPEN_REDIRECT',
  SENSITIVE_DATA_EXPOSURE = 'SENSITIVE_DATA_EXPOSURE',
  MISSING_SECURITY_HEADER = 'MISSING_SECURITY_HEADER',
  DIRECTORY_LISTING       = 'DIRECTORY_LISTING',
  INFORMATION_DISCLOSURE  = 'INFORMATION_DISCLOSURE',
  OTHER                   = 'OTHER',
}

export interface CreateFindingProps {
  scanId: string;
  targetId: string;
  pluginId: string;
  title: string;
  description: string;
  type: FindingType;
  severity: Severity;
  cvssScore?: CvssScore;
  evidence?: string;
  recommendation?: string;
  affectedUrl?: string;
}

export interface RehydrateFindingProps {
  id: string;
  scanId: string;
  targetId: string;
  pluginId: string;
  title: string;
  description: string;
  type: FindingType;
  severityLevel: SeverityLevel;
  cvssScore: number | null;
  evidence: string | null;
  recommendation: string | null;
  affectedUrl: string | null;
  createdAt: Date;
}

export class Finding {
  readonly id: string;
  readonly scanId: string;
  readonly targetId: string;
  readonly pluginId: string;
  readonly title: string;
  readonly description: string;
  readonly type: FindingType;
  readonly severity: Severity;
  readonly cvssScore: CvssScore | null;
  readonly evidence: string | null;
  readonly recommendation: string | null;
  readonly affectedUrl: string | null;
  readonly createdAt: Date;

  private constructor(props: {
    id: string;
    scanId: string;
    targetId: string;
    pluginId: string;
    title: string;
    description: string;
    type: FindingType;
    severity: Severity;
    cvssScore: CvssScore | null;
    evidence: string | null;
    recommendation: string | null;
    affectedUrl: string | null;
    createdAt: Date;
  }) {
    this.id           = props.id;
    this.scanId       = props.scanId;
    this.targetId     = props.targetId;
    this.pluginId     = props.pluginId;
    this.title        = props.title;
    this.description  = props.description;
    this.type         = props.type;
    this.severity     = props.severity;
    this.cvssScore    = props.cvssScore;
    this.evidence     = props.evidence;
    this.recommendation = props.recommendation;
    this.affectedUrl  = props.affectedUrl;
    this.createdAt    = props.createdAt;
  }

  static create(props: CreateFindingProps): Finding {
    return new Finding({
      id:             uuidv4(),
      scanId:         props.scanId,
      targetId:       props.targetId,
      pluginId:       props.pluginId,
      title:          props.title,
      description:    props.description,
      type:           props.type,
      severity:       props.severity,
      cvssScore:      props.cvssScore ?? null,
      evidence:       props.evidence ?? null,
      recommendation: props.recommendation ?? null,
      affectedUrl:    props.affectedUrl ?? null,
      createdAt:      new Date(),
    });
  }

  static rehydrate(props: RehydrateFindingProps): Finding {
    return new Finding({
      id:             props.id,
      scanId:         props.scanId,
      targetId:       props.targetId,
      pluginId:       props.pluginId,
      title:          props.title,
      description:    props.description,
      type:           props.type,
      severity:       Severity.of(props.severityLevel),
      cvssScore:      props.cvssScore !== null ? CvssScore.of(props.cvssScore) : null,
      evidence:       props.evidence,
      recommendation: props.recommendation,
      affectedUrl:    props.affectedUrl,
      createdAt:      props.createdAt,
    });
  }
}

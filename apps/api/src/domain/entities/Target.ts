import { v4 as uuidv4 } from 'uuid';
import { ScanTargetUrl } from '../value-objects';
import { BusinessRuleError } from '../errors';

export interface CreateTargetProps {
  url: string;
  projectId: string;
}

export interface RehydrateTargetProps {
  id: string;
  url: string;
  projectId: string;
  isAuthorized: boolean;
  authorizedAt: Date | null;
  authorizedBy: string | null;
  createdAt: Date;
}

export class Target {
  readonly id: string;
  private readonly _url: ScanTargetUrl;
  readonly projectId: string;
  private _isAuthorized: boolean;
  private _authorizedAt: Date | null;
  private _authorizedBy: string | null;
  readonly createdAt: Date;

  private constructor(
    id: string,
    url: ScanTargetUrl,
    projectId: string,
    isAuthorized: boolean,
    authorizedAt: Date | null,
    authorizedBy: string | null,
    createdAt: Date,
  ) {
    this.id = id;
    this._url = url;
    this.projectId = projectId;
    this._isAuthorized = isAuthorized;
    this._authorizedAt = authorizedAt;
    this._authorizedBy = authorizedBy;
    this.createdAt = createdAt;
  }

  static create(props: CreateTargetProps): Target {
    const url = ScanTargetUrl.create(props.url);
    return new Target(uuidv4(), url, props.projectId, false, null, null, new Date());
  }

  static rehydrate(props: RehydrateTargetProps): Target {
    const url = ScanTargetUrl.create(props.url);
    return new Target(
      props.id,
      url,
      props.projectId,
      props.isAuthorized,
      props.authorizedAt,
      props.authorizedBy,
      props.createdAt,
    );
  }

  get url(): ScanTargetUrl { return this._url; }
  get isAuthorized(): boolean { return this._isAuthorized; }
  get authorizedAt(): Date | null { return this._authorizedAt; }
  get authorizedBy(): string | null { return this._authorizedBy; }

  authorize(userId: string): void {
    this._isAuthorized = true;
    this._authorizedAt = new Date();
    this._authorizedBy = userId;
  }

  revokeAuthorization(): void {
    this._isAuthorized = false;
    this._authorizedAt = null;
    this._authorizedBy = null;
  }

  assertAuthorized(): void {
    if (!this._isAuthorized) {
      throw new BusinessRuleError(
        `Target "${this._url.value}" has not been authorized for scanning.`,
      );
    }
  }
}

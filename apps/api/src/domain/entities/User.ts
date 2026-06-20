import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN   = 'admin',
  ANALYST = 'analyst',
  VIEWER  = 'viewer',
}

export interface CreateUserProps {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface RehydrateUserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  private _email: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _isActive: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: RehydrateUserProps) {
    this.id = props.id;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isActive = props.isActive;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User({
      id: uuidv4(),
      email: props.email.toLowerCase().trim(),
      passwordHash: props.passwordHash,
      role: props.role ?? UserRole.ANALYST,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: RehydrateUserProps): User {
    return new User(props);
  }

  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get role(): UserRole { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }

  changeRole(newRole: UserRole): void {
    this._role = newRole;
    this._touch();
  }

  updatePasswordHash(newHash: string): void {
    this._passwordHash = newHash;
    this._touch();
  }

  deactivate(): void {
    this._isActive = false;
    this._touch();
  }

  activate(): void {
    this._isActive = true;
    this._touch();
  }

  hasRole(...roles: UserRole[]): boolean {
    return roles.includes(this._role);
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';

export interface CreateProjectProps {
  name: string;
  description?: string;
  ownerId: string;
}

export interface RehydrateProjectProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  readonly id: string;
  private _name: string;
  private _description: string;
  readonly ownerId: string;
  private _isArchived: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: RehydrateProjectProps) {
    this.id = props.id;
    this._name = props.name;
    this._description = props.description;
    this.ownerId = props.ownerId;
    this._isArchived = props.isArchived;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateProjectProps): Project {
    const name = props.name.trim();
    if (name.length === 0) {
      throw new ValidationError('Project name cannot be empty');
    }
    const now = new Date();
    return new Project({
      id: uuidv4(),
      name,
      description: props.description?.trim() ?? '',
      ownerId: props.ownerId,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: RehydrateProjectProps): Project {
    return new Project(props);
  }

  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get isArchived(): boolean { return this._isArchived; }
  get updatedAt(): Date { return this._updatedAt; }

  rename(newName: string): void {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('Project name cannot be empty');
    }
    this._name = trimmed;
    this._touch();
  }

  updateDescription(description: string): void {
    this._description = description.trim();
    this._touch();
  }

  archive(): void {
    this._isArchived = true;
    this._touch();
  }

  unarchive(): void {
    this._isArchived = false;
    this._touch();
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}

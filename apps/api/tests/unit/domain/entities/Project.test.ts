import { Project } from '@domain/entities/Project';
import { ValidationError } from '@domain/errors';

const OWNER = 'user-uuid-123';

describe('Project', () => {
  describe('create()', () => {
    it('creates a project with trimmed name', () => {
      const p = Project.create({ name: '  My Project  ', ownerId: OWNER });
      expect(p.name).toBe('My Project');
    });

    it('defaults description to empty string', () => {
      const p = Project.create({ name: 'P', ownerId: OWNER });
      expect(p.description).toBe('');
    });

    it('stores provided description trimmed', () => {
      const p = Project.create({ name: 'P', ownerId: OWNER, description: '  desc  ' });
      expect(p.description).toBe('desc');
    });

    it('starts not archived', () => {
      const p = Project.create({ name: 'P', ownerId: OWNER });
      expect(p.isArchived).toBe(false);
    });

    it('throws ValidationError for empty name', () => {
      expect(() => Project.create({ name: '   ', ownerId: OWNER })).toThrow(ValidationError);
    });

    it('generates a unique id', () => {
      const a = Project.create({ name: 'A', ownerId: OWNER });
      const b = Project.create({ name: 'B', ownerId: OWNER });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('rename()', () => {
    it('updates the name', () => {
      const p = Project.create({ name: 'Old', ownerId: OWNER });
      p.rename('New Name');
      expect(p.name).toBe('New Name');
    });

    it('throws ValidationError for blank name', () => {
      const p = Project.create({ name: 'Old', ownerId: OWNER });
      expect(() => p.rename('')).toThrow(ValidationError);
    });

    it('bumps updatedAt', () => {
      const p = Project.create({ name: 'Old', ownerId: OWNER });
      const before = p.updatedAt;
      p.rename('New');
      expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('archive() / unarchive()', () => {
    it('archives a project', () => {
      const p = Project.create({ name: 'P', ownerId: OWNER });
      p.archive();
      expect(p.isArchived).toBe(true);
    });

    it('unarchives a project', () => {
      const p = Project.create({ name: 'P', ownerId: OWNER });
      p.archive();
      p.unarchive();
      expect(p.isArchived).toBe(false);
    });
  });
});

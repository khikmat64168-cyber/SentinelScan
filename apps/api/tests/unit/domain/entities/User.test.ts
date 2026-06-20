import { User, UserRole } from '@domain/entities/User';

const HASH = '$2b$10$testhashtesthashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh';

describe('User', () => {
  describe('create()', () => {
    it('normalises email to lowercase', () => {
      const user = User.create({ email: 'TEST@EXAMPLE.COM', passwordHash: HASH });
      expect(user.email).toBe('test@example.com');
    });

    it('assigns ANALYST role by default', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      expect(user.role).toBe(UserRole.ANALYST);
    });

    it('accepts an explicit role', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH, role: UserRole.ADMIN });
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('creates an active user', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      expect(user.isActive).toBe(true);
    });

    it('generates a unique id', () => {
      const a = User.create({ email: 'a@b.com', passwordHash: HASH });
      const b = User.create({ email: 'b@b.com', passwordHash: HASH });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('rehydrate()', () => {
    it('restores all fields from persistence', () => {
      const now = new Date();
      const user = User.rehydrate({
        id: 'abc-123',
        email: 'x@y.com',
        passwordHash: HASH,
        role: UserRole.VIEWER,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });
      expect(user.id).toBe('abc-123');
      expect(user.role).toBe(UserRole.VIEWER);
      expect(user.isActive).toBe(false);
    });
  });

  describe('changeRole()', () => {
    it('updates the role', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      user.changeRole(UserRole.VIEWER);
      expect(user.role).toBe(UserRole.VIEWER);
    });

    it('bumps updatedAt', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      const before = user.updatedAt;
      user.changeRole(UserRole.ADMIN);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('deactivate() / activate()', () => {
    it('deactivates an active user', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      user.deactivate();
      expect(user.isActive).toBe(false);
    });

    it('reactivates a deactivated user', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH });
      user.deactivate();
      user.activate();
      expect(user.isActive).toBe(true);
    });
  });

  describe('hasRole()', () => {
    it('returns true when role matches', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH, role: UserRole.ADMIN });
      expect(user.hasRole(UserRole.ADMIN, UserRole.ANALYST)).toBe(true);
    });

    it('returns false when role does not match', () => {
      const user = User.create({ email: 'a@b.com', passwordHash: HASH, role: UserRole.VIEWER });
      expect(user.hasRole(UserRole.ADMIN, UserRole.ANALYST)).toBe(false);
    });
  });
});

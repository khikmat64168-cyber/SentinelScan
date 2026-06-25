import type { Pool } from 'pg';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import type { UserRole } from '@domain/entities/User';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );
    const row = result.rows[0];
    return row ? this._toEntity(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         email         = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         role          = EXCLUDED.role,
         is_active     = EXCLUDED.is_active,
         updated_at    = EXCLUDED.updated_at`,
      [user.id, user.email, user.passwordHash, user.role, user.isActive, user.createdAt, user.updatedAt],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private _toEntity(row: UserRow): User {
    return User.rehydrate({
      id:           row.id,
      email:        row.email,
      passwordHash: row.password_hash,
      role:         row.role as UserRole,
      isActive:     row.is_active,
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    });
  }
}

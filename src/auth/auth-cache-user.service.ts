import { Injectable } from '@nestjs/common';

type User = {
  email: string;
  id: string;
  permissions: Record<string, string[]>;
  name?: string;
};

@Injectable()
export class AuthCacheService {
  private cache = new Map<string, { user: User; expiresAt: number }>();

  get(token: string): { user: User; expiresAt: number } | undefined {
    return this.cache.get(token);
  }

  set(token: string, user: User, ttlMs = 10 * 60 * 1000): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(token, { user, expiresAt });
  }

  delete(token: string): void {
    this.cache.delete(token);
  }

  clear(): void {
    this.cache.clear();
  }
}

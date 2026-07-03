import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { PrismaClient } from '@prisma/client-auth';

/**
 * Base class for managing multiple Prisma instances (one per company/tenant).
 * Handles connection pooling, idle eviction, and cleanup.
 */
@Injectable()
export abstract class BasePrismaMultiService implements OnModuleDestroy {
  private clients: Map<string, PrismaClient> = new Map();
  private pendingClients: Map<string, Promise<PrismaClient>> = new Map();
  private lastUsed: Map<string, number> = new Map();
  private evictionTimer: NodeJS.Timeout;

  // Configuration constants
  protected readonly IDLE_TTL_MS = 5 * 60 * 1000; // 5 min (Aggressive for RDS)
  protected readonly EVICTION_INTERVAL_MS = 2 * 60 * 1000; // 2 min

  constructor() {
    this.evictionTimer = setInterval(
      () => this.evictIdleClients(),
      this.EVICTION_INTERVAL_MS,
    );
  }

  async onModuleDestroy() {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
    }
    for (const [, client] of this.clients) {
      try {
        await client.$disconnect();
      } catch (e) {
        console.error(`[PrismaMulti] Error disconnecting client:`, e);
      }
    }
    this.clients.clear();
    this.pendingClients.clear();
    this.lastUsed.clear();
  }

  /**
   * Implement this method to define how the database URL is constructed for a given company.
   */
  protected abstract getDatabaseUrl(empresa: string): string;

  /**
   * Normalizes the database URL to include connection pooling parameters.
   */
  private normalizeUrl(url: string): string {
    if (url.includes('connection_limit')) return url;
    const separator = url.includes('?') ? '&' : '?';
    // connection_limit=2 is safe for RDS t3.micro/small with many tenants
    return `${url}${separator}connection_limit=3&pool_timeout=15`;
  }

  /**
   * Gets or creates a PrismaClient for the specified company.
   */
  async getClientForCompany(empresa: string): Promise<PrismaClient> {
    this.lastUsed.set(empresa, Date.now());

    // 1. Check if client already exists
    const existingClient = this.clients.get(empresa);
    if (existingClient) {
      return existingClient;
    }

    // 2. Check if creation is already in progress (prevents race conditions)
    const pending = this.pendingClients.get(empresa);
    if (pending) {
      return pending;
    }

    // 3. Create the creation promise
    const creationPromise = (async () => {
      try {
        const rawUrl = this.getDatabaseUrl(empresa);
        const databaseUrl = this.normalizeUrl(rawUrl);

        console.log(`[PrismaMulti] Initializing client for: ${empresa}`);

        const client = new PrismaClient({
          datasources: { db: { url: databaseUrl } },
        });
        client.$use(auditMiddleware(client));

        // We don't await $connect() here to allow lazy connection
        this.clients.set(empresa, client);
        return client;
      } finally {
        this.pendingClients.delete(empresa);
      }
    })();

    this.pendingClients.set(empresa, creationPromise);
    return creationPromise;
  }

  /**
   * Periodically removes clients that haven't been used for a while.
   */
  private async evictIdleClients() {
    const now = Date.now();
    for (const [empresa, ts] of this.lastUsed) {
      if (now - ts > this.IDLE_TTL_MS) {
        const client = this.clients.get(empresa);
        if (client) {
          console.log(`[PrismaMulti] Evicting idle client for: ${empresa}`);
          try {
            await client.$disconnect();
          } catch (e) {
            console.error(
              `[PrismaMulti] Error during eviction disconnect for ${empresa}:`,
              e,
            );
          }
          this.clients.delete(empresa);
          this.lastUsed.delete(empresa);
        }
      }
    }
  }
}

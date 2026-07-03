import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      databaseUrl += `${separator}connection_limit=3&pool_timeout=15`;
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
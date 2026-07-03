import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client-auth';

@Injectable()
export class PrismaServiceAuth implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    let databaseUrl = process.env.DATABASE_URL_AUTH;

    // Limit connections to avoid exhausting RDS slots
    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      databaseUrl += `${separator}connection_limit=2&pool_timeout=20`;
    }

    this.connectToDatabase(databaseUrl);
  }

  private connectToDatabase(databaseUrl: string) {
    if (this.prisma) {
      this.prisma.$disconnect();
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Agrega middlewares o cualquier configuración adicional necesaria
    this.prisma.$use(async (params, next) => {
      try {
        const result = await next(params);
        return result;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new Error(
              `Unique constraint failed on the field: ${error.meta?.target}`,
            );
          }
          if (error.code === 'P2003') {
            throw new Error('Foreign key constraint violated');
          }
        }
        throw error;
      }
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  setDatabaseUrl(databaseUrl: string) {
    // Cambia la URL de conexión y reconecta
    this.connectToDatabase(databaseUrl);
  }

  get client() {
    return this.prisma;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}

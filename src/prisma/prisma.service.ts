import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: any;
  private currentDatabaseUrl: string;

  constructor() {
    let databaseUrl = process.env.DATABASE_URL;

    // Limit connections to avoid exhausting RDS slots
    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      databaseUrl += `${separator}connection_limit=2&pool_timeout=20`;
    }

    this.currentDatabaseUrl = databaseUrl;
    // this.prisma = this.createPrismaClient(databaseUrl);
  }

  private createPrismaClient(databaseUrl: string): any {
    /* return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    }); */
    return null;
  }

  async onModuleInit() {
    await this.prisma.$connect();
    //await this.prismaAuth.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    //await this.prismaAuth.$disconnect();
  }

  get client() {
    return this.prisma;
  }

  // async setDatabaseUrl(databaseUrl: string) {
  //   if (this.currentDatabaseUrl !== databaseUrl) {
  //     this.currentDatabaseUrl = databaseUrl;

  //     console.log('conexion desconectada');
  //     await this.prisma.$disconnect();

  //     this.prisma = this.createPrismaClient(databaseUrl);
  //     console.log('conexion conectada');
  //     await this.prisma.$connect();
  //   }
  // }
}

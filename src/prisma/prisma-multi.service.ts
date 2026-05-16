import { Injectable } from '@nestjs/common';
import { BasePrismaMultiService } from './prisma-multi-base.service';

@Injectable()
export class PrismaMultiService extends BasePrismaMultiService {
  /**
   * Constructs the database URL specifically for the Control Activos API.
   */
  protected getDatabaseUrl(empresa: string): string {
    const isProd = process.env.CONTROL_ACTIVOS_ENV === 'prod';
    const pass_db = process.env.PASS_DB_AWS;
    const pass_db_neon = process.env.PASS_DB_NEON;
    const port_db = process.env.PORT_DB;
    const databaseDev = process.env.DATABASE_URL;

    // Control Activos database name pattern: {empresa}_activos
    if (isProd) {
      return `postgresql://postgres:${pass_db}@database-1.c5gm0gwc8i0f.us-east-1.rds.amazonaws.com:${port_db}/${empresa}_activos`;
    }

    if (process.env.CONTROL_ACTIVOS_ENV === 'dev') {
      return databaseDev;
    }

    return `postgresql://neondb_owner:${pass_db_neon}@ep-gentle-thunder-aalvtxgi-pooler.westus3.azure.neon.tech/${empresa}_activos`;
  }
}

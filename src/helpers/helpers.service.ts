import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class HelpersService {
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, 'clave_secreta').toString();
  }

  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, 'clave_secreta');
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async runPrismaMigrations(databaseName: string) {
    const url = `postgresql://postgres:khElE2jvQJrsfI6a8MTP@database-1.c5gm0gwc8i0f.us-east-1.rds.amazonaws.com:5432/${databaseName}`;
    try {
      // npx prisma db push --force-reset
      await execAsync('npx prisma migrate deploy', {
        env: {
          ...process.env,
          DATABASE_URL: url,
        },
      });

      return {
        status: 'success',
        message: 'La migración se realizó correctamente.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error al ejecutar la migración: ${error.message}`,
      };
    }
  }
}

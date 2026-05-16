import { Module } from '@nestjs/common';
import { PrismaServiceAuth } from './prisma-auth.service';

@Module({
  providers: [PrismaServiceAuth],
  exports: [PrismaServiceAuth],
})
export class SecondaryPrismaModule { }
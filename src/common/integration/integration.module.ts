import { Global, Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}

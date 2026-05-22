import { Module } from '@nestjs/common';
import { InfoExternalService } from './info-external.service';
import { InfoExternalController } from './info-external.controller';

@Module({
  controllers: [InfoExternalController],
  providers: [InfoExternalService],
})
export class InfoExternalModule {}

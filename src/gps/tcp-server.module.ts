import { Module } from '@nestjs/common';
import { GpsController } from './tcp-server.controller';
import { GpsService } from './tcp-server.service';


@Module({
  controllers: [
    GpsController,
  ],
  providers: [
    GpsService,
  ],
})
export class GpsModule {}
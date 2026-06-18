import { Module } from '@nestjs/common';
import { GpsDeviceService } from './gps-device.service';
import { GpsDeviceController } from './gps-device.controller';

@Module({
  controllers: [GpsDeviceController],
  providers: [GpsDeviceService],
})
export class GpsDeviceModule {}

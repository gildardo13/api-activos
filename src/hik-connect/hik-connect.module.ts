import { Module } from '@nestjs/common';
import { HikConnectService } from './hik-connect.service';
import { HikConnectController } from './hik-connect.controller';

@Module({
  controllers: [HikConnectController],
  providers: [HikConnectService],
})
export class HikConnectModule {}

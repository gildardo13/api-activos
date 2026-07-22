import { Module } from '@nestjs/common';
import { CamLiveService } from './cam-live.service';
import { CamLiveController } from './cam-live.controller';

@Module({
  controllers: [CamLiveController],
  providers: [CamLiveService],
})
export class CamLiveModule {}

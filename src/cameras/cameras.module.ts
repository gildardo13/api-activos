import { Module } from '@nestjs/common';
import { CamerasController } from './cameras.controller';

@Module({
  controllers: [CamerasController],
})
export class CamerasModule {}

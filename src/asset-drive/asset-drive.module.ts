import { Module } from '@nestjs/common';
import { AssetDriveService } from './asset-drive.service';
import { AssetDriveController } from './asset-drive.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssetDriveController],
  providers: [AssetDriveService],
})
export class AssetDriveModule {}

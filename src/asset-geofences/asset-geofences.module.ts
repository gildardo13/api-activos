import { Module } from '@nestjs/common';
import { AssetGeofencesService } from './asset-geofences.service';
import { AssetGeofencesController } from './asset-geofences.controller';

@Module({
  controllers: [AssetGeofencesController],
  providers: [AssetGeofencesService],
})
export class AssetGeofencesModule {}

import { forwardRef, Module } from '@nestjs/common';
import { AssetGeofencesService } from './asset-geofences.service';
import { AssetGeofencesController } from './asset-geofences.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';

@Module({
  imports:[forwardRef(() => ApprovalFlowsModule)],
  controllers: [AssetGeofencesController],
  providers: [AssetGeofencesService],
  exports:[AssetGeofencesService]
})
export class AssetGeofencesModule {}

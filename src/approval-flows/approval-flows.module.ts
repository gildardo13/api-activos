import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovalFlowsController } from './approval-flows.controller';
import { AssetAssignmentsModule } from 'src/asset-assignments/asset-assignments.module';
import { AssetsModule } from 'src/assets/assets.module';
import { AssetGeofencesModule } from 'src/asset-geofences/asset-geofences.module';

@Module({
  imports: [HttpModule, 
    forwardRef(() => AssetAssignmentsModule), 
    forwardRef(() => AssetsModule),
    forwardRef(()=>AssetGeofencesModule)],
  controllers: [ApprovalFlowsController],
  providers: [ApprovalFlowsService],
  exports: [ApprovalFlowsService],
})
export class ApprovalFlowsModule { }


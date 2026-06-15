import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovalFlowsController } from './approval-flows.controller';
import { AssetAssignmentsModule } from 'src/asset-assignments/asset-assignments.module';
import { AssetsModule } from 'src/assets/assets.module';
import { AssetGeofencesModule } from 'src/asset-geofences/asset-geofences.module';
import { AssetDocumentsModule } from 'src/asset-documents/asset-documents.module';

@Module({
  imports: [HttpModule,
    forwardRef(() => AssetAssignmentsModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => AssetGeofencesModule),
    forwardRef(() => AssetDocumentsModule)],
  controllers: [ApprovalFlowsController],
  providers: [ApprovalFlowsService],
  exports: [ApprovalFlowsService],
})
export class ApprovalFlowsModule { }


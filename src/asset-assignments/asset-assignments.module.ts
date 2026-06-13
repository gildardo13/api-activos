import { forwardRef, Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { AssetAssignmentsController } from './asset-assignments.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';

@Module({
  imports: [
    forwardRef(() => ApprovalFlowsModule),
  ],
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService],
  exports: [AssetAssignmentsService],
})
export class AssetAssignmentsModule { }

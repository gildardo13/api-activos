import { Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { AssetAssignmentsController } from './asset-assignments.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';

@Module({
  imports: [ApprovalFlowsModule],
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService],
})
export class AssetAssignmentsModule { }

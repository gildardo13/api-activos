import { Module } from '@nestjs/common';
import { ApprovalFlowBodyService } from './approval-flow-body.service';
import { ApprovalFlowBodyController } from './approval-flow-body.controller';

@Module({
  controllers: [ApprovalFlowBodyController],
  providers: [ApprovalFlowBodyService],
})
export class ApprovalFlowBodyModule {}

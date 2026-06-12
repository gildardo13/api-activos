import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovalFlowsController } from './approval-flows.controller';

@Module({
  imports: [HttpModule],
  controllers: [ApprovalFlowsController],
  providers: [ApprovalFlowsService],
  exports: [ApprovalFlowsService],
})
export class ApprovalFlowsModule {}


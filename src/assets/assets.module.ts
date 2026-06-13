import { forwardRef, Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';

@Module({
  imports: [ApprovalFlowsModule, forwardRef(() => ApprovalFlowsModule)],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule { }

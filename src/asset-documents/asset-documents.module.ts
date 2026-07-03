import { forwardRef, Module } from '@nestjs/common';
import { AssetDocumentsService } from './asset-documents.service';
import { AssetDocumentsController } from './asset-documents.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';

@Module({
  imports: [
    forwardRef(() => ApprovalFlowsModule),
  ],
  controllers: [AssetDocumentsController],
  providers: [AssetDocumentsService],
  exports: [AssetDocumentsService],
})
export class AssetDocumentsModule { }

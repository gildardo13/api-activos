import { forwardRef, Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { ApprovalFlowsModule } from 'src/approval-flows/approval-flows.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    ApprovalFlowsModule,
    forwardRef(() => ApprovalFlowsModule),
    CloudinaryModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule { }

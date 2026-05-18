import { Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { AssetAssignmentsController } from './asset-assignments.controller';

@Module({
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService],
})
export class AssetAssignmentsModule {}

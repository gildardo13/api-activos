import { Module } from '@nestjs/common';
import { AssetDocumentsService } from './asset-documents.service';
import { AssetDocumentsController } from './asset-documents.controller';

@Module({
  controllers: [AssetDocumentsController],
  providers: [AssetDocumentsService],
})
export class AssetDocumentsModule {}

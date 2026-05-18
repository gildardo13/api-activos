import { Module } from '@nestjs/common';
import { AssetDocumentChunksService } from './asset-document-chunks.service';
import { AssetDocumentChunksController } from './asset-document-chunks.controller';

@Module({
  controllers: [AssetDocumentChunksController],
  providers: [AssetDocumentChunksService],
})
export class AssetDocumentChunksModule {}

import { Module } from '@nestjs/common';
import { AssetFieldDefinitionsService } from './asset-field-definitions.service';
import { AssetFieldDefinitionsController } from './asset-field-definitions.controller';

@Module({
  controllers: [AssetFieldDefinitionsController],
  providers: [AssetFieldDefinitionsService],
})
export class AssetFieldDefinitionsModule {}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetFieldDefinitionsService } from './asset-field-definitions.service';
import { CreateAssetFieldDefinitionDto } from './dto/create-asset-field-definition.dto';
import { UpdateAssetFieldDefinitionDto } from './dto/update-asset-field-definition.dto';

@Controller('asset-field-definitions')
export class AssetFieldDefinitionsController {
  constructor(private readonly assetFieldDefinitionsService: AssetFieldDefinitionsService) {}

  @Post()
  create(@Body() createAssetFieldDefinitionDto: CreateAssetFieldDefinitionDto) {
    return this.assetFieldDefinitionsService.create(createAssetFieldDefinitionDto);
  }

  @Get()
  findAll() {
    return this.assetFieldDefinitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetFieldDefinitionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetFieldDefinitionDto: UpdateAssetFieldDefinitionDto) {
    return this.assetFieldDefinitionsService.update(+id, updateAssetFieldDefinitionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetFieldDefinitionsService.remove(+id);
  }
}

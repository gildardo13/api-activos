import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';

@Controller('asset-types')
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Post()
  create(@Body() createAssetTypeDto: CreateAssetTypeDto) {
    return this.assetTypesService.create(createAssetTypeDto);
  }

  @Get()
  findAll() {
    return this.assetTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetTypeDto: UpdateAssetTypeDto) {
    return this.assetTypesService.update(+id, updateAssetTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetTypesService.remove(+id);
  }
}

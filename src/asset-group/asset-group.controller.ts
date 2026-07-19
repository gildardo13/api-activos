import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssetGroupService } from './asset-group.service';
import { CreateAssetGroupDto } from './dto/create-asset-group.dto';
import { UpdateAssetGroupDto } from './dto/update-asset-group.dto';
import { QueryAssetGroupDto } from './dto/query-asset-group.dto';
import { AssignAssetsDto } from './dto/assign-assets.dto';

@Controller('asset-group')
export class AssetGroupController {
  constructor(private readonly assetGroupService: AssetGroupService) {}

  @Post()
  create(@Body() createAssetGroupDto: CreateAssetGroupDto) {
    return this.assetGroupService.create(createAssetGroupDto);
  }

  @Get()
  findAll(@Query() query: QueryAssetGroupDto) {
    return this.assetGroupService.findAll(query);
  }

  @Get('all')
  findAllNoQuery() {
    return this.assetGroupService.findAllNoQuery();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetGroupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetGroupDto: UpdateAssetGroupDto) {
    return this.assetGroupService.update(id, updateAssetGroupDto);
  }

  @Patch(':id/assign-assets')
  assignAssets(@Param('id') id: string, @Body() dto: AssignAssetsDto) {
    return this.assetGroupService.assignAssets(id, dto.assetIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetGroupService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetAssignmentsService } from './asset-assignments.service';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';

@Controller('asset-assignments')
export class AssetAssignmentsController {
  constructor(private readonly assetAssignmentsService: AssetAssignmentsService) {}

  @Post()
  create(@Body() createAssetAssignmentDto: CreateAssetAssignmentDto) {
    return this.assetAssignmentsService.create(createAssetAssignmentDto);
  }

  @Get()
  findAll() {
    return this.assetAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetAssignmentDto: UpdateAssetAssignmentDto) {
    return this.assetAssignmentsService.update(+id, updateAssetAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetAssignmentsService.remove(+id);
  }
}

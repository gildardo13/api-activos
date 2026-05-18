import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetGeofencesService } from './asset-geofences.service';
import { CreateAssetGeofenceDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';

@Controller('asset-geofences')
export class AssetGeofencesController {
  constructor(private readonly assetGeofencesService: AssetGeofencesService) {}

  @Post()
  create(@Body() createAssetGeofenceDto: CreateAssetGeofenceDto) {
    return this.assetGeofencesService.create(createAssetGeofenceDto);
  }

  @Get()
  findAll() {
    return this.assetGeofencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetGeofencesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetGeofenceDto: UpdateAssetGeofenceDto) {
    return this.assetGeofencesService.update(+id, updateAssetGeofenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetGeofencesService.remove(+id);
  }
}

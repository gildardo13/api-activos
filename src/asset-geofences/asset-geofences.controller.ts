import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';

import { AssetGeofencesService } from './asset-geofences.service';
import { CreateAssetGeofenceDto } from './dto/create-asset-geofence.dto';
import { UpdateAssetGeofenceDto } from './dto/update-asset-geofence.dto';
import { PrismaClient } from '@prisma/client';

@Controller('asset-geofences')
export class AssetGeofencesController {
  constructor(
    private readonly assetGeofencesService: AssetGeofencesService,
  ) {}

  @Post('/createGeofence')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetGeofenceDto: CreateAssetGeofenceDto,
  ) {
    return this.assetGeofencesService.create(
      createAssetGeofenceDto
    );
  }

  @Get('/getAllAssetGeofences')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.assetGeofencesService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string
  ) {
    return this.assetGeofencesService.findOne(id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetGeofenceDto: UpdateAssetGeofenceDto,
  ) {
    return this.assetGeofencesService.update(
      id,
      updateAssetGeofenceDto,
    );
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string
  ) {
    return this.assetGeofencesService.remove(id);
  }
}
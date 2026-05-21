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

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetGeofenceDto: CreateAssetGeofenceDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetGeofencesService.create(
      createAssetGeofenceDto,
      prisma,
    );
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetGeofencesService.findAll(prisma);
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetGeofencesService.findOne(id, prisma);
  }

  @Patch('/update/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetGeofenceDto: UpdateAssetGeofenceDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetGeofencesService.update(
      id,
      updateAssetGeofenceDto,
      prisma,
    );
  }

  @Delete('/delete/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetGeofencesService.remove(id, prisma);
  }
}
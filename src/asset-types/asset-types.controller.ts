import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';
import { HttpCode } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Req, } from '@nestjs/common';
import { QueryAssetTypeDto } from './dto/query-asset-type.dto';

@Controller('asset-type')
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) { }

  @Post('/create-asset-type')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAssetTypeDto: CreateAssetTypeDto, @Req() req: Request) {
    return this.assetTypesService.create(createAssetTypeDto);
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryAssetTypeDto, @Req() req: Request) {
    return this.assetTypesService.findAll(query);
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTypesService.findOne(
      id,
      prisma,
    );
  }

  @Patch('/update-asset-type/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetTypeDto: UpdateAssetTypeDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTypesService.update(
      id,
      updateAssetTypeDto,
      prisma,
    );
  }

  @Put('/change-status/:id')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'DELETED',
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTypesService.changeStatus(
      id,
      status,
      prisma,
    );
  }
}

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

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaClient } from '@prisma/client';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAssetDto: CreateAssetDto, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetsService.create(createAssetDto, prisma);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetsService.findAll(prisma);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetsService.findOne(id, prisma);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetsService.update(id, updateAssetDto, prisma);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetsService.remove(id, prisma);
  }


  @Patch('/change-status/:id')
  @HttpCode(HttpStatus.OK)
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'DELETED',
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetsService.changeStatus(id, status, prisma);
  }
}
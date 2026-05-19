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

import { AssetAssignmentsService } from './asset-assignments.service';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { PrismaClient } from '@prisma/client';

@Controller('asset-assignments')
export class AssetAssignmentsController {
  constructor(
    private readonly assetAssignmentsService: AssetAssignmentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetAssignmentDto: CreateAssetAssignmentDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetAssignmentsService.create(
      createAssetAssignmentDto,
      prisma,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetAssignmentsService.findAll(prisma);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetAssignmentsService.findOne(id, prisma);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetAssignmentDto: UpdateAssetAssignmentDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetAssignmentsService.update(
      id,
      updateAssetAssignmentDto,
      prisma,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;
    return this.assetAssignmentsService.remove(id, prisma);
  }
}
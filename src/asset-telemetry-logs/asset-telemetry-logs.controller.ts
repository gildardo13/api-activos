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

import { AssetTelemetryLogsService } from './asset-telemetry-logs.service';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaClient } from '@prisma/client';

@Controller('asset-telemetry-logs')
export class AssetTelemetryLogsController {
  constructor(
    private readonly assetTelemetryLogsService: AssetTelemetryLogsService,
  ) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetTelemetryLogDto: CreateAssetTelemetryLogDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTelemetryLogsService.create(
      createAssetTelemetryLogDto,
      prisma,
    );
  }

  @Get('/find-all')
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTelemetryLogsService.findAll(prisma);
  }

  @Get('/find-one/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTelemetryLogsService.findOne(id, prisma);
  }

  @Patch('/update/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetTelemetryLogDto: UpdateAssetTelemetryLogDto,
    @Req() req: Request,
  ) {
    const prisma = req['prisma'] as PrismaClient;

    return this.assetTelemetryLogsService.update(
      id,
      updateAssetTelemetryLogDto,
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

    return this.assetTelemetryLogsService.remove(id, prisma);
  }
}
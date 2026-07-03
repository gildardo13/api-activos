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
  Query,
} from '@nestjs/common';

import { AssetTelemetryLogsService } from './asset-telemetry-logs.service';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';
import { PrismaClient } from '@prisma/client';
import { QueryAssetTelemetryLogDto } from './dto/query-asset-telemetry-log.dto';

@Controller('asset-telemetry-logs')
export class AssetTelemetryLogsController {
  constructor(
    private readonly assetTelemetryLogsService: AssetTelemetryLogsService,
  ) { }

  @Post('/create-asset-telemetry')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAssetTelemetryLogDto: CreateAssetTelemetryLogDto) {
    return this.assetTelemetryLogsService.create(
      createAssetTelemetryLogDto
    );
  }

  @Get('/getall-telemetry-logs')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.assetTelemetryLogsService.findAll();
  }

  @Get('/getall-latest-telemetry-logs')
  @HttpCode(HttpStatus.OK)
  findAllLatest() {
    return this.assetTelemetryLogsService.findAllLatest();
  }

  @Get('/getAll-telemetry-logs-by-asset/:assetId')
  @HttpCode(HttpStatus.OK)
  findAllHistoryByAsset(@Param('assetId') assetId: string) {
    return this.assetTelemetryLogsService.findAllHistoryByAsset(assetId);
  }


  @Get('/latest/:assetId')
  @HttpCode(HttpStatus.OK)
  findLatestByAssetId(@Param('assetId') assetId: string) {
    return this.assetTelemetryLogsService.findLatestByAsset(assetId);
  }

  @Get('/getOne-telemetry-log/:id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
  ) {
    return this.assetTelemetryLogsService.findOne(id);
  }

  @Patch('/updateAssetTelemetry/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAssetTelemetryLogDto: UpdateAssetTelemetryLogDto) {
    return this.assetTelemetryLogsService.update(
      id,
      updateAssetTelemetryLogDto,
    );
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
  ) {
    return this.assetTelemetryLogsService.remove(id);
  }

  @Get('getOneUniqueByAssetId/:assetId')
  @HttpCode(HttpStatus.OK)
  findOneUniqueByAssetId(
    @Param('assetId') assetId: string
  ) {
    return this.assetTelemetryLogsService.findOneUniqueByAssetId(assetId);
  }

  @Get('/getAll-telemetry-logs-query')
  @HttpCode(HttpStatus.OK)
  findAllQuery(@Query() query: QueryAssetTelemetryLogDto) {
    return this.assetTelemetryLogsService.findAllQuery(query);
  }

  @Get('/verify-limit')
  @HttpCode(HttpStatus.OK)
  verifyLimit() {
    return this.assetTelemetryLogsService.veriGlobal();
  }

  @Delete('/deleteAssetById/:assetId')
  @HttpCode(HttpStatus.OK)
  deleteAssetById(@Param('assetId') assetId: string) {
    return this.assetTelemetryLogsService.deleteAssetById(assetId);
  }
}
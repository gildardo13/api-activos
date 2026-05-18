import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetTelemetryLogsService } from './asset-telemetry-logs.service';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';

@Controller('asset-telemetry-logs')
export class AssetTelemetryLogsController {
  constructor(private readonly assetTelemetryLogsService: AssetTelemetryLogsService) {}

  @Post()
  create(@Body() createAssetTelemetryLogDto: CreateAssetTelemetryLogDto) {
    return this.assetTelemetryLogsService.create(createAssetTelemetryLogDto);
  }

  @Get()
  findAll() {
    return this.assetTelemetryLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetTelemetryLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetTelemetryLogDto: UpdateAssetTelemetryLogDto) {
    return this.assetTelemetryLogsService.update(+id, updateAssetTelemetryLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetTelemetryLogsService.remove(+id);
  }
}

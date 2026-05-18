import { Injectable } from '@nestjs/common';
import { CreateAssetTelemetryLogDto } from './dto/create-asset-telemetry-log.dto';
import { UpdateAssetTelemetryLogDto } from './dto/update-asset-telemetry-log.dto';

@Injectable()
export class AssetTelemetryLogsService {
  create(createAssetTelemetryLogDto: CreateAssetTelemetryLogDto) {
    return 'This action adds a new assetTelemetryLog';
  }

  findAll() {
    return `This action returns all assetTelemetryLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetTelemetryLog`;
  }

  update(id: number, updateAssetTelemetryLogDto: UpdateAssetTelemetryLogDto) {
    return `This action updates a #${id} assetTelemetryLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetTelemetryLog`;
  }
}

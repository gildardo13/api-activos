import { Module } from '@nestjs/common';
import { AssetTelemetryLogsService } from './asset-telemetry-logs.service';
import { AssetTelemetryLogsController } from './asset-telemetry-logs.controller';

@Module({
  controllers: [AssetTelemetryLogsController],
  providers: [AssetTelemetryLogsService],
})
export class AssetTelemetryLogsModule {}

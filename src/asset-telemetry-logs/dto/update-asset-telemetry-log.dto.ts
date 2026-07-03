import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetTelemetryLogDto } from './create-asset-telemetry-log.dto';

export class UpdateAssetTelemetryLogDto extends PartialType(CreateAssetTelemetryLogDto) {}

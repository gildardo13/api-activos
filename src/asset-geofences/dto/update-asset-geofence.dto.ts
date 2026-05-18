import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetGeofenceDto } from './create-asset-geofence.dto';

export class UpdateAssetGeofenceDto extends PartialType(CreateAssetGeofenceDto) {}

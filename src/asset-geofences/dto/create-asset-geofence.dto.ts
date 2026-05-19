import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAssetGeofenceDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsString()
  name: string;

  @IsString()
  coordinates: string;

  @IsEnum(['ACTIVE', 'INACTIVE', 'DELETED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' = 'ACTIVE';
}

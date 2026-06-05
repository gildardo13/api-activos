import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';


export class CoordinatesDto {
  @IsString()
  lat: string;

  @IsString()
  lng: string;
}

export class CreateAssetGeofenceDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsString()
  name: string;

  @IsArray()
  coordinates: CoordinatesDto[];

  @IsEnum(['ACTIVE', 'INACTIVE', 'DELETED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' = 'ACTIVE';
}

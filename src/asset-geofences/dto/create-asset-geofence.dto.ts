import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';


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

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  mainPhotograph: string;


  @IsOptional()
  @IsBoolean()
  isLimitMovible?: boolean = false;


  @IsArray()
  coordinates: CoordinatesDto[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(['ACTIVE', 'INACTIVE', 'DELETED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' = 'ACTIVE';
}

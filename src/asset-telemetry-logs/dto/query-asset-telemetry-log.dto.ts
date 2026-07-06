  import {
    IsOptional,
    IsString,
  } from 'class-validator';

  export class QueryAssetTelemetryLogDto {

    @IsOptional()
    @IsString()
    searchName?: string;


    @IsOptional()
    @IsString()
    searchJibbyId?: string;

    @IsOptional()
    @IsString()
    assetId?: string;

    @IsOptional()
    @IsString()
    isActive?: string;
  }
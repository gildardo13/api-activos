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
  }
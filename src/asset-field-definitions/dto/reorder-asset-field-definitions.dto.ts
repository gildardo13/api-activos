import { IsArray, IsString, IsNumber, IsOptional } from 'class-validator';

export class ReorderAssetFieldDefinitionsDto {
  @IsString()
  assetTypeId: string;

  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsNumber()
  @IsOptional()
  indexCol?: number;

  @IsNumber()
  @IsOptional()
  indexRow?: number;
}
